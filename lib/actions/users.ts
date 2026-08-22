'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export type ProfileInput = {
  username: string
  display_name: string | null
  bio: string | null
  instagram_handle: string | null
  neighborhood_id: number | null
  privacy_state: 'public' | 'private'
}

export async function updateProfile(id: string, input: ProfileInput) {
  await requireModerator()

  const username = input.username.trim()
  if (!username) return { error: 'Username is required.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      display_name: input.display_name || null,
      bio: input.bio || null,
      instagram_handle: input.instagram_handle || null,
      neighborhood_id: input.neighborhood_id,
      privacy_state: input.privacy_state,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/users')
}

// Deletes the auth.users row; public.profiles cascades via its FK.
export async function deleteUser(id: string) {
  const moderator = await requireModerator()
  if (moderator.id === id) {
    return { error: "You can't delete your own account from here." }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) return { error: error.message }
  revalidatePath('/users')
}
