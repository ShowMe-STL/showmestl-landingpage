import { createAdminClient } from '@/lib/supabase/admin'
import { ModeratorsManager } from '@/components/moderators/moderators-manager'

export default async function ModeratorsPage() {
  const supabase = createAdminClient()

  const [moderatorsRes, usersRes] = await Promise.all([
    supabase.from('moderators').select('user_id, created_at'),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const usersById = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u]))

  const moderators = (moderatorsRes.data ?? []).map((m) => {
    const user = usersById.get(m.user_id)
    return {
      user_id: m.user_id,
      created_at: m.created_at,
      email: user?.email ?? null,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Moderators</h1>
        <p className="text-muted-foreground">
          Accounts with admin dashboard access. Someone needs an existing
          ShowMeSTL account before they can be added here.
        </p>
      </div>
      <ModeratorsManager initialModerators={moderators} />
    </div>
  )
}
