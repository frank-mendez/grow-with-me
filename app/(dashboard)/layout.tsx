import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentWeek } from '@/lib/pregnancy'
import { BottomNav } from '@/components/ui/BottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('due_date')
    .eq('id', user.id)
    .single()

  const currentWeek = getCurrentWeek(profile?.due_date ?? null)
  const weeksLeft = currentWeek !== null ? Math.max(0, 40 - currentWeek) : null

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
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 72, maxWidth: 900, margin: '0 auto', width: '100%' }}
        >
          {/* Hamburger */}
          <button
            aria-label="Open menu"
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

          {/* Center: branding */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.35rem',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: 'var(--cream)',
                  letterSpacing: '0.01em',
                }}
              >
                Grow With Me
              </span>
              <span aria-hidden="true" style={{ fontSize: '15px' }}>🍃</span>
            </div>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--cream-dim)',
                letterSpacing: '0.01em',
                marginTop: '1px',
              }}
            >
              Cherishing every little moment of our journey ♥
            </p>
          </div>

          {/* Right: weeks-to-go pill */}
          {weeksLeft !== null ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 11px',
                borderRadius: 9999,
                background: 'var(--forest-light)',
                border: '1px solid rgba(201,160,50,0.28)',
                fontSize: '11.5px',
                color: 'var(--cream)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span style={{ color: 'var(--gold)' }}>❤</span>
              <span>{weeksLeft} weeks to go</span>
            </div>
          ) : (
            <div style={{ width: 40 }} aria-hidden="true" />
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-4">{children}</main>

      <BottomNav />
    </div>
  )
}
