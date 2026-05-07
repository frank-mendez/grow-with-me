import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentWeek } from '@/lib/pregnancy'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/ui/header'
import { TalkToBaby } from '@/components/timeline/TalkToBaby'
import type { Profile, PregnancyWeek } from '@/types/database'

export default async function TalkToBabyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, weeksResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('due_date')
      .eq('id', user.id)
      .single<Pick<Profile, 'due_date'>>(),
    supabase
      .from('pregnancy_weeks')
      .select('id, week_number')
      .order('week_number'),
  ])

  const currentWeekNumber = getCurrentWeek(profileResult.data?.due_date ?? null) ?? 1
  const weeks = (weeksResult.data ?? []) as Pick<PregnancyWeek, 'id' | 'week_number'>[]
  const week = weeks.find(w => w.week_number === currentWeekNumber) ?? weeks[0]

  return (
    <Container className="pt-6">
      <div className="fade-up mb-6">
        <Header eyebrow={`Week ${currentWeekNumber}`} title="Talk to Baby" />
      </div>
      <div className="fade-up">
        {week ? (
          <TalkToBaby weekId={week.id} weekNumber={week.week_number} userId={user.id} />
        ) : (
          <p style={{ color: 'var(--cream-dim)', fontSize: '0.9rem' }}>
            Timeline data not available yet.
          </p>
        )}
      </div>
    </Container>
  )
}
