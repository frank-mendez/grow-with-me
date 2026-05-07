import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/ui/header'
import { ThemeSelector } from '@/components/theme/ThemeSelector'
import type { Profile } from '@/types/database'
import { saveDueDate } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('due_date')
    .eq('id', user.id)
    .single<Pick<Profile, 'due_date'>>()

  return (
    <Container className="pt-6">
      <div className="fade-up mb-8">
        <Header eyebrow="Personalize" title="Settings" />
      </div>

      <div className="flex flex-col gap-4 fade-up">
        <form action={saveDueDate}>
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
          >
            <label className="block mb-5">
              <p
                className="text-xs tracking-widest uppercase mb-1"
                style={{ color: 'var(--accent)' }}
              >
                Due Date
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
                Used to calculate your current week of pregnancy
              </p>
              <input
                type="date"
                name="due_date"
                defaultValue={profile?.due_date ?? ''}
                required
                className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-1"
                style={{
                  background: 'var(--card-alt)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text)',
                  colorScheme: 'dark',
                }}
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-medium tracking-wide transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              Save
            </button>
          </div>
        </form>

        <ThemeSelector />
      </div>
    </Container>
  )
}
