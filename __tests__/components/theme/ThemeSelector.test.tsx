import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ThemeSelector } from '@/components/theme/ThemeSelector'
import { themes } from '@/lib/themes'

function renderWithProvider(initialTheme = 'botanical') {
  document.documentElement.setAttribute('data-theme', initialTheme)
  return render(
    <ThemeProvider>
      <ThemeSelector />
    </ThemeProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeSelector', () => {
  it('renders a button for all 4 themes', async () => {
    renderWithProvider()
    await act(async () => {})
    for (const t of themes) {
      expect(
        screen.getByRole('button', { name: `Select ${t.name} theme` })
      ).toBeInTheDocument()
    }
  })

  it('marks the active theme button as aria-pressed', async () => {
    renderWithProvider('botanical')
    await act(async () => {})
    expect(
      screen.getByRole('button', { name: 'Select Botanical Calm theme' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Select Soft Blossom theme' })
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('updates data-theme and localStorage when a theme card is clicked', async () => {
    const user = userEvent.setup()
    renderWithProvider('botanical')
    await act(async () => {})
    await user.click(screen.getByRole('button', { name: 'Select Midnight Glow theme' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight')
    expect(localStorage.getItem('gwm-theme')).toBe('midnight')
  })

  it('shows the active theme name in the status label', async () => {
    renderWithProvider('blossom')
    await act(async () => {})
    expect(screen.getByText('Soft Blossom is active')).toBeInTheDocument()
  })
})
