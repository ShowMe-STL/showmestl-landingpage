'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export type TrendingTargetType = 'place' | 'event' | 'playlist'

const TARGET_COLUMN: Record<
  TrendingTargetType,
  'place_id' | 'event_id' | 'playlist_id'
> = {
  place: 'place_id',
  event: 'event_id',
  playlist: 'playlist_id',
}

const REVALIDATE_PATHS: Record<TrendingTargetType, string> = {
  place: '/admin/places',
  event: '/admin/events',
  playlist: '/admin/playlists',
}

// home_trending_items has a partial unique index per target column
// (e.g. `where place_id is not null`), which PostgREST's upsert can't
// target reliably, so this does a manual find-then-write instead.
export async function setTrending(
  targetType: TrendingTargetType,
  targetId: number,
  enabled: boolean,
) {
  await requireModerator()

  const column = TARGET_COLUMN[targetType]
  const supabase = createAdminClient()

  const { data: existing, error: findError } = await supabase
    .from('home_trending_items')
    .select('id')
    .eq(column, targetId)
    .maybeSingle()

  if (findError) return { error: findError.message }

  if (existing) {
    const { error } = await supabase
      .from('home_trending_items')
      .update({ enabled })
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else if (enabled) {
    const { data: maxRow } = await supabase
      .from('home_trending_items')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    // `column` is a dynamic key, so supabase-js can't narrow the insert
    // shape; the object itself only ever sets one of the three nullable
    // target columns, which is exactly what the table allows.
    const { error } = await supabase.from('home_trending_items').insert({
      [column]: targetId,
      enabled: true,
      sort_order: (maxRow?.sort_order ?? -1) + 1,
    } as never)
    if (error) return { error: error.message }
  }

  revalidatePath(REVALIDATE_PATHS[targetType])
}
