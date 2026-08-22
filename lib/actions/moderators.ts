'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function addModeratorByEmail(email: string) {
  await requireModerator()

  const normalized = email.trim().toLowerCase()
  if (!normalized) return { error: 'Email is required.' }

  const supabase = createAdminClient()

  // GoTrue's admin listUsers doesn't filter server-side by email in this
  // project's version, so we page through and match client-side.
  let user: { id: string; email?: string } | undefined
  for (let page = 1; page <= 20 && !user; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    })
    if (error) return { error: error.message }
    user = data.users.find((u) => u.email?.toLowerCase() === normalized)
    if (data.users.length < 1000) break
  }

  if (!user) {
    return { error: 'No account found with that email.' }
  }

  const { error } = await supabase
    .from('moderators')
    .insert({ user_id: user.id })

  if (error) {
    if (error.code === '23505') return { error: 'Already a moderator.' }
    return { error: error.message }
  }

  revalidatePath('/moderators')
}

export async function removeModerator(userId: string) {
  const moderator = await requireModerator()
  if (moderator.id === userId) {
    return { error: "You can't remove your own moderator access from here." }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('moderators')
    .delete()
    .eq('user_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/moderators')
}
