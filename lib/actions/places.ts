'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export type PlaceInput = {
  name: string
  description: string | null
  address: string | null
  website: string | null
  image_url: string | null
  image_thumb_url: string | null
  neighborhood_id: number | null
  category_ids: number[]
  dress_code_id: number | null
  custom_dress_code: string | null
  latitude: number | null
  longitude: number | null
}

function toLocation(lat: number | null, lng: number | null) {
  if (lat === null || lng === null) return undefined
  return `SRID=4326;POINT(${lng} ${lat})`
}

async function syncCategoryAssignments(placeId: number, categoryIds: number[]) {
  const supabase = createAdminClient()
  await supabase
    .from('place_category_assignments')
    .delete()
    .eq('place_id', placeId)

  if (categoryIds.length === 0) return

  await supabase.from('place_category_assignments').insert(
    categoryIds.map((category_id, index) => ({
      place_id: placeId,
      category_id,
      sort_order: index,
    })),
  )
}

export async function createPlace(input: PlaceInput) {
  await requireModerator()

  const name = input.name.trim()
  if (!name) return { error: 'Name is required.' }

  const supabase = createAdminClient()
  const location = toLocation(input.latitude, input.longitude)

  const { data, error } = await supabase
    .from('places')
    .insert({
      name,
      description: input.description || null,
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
      ...(location ? { location } : {}),
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await syncCategoryAssignments(data.id, input.category_ids)

  revalidatePath('/places')
  return { id: data.id }
}

export async function updatePlace(id: number, input: PlaceInput) {
  await requireModerator()

  const name = input.name.trim()
  if (!name) return { error: 'Name is required.' }

  const supabase = createAdminClient()
  const location = toLocation(input.latitude, input.longitude)

  const { error } = await supabase
    .from('places')
    .update({
      name,
      description: input.description || null,
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
      ...(location ? { location } : {}),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await syncCategoryAssignments(id, input.category_ids)

  revalidatePath('/places')
}

export async function deletePlace(id: number) {
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase.from('places').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/places')
}
