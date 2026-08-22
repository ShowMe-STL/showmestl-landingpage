import { createAdminClient } from '@/lib/supabase/admin'
import { PlaylistsManager } from '@/components/playlists/playlists-manager'

export default async function PlaylistsPage() {
  const supabase = createAdminClient()

  const [playlistsRes, itemsRes, placesRes, trendingRes] = await Promise.all([
    supabase
      .from('playlists')
      .select(
        'id, name, description, image_url, privacy, featured, owner_id, curator_key, created_at',
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('playlist_items')
      .select('playlist_id, target_id, sort_order')
      .eq('target_type', 'place')
      .order('sort_order'),
    supabase.from('places').select('id, name').order('name'),
    supabase
      .from('home_trending_items')
      .select('playlist_id, enabled')
      .not('playlist_id', 'is', null)
      .eq('enabled', true),
  ])

  const placeIdsByPlaylist = new Map<number, number[]>()
  for (const row of itemsRes.data ?? []) {
    const list = placeIdsByPlaylist.get(row.playlist_id) ?? []
    list.push(row.target_id)
    placeIdsByPlaylist.set(row.playlist_id, list)
  }

  const trendingPlaylistIds = new Set(
    (trendingRes.data ?? []).map((row) => row.playlist_id as number),
  )

  const playlists = (playlistsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    image_url: p.image_url,
    privacy: p.privacy,
    featured: p.featured,
    isOfficial: p.owner_id === null,
    created_at: p.created_at,
    place_ids: placeIdsByPlaylist.get(p.id) ?? [],
    trending: trendingPlaylistIds.has(p.id),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Playlists</h1>
        <p className="text-muted-foreground">
          {playlists.length} playlists. Playlists created here are official
          ShowMe STL curation — user-made playlists aren&apos;t editable from
          this dashboard.
        </p>
      </div>
      <PlaylistsManager
        initialPlaylists={playlists}
        places={placesRes.data ?? []}
      />
    </div>
  )
}
