import { NextRequest, NextResponse } from 'next/server'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

function toLocation(lat: number | null | undefined, lng: number | null | undefined) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return undefined
  return `SRID=4326;POINT(${lng} ${lat})`
}

async function syncCategoryAssignments(placeId: number, categoryIds: number[]) {
  const supabase = createAdminClient()
  await supabase
    .from('place_category_assignments')
    .delete()
    .eq('place_id', placeId)

  if (categoryIds.length === 0) return

  await supabase.from('place_category_assignments').insert(
    categoryIds.map((category_id, index) => ({
      place_id: placeId,
      category_id,
      sort_order: index,
    })),
  )
}

/**
 * GET /api/admin/places
 * List all places with optional filtering
 * 
 * Query params:
 * - limit: number (default 100, max 500)
 * - offset: number (default 0)
 * - search: string (filters by name)
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
    .from('places')
    .select(
      'id, name, description, address, website, image_url, image_thumb_url, neighborhood_id, dress_code_id, custom_dress_code, created_at',
      { count: 'exact' }
    )
    .order('name')
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: places, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const placeIds = places?.map(p => p.id) ?? []
  const { data: assignments } = await supabase
    .from('place_category_assignments')
    .select('place_id, category_id')
    .in('place_id', placeIds)

  const categoryMap = new Map<number, number[]>()
  for (const a of assignments ?? []) {
    const list = categoryMap.get(a.place_id) ?? []
    list.push(a.category_id)
    categoryMap.set(a.place_id, list)
  }

  const placesWithCategories = places?.map(p => ({
    ...p,
    category_ids: categoryMap.get(p.id) ?? [],
  }))

  return NextResponse.json({
    places: placesWithCategories,
    total: count ?? 0,
    limit,
    offset,
  })
}

/**
 * POST /api/admin/places
 * Create a new place
 * 
 * Body (JSON):
 * - name: string (required)
 * - description?: string
 * - address?: string
 * - website?: string
 * - image_url?: string
 * - image_thumb_url?: string
 * - neighborhood_id?: number
 * - category_ids?: number[]
 * - dress_code_id?: number
 * - custom_dress_code?: string
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

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const categoryIds = Array.isArray(body.category_ids)
    ? body.category_ids.filter((id): id is number => typeof id === 'number')
    : []

  const lat = typeof body.latitude === 'number' ? body.latitude : null
  const lng = typeof body.longitude === 'number' ? body.longitude : null
  const location = toLocation(lat, lng)

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('places')
    .insert({
      name,
      description: typeof body.description === 'string' ? body.description : null,
      address: typeof body.address === 'string' ? body.address : null,
      website: typeof body.website === 'string' ? body.website : null,
      image_url: typeof body.image_url === 'string' ? body.image_url : null,
      image_thumb_url: typeof body.image_thumb_url === 'string' ? body.image_thumb_url : null,
      neighborhood_id: typeof body.neighborhood_id === 'number' ? body.neighborhood_id : null,
      category_id: categoryIds[0] ?? null,
      dress_code_id: typeof body.dress_code_id === 'number' ? body.dress_code_id : null,
      custom_dress_code: typeof body.custom_dress_code === 'string' ? body.custom_dress_code : null,
      ...(location ? { location } : {}),
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await syncCategoryAssignments(data.id, categoryIds)

  return NextResponse.json({ id: data.id }, { status: 201 })
}
