import { createAdminClient } from '@/lib/supabase/admin'
import { PlacesManager } from '@/components/places/places-manager'
import { BarChart } from '@/components/analytics/charts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { addDays, dayKey, mondayOf } from '@/lib/analytics/shared'

// The 2026-08-08 seed import dropped ~780 places in one day; the chart starts
// well after it so a single spike doesn't flatten every real week.
const CHART_SINCE = '2026-08-17'
const MAX_WEEKS = 16

function placesAddedPerWeek(createdAts: string[]) {
  const byWeek = new Map<string, number>()
  for (const iso of createdAts) {
    const wk = mondayOf(dayKey(iso))
    if (wk < CHART_SINCE) continue
    byWeek.set(wk, (byWeek.get(wk) ?? 0) + 1)
  }

  const thisWeek = mondayOf(dayKey(new Date()))
  const rows: { label: string; value: number; sub: string }[] = []
  for (let wk = CHART_SINCE; wk <= thisWeek; wk = addDays(wk, 7)) {
    const [, m, d] = wk.split('-')
    const n = byWeek.get(wk) ?? 0
    rows.push({
      label: `${Number(m)}/${Number(d)}`,
      value: n,
      sub: `Week of ${Number(m)}/${Number(d)} — ${n} place${n === 1 ? '' : 's'} added`,
    })
  }
  return rows.slice(-MAX_WEEKS)
}

export default async function PlacesPage() {
  const supabase = createAdminClient()

  const [
    placesRes,
    neighborhoodsRes,
    categoriesRes,
    dressCodesRes,
    assignmentsRes,
    trendingRes,
  ] = await Promise.all([
    supabase
      .from('places_with_coords')
      .select(
        'id, name, description, address, website, image_url, image_thumb_url, neighborhood_id, dress_code_id, custom_dress_code, lat, lng, created_at',
      )
      .order('name'),
    supabase.from('neighborhoods').select('id, name').order('name'),
    supabase
      .from('place_categories')
      .select('id, name, sort_order')
      .order('sort_order'),
    supabase
      .from('dress_codes')
      .select('id, name, sort_order')
      .order('sort_order'),
    supabase
      .from('place_category_assignments')
      .select('place_id, category_id, sort_order')
      .order('sort_order'),
    supabase
      .from('home_trending_items')
      .select('place_id, enabled')
      .not('place_id', 'is', null)
      .eq('enabled', true),
  ])

  const assignmentsByPlace = new Map<number, number[]>()
  for (const row of assignmentsRes.data ?? []) {
    const list = assignmentsByPlace.get(row.place_id) ?? []
    list.push(row.category_id)
    assignmentsByPlace.set(row.place_id, list)
  }

  const trendingPlaceIds = new Set(
    (trendingRes.data ?? []).map((row) => row.place_id as number),
  )

  const weeklyAdds = placesAddedPerWeek(
    (placesRes.data ?? [])
      .map((p) => p.created_at as string | null)
      .filter((v): v is string => Boolean(v)),
  )

  const places = (placesRes.data ?? []).map((p) => ({
    id: p.id as number,
    name: p.name ?? '',
    description: p.description,
    address: p.address,
    website: p.website,
    image_url: p.image_url,
    image_thumb_url: p.image_thumb_url,
    neighborhood_id: p.neighborhood_id,
    dress_code_id: p.dress_code_id,
    custom_dress_code: p.custom_dress_code,
    latitude: p.lat,
    longitude: p.lng,
    category_ids: assignmentsByPlace.get(p.id as number) ?? [],
    trending: trendingPlaceIds.has(p.id as number),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
        <p className="text-muted-foreground">
          {places.length} places curated in ShowMeSTL.
        </p>
      </div>

      {weeklyAdds.length > 0 && (
        <Card className="border-white/10 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Places added per week</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={weeklyAdds} height={180} color="var(--chart-1)" />
          </CardContent>
        </Card>
      )}

      <PlacesManager
        initialPlaces={places}
        neighborhoods={neighborhoodsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        dressCodes={dressCodesRes.data ?? []}
      />
    </div>
  )
}
