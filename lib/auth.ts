import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type CurrentModerator = {
  id: string
  email: string | null
  username: string
  displayName: string | null
}

/**
 * Confirms the caller is signed in AND present in `moderators`. Every server
 * action calls this itself rather than trusting proxy.ts, per Next's
 * server-actions guidance: a matcher change can silently stop covering a
 * Server Function, so each action must re-check authorization on its own.
 */
export async function requireModerator(): Promise<CurrentModerator> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not signed in.')
  }

  const { data: moderator } = await supabase
    .from('moderators')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!moderator) {
    throw new Error('Not authorized.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? null,
    username: profile?.username ?? 'moderator',
    displayName: profile?.display_name ?? null,
  }
}
