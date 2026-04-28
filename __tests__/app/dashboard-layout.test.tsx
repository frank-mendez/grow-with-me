import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockGetUser = vi.fn()
const mockRedirect = vi.fn(() => { throw new Error('NEXT_REDIRECT') })

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser } })
  ),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
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

  it('renders "soon" labels for unavailable nav items', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const { default: DashboardLayout } = await import('@/app/(dashboard)/layout')
    const jsx = await DashboardLayout({ children: <div /> })
    render(jsx)

    const soonLabels = screen.getAllByText('soon')
    expect(soonLabels.length).toBeGreaterThan(0)
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: DashboardLayout } = await import('@/app/(dashboard)/layout')
    await expect(DashboardLayout({ children: <div /> })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
