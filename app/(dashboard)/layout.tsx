import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/timeline', label: 'Timeline' },
  { href: '#', label: 'Kicks', soon: true },
  { href: '#', label: 'Mood', soon: true },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: 'var(--forest)' }}
    >
      {/* Top header */}
      <header
        style={{
          background: 'var(--forest-mid)',
          borderBottom: '1px solid rgba(201,160,50,0.12)',
        }}
      >
        <Container>
          <div className="flex items-center justify-between h-14">
            <span
              className="text-lg font-light italic"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--cream)' }}
            >
              Grow With Me
            </span>
            <span aria-hidden="true">🌿</span>
          </div>
        </Container>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-4">{children}</main>

      {/* Bottom nav */}
      <nav
        className="sticky bottom-0"
        style={{
          background: 'var(--forest-mid)',
          borderTop: '1px solid rgba(201,160,50,0.12)',
        }}
      >
        <Container>
          <div className="flex justify-around h-16 items-center">
            {NAV_ITEMS.map(({ href, label, soon }) =>
              soon ? (
                <span
                  key={label}
                  className="flex flex-col items-center text-xs gap-0.5 opacity-30 cursor-not-allowed select-none"
                  style={{ color: 'var(--cream-dim)' }}
                >
                  {label}
                  <span className="text-[10px]">soon</span>
                </span>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center text-xs gap-0.5 transition-colors hover:text-[var(--cream)]"
                  style={{ color: 'var(--cream-dim)' }}
                >
                  {label}
                </Link>
              )
            )}
          </div>
        </Container>
      </nav>
    </div>
  )
}
