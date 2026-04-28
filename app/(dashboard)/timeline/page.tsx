import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/ui/header'
import type { PregnancyWeek } from '@/types/database'

export default async function TimelinePage() {
  const supabase = await createClient()

  const { data: weeks } = await supabase
    .from('pregnancy_weeks')
    .select('id, week_number, title, description')
    .order('week_number')

  return (
    <Container className="pt-6">
      <div className="fade-up">
        <Header eyebrow="Your journey" title="Timeline" />
      </div>

      <ol className="space-y-2 fade-up">
        {((weeks ?? []) as PregnancyWeek[]).map((week) => (
          <li
            key={week.id}
            className="flex items-center gap-4 px-5 py-4 rounded-xl"
            style={{
              background: 'var(--forest-mid)',
              border: '1px solid rgba(201,160,50,0.1)',
            }}
          >
            <span
              className="text-2xl font-light w-10 shrink-0 text-center tabular-nums"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--gold)' }}
              aria-label={`Week ${week.week_number}`}
            >
              {week.week_number}
            </span>
            <div className="min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--cream)' }}
              >
                {week.title ?? `Week ${week.week_number}`}
              </p>
              {week.description && (
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: 'var(--cream-dim)' }}
                >
                  {week.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Container>
  )
}
