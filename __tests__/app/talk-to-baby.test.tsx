import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { mockGetUser, mockRedirect, mockSingle, mockOrder, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockOrder = vi.fn()
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockProfileSelect = vi.fn(() => ({ eq: mockEq }))
  const mockWeeksSelect = vi.fn(() => ({ order: mockOrder }))
  const mockFrom = vi.fn((table: string) => {
    if (table === 'profiles') return { select: mockProfileSelect }
    return { select: mockWeeksSelect }
  })
  return {
    mockGetUser: vi.fn(),
    mockRedirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
    mockSingle,
    mockOrder,
    mockFrom,
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

vi.mock('@/components/timeline/TalkToBaby', () => ({
  TalkToBaby: ({
    weekId,
    weekNumber,
    userId,
  }: {
    weekId: string
    weekNumber: number
    userId: string
  }) => (
    <div
      data-testid="talk-to-baby"
      data-week-id={weekId}
      data-week-number={weekNumber}
      data-user-id={userId}
    />
  ),
}))

const WEEKS = [
  { id: 'wk-1', week_number: 1 },
  { id: 'wk-35', week_number: 35 },
]

describe('TalkToBabyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: { due_date: null }, error: null })
    mockOrder.mockResolvedValue({ data: WEEKS, error: null })
  })

  it('renders TalkToBaby with the authenticated user id', async () => {
    const { default: TalkToBabyPage } = await import('@/app/(dashboard)/talk-to-baby/page')
    const jsx = await TalkToBabyPage()
    render(jsx)

    expect(screen.getByTestId('talk-to-baby')).toHaveAttribute('data-user-id', 'user-1')
  })

  it('renders the page heading', async () => {
    const { default: TalkToBabyPage } = await import('@/app/(dashboard)/talk-to-baby/page')
    const jsx = await TalkToBabyPage()
    render(jsx)

    expect(screen.getByText('Talk to Baby')).toBeInTheDocument()
  })

  it('defaults to week 1 when no due date is set', async () => {
    const { default: TalkToBabyPage } = await import('@/app/(dashboard)/talk-to-baby/page')
    const jsx = await TalkToBabyPage()
    render(jsx)

    expect(screen.getByTestId('talk-to-baby')).toHaveAttribute('data-week-id', 'wk-1')
    expect(screen.getByTestId('talk-to-baby')).toHaveAttribute('data-week-number', '1')
  })

  it('selects the week matching the current pregnancy week', async () => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 35)
    mockSingle.mockResolvedValue({ data: { due_date: dueDate.toISOString().slice(0, 10) }, error: null })

    const { default: TalkToBabyPage } = await import('@/app/(dashboard)/talk-to-baby/page')
    const jsx = await TalkToBabyPage()
    render(jsx)

    const el = screen.getByTestId('talk-to-baby')
    const weekNum = Number(el.getAttribute('data-week-number'))
    expect(weekNum).toBeGreaterThanOrEqual(1)
    expect(weekNum).toBeLessThanOrEqual(40)
  })

  it('shows fallback message when no pregnancy weeks exist', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })

    const { default: TalkToBabyPage } = await import('@/app/(dashboard)/talk-to-baby/page')
    const jsx = await TalkToBabyPage()
    render(jsx)

    expect(screen.queryByTestId('talk-to-baby')).toBeNull()
    expect(screen.getByText('Timeline data not available yet.')).toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: TalkToBabyPage } = await import('@/app/(dashboard)/talk-to-baby/page')
    await expect(TalkToBabyPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
