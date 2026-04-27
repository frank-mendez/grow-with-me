import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockClient = { auth: {}, from: vi.fn() }
const mockCreateBrowserClient = vi.fn(() => mockClient)

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: mockCreateBrowserClient,
}))

describe('lib/supabase/client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('returns a client instance', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const client = createClient()
    expect(client).toBeDefined()
    expect(client).toBe(mockClient)
  })

  it('calls createBrowserClient with env vars', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    createClient()
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'http://127.0.0.1:54321',
      'test-anon-key'
    )
  })

  it('creates a new client on each call', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    createClient()
    createClient()
    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2)
  })
})
