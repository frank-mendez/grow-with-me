import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const mockExchangeCode = vi.fn()
const mockClient = {
  auth: { exchangeCodeForSession: mockExchangeCode },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}))

const mockRedirect = vi.fn((url: string) => ({ type: 'redirect', url }))
vi.mock('next/server', () => ({
  NextResponse: {
    redirect: mockRedirect,
  },
}))

describe('app/auth/callback/route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login?error=auth when no code is present', async () => {
    const { GET } = await import('@/app/auth/callback/route')
    const request = new Request('http://localhost/auth/callback')
    await GET(request as unknown as NextRequest)
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/login?error=auth')
    )
  })

  it('redirects to /login?error=auth when code exchange fails', async () => {
    mockExchangeCode.mockResolvedValue({ error: new Error('invalid code') })
    const { GET } = await import('@/app/auth/callback/route')
    const request = new Request('http://localhost/auth/callback?code=badcode')
    await GET(request as unknown as NextRequest)
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/login?error=auth')
    )
  })

  it('redirects to /dashboard on successful code exchange', async () => {
    mockExchangeCode.mockResolvedValue({ error: null })
    const { GET } = await import('@/app/auth/callback/route')
    const request = new Request('http://localhost/auth/callback?code=validcode')
    await GET(request as unknown as NextRequest)
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard')
    )
  })
})
