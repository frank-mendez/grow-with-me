'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/(dashboard)/settings/actions'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/kicks', label: 'Kick Tracker' },
  { href: '/mood', label: 'Mood Garden' },
  { href: '/talk-to-baby', label: 'Talk to Baby' },
  { href: '/settings', label: 'Settings' },
]

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 51,
              background: 'var(--overlay-bg)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem 2rem 2.5rem',
            }}
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
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            <nav style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '2rem',
                      fontWeight: 300,
                      fontStyle: 'italic',
                      color: isActive ? 'var(--gold)' : 'var(--cream)',
                      textDecoration: 'none',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid rgba(201,160,50,0.08)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            <form action={signOut}>
              <button
                type="submit"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--card-border)',
                  borderRadius: 8,
                  color: 'var(--cream-dim)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.6rem 1.2rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}
