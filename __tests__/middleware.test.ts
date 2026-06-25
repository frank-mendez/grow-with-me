import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const { mockGetUser, mockRedirectFn, mockRedirectResponse, mockResponse } = vi.hoisted(() => {
  const setCookieSpy = vi.fn()
  const mockRedirectResponse = { cookies: { set: setCookieSpy } }
  const getAll = vi.fn(() => [] as { name: string; value: string }[])
  const mockResponse = { cookies: { getAll, set: vi.fn() } }
  const mockRedirectFn = vi.fn(() => mockRedirectResponse)
  const mockGetUser = vi.fn()
  return { mockGetUser, mockRedirectFn, mockRedirectResponse, mockResponse }
})

vi.mock('@/lib/supabase/middleware', () => ({
  createClient: vi.fn(() => ({ supabase: { auth: { getUser: mockGetUser } }, response: mockResponse })),
}))

vi.mock('next/server', () => ({
  NextResponse: { redirect: mockRedirectFn },
}))

import { middleware } from '@/middleware'

function makeRequest(path: string): NextRequest {
  const url = new URL(`http://localhost${path}`)
  return {
    nextUrl: { pathname: url.pathname, searchParams: url.searchParams },
    url: url.toString(),
  } as unknown as NextRequest
}

describe('middleware — redirect logic', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects unauthenticated user from /dashboard to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await middleware(makeRequest('/dashboard'))
    expect(mockRedirectFn).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/login' })
    )
    expect(result).toBe(mockRedirectResponse)
  })

  it('redirects unauthenticated user from /timeline to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await middleware(makeRequest('/timeline'))
    expect(mockRedirectFn).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/login' })
    )
  })

  it('forwards auth cookies on protected-path redirect', async () => {
    const authCookies = [{ name: 'sb-token', value: 'xyz' }]
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockResponse.cookies.getAll.mockReturnValue(authCookies)
    await middleware(makeRequest('/dashboard'))
    expect(mockRedirectResponse.cookies.set).toHaveBeenCalledWith(authCookies[0])
  })

  it('redirects authenticated user from /login to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const result = await middleware(makeRequest('/login'))
    expect(mockRedirectFn).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/dashboard' })
    )
    expect(result).toBe(mockRedirectResponse)
  })

  it('forwards auth cookies on auth-path redirect', async () => {
    const authCookies = [{ name: 'sb-token', value: 'xyz' }]
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockResponse.cookies.getAll.mockReturnValue(authCookies)
    await middleware(makeRequest('/login'))
    expect(mockRedirectResponse.cookies.set).toHaveBeenCalledWith(authCookies[0])
  })

  it('allows authenticated user to access /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const result = await middleware(makeRequest('/dashboard'))
    expect(mockRedirectFn).not.toHaveBeenCalled()
    expect(result).toBe(mockResponse)
  })

  it('allows unauthenticated user to access /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await middleware(makeRequest('/login'))
    expect(mockRedirectFn).not.toHaveBeenCalled()
    expect(result).toBe(mockResponse)
  })

  it('redirects unauthenticated user from /kicks to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await middleware(makeRequest('/kicks'))
    expect(mockRedirectFn).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/login' })
    )
  })

  it('redirects unauthenticated user from /settings to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await middleware(makeRequest('/settings'))
    expect(mockRedirectFn).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/login' })
    )
  })

  it('redirects authenticated user from / to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const result = await middleware(makeRequest('/'))
    expect(mockRedirectFn).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/dashboard' })
    )
    expect(result).toBe(mockRedirectResponse)
  })

  it('forwards ?code at / to /auth/callback before any auth check', async () => {
    const result = await middleware(makeRequest('/?code=test-code-123'))
    expect(mockGetUser).not.toHaveBeenCalled()
    expect(mockRedirectFn).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/auth/callback' })
    )
    const redirectedUrl = (mockRedirectFn.mock.calls as unknown as URL[][])[0]?.[0]
    expect(redirectedUrl?.searchParams.get('code')).toBe('test-code-123')
    expect(result).toBe(mockRedirectResponse)
  })
})
