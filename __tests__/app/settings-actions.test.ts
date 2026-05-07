import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetUser, mockSignOut, mockUpdate, mockEq, mockFrom, mockRedirect, mockRevalidatePath } = vi.hoisted(() => {
  const mockEq = vi.fn(() => Promise.resolve({ error: null }))
  const mockUpdate = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ update: mockUpdate }))
  return {
    mockGetUser: vi.fn(),
    mockSignOut: vi.fn().mockResolvedValue({}),
    mockUpdate,
    mockEq,
    mockFrom,
    mockRedirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
    mockRevalidatePath: vi.fn(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser, signOut: mockSignOut }, from: mockFrom })
  ),
}))

vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v))
  return fd
}

describe('signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase.auth.signOut and redirects to /login', async () => {
    const { signOut } = await import('@/app/(dashboard)/settings/actions')
    await expect(signOut()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockSignOut).toHaveBeenCalledOnce()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})

describe('saveDueDate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('updates the profile and redirects to /dashboard on valid input', async () => {
    const { saveDueDate } = await import('@/app/(dashboard)/settings/actions')
    await expect(saveDueDate(makeFormData({ due_date: '2025-12-01' }))).rejects.toThrow('NEXT_REDIRECT')

    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockUpdate).toHaveBeenCalledWith({ due_date: '2025-12-01' })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { saveDueDate } = await import('@/app/(dashboard)/settings/actions')
    await expect(saveDueDate(makeFormData({ due_date: '2025-12-01' }))).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('returns early when due_date is missing', async () => {
    const { saveDueDate } = await import('@/app/(dashboard)/settings/actions')
    await saveDueDate(makeFormData({}))

    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('returns early when due_date is an empty string', async () => {
    const { saveDueDate } = await import('@/app/(dashboard)/settings/actions')
    await saveDueDate(makeFormData({ due_date: '' }))

    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('returns early when due_date does not match YYYY-MM-DD format', async () => {
    const { saveDueDate } = await import('@/app/(dashboard)/settings/actions')
    await saveDueDate(makeFormData({ due_date: '01/12/2025' }))

    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('returns early when due_date is an impossible calendar date', async () => {
    const { saveDueDate } = await import('@/app/(dashboard)/settings/actions')
    await saveDueDate(makeFormData({ due_date: '2025-99-99' }))

    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('returns early for a structurally valid but non-existent date (e.g. Feb 30)', async () => {
    const { saveDueDate } = await import('@/app/(dashboard)/settings/actions')
    await saveDueDate(makeFormData({ due_date: '2025-02-30' }))

    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('throws when Supabase update returns an error', async () => {
    mockEq.mockResolvedValue({ error: { message: 'RLS violation' } })

    const { saveDueDate } = await import('@/app/(dashboard)/settings/actions')
    await expect(saveDueDate(makeFormData({ due_date: '2025-12-01' }))).rejects.toThrow('RLS violation')

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
