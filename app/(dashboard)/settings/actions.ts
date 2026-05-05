'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function saveDueDate(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = formData.get('due_date')
  if (typeof raw !== 'string' || !raw) return

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return

  await supabase
    .from('profiles')
    .update({ due_date: raw })
    .eq('id', user.id)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
