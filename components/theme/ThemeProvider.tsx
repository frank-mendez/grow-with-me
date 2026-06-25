'use client'
import { createContext, useContext, useState } from 'react'
import { DEFAULT_THEME, type ThemeId } from '@/lib/themes'

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof document === 'undefined') return DEFAULT_THEME
    return (document.documentElement.getAttribute('data-theme') as ThemeId) || DEFAULT_THEME
  })

  function setTheme(id: ThemeId) {
    setThemeState(id)
    document.documentElement.setAttribute('data-theme', id)
    try {
      localStorage.setItem('gwm-theme', id)
    } catch {
      // storage unavailable — silently ignore
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
