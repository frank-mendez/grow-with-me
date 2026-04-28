import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const mockNextResponse = {
  cookies: {
    set: vi.fn(),
  },
}

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => mockNextResponse),
  },
}))

const mockServerClient = { auth: {}, from: vi.fn() }
const mockCreateServerClient = vi.fn(() => mockServerClient)

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}))

type CookieAdapter = {
  cookies: {
    getAll: () => { name: string; value: string }[]
    setAll: (cookies: { name: string; value: string; options: object }[]) => void
  }
}

describe('lib/supabase/middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('returns a supabase client and response object', async () => {
    const { createClient } = await import('@/lib/supabase/middleware')
    const mockRequest = {
      cookies: { getAll: vi.fn(() => []), set: vi.fn() },
    } as unknown as NextRequest

    const result = createClient(mockRequest)
    expect(result.supabase).toBe(mockServerClient)
    expect(result.response).toBeDefined()
  })

  it('calls createServerClient with correct env vars', async () => {
    const { createClient } = await import('@/lib/supabase/middleware')
    const mockRequest = {
      cookies: { getAll: vi.fn(() => []), set: vi.fn() },
    } as unknown as NextRequest

    createClient(mockRequest)
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'http://127.0.0.1:54321',
      'test-anon-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    )
  })

  it('getAll returns cookies from the request', async () => {
    const { createClient } = await import('@/lib/supabase/middleware')
    const mockCookies = [{ name: 'session', value: 'abc123' }]
    const mockRequest = {
      cookies: { getAll: vi.fn(() => mockCookies), set: vi.fn() },
    } as unknown as NextRequest

    createClient(mockRequest)

    const [, , opts] = mockCreateServerClient.mock.calls[0] as unknown as [string, string, CookieAdapter]
    expect(opts.cookies.getAll()).toEqual(mockCookies)
  })

  it('setAll sets cookies on both the request and the new response', async () => {
    const { createClient } = await import('@/lib/supabase/middleware')
    const mockSet = vi.fn()
    const mockRequest = {
      cookies: { getAll: vi.fn(() => []), set: mockSet },
    } as unknown as NextRequest

    createClient(mockRequest)

    const [, , opts] = mockCreateServerClient.mock.calls[0] as unknown as [string, string, CookieAdapter]
    const cookiesToSet = [{ name: 'token', value: 'xyz', options: { path: '/' } }]
    opts.cookies.setAll(cookiesToSet)

    expect(mockSet).toHaveBeenCalledWith('token', 'xyz')
    expect(mockNextResponse.cookies.set).toHaveBeenCalledWith('token', 'xyz', { path: '/' })
  })
})
