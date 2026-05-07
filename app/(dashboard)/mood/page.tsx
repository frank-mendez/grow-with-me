import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/ui/header'
import { MoodGarden } from '@/components/mood/mood-garden'

export default async function MoodPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <Container className="pt-6">
      <div className="fade-up mb-6">
        <Header eyebrow="Daily" title="Mood Garden" />
      </div>
      <div className="fade-up">
        <MoodGarden userId={user.id} />
      </div>
    </Container>
  )
}
