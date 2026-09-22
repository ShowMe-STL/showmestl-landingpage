'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentWeekStart } from '@/lib/analytics/shared'

const DEV_TASKS_PATH = '/admin/dev-tasks'

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskOwner = 'Jack' | 'Izayah' | 'Alec'
export type TaskPriority = 0 | 1 | 2

export type TaskInput = {
  title: string
  notes: string | null
  status: TaskStatus
  owner: TaskOwner | null
  due_date: string | null
  image_url: string | null
  is_recurring: boolean
  priority: TaskPriority | null
}

export type PartnershipStage =
  | 'researching'
  | 'contacted'
  | 'in_talks'
  | 'partnered'
  | 'declined'

export type PartnershipInput = {
  name: string
  contact_info: string | null
  stage: PartnershipStage
  notes: string | null
}

// Tasks (Kanban)

export async function createTask(input: TaskInput) {
  await requireModerator()

  const title = input.title.trim()
  if (!title) return { error: 'Title is required.' }

  const supabase = createAdminClient()

  const { count } = await supabase
    .from('dev_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', input.status)

  const { error } = await supabase.from('dev_tasks').insert({
    title,
    notes: input.notes || null,
    status: input.status,
    owner: input.owner,
    due_date: input.due_date || null,
    image_url: input.image_url || null,
    is_recurring: input.is_recurring,
    priority: input.priority,
    sort_order: count ?? 0,
  })

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function updateTask(id: number, input: TaskInput) {
  await requireModerator()

  const title = input.title.trim()
  if (!title) return { error: 'Title is required.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('dev_tasks')
    .update({
      title,
      notes: input.notes || null,
      status: input.status,
      owner: input.owner,
      due_date: input.due_date || null,
      image_url: input.image_url || null,
      is_recurring: input.is_recurring,
      priority: input.priority,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function deleteTask(id: number) {
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase.from('dev_tasks').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function moveTask(
  id: number,
  status: TaskStatus,
  sortOrder: number,
) {
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('dev_tasks')
    .update({ status, sort_order: sortOrder })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function setWeeklyCompletion(taskId: number, completed: boolean) {
  await requireModerator()

  const supabase = createAdminClient()
  const weekStart = currentWeekStart()

  if (completed) {
    const { error } = await supabase
      .from('dev_task_completions')
      .upsert(
        { task_id: taskId, week_start: weekStart },
        { onConflict: 'task_id,week_start' },
      )
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('dev_task_completions')
      .delete()
      .eq('task_id', taskId)
      .eq('week_start', weekStart)
    if (error) return { error: error.message }
  }

  revalidatePath(DEV_TASKS_PATH)
}

export async function archiveTask(id: number, archived: boolean) {
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('dev_tasks')
    .update({ is_archived: archived, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function markTaskDone(id: number) {
  await requireModerator()

  const supabase = createAdminClient()

  const { count } = await supabase
    .from('dev_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'done')
    .eq('is_archived', false)

  const { error } = await supabase
    .from('dev_tasks')
    .update({
      status: 'done',
      sort_order: count ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function uploadTaskImage(formData: FormData) {
  await requireModerator()

  const file = formData.get('file')
  if (!(file instanceof File)) return { error: 'No file provided.' }
  if (!file.type.startsWith('image/')) {
    return { error: 'Only image files are supported.' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: 'Image must be smaller than 5MB.' }
  }

  const supabase = createAdminClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('dev-task-images')
    .upload(path, file, { contentType: file.type })

  if (error) return { error: error.message }

  const { data } = supabase.storage.from('dev-task-images').getPublicUrl(path)
  return { url: data.publicUrl }
}

// Partnerships

export async function createPartnership(input: PartnershipInput) {
  await requireModerator()

  const name = input.name.trim()
  if (!name) return { error: 'Name is required.' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('partnerships').insert({
    name,
    contact_info: input.contact_info || null,
    stage: input.stage,
    notes: input.notes || null,
  })

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function updatePartnership(id: number, input: PartnershipInput) {
  await requireModerator()

  const name = input.name.trim()
  if (!name) return { error: 'Name is required.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('partnerships')
    .update({
      name,
      contact_info: input.contact_info || null,
      stage: input.stage,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function deletePartnership(id: number) {
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase.from('partnerships').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function addPartnershipMessage(
  partnershipId: number,
  message: string,
) {
  await requireModerator()

  const trimmed = message.trim()
  if (!trimmed) return { error: 'Message is required.' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('partnership_messages').insert({
    partnership_id: partnershipId,
    message: trimmed,
  })

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}

export async function deletePartnershipMessage(id: number) {
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('partnership_messages')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(DEV_TASKS_PATH)
}
