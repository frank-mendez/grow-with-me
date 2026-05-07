import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ── Supabase mock ─────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  // Read chain: from().select().eq().gte().order()
  select: vi.fn(),
  eq: vi.fn(),
  gte: vi.fn(),
  order: vi.fn(),
  // Write chain: from().upsert().select().single()
  upsert: vi.fn(),
  upsertSelect: vi.fn(),
  single: vi.fn(),
  from: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: mocks.from }),
}))

// ── Framer Motion mock ────────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, animate, initial, exit, transition, ...rest }: React.ComponentProps<'div'> & Record<string, unknown>) => (
      <div {...rest}>{children}</div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    button: ({ children, animate, initial, exit, transition, whileTap, ...rest }: React.ComponentProps<'button'> & Record<string, unknown>) => (
      <button {...rest}>{children}</button>
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    span: ({ children, animate, initial, exit, transition, ...rest }: React.ComponentProps<'span'> & Record<string, unknown>) => (
      <span {...rest}>{children}</span>
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    p: ({ children, animate, initial, exit, transition, ...rest }: React.ComponentProps<'p'> & Record<string, unknown>) => (
      <p {...rest}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ── Import component (after mocks) ────────────────────────────────────────────

import { MoodGarden } from '@/components/mood/mood-garden'

// ── Helpers ───────────────────────────────────────────────────────────────────

function localDate(daysAgo = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type SetupOptions = {
  queryResult?: { data: unknown; error: unknown }
  upsertResult?: { data: unknown; error: unknown }
}

function setupChains({
  queryResult = { data: [], error: null },
  upsertResult = {
    data: { id: 'mood-new-1', user_id: 'user-123', date: localDate(), mood: 'HAPPY' },
    error: null,
  },
}: SetupOptions = {}) {
  // Read chain: each builder method returns the builder so the chain can continue
  const readBuilder = {
    select: mocks.select,
    eq: mocks.eq,
    gte: mocks.gte,
    order: mocks.order,
    upsert: mocks.upsert,
  }
  mocks.from.mockReturnValue(readBuilder)
  mocks.select.mockReturnValue(readBuilder)
  mocks.eq.mockReturnValue(readBuilder)
  mocks.gte.mockReturnValue(readBuilder)
  mocks.order.mockResolvedValue(queryResult)

  // Write chain: upsert() returns a new builder with select → single
  mocks.upsertSelect.mockReturnValue({ single: mocks.single })
  mocks.upsert.mockReturnValue({ select: mocks.upsertSelect })
  mocks.single.mockResolvedValue(upsertResult)
}

beforeEach(() => {
  vi.clearAllMocks()
  setupChains()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MoodGarden', () => {
  describe('initial load', () => {
    it('shows header and subtitle', async () => {
      render(<MoodGarden userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText('Mood Garden')).toBeInTheDocument()
        expect(screen.getByText('How are you feeling today?')).toBeInTheDocument()
      })
    })

    it('shows empty-state message when there are no mood entries', async () => {
      render(<MoodGarden userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText(/your garden will grow/i)).toBeInTheDocument()
      })
    })

    it('shows error message and hides garden when fetch fails', async () => {
      setupChains({ queryResult: { data: null, error: new Error('DB error') } })
      render(<MoodGarden userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText(/could not load your garden/i)).toBeInTheDocument()
      })
      expect(screen.queryByText(/your garden will grow/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Happy' })).not.toBeInTheDocument()
    })

    it("marks today's mood button as selected when a mood exists in DB", async () => {
      setupChains({
        queryResult: {
          data: [{ id: 'm1', user_id: 'user-123', date: localDate(), mood: 'HAPPY' }],
          error: null,
        },
      })
      render(<MoodGarden userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Happy' })).toHaveAttribute('aria-pressed', 'true')
      })
      expect(screen.getByRole('button', { name: 'Neutral' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('fetches with the correct user_id filter', async () => {
      render(<MoodGarden userId="user-456" />)
      await waitFor(() => expect(mocks.eq).toHaveBeenCalledWith('user_id', 'user-456'))
    })

    it('shows the garden row (not the empty state) when past mood entries exist', async () => {
      setupChains({
        queryResult: {
          data: [{ id: 'm1', user_id: 'user-123', date: localDate(1), mood: 'NEUTRAL' }],
          error: null,
        },
      })
      render(<MoodGarden userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText('Your garden')).toBeInTheDocument()
      })
      expect(screen.queryByText(/your garden will grow/i)).not.toBeInTheDocument()
    })

    it('clears previous user data immediately when userId changes', async () => {
      // First user loads with a HAPPY mood
      setupChains({
        queryResult: {
          data: [{ id: 'm1', user_id: 'user-A', date: localDate(), mood: 'HAPPY' }],
          error: null,
        },
      })
      const { rerender } = render(<MoodGarden userId="user-A" />)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Happy' })).toHaveAttribute('aria-pressed', 'true')
      })

      // Second user's fetch is held pending so we can inspect the in-between state
      let resolveSecondFetch!: (v: unknown) => void
      mocks.order.mockReturnValue(
        new Promise((resolve) => { resolveSecondFetch = resolve }),
      )

      rerender(<MoodGarden userId="user-B" />)

      // While second fetch is pending the component is in loading state —
      // mood buttons are not rendered, so no previous user data is visible.
      expect(screen.queryByRole('button', { name: 'Happy' })).not.toBeInTheDocument()

      // Resolve and clean up
      await act(async () => {
        resolveSecondFetch({ data: [], error: null })
      })
    })
  })

  describe('mood selection', () => {
    async function loadedRender(userId = 'user-123') {
      render(<MoodGarden userId={userId} />)
      await act(async () => {})
    }

    it('marks the tapped mood as selected (optimistic)', async () => {
      await loadedRender()
      fireEvent.click(screen.getByRole('button', { name: 'Neutral' }))
      expect(screen.getByRole('button', { name: 'Neutral' })).toHaveAttribute('aria-pressed', 'true')
    })

    it('upserts the selected mood with the correct params', async () => {
      await loadedRender()
      fireEvent.click(screen.getByRole('button', { name: 'Stressed' }))
      await waitFor(() => expect(mocks.upsert).toHaveBeenCalledTimes(1))
      expect(mocks.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-123', mood: 'STRESSED' }),
        expect.objectContaining({ onConflict: 'user_id,date' }),
      )
    })

    it('rolls back the optimistic mood when the upsert fails', async () => {
      setupChains({ upsertResult: { data: null, error: new Error('network error') } })
      await loadedRender()

      fireEvent.click(screen.getByRole('button', { name: 'Sad' }))
      // Optimistic: Sad should be selected
      expect(screen.getByRole('button', { name: 'Sad' })).toHaveAttribute('aria-pressed', 'true')

      // Wait for upsert to fail and rollback to apply
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sad' })).toHaveAttribute('aria-pressed', 'false')
      })
    })

    it('blocks a second tap while the first upsert is in flight (ref guard)', async () => {
      // Hold the upsert promise pending to simulate a slow network
      let resolveUpsert!: (v: unknown) => void
      mocks.single.mockReturnValue(
        new Promise((resolve) => { resolveUpsert = resolve }),
      )

      await loadedRender()

      fireEvent.click(screen.getByRole('button', { name: 'Happy' }))
      fireEvent.click(screen.getByRole('button', { name: 'Sad' }))

      // Only one upsert should have been issued — the guard blocked the second tap
      expect(mocks.upsert).toHaveBeenCalledTimes(1)
      expect(mocks.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ mood: 'HAPPY' }),
        expect.anything(),
      )

      await act(async () => {
        resolveUpsert({ data: { id: 'mood-1', user_id: 'user-123', date: localDate(), mood: 'HAPPY' }, error: null })
      })
    })

    it('allows re-selecting a different mood after the first upsert resolves', async () => {
      await loadedRender()

      fireEvent.click(screen.getByRole('button', { name: 'Happy' }))
      await waitFor(() => expect(mocks.upsert).toHaveBeenCalledTimes(1))

      fireEvent.click(screen.getByRole('button', { name: 'Sad' }))
      await waitFor(() => expect(mocks.upsert).toHaveBeenCalledTimes(2))

      expect(mocks.upsert).toHaveBeenLastCalledWith(
        expect.objectContaining({ mood: 'SAD' }),
        expect.anything(),
      )
    })
  })

  describe('garden display', () => {
    it('always shows a today placeholder cell alongside past days', async () => {
      setupChains({
        queryResult: {
          data: [{ id: 'm1', user_id: 'user-123', date: localDate(1), mood: 'HAPPY' }],
          error: null,
        },
      })
      render(<MoodGarden userId="user-123" />)
      await waitFor(() => expect(screen.getByText('Your garden')).toBeInTheDocument())

      // The garden emoji for yesterday's HAPPY entry should be visible
      expect(screen.getByText('🌸')).toBeInTheDocument()
      // Empty placeholder cells should exist — one for each day without an entry,
      // including today (no mood selected yet). Use getAllByText since multiple cells
      // show the same "·" character.
      expect(screen.getAllByText('·').length).toBeGreaterThan(0)
    })

    it('replaces the today placeholder with the mood glyph after selection', async () => {
      render(<MoodGarden userId="user-123" />)
      await act(async () => {})

      // No history, so empty state is shown initially
      expect(screen.getByText(/your garden will grow/i)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Sad' }))

      // Garden appears with the SAD glyph
      await waitFor(() => {
        expect(screen.getByText('🌧')).toBeInTheDocument()
      })
      expect(screen.queryByText(/your garden will grow/i)).not.toBeInTheDocument()
    })
  })
})
