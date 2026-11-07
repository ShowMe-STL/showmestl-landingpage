import 'server-only'
import { requireModerator } from '@/lib/auth'
import { PLACE_MEDIA_BUCKET } from '@/lib/place-media'
import { createAdminClient } from '@/lib/supabase/admin'

export async function deleteStoredPlaceMedia(placeId: number) {
  await requireModerator()
  const supabase = createAdminClient()
  const { data } = await supabase.storage
    .from(PLACE_MEDIA_BUCKET)
    .list(`places/${placeId}/gallery`, { limit: 1000 })
  const paths = (data ?? []).map(
    (entry) => `places/${placeId}/gallery/${entry.name}`,
  )
  paths.push(`places/${placeId}/full.jpg`, `places/${placeId}/thumb.jpg`)
  if (paths.length === 0) return
  await supabase.storage.from(PLACE_MEDIA_BUCKET).remove(paths)
}
