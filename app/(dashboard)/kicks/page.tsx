import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/ui/header'
import { KickPlay } from '@/components/timeline/KickPlay'

export default async function KicksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <Container className="pt-6">
      <div className="fade-up mb-6">
        <Header eyebrow="Today" title="Kick Tracker" />
      </div>
      <div className="fade-up">
        <KickPlay userId={user.id} />
      </div>
    </Container>
  )
}
