import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { mockGetUser, mockRedirect } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockRedirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser } })
  ),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

vi.mock('@/components/mood/mood-garden', () => ({
  MoodGarden: ({ userId }: { userId: string }) => (
    <div data-testid="mood-garden" data-user-id={userId} />
  ),
}))

describe('MoodPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders MoodGarden with the authenticated user id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-99' } } })

    const { default: MoodPage } = await import('@/app/(dashboard)/mood/page')
    const jsx = await MoodPage()
    render(jsx)

    expect(screen.getByTestId('mood-garden')).toHaveAttribute('data-user-id', 'user-99')
  })

  it('renders the page heading', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-99' } } })

    const { default: MoodPage } = await import('@/app/(dashboard)/mood/page')
    const jsx = await MoodPage()
    render(jsx)

    expect(screen.getByText('Mood Garden')).toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: MoodPage } = await import('@/app/(dashboard)/mood/page')
    await expect(MoodPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
