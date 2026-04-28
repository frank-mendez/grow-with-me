import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Hoist mocks so they are available inside vi.mock() factory functions
const { mockGetUser, mockSingle, mockFrom, mockRedirect } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return {
    mockGetUser: vi.fn(),
    mockSingle,
    mockFrom,
    mockRedirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser }, from: mockFrom })
  ),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

// Static import is safe now that mocks are hoisted
import { getCurrentWeek } from '@/app/(dashboard)/dashboard/page'

// ── getCurrentWeek ────────────────────────────────────────────────────────────

describe('getCurrentWeek', () => {
  it('returns null when dueDate is null', () => {
    expect(getCurrentWeek(null)).toBeNull()
  })

  it('returns null when pregnancy has already ended (due date > 280 days ago)', () => {
    const past = new Date()
    past.setDate(past.getDate() - 300)
    expect(getCurrentWeek(past.toISOString().slice(0, 10))).toBeNull()
  })

  it('returns null when due date is too far in the future (not yet started)', () => {
    const future = new Date()
    future.setDate(future.getDate() + 290)
    expect(getCurrentWeek(future.toISOString().slice(0, 10))).toBeNull()
  })

  it('returns a valid week number (1–40) for an ongoing pregnancy', () => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 140)
    const week = getCurrentWeek(dueDate.toISOString().slice(0, 10))
    expect(week).not.toBeNull()
    expect(week!).toBeGreaterThanOrEqual(1)
    expect(week!).toBeLessThanOrEqual(40)
  })

  it('returns 1 at the very beginning of pregnancy (~280 days to due date)', () => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 279)
    expect(getCurrentWeek(dueDate.toISOString().slice(0, 10))).toBe(1)
  })

  it('returns null for a malformed date string (not YYYY-MM-DD)', () => {
    expect(getCurrentWeek('not-a-date')).toBeNull()
    expect(getCurrentWeek('2025/06/01')).toBeNull()
    expect(getCurrentWeek('20250601')).toBeNull()
  })

  it('returns null for an impossible calendar date that JS would silently roll over', () => {
    // Month 13 or day 32 don't exist; JS Date would roll them over, so we reject
    expect(getCurrentWeek('2025-13-01')).toBeNull()
    expect(getCurrentWeek('2025-02-30')).toBeNull()
  })
})

// ── DashboardPage ─────────────────────────────────────────────────────────────

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the profile display name', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSingle.mockResolvedValue({ data: { display_name: 'Alice', due_date: null } })

    const { default: DashboardPage } = await import('@/app/(dashboard)/dashboard/page')
    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('falls back to "Mama" when display_name is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSingle.mockResolvedValue({ data: { display_name: null, due_date: null } })

    const { default: DashboardPage } = await import('@/app/(dashboard)/dashboard/page')
    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText('Mama')).toBeInTheDocument()
  })

  it('shows current week when a valid due date is set', async () => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 140)
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSingle.mockResolvedValue({
      data: { display_name: 'Alice', due_date: dueDate.toISOString().slice(0, 10) },
    })

    const { default: DashboardPage } = await import('@/app/(dashboard)/dashboard/page')
    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText('of 40')).toBeInTheDocument()
  })

  it('shows prompt to set due date when due_date is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSingle.mockResolvedValue({ data: { display_name: 'Alice', due_date: null } })

    const { default: DashboardPage } = await import('@/app/(dashboard)/dashboard/page')
    const jsx = await DashboardPage()
    render(jsx)

    expect(screen.getByText(/Set your due date/i)).toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: DashboardPage } = await import('@/app/(dashboard)/dashboard/page')
    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
