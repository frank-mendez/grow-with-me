'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
}

function TimelineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="2" />
      <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="2" />
      <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="2" />
    </svg>
  )
}

function KicksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v6" />
      <path d="M9 10l-2 5" />
      <path d="M15 10l2 5" />
      <path d="M9 19h6" />
    </svg>
  )
}

function MoodIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
    </svg>
  )
}

const NAV_ITEMS: Array<{
  href: string
  label: string
  Icon: React.ComponentType
  soon?: boolean
}> = [
  { href: '/dashboard', label: 'Home', Icon: HomeIcon },
  { href: '/timeline', label: 'Timeline', Icon: TimelineIcon },
  { href: '#', label: 'Kicks', Icon: KicksIcon, soon: true },
  { href: '#', label: 'Mood', Icon: MoodIcon, soon: true },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="sticky bottom-0"
      style={{
        background: 'var(--forest-mid)',
        borderTop: '1px solid rgba(201,160,50,0.12)',
      }}
    >
      <div className="flex justify-around h-16 items-center max-w-3xl mx-auto px-4">
        {NAV_ITEMS.map(({ href, label, Icon, soon }) => {
          const isActive = !soon && (pathname === href || pathname.startsWith(href + '/'))

          if (soon) {
            return (
              <span
                key={label}
                className="flex flex-col items-center gap-0.5 cursor-not-allowed select-none"
                style={{ color: 'var(--cream-dim)', opacity: 0.35 }}
              >
                <Icon />
                <span style={{ fontSize: '10px' }}>{label}</span>
                <span style={{ fontSize: '9px', letterSpacing: '0.04em' }}>soon</span>
              </span>
            )
          }

          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-0.5 transition-colors"
              style={{ color: isActive ? 'var(--gold)' : 'var(--cream-dim)' }}
            >
              <Icon />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
