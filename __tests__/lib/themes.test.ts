import { describe, it, expect } from 'vitest'
import { themes, DEFAULT_THEME } from '@/lib/themes'

describe('themes', () => {
  it('has exactly 4 themes', () => {
    expect(themes).toHaveLength(4)
  })

  it('contains botanical, blossom, midnight, light IDs', () => {
    const ids = themes.map((t) => t.id)
    expect(ids).toContain('botanical')
    expect(ids).toContain('blossom')
    expect(ids).toContain('midnight')
    expect(ids).toContain('light')
  })

  it('each theme has all required preview fields', () => {
    for (const t of themes) {
      expect(t.id).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.emoji).toBeTruthy()
      expect(t.bg).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(t.card).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(t.accent).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('DEFAULT_THEME is botanical', () => {
    expect(DEFAULT_THEME).toBe('botanical')
  })
})
