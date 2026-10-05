import { createAdminClient } from '@/lib/supabase/admin'
import { currentWeekStart } from '@/lib/analytics/shared'
import { DevTasksTabs } from '@/components/dev-tasks/dev-tasks-tabs'

export default async function DevTasksPage() {
  const supabase = createAdminClient()
  const weekStart = currentWeekStart()

  const [tasksRes, partnershipsRes, messagesRes, completionsRes] =
    await Promise.all([
      supabase
        .from('dev_tasks')
        .select(
          'id, title, notes, status, owner, due_date, image_url, sort_order, is_recurring, priority, is_archived, updated_at',
        )
        .order('sort_order'),
      supabase
        .from('partnerships')
        .select(
          'id, name, contact_info, stage, notes, created_at, updated_at',
        )
        .order('updated_at', { ascending: false }),
      supabase
        .from('partnership_messages')
        .select('id, partnership_id, message, sent_at')
        .order('sent_at', { ascending: false }),
      supabase
        .from('dev_task_completions')
        .select('task_id')
        .eq('week_start', weekStart),
    ])

  const completedTaskIds = (completionsRes.data ?? []).map((c) => c.task_id)

  const messagesByPartnership = new Map<
    number,
    NonNullable<typeof messagesRes.data>
  >()
  for (const message of messagesRes.data ?? []) {
    const list = messagesByPartnership.get(message.partnership_id) ?? []
    list.push(message)
    messagesByPartnership.set(message.partnership_id, list)
  }

  const partnerships = (partnershipsRes.data ?? []).map((p) => ({
    ...p,
    messages: messagesByPartnership.get(p.id) ?? [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team Tasks</h1>
        <p className="text-muted-foreground">
          The weekly Kanban board and partnership outreach.
        </p>
      </div>
      <DevTasksTabs
        tasks={tasksRes.data ?? []}
        partnerships={partnerships}
        completedTaskIds={completedTaskIds}
      />
    </div>
  )
}
