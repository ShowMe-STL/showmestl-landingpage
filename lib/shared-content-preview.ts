import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import {
  buildEventPreview,
  buildPlacePreview,
  buildPlaylistPreview,
  buildProfilePreview,
  genericSharePreview,
  safeHttpsUrl,
  type SharePreview,
} from '@/lib/shared-content-links.mjs'

function relatedName(value: { name: string } | { name: string }[] | null): string | null {
  if (!value) return null
  return Array.isArray(value) ? value[0]?.name ?? null : value.name
}

async function placePreview(id: string): Promise<SharePreview | null> {
  const supabase = createPublicClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('places')
    .select('name, address, description, image_url, image_thumb_url, place_categories!places_category_id_fkey(name), neighborhoods(name)')
    .eq('id', Number(id))
    .maybeSingle()
  if (error || !data) return null
  return buildPlacePreview({
    name: data.name,
    address: data.address,
    description: data.description,
    image_url: data.image_url,
    image_thumb_url: data.image_thumb_url,
    category: relatedName(data.place_categories),
    neighborhood: relatedName(data.neighborhoods),
  })
}

async function eventPreview(id: string): Promise<SharePreview | null> {
  const supabase = createPublicClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('events')
    .select('title, start_time, end_time, venue_name, address, description, image_url, image_thumb_url')
    .eq('id', Number(id))
    .maybeSingle()
  if (error || !data) return null
  return buildEventPreview(data)
}

async function playlistPreview(id: string): Promise<SharePreview | null> {
  const supabase = createPublicClient()
  if (!supabase) return null
  const playlistId = Number(id)
  const { data, error } = await supabase
    .from('playlists')
    .select('name, description, image_url, image_thumb_url, privacy')
    .eq('id', playlistId)
    .eq('privacy', 'public')
    .maybeSingle()
  if (error || !data) return null

  const { data: items } = await supabase
    .from('playlist_items')
    .select('target_id, target_type, sort_order')
    .eq('playlist_id', playlistId)
    .order('sort_order')
    .limit(4)

  const placeIds = (items ?? []).filter((item) => item.target_type === 'place').map((item) => item.target_id)
  const eventIds = (items ?? []).filter((item) => item.target_type === 'event').map((item) => item.target_id)
  const [places, events] = await Promise.all([
    placeIds.length
      ? supabase.from('places').select('id, image_url, image_thumb_url').in('id', placeIds)
      : Promise.resolve({ data: [] as { id: number; image_url: string | null; image_thumb_url: string | null }[] }),
    eventIds.length
      ? supabase.from('events').select('id, image_url, image_thumb_url').in('id', eventIds)
      : Promise.resolve({ data: [] as { id: number; image_url: string | null; image_thumb_url: string | null }[] }),
  ])
  const byTarget = new Map<string, string | null>()
  for (const place of places.data ?? []) byTarget.set(`place:${place.id}`, place.image_url || place.image_thumb_url)
  for (const event of events.data ?? []) byTarget.set(`event:${event.id}`, event.image_url || event.image_thumb_url)
  const extraImages = (items ?? [])
    .map((item) => byTarget.get(`${item.target_type}:${item.target_id}`) ?? null)
    .filter((url): url is string => Boolean(safeHttpsUrl(url)))

  return buildPlaylistPreview(data, extraImages)
}

async function profilePreview(id: string): Promise<SharePreview | null> {
  const supabase = createPublicClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_url, avatar_thumb_url')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return buildProfilePreview(data)
}

export const loadSharePreview = cache(async (kind: string, id: string): Promise<SharePreview | null> => {
  const generic = genericSharePreview(kind)
  if (!generic) return generic
  try {
    const preview = kind === 'place'
      ? await placePreview(id)
      : kind === 'event'
        ? await eventPreview(id)
        : kind === 'playlist'
          ? await playlistPreview(id)
          : kind === 'profile'
            ? await profilePreview(id)
            : null
    return preview ?? generic
  } catch {
    return generic
  }
})
