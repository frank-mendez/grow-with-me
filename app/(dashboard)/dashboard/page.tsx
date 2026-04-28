import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/ui/header'
import type { Profile } from '@/types/database'
import { getCurrentWeek } from '@/lib/pregnancy'

const FEATURES = [
  { href: '/timeline', label: 'Timeline', description: 'Week-by-week development', ready: true },
  { href: '#', label: 'Kick Tracker', description: "Log your baby's kicks", ready: false },
  { href: '#', label: 'Mood Garden', description: 'Tend to your daily mood', ready: false },
  { href: '#', label: 'Talk to Baby', description: 'Record a voice message', ready: false },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  // Always use getUser() — getSession() is unsafe for server-side auth checks
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, due_date')
    .eq('id', user.id)
    .single<Pick<Profile, 'display_name' | 'due_date'>>()

  const currentWeek = getCurrentWeek(profile?.due_date ?? null)

  return (
    <Container className="pt-6">
      <div className="fade-up">
        <Header eyebrow="Welcome back" title={profile?.display_name ?? 'Mama'} />
      </div>

      {/* Current week card */}
      <div
        className="rounded-2xl p-6 mb-8 text-center fade-up"
        style={{ background: 'var(--forest-mid)', border: '1px solid rgba(201,160,50,0.18)' }}
      >
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--cream-dim)' }}>
          Current week
        </p>
        <p
          className="text-8xl font-light leading-none"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--gold)' }}
        >
          {currentWeek ?? '—'}
        </p>
        <p className="text-xs mt-3" style={{ color: 'var(--cream-dim)' }}>
          {currentWeek ? 'of 40' : 'Set your due date to track your week'}
        </p>
      </div>

      {/* Feature nav */}
      <nav className="grid grid-cols-1 gap-3 fade-up">
        {FEATURES.map(({ href, label, description, ready }) => {
          const cardClass = `flex items-center justify-between px-5 py-4 rounded-xl border border-[#c9a032]/10 ${
            ready ? 'transition-colors hover:border-[#c9a032]/40' : 'opacity-40'
          }`
          const cardContent = (
            <>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--cream-dim)' }}>{description}</p>
              </div>
              {ready
                ? <span style={{ color: 'var(--gold)' }}>→</span>
                : <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>Soon</span>}
            </>
          )

          return ready ? (
            <Link key={label} href={href} className={cardClass} style={{ background: 'var(--forest-mid)' }}>
              {cardContent}
            </Link>
          ) : (
            <div key={label} className={cardClass} style={{ background: 'var(--forest-mid)' }}>
              {cardContent}
            </div>
          )
        })}
      </nav>
    </Container>
  )
}
