import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { mockGetUser, mockSingle, mockFrom, mockRedirect } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return {
    mockGetUser: vi.fn(),
    mockSingle,
    mockFrom,
    mockRedirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser }, from: mockFrom })
  ),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('renders the due date label and save button', async () => {
    mockSingle.mockResolvedValue({ data: { due_date: null, display_name: 'Alice' } })

    const { default: SettingsPage } = await import('@/app/(dashboard)/settings/page')
    const jsx = await SettingsPage()
    render(jsx)

    expect(screen.getByText(/Due Date/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('pre-fills the date input when profile has a due date', async () => {
    mockSingle.mockResolvedValue({ data: { due_date: '2025-12-01', display_name: 'Alice' } })

    const { default: SettingsPage } = await import('@/app/(dashboard)/settings/page')
    const jsx = await SettingsPage()
    render(jsx)

    expect(document.querySelector('input[name="due_date"]')).toHaveValue('2025-12-01')
  })

  it('leaves the date input empty when profile has no due date', async () => {
    mockSingle.mockResolvedValue({ data: { due_date: null, display_name: 'Alice' } })

    const { default: SettingsPage } = await import('@/app/(dashboard)/settings/page')
    const jsx = await SettingsPage()
    render(jsx)

    expect(document.querySelector('input[name="due_date"]')).toHaveValue('')
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: SettingsPage } = await import('@/app/(dashboard)/settings/page')
    await expect(SettingsPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
