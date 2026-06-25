import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/theme/ThemeProvider'

function TestConsumer() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('blossom')}>switch</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeProvider', () => {
  it('provides default theme (botanical) when no data-theme is set', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme').textContent).toBe('botanical')
  })

  it('reads data-theme attribute from document on mount', async () => {
    document.documentElement.setAttribute('data-theme', 'midnight')
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    await act(async () => {})
    expect(screen.getByTestId('theme').textContent).toBe('midnight')
  })

  it('setTheme updates the data-theme attribute on document', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    await act(async () => {
      fireEvent.click(screen.getByText('switch'))
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('blossom')
  })

  it('setTheme writes the theme id to localStorage', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    await act(async () => {
      fireEvent.click(screen.getByText('switch'))
    })
    expect(localStorage.getItem('gwm-theme')).toBe('blossom')
  })

  it('setTheme still updates data-theme when localStorage throws', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    await act(async () => {
      fireEvent.click(screen.getByText('switch'))
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('blossom')
    expect(screen.getByTestId('theme').textContent).toBe('blossom')
    spy.mockRestore()
  })
})
