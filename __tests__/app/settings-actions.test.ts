import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetUser, mockUpdate, mockFrom, mockRedirect, mockRevalidatePath } = vi.hoisted(() => {
  const mockUpdate = vi.fn()
  const mockEq = vi.fn(() => Promise.resolve({ error: null }))
  mockUpdate.mockReturnValue({ eq: mockEq })
  const mockFrom = vi.fn(() => ({ update: mockUpdate }))
  return {
    mockGetUser: vi.fn(),
    mockUpdate,
    mockFrom,
    mockRedirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
    mockRevalidatePath: vi.fn(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser }, from: mockFrom })
  ),
}))

vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v))
  return fd
}

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
})
