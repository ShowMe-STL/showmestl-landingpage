import { NextRequest, NextResponse } from 'next/server'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

function toLocation(lat: number | null | undefined, lng: number | null | undefined) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return undefined
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

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/events/[id]
 * Get a single event by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireModerator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const eventId = Number(id)
  if (isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: event, error } = await supabase
    .from('events')
    .select(
      'id, title, description, start_time, end_time, place_id, venue_name, address, website, image_url, image_thumb_url, neighborhood_id, dress_code_id, custom_dress_code, recurrence_rule, recurrence_timezone, created_at'
    )
    .eq('id', eventId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: assignments } = await supabase
    .from('event_category_assignments')
    .select('category_id')
    .eq('event_id', eventId)
    .order('sort_order')

  return NextResponse.json({
    ...event,
    category_ids: assignments?.map(a => a.category_id) ?? [],
  })
}

/**
 * PUT /api/admin/events/[id]
 * Update an event
 * 
 * Body (JSON): Same fields as POST, all optional except title and start_time
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireModerator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const eventId = Number(id)
  if (isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const startTime = typeof body.start_time === 'string' ? body.start_time : ''
  if (!startTime) {
    return NextResponse.json({ error: 'start_time is required' }, { status: 400 })
  }

  const startDate = new Date(startTime)
  if (isNaN(startDate.getTime())) {
    return NextResponse.json({ error: 'start_time is not a valid date' }, { status: 400 })
  }

  const categoryIds = Array.isArray(body.category_ids)
    ? body.category_ids.filter((id): id is number => typeof id === 'number')
    : []

  const lat = typeof body.latitude === 'number' ? body.latitude : null
  const lng = typeof body.longitude === 'number' ? body.longitude : null
  const location = toLocation(lat, lng)

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('events')
    .update({
      title,
      description: typeof body.description === 'string' ? body.description : null,
      start_time: startDate.toISOString(),
      end_time: typeof body.end_time === 'string' ? new Date(body.end_time).toISOString() : null,
      place_id: typeof body.place_id === 'number' ? body.place_id : null,
      venue_name: typeof body.venue_name === 'string' ? body.venue_name : null,
      address: typeof body.address === 'string' ? body.address : null,
      website: typeof body.website === 'string' ? body.website : null,
      image_url: typeof body.image_url === 'string' ? body.image_url : null,
      image_thumb_url: typeof body.image_thumb_url === 'string' ? body.image_thumb_url : null,
      neighborhood_id: typeof body.neighborhood_id === 'number' ? body.neighborhood_id : null,
      category_id: categoryIds[0] ?? null,
      dress_code_id: typeof body.dress_code_id === 'number' ? body.dress_code_id : null,
      custom_dress_code: typeof body.custom_dress_code === 'string' ? body.custom_dress_code : null,
      recurrence_rule: typeof body.recurrence_rule === 'string' ? body.recurrence_rule : null,
      recurrence_timezone: typeof body.recurrence_timezone === 'string' ? body.recurrence_timezone : null,
      ...(location ? { location } : {}),
    })
    .eq('id', eventId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await syncCategoryAssignments(eventId, categoryIds)

  return NextResponse.json({ success: true })
}

/**
 * DELETE /api/admin/events/[id]
 * Delete an event
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireModerator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const eventId = Number(id)
  if (isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
