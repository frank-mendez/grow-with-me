import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockGetUser = vi.fn()
const mockRedirect = vi.fn(() => { throw new Error('NEXT_REDIRECT') })

function makeProfileQuery(data: Record<string, unknown> | null = null) {
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({ data, error: null }),
  }
  q.select.mockReturnValue(q)
  q.eq.mockReturnValue(q)
  return q
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: vi.fn().mockReturnValue(makeProfileQuery()),
    })
  ),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
  usePathname: vi.fn().mockReturnValue('/dashboard'),
}))

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when the user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const { default: DashboardLayout } = await import('@/app/(dashboard)/layout')
    const jsx = await DashboardLayout({ children: <div>Page Content</div> })
    render(jsx)

    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('renders the app name in the header', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const { default: DashboardLayout } = await import('@/app/(dashboard)/layout')
    const jsx = await DashboardLayout({ children: <div /> })
    render(jsx)

    expect(screen.getByText('Grow With Me')).toBeInTheDocument()
  })

  it('renders Mood as a nav link (not a soon placeholder)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const { default: DashboardLayout } = await import('@/app/(dashboard)/layout')
    const jsx = await DashboardLayout({ children: <div /> })
    render(jsx)

    expect(screen.queryByText('soon')).toBeNull()
    const moodLink = screen.getByRole('link', { name: /mood/i })
    expect(moodLink).toHaveAttribute('href', '/mood')
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: DashboardLayout } = await import('@/app/(dashboard)/layout')
    await expect(DashboardLayout({ children: <div /> })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
