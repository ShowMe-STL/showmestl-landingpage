import { createAdminClient } from '@/lib/supabase/admin'
import { UsersManager } from '@/components/users/users-manager'

export default async function UsersPage() {
  const supabase = createAdminClient()

  const [profilesRes, neighborhoodsRes, usersRes, moderatorsRes] =
    await Promise.all([
      supabase
        .from('profiles')
        .select(
          'id, username, display_name, avatar_url, bio, instagram_handle, neighborhood_id, privacy_state, created_at',
        )
        .order('created_at', { ascending: false }),
      supabase.from('neighborhoods').select('id, name').order('name'),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from('moderators').select('user_id'),
    ])

  const emailById = new Map(
    (usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? null]),
  )
  const moderatorIds = new Set((moderatorsRes.data ?? []).map((m) => m.user_id))

  const users = (profilesRes.data ?? []).map((p) => ({
    ...p,
    email: emailById.get(p.id) ?? null,
    is_moderator: moderatorIds.has(p.id),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground">{users.length} accounts.</p>
      </div>
      <UsersManager
        initialUsers={users}
        neighborhoods={neighborhoodsRes.data ?? []}
      />
    </div>
  )
}
