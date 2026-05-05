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

vi.mock('@/components/timeline/KickPlay', () => ({
  KickPlay: ({ userId }: { userId: string }) => (
    <div data-testid="kick-play" data-user-id={userId} />
  ),
}))

describe('KicksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders KickPlay with the authenticated user id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-42' } } })

    const { default: KicksPage } = await import('@/app/(dashboard)/kicks/page')
    const jsx = await KicksPage()
    render(jsx)

    expect(screen.getByTestId('kick-play')).toHaveAttribute('data-user-id', 'user-42')
  })

  it('renders the page heading', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-42' } } })

    const { default: KicksPage } = await import('@/app/(dashboard)/kicks/page')
    const jsx = await KicksPage()
    render(jsx)

    expect(screen.getByText('Kick Tracker')).toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: KicksPage } = await import('@/app/(dashboard)/kicks/page')
    await expect(KicksPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
