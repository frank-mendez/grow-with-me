import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, style, animate, initial, exit, transition, ...rest }: React.ComponentProps<'div'> & {
      animate?: unknown; initial?: unknown; exit?: unknown; transition?: unknown
    }) => <div style={style} {...rest}>{children}</div>,
  },
  useMotionValue: (initial: number) => ({ set: vi.fn(), get: () => initial }),
  useSpring: (v: unknown) => v,
}))

import { BabyVisual } from '@/components/timeline/BabyVisual'

describe('BabyVisual', () => {
  it.each([1, 20, 40])('renders without errors at week %i', (weekNumber) => {
    expect(() => render(<BabyVisual weekNumber={weekNumber} />)).not.toThrow()
  })
})
