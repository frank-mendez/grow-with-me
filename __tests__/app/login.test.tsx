import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

const mockSignInWithOtp = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { signInWithOtp: mockSignInWithOtp },
  })),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders the email input and submit button', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument()
  })

  it('renders the brand heading', () => {
    render(<LoginPage />)
    expect(screen.getByText('Grow With Me')).toBeInTheDocument()
  })

  it('shows loading state while submitting', async () => {
    mockSignInWithOtp.mockImplementation(() => new Promise(() => {}))
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument()
    })
  })

  it('shows success state after magic link is sent', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
    })
  })

  it('shows error message when signInWithOtp fails', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: { message: 'Rate limit exceeded' } })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'bad@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
    })
  })

  it('uses NEXT_PUBLIC_SITE_URL as emailRedirectTo when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: 'https://example.com/auth/callback',
          }),
        })
      )
    })
  })

  it('strips trailing slash from NEXT_PUBLIC_SITE_URL in emailRedirectTo', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/')
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: 'https://example.com/auth/callback',
          }),
        })
      )
    })
  })

  it('falls back to location.origin for emailRedirectTo when NEXT_PUBLIC_SITE_URL is unset', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: expect.stringMatching(/\/auth\/callback$/),
          }),
        })
      )
    })
  })

  it('returns to the form when "Use a different email" is clicked', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => screen.getByText(/check your inbox/i))
    fireEvent.click(screen.getByRole('button', { name: /use a different email/i }))

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
