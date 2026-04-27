import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetAll = vi.fn(() => [{ name: 'sb-token', value: 'abc' }])
const mockSet = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({ getAll: mockGetAll, set: mockSet })
  ),
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

describe('lib/supabase/server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('returns a server client instance', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const client = await createClient()
    expect(client).toBeDefined()
    expect(client).toBe(mockServerClient)
  })

  it('calls createServerClient with correct url and key', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    await createClient()
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'http://127.0.0.1:54321',
      'test-anon-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    )
  })

  it('passes getAll to cookie adapter', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    await createClient()

    const [, , cookiesArg] = mockCreateServerClient.mock.calls[0] as unknown as [string, string, CookieAdapter]
    const result = cookiesArg.cookies.getAll()
    expect(result).toEqual([{ name: 'sb-token', value: 'abc' }])
  })

  it('setAll silently ignores errors from Server Component context', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    await createClient()

    const [, , cookiesArg] = mockCreateServerClient.mock.calls[0] as unknown as [string, string, CookieAdapter]
    mockSet.mockImplementationOnce(() => { throw new Error('read-only') })
    expect(() =>
      cookiesArg.cookies.setAll([{ name: 'x', value: 'y', options: {} }])
    ).not.toThrow()
  })
})
