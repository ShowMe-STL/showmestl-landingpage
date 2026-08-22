'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export type EventInput = {
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  place_id: number | null
  venue_name: string | null
  address: string | null
  website: string | null
  image_url: string | null
  image_thumb_url: string | null
  neighborhood_id: number | null
  category_ids: number[]
  dress_code_id: number | null
  custom_dress_code: string | null
  recurrence_rule: string | null
  recurrence_timezone: string | null
  // Blank means "leave the existing location untouched" on update.
  latitude: number | null
  longitude: number | null
}

function toLocation(lat: number | null, lng: number | null) {
  if (lat === null || lng === null) return undefined
  return `SRID=4326;POINT(${lng} ${lat})`
}

async function syncCategoryAssignments(eventId: number, categoryIds: number[]) {
  const supabase = createAdminClient()
  await supabase
    .from('event_category_assignments')
    .delete()
    .eq('event_id', eventId)

  if (categoryIds.length === 0) return

  await supabase.from('event_category_assignments').insert(
    categoryIds.map((category_id, index) => ({
      event_id: eventId,
      category_id,
      sort_order: index,
    })),
  )
}

export async function createEvent(input: EventInput) {
  await requireModerator()

  const title = input.title.trim()
  if (!title) return { error: 'Title is required.' }
  if (!input.start_time) return { error: 'Start time is required.' }

  const supabase = createAdminClient()
  const location = toLocation(input.latitude, input.longitude)

  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      description: input.description || null,
      start_time: input.start_time,
      end_time: input.end_time || null,
      place_id: input.place_id,
      venue_name: input.venue_name || null,
      address: input.address || null,
      website: input.website || null,
      image_url: input.image_url || null,
      image_thumb_url: input.image_thumb_url || null,
      neighborhood_id: input.neighborhood_id,
      category_id: input.category_ids[0] ?? null,
      dress_code_id: input.dress_code_id,
      custom_dress_code: input.dress_code_id
        ? null
        : input.custom_dress_code || null,
      recurrence_rule: input.recurrence_rule || null,
      recurrence_timezone: input.recurrence_timezone || null,
      location: location ?? 'SRID=4326;POINT(-90.199404 38.627003)',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await syncCategoryAssignments(data.id, input.category_ids)

  revalidatePath('/events')
  return { id: data.id }
}

export async function updateEvent(id: number, input: EventInput) {
  await requireModerator()

  const title = input.title.trim()
  if (!title) return { error: 'Title is required.' }
  if (!input.start_time) return { error: 'Start time is required.' }

  const supabase = createAdminClient()
  const location = toLocation(input.latitude, input.longitude)

  const { error } = await supabase
    .from('events')
    .update({
      title,
      description: input.description || null,
      start_time: input.start_time,
      end_time: input.end_time || null,
      place_id: input.place_id,
      venue_name: input.venue_name || null,
      address: input.address || null,
      website: input.website || null,
      image_url: input.image_url || null,
      image_thumb_url: input.image_thumb_url || null,
      neighborhood_id: input.neighborhood_id,
      category_id: input.category_ids[0] ?? null,
      dress_code_id: input.dress_code_id,
      custom_dress_code: input.dress_code_id
        ? null
        : input.custom_dress_code || null,
      recurrence_rule: input.recurrence_rule || null,
      recurrence_timezone: input.recurrence_timezone || null,
      ...(location ? { location } : {}),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await syncCategoryAssignments(id, input.category_ids)

  revalidatePath('/events')
}

export async function deleteEvent(id: number) {
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/events')
}
