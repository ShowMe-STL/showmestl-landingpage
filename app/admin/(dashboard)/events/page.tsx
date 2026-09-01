import { createAdminClient } from '@/lib/supabase/admin'
import { EventsManager } from '@/components/events/events-manager'
import { BarChart } from '@/components/analytics/charts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { addDays, dayKey, mondayOf } from '@/lib/analytics/shared'

// Match the Places chart window: the early weeks were bulk seeding, so the
// chart starts here and shows at most the last 16 weeks.
const CHART_SINCE = '2026-08-17'
const MAX_WEEKS = 16

function eventsAddedPerWeek(createdAts: string[]) {
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
      sub: `Week of ${Number(m)}/${Number(d)} — ${n} event${n === 1 ? '' : 's'} added`,
    })
  }
  return rows.slice(-MAX_WEEKS)
}

export default async function EventsPage() {
  const supabase = createAdminClient()

  const [
    eventsRes,
    neighborhoodsRes,
    categoriesRes,
    dressCodesRes,
    assignmentsRes,
    placesRes,
    trendingRes,
    createdAtRes,
  ] = await Promise.all([
    supabase
      .from('events')
      .select(
        'id, title, description, start_time, end_time, place_id, venue_name, address, website, image_url, image_thumb_url, neighborhood_id, dress_code_id, custom_dress_code, recurrence_rule, recurrence_timezone',
      )
      .order('start_time', { ascending: false }),
    supabase.from('neighborhoods').select('id, name').order('name'),
    supabase
      .from('event_categories')
      .select('id, name, sort_order')
      .order('sort_order'),
    supabase
      .from('dress_codes')
      .select('id, name, sort_order')
      .order('sort_order'),
    supabase
      .from('event_category_assignments')
      .select('event_id, category_id, sort_order')
      .order('sort_order'),
    supabase.from('places').select('id, name').order('name'),
    supabase
      .from('home_trending_items')
      .select('event_id, enabled')
      .not('event_id', 'is', null)
      .eq('enabled', true),
    supabase.from('events').select('created_at'),
  ])

  const weeklyAdds = eventsAddedPerWeek(
    (createdAtRes.data ?? [])
      .map((e) => e.created_at as string | null)
      .filter((v): v is string => Boolean(v)),
  )

  const assignmentsByEvent = new Map<number, number[]>()
  for (const row of assignmentsRes.data ?? []) {
    const list = assignmentsByEvent.get(row.event_id) ?? []
    list.push(row.category_id)
    assignmentsByEvent.set(row.event_id, list)
  }

  const trendingEventIds = new Set(
    (trendingRes.data ?? []).map((row) => row.event_id as number),
  )

  const events = (eventsRes.data ?? []).map((e) => ({
    ...e,
    category_ids: assignmentsByEvent.get(e.id) ?? [],
    trending: trendingEventIds.has(e.id),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-muted-foreground">{events.length} events total.</p>
      </div>

      {weeklyAdds.length > 0 && (
        <Card className="border-white/10 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Events added per week</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={weeklyAdds} height={180} color="var(--chart-1)" />
          </CardContent>
        </Card>
      )}

      <EventsManager
        initialEvents={events}
        neighborhoods={neighborhoodsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        dressCodes={dressCodesRes.data ?? []}
        places={placesRes.data ?? []}
      />
    </div>
  )
}
