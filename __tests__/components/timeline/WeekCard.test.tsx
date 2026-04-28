import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    button: ({ children, animate, whileTap, transition, ...rest }: React.ComponentProps<'button'> & {
      animate?: unknown; whileTap?: unknown; transition?: unknown
    }) => <button {...rest}>{children}</button>,
  },
}))

import { WeekCard } from '@/components/timeline/WeekCard'

const week = {
  id: 'w5',
  week_number: 5,
  title: 'The Heart Beats',
  description: 'Heart starts beating',
}

describe('WeekCard', () => {
  it('renders the week number', () => {
    render(<WeekCard week={week} isSelected={false} isCurrent={false} onClick={vi.fn()} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders the fruit emoji for the week', () => {
    render(<WeekCard week={week} isSelected={false} isCurrent={false} onClick={vi.fn()} />)
    // Week 5 maps to 🫘
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<WeekCard week={week} isSelected={false} isCurrent={false} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows "now" badge when isCurrent', () => {
    render(<WeekCard week={week} isSelected={false} isCurrent={true} onClick={vi.fn()} />)
    expect(screen.getByText('now')).toBeInTheDocument()
  })

  it('hides "now" badge when not current', () => {
    render(<WeekCard week={week} isSelected={false} isCurrent={false} onClick={vi.fn()} />)
    expect(screen.queryByText('now')).not.toBeInTheDocument()
  })

  it('has accessible aria-label with week number', () => {
    render(<WeekCard week={week} isSelected={false} isCurrent={false} onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /week 5/i })).toBeInTheDocument()
  })

  it('aria-label includes "current week" when isCurrent', () => {
    render(<WeekCard week={week} isSelected={false} isCurrent={true} onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /current week/i })).toBeInTheDocument()
  })

  it('sets aria-pressed true when selected', () => {
    render(<WeekCard week={week} isSelected={true} isCurrent={false} onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('sets aria-pressed false when not selected', () => {
    render(<WeekCard week={week} isSelected={false} isCurrent={false} onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })
})
