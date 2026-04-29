'use client'
import { useState } from 'react'

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--cream)',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
          <rect y="0" width="18" height="1.5" rx="0.75" fill="currentColor" />
          <rect y="6.25" width="18" height="1.5" rx="0.75" fill="currentColor" />
          <rect y="12.5" width="18" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      </button>

      {/* Placeholder drawer — expand when implementing full nav menu */}
      {open && (
        <div
          role="dialog"
          aria-label="Navigation menu"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(11,26,20,0.96)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
          }}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            style={{
              alignSelf: 'flex-end',
              background: 'transparent',
              border: 'none',
              color: 'var(--cream)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
