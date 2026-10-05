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

/**
 * GET /api/admin/events
 * List all events with optional filtering
 * 
 * Query params:
 * - limit: number (default 100, max 500)
 * - offset: number (default 0)
 * - search: string (filters by title)
 */
export async function GET(request: NextRequest) {
  try {
    await requireModerator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(Number(searchParams.get('limit')) || 100, 500)
  const offset = Number(searchParams.get('offset')) || 0
  const search = searchParams.get('search')

  const supabase = createAdminClient()

  let query = supabase
    .from('events')
    .select(
      'id, title, description, start_time, end_time, place_id, venue_name, address, website, image_url, image_thumb_url, neighborhood_id, dress_code_id, custom_dress_code, recurrence_rule, recurrence_timezone, created_at',
      { count: 'exact' }
    )
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data: events, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const eventIds = events?.map(e => e.id) ?? []
  const { data: assignments } = await supabase
    .from('event_category_assignments')
    .select('event_id, category_id')
    .in('event_id', eventIds)

  const categoryMap = new Map<number, number[]>()
  for (const a of assignments ?? []) {
    const list = categoryMap.get(a.event_id) ?? []
    list.push(a.category_id)
    categoryMap.set(a.event_id, list)
  }

  const eventsWithCategories = events?.map(e => ({
    ...e,
    category_ids: categoryMap.get(e.id) ?? [],
  }))

  return NextResponse.json({
    events: eventsWithCategories,
    total: count ?? 0,
    limit,
    offset,
  })
}

/**
 * POST /api/admin/events
 * Create a new event
 * 
 * Body (JSON):
 * - title: string (required)
 * - start_time: string ISO date (required)
 * - description?: string
 * - end_time?: string ISO date
 * - place_id?: number
 * - venue_name?: string
 * - address?: string
 * - website?: string
 * - image_url?: string
 * - image_thumb_url?: string
 * - neighborhood_id?: number
 * - category_ids?: number[]
 * - dress_code_id?: number
 * - custom_dress_code?: string
 * - recurrence_rule?: string
 * - recurrence_timezone?: string
 * - latitude?: number
 * - longitude?: number
 */
export async function POST(request: NextRequest) {
  try {
    await requireModerator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const { data, error } = await supabase
    .from('events')
    .insert({
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
      location: location ?? 'SRID=4326;POINT(-90.199404 38.627003)',
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await syncCategoryAssignments(data.id, categoryIds)

  return NextResponse.json({ id: data.id }, { status: 201 })
}
