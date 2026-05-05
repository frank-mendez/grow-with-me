import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ── Supabase mock ────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  eq: vi.fn(),
  gte: vi.fn(),
  order: vi.fn(),
  upsert: vi.fn(),
  from: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: mocks.from }),
}))

// ── Framer Motion mock ───────────────────────────────────────────────────────

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

// ── Import component (after mocks) ───────────────────────────────────────────

import { KickPlay } from '@/components/timeline/KickPlay'

// ── Helpers ──────────────────────────────────────────────────────────────────

function localDate(daysAgo = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function setupQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const qb = {
    select: mocks.select,
    eq: mocks.eq,
    gte: mocks.gte,
    order: mocks.order,
    upsert: mocks.upsert,
  }
  mocks.from.mockReturnValue(qb)
  mocks.select.mockReturnValue(qb)
  mocks.eq.mockReturnValue(qb)
  mocks.gte.mockReturnValue(qb)
  mocks.order.mockResolvedValue(resolvedValue)
  mocks.upsert.mockResolvedValue({ error: null })
}

// ── Global setup ─────────────────────────────────────────────────────────────

// Clear before each test so RTL's afterEach cleanup (which runs after our afterEach)
// doesn't bleed upsert calls into the next test's mock call history.
beforeEach(() => {
  vi.clearAllMocks()
  setupQueryChain({ data: [], error: null })
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('KickPlay', () => {
  describe('initial load', () => {
    it('shows Kick Play header and subtitle', async () => {
      render(<KickPlay userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText('Kick Play')).toBeInTheDocument()
        expect(screen.getByText('Tap when you feel a kick')).toBeInTheDocument()
      })
    })

    it('shows count 0 when no record exists for today', async () => {
      render(<KickPlay userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
        expect(screen.getByText('kicks today')).toBeInTheDocument()
      })
    })

    it("shows today's count loaded from the database", async () => {
      setupQueryChain({
        data: [{ id: 'k1', user_id: 'user-123', date: localDate(), count: 8 }],
        error: null,
      })

      render(<KickPlay userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('8')).toBeInTheDocument()
      })
    })

    it('queries with the correct user_id filter', async () => {
      render(<KickPlay userId="user-456" />)
      await waitFor(() => {
        expect(mocks.eq).toHaveBeenCalledWith('user_id', 'user-456')
      })
    })

    it('shows an error message when the fetch fails', async () => {
      setupQueryChain({ data: null, error: new Error('DB error') })

      render(<KickPlay userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText(/Could not load kick data/i)).toBeInTheDocument()
      })
    })

    it('does not render the tap zone when the fetch failed', async () => {
      setupQueryChain({ data: null, error: new Error('DB error') })

      render(<KickPlay userId="user-123" />)
      await waitFor(() => screen.getByText(/Could not load kick data/i))

      expect(screen.queryByText('kicks today')).not.toBeInTheDocument()
    })
  })

  describe('tapping', () => {
    it('increments the displayed count on each tap', async () => {
      render(<KickPlay userId="user-123" />)
      await waitFor(() => screen.getByText('0'))

      const btn = screen.getByRole('button', { name: /log a kick/i })
      fireEvent.click(btn)
      expect(screen.getByText('1')).toBeInTheDocument()

      fireEvent.click(btn)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('handles rapid taps without losing counts (functional updater)', async () => {
      render(<KickPlay userId="user-123" />)
      await waitFor(() => screen.getByText('0'))

      const btn = screen.getByRole('button', { name: /log a kick/i })
      fireEvent.click(btn)
      fireEvent.click(btn)
      fireEvent.click(btn)

      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows "Baby is waking up" for 1–5 kicks', async () => {
      render(<KickPlay userId="user-123" />)
      await waitFor(() => screen.getByText('0'))

      fireEvent.click(screen.getByRole('button', { name: /log a kick/i }))

      expect(screen.getByText('Baby is waking up ✨')).toBeInTheDocument()
    })

    it('shows "Nice and active today" for 6–10 kicks', async () => {
      setupQueryChain({
        data: [{ id: 'k1', user_id: 'user-123', date: localDate(), count: 5 }],
        error: null,
      })

      render(<KickPlay userId="user-123" />)
      await waitFor(() => screen.getByText('5'))

      fireEvent.click(screen.getByRole('button', { name: /log a kick/i }))

      expect(screen.getByText('Nice and active today 💪')).toBeInTheDocument()
    })

    it('shows "Lots of movement today" for 11+ kicks', async () => {
      setupQueryChain({
        data: [{ id: 'k1', user_id: 'user-123', date: localDate(), count: 10 }],
        error: null,
      })

      render(<KickPlay userId="user-123" />)
      await waitFor(() => screen.getByText('10'))

      fireEvent.click(screen.getByRole('button', { name: /log a kick/i }))

      expect(screen.getByText('Lots of movement today!')).toBeInTheDocument()
    })
  })

  describe('debounced save', () => {
    // Scoped fake timers so cleanup always runs even on test failure
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    async function loadedRender(userId = 'user-123') {
      render(<KickPlay userId={userId} />)
      // Flush the initial async load: mock promises resolve via microtasks,
      // so an empty async act() flushes them without needing real timers.
      await act(async () => {})
    }

    it('upserts the count to the database after the debounce window', async () => {
      await loadedRender()

      fireEvent.click(screen.getByRole('button', { name: /log a kick/i }))

      await act(async () => { await vi.advanceTimersByTimeAsync(900) })

      expect(mocks.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-123', count: 1 }),
        expect.objectContaining({ onConflict: 'user_id,date' }),
      )
    })

    it('does not upsert until the debounce window expires', async () => {
      await loadedRender()

      fireEvent.click(screen.getByRole('button', { name: /log a kick/i }))
      await act(async () => { await vi.advanceTimersByTimeAsync(400) })

      expect(mocks.upsert).not.toHaveBeenCalled()
    })

    it('batches rapid taps into a single upsert with the final count', async () => {
      await loadedRender()

      const btn = screen.getByRole('button', { name: /log a kick/i })
      fireEvent.click(btn)
      fireEvent.click(btn)
      fireEvent.click(btn)

      await act(async () => { await vi.advanceTimersByTimeAsync(900) })

      expect(mocks.upsert).toHaveBeenCalledTimes(1)
      expect(mocks.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ count: 3 }),
        expect.anything(),
      )
    })

    it('retains pending count when upsert fails so next debounce can retry', async () => {
      mocks.upsert.mockResolvedValue({ error: new Error('network error') })

      await loadedRender()

      const btn = screen.getByRole('button', { name: /log a kick/i })
      fireEvent.click(btn) // count = 1

      await act(async () => { await vi.advanceTimersByTimeAsync(900) })
      // Upsert failed → pending count retained

      // Next tap — count = 2; successful write should use 2
      mocks.upsert.mockResolvedValue({ error: null })
      fireEvent.click(btn)

      await act(async () => { await vi.advanceTimersByTimeAsync(900) })

      expect(mocks.upsert).toHaveBeenLastCalledWith(
        expect.objectContaining({ count: 2 }),
        expect.anything(),
      )
    })
  })

  describe('history', () => {
    it('shows the Recent days section when a prior day has kicks', async () => {
      setupQueryChain({
        data: [
          { id: 'k-today', user_id: 'user-123', date: localDate(), count: 3 },
          { id: 'k-yesterday', user_id: 'user-123', date: localDate(1), count: 5 },
        ],
        error: null,
      })

      render(<KickPlay userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('Recent days')).toBeInTheDocument()
        expect(screen.getByText('5 kicks')).toBeInTheDocument()
      })
    })

    it('does not show the Recent days section when there is no activity at all', async () => {
      // All zeros: history section has nothing meaningful to show
      render(<KickPlay userId="user-123" />)
      await waitFor(() => screen.getByText('0'))

      expect(screen.queryByText('Recent days')).not.toBeInTheDocument()
    })

    it('shows the Recent days section when today has kicks but no prior days do', async () => {
      setupQueryChain({
        data: [{ id: 'k-today', user_id: 'user-123', date: localDate(), count: 2 }],
        error: null,
      })

      render(<KickPlay userId="user-123" />)
      await waitFor(() => screen.getByText('2'))

      expect(screen.getByText('Recent days')).toBeInTheDocument()
    })

    it('fills in 0 kicks for calendar days with no logged row', async () => {
      setupQueryChain({
        data: [
          { id: 'k-today', user_id: 'user-123', date: localDate(), count: 1 },
          { id: 'k-d1', user_id: 'user-123', date: localDate(1), count: 4 },
          // localDate(2) missing — should appear as 0 kicks
        ],
        error: null,
      })

      render(<KickPlay userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('Recent days')).toBeInTheDocument()
      })

      const zeroRows = screen.getAllByText('0 kicks')
      expect(zeroRows.length).toBeGreaterThan(0)
    })

    it('shows singular "kick" for a count of 1', async () => {
      setupQueryChain({
        data: [
          { id: 'k-today', user_id: 'user-123', date: localDate(), count: 2 },
          { id: 'k-d1', user_id: 'user-123', date: localDate(1), count: 1 },
        ],
        error: null,
      })

      render(<KickPlay userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('1 kick')).toBeInTheDocument()
      })
    })
  })
})
