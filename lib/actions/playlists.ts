'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export type PlaylistInput = {
  name: string
  description: string | null
  image_url: string | null
  privacy: 'public' | 'private'
  featured: boolean
  place_ids: number[]
}

async function syncPlaylistItems(playlistId: number, placeIds: number[]) {
  const supabase = createAdminClient()
  await supabase
    .from('playlist_items')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('target_type', 'place')

  if (placeIds.length === 0) return

  await supabase.from('playlist_items').insert(
    placeIds.map((target_id, index) => ({
      playlist_id: playlistId,
      target_type: 'place' as const,
      target_id,
      sort_order: index,
    })),
  )
}

export async function createPlaylist(input: PlaylistInput) {
  await requireModerator()

  const name = input.name.trim()
  if (!name) return { error: 'Name is required.' }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('playlists')
    .insert({
      name,
      description: input.description || null,
      image_url: input.image_url || null,
      privacy: input.privacy,
      featured: input.featured,
      // Admin-curated playlists represent ShowMe STL editorial, not a user
      // account — see playlists_curator_source_check.
      owner_id: null,
      curator_key: 'showmestl',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await syncPlaylistItems(data.id, input.place_ids)

  revalidatePath('/admin/playlists')
  return { id: data.id }
}

export async function updatePlaylist(id: number, input: PlaylistInput) {
  await requireModerator()

  const name = input.name.trim()
  if (!name) return { error: 'Name is required.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('playlists')
    .update({
      name,
      description: input.description || null,
      image_url: input.image_url || null,
      privacy: input.privacy,
      featured: input.featured,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await syncPlaylistItems(id, input.place_ids)

  revalidatePath('/admin/playlists')
}

export async function deletePlaylist(id: number) {
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase.from('playlists').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/playlists')
}
