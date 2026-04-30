import { createClient } from '@/lib/supabase/server'
import type { PregnancyWeek, Profile } from '@/types/database'
import { getCurrentWeek } from '@/lib/pregnancy'
import { TimelineView } from '@/components/timeline/TimelineView'

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [weeksResult, profileResult] = await Promise.all([
    supabase
      .from('pregnancy_weeks')
      .select('id, week_number, title, description, baby_size, trimester, approx_size, just_for_you')
      .order('week_number'),
    user
      ? supabase
          .from('profiles')
          .select('due_date')
          .eq('id', user.id)
          .single<Pick<Profile, 'due_date'>>()
      : Promise.resolve({ data: null, error: null }),
  ])

  if (weeksResult.error) throw weeksResult.error
  if (profileResult.error) {
    console.warn('Failed to load profile due_date for timeline', {
      userId: user?.id,
      message: profileResult.error.message,
    })
  }

  const weeks = (weeksResult.data ?? []) as PregnancyWeek[]
  const currentWeek = getCurrentWeek(profileResult.error ? null : (profileResult.data?.due_date ?? null))
  const initialWeek = currentWeek ?? 1

  return (
    <TimelineView
      weeks={weeks}
      initialWeek={initialWeek}
      currentWeek={currentWeek}
    />
  )
}
