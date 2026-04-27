import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders the main landmark', () => {
    render(<HomePage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the "Grow With" headline text', () => {
    render(<HomePage />)
    expect(screen.getByText('Grow With')).toBeInTheDocument()
  })

  it('renders the gold "Me" span', () => {
    render(<HomePage />)
    expect(screen.getByText('Me')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<HomePage />)
    expect(
      screen.getByText(/A week-by-week sanctuary/i)
    ).toBeInTheDocument()
  })

  it('renders the primary CTA button', () => {
    render(<HomePage />)
    expect(
      screen.getByRole('button', { name: /Begin Your Journey/i })
    ).toBeInTheDocument()
  })

  it('renders the secondary CTA button', () => {
    render(<HomePage />)
    expect(
      screen.getByRole('button', { name: /See the features/i })
    ).toBeInTheDocument()
  })

  it('renders all four feature cards', () => {
    render(<HomePage />)
    expect(screen.getByText('Baby Timeline')).toBeInTheDocument()
    expect(screen.getByText('Talk to Baby')).toBeInTheDocument()
    expect(screen.getByText('Kick Play')).toBeInTheDocument()
    expect(screen.getByText('Mood Garden')).toBeInTheDocument()
  })

  it('renders the week milestone badge', () => {
    render(<HomePage />)
    expect(screen.getByText(/40 weeks of guided milestones/i)).toBeInTheDocument()
  })
})
