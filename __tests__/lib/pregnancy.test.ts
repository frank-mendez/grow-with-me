import { describe, it, expect } from 'vitest'
import { computeProgress } from '@/lib/pregnancy'

describe('computeProgress', () => {
  it('returns 0.4 at week 1', () => {
    expect(computeProgress(1)).toBe(0.4)
  })

  it('returns 1.0 at week 40', () => {
    expect(computeProgress(40)).toBe(1.0)
  })

  it('returns a value between 0.4 and 1.0 for mid-range weeks', () => {
    const result = computeProgress(20)
    expect(result).toBeGreaterThan(0.4)
    expect(result).toBeLessThan(1.0)
  })

  it('increases monotonically from week 1 to week 40', () => {
    for (let w = 1; w < 40; w++) {
      expect(computeProgress(w + 1)).toBeGreaterThan(computeProgress(w))
    }
  })
})
