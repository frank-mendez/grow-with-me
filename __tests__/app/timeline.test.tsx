import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockOrder = vi.fn()
const mockSelect = vi.fn(() => ({ order: mockOrder }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({ from: mockFrom })),
}))

describe('TimelinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders weeks when data is available', async () => {
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

    expect(screen.getByText('The Beginning')).toBeInTheDocument()
    expect(screen.getByText('Everything starts here')).toBeInTheDocument()
    expect(screen.getByText('Week Two')).toBeInTheDocument()
  })

  it('renders an empty list when data is null', async () => {
    mockOrder.mockResolvedValue({ data: null, error: null })

    const { default: TimelinePage } = await import('@/app/(dashboard)/timeline/page')
    const jsx = await TimelinePage()
    render(jsx)

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('renders the "Timeline" heading', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })

    const { default: TimelinePage } = await import('@/app/(dashboard)/timeline/page')
    const jsx = await TimelinePage()
    render(jsx)

    expect(screen.getByText('Timeline')).toBeInTheDocument()
  })

  it('throws when the Supabase query returns an error', async () => {
    const dbError = new Error('Connection refused')
    mockOrder.mockResolvedValue({ data: null, error: dbError })

    const { default: TimelinePage } = await import('@/app/(dashboard)/timeline/page')
    await expect(TimelinePage()).rejects.toThrow('Connection refused')
  })
})
