import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { mockGetUser, mockSingle, mockOrder, mockFrom } = vi.hoisted(() => {
  const mockOrder = vi.fn()
  const mockSingle = vi.fn()
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockWeeksSelect = vi.fn(() => ({ order: mockOrder }))
  const mockProfileSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn((table: string) => {
    if (table === 'profiles') return { select: mockProfileSelect }
    return { select: mockWeeksSelect }
  })
  return { mockGetUser: vi.fn(), mockSingle, mockOrder, mockFrom }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser }, from: mockFrom })
  ),
}))

vi.mock('@/components/timeline/TimelineView', () => ({
  TimelineView: ({
    weeks,
    initialWeek,
    currentWeek,
    userId,
  }: {
    weeks: { id: string }[]
    initialWeek: number
    currentWeek: number | null
    userId: string | null
  }) => (
    <div
      data-testid="timeline-view"
      data-week-count={weeks.length}
      data-initial-week={initialWeek}
      data-current-week={currentWeek ?? ''}
      data-user-id={userId ?? ''}
    />
  ),
}))

describe('TimelinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: { due_date: null }, error: null })
  })

  it('passes all weeks to TimelineView', async () => {
    mockOrder.mockResolvedValue({
      data: [
        { id: '1', week_number: 1, title: 'The Beginning', description: 'Everything starts here' },
        { id: '2', week_number: 2, title: 'Week Two', description: null },
      ],
      error: null,
    })

    const { default: TimelinePage } = await import('@/app/(dashboard)/timeline/page')
    const jsx = await TimelinePage()
    render(jsx)

    expect(screen.getByTestId('timeline-view')).toHaveAttribute('data-week-count', '2')
  })

  it('defaults initialWeek to 1 when due_date is null', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })

    const { default: TimelinePage } = await import('@/app/(dashboard)/timeline/page')
    const jsx = await TimelinePage()
    render(jsx)

    expect(screen.getByTestId('timeline-view')).toHaveAttribute('data-initial-week', '1')
  })

  it('passes a valid currentWeek when profile has a due_date', async () => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 140)
    mockSingle.mockResolvedValue({
      data: { due_date: dueDate.toISOString().slice(0, 10) },
      error: null,
    })
    mockOrder.mockResolvedValue({ data: [], error: null })

    const { default: TimelinePage } = await import('@/app/(dashboard)/timeline/page')
    const jsx = await TimelinePage()
    render(jsx)

    const currentWeek = Number(
      screen.getByTestId('timeline-view').getAttribute('data-current-week')
    )
    expect(currentWeek).toBeGreaterThanOrEqual(1)
    expect(currentWeek).toBeLessThanOrEqual(40)
  })

  it('forwards userId from auth.getUser to TimelineView', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })

    const { default: TimelinePage } = await import('@/app/(dashboard)/timeline/page')
    const jsx = await TimelinePage()
    render(jsx)

    expect(screen.getByTestId('timeline-view')).toHaveAttribute('data-user-id', 'user-1')
  })

  it('throws when the pregnancy_weeks query errors', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('Connection refused') })

    const { default: TimelinePage } = await import('@/app/(dashboard)/timeline/page')
    await expect(TimelinePage()).rejects.toThrow('Connection refused')
  })
})
