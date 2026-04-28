import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base =
    'w-full py-3 px-6 rounded-xl font-medium text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'btn-shimmer text-[var(--forest)] font-semibold',
    ghost:
      'border text-[var(--cream-dim)] hover:text-[var(--cream)]',
  }

  const ghostStyle =
    variant === 'ghost'
      ? { borderColor: 'rgba(201,160,50,0.3)' }
      : {}

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={ghostStyle}
      {...props}
    >
      {children}
    </button>
  )
}
