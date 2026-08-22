import { createAdminClient } from '@/lib/supabase/admin'
import { EventsManager } from '@/components/events/events-manager'

export default async function EventsPage() {
  const supabase = createAdminClient()

  const [
    eventsRes,
    neighborhoodsRes,
    categoriesRes,
    dressCodesRes,
    assignmentsRes,
    placesRes,
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
  ])

  const assignmentsByEvent = new Map<number, number[]>()
  for (const row of assignmentsRes.data ?? []) {
    const list = assignmentsByEvent.get(row.event_id) ?? []
    list.push(row.category_id)
    assignmentsByEvent.set(row.event_id, list)
  }

  const events = (eventsRes.data ?? []).map((e) => ({
    ...e,
    category_ids: assignmentsByEvent.get(e.id) ?? [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-muted-foreground">{events.length} events total.</p>
      </div>
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
