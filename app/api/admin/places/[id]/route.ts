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

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/places/[id]
 * Get a single place by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireModerator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const placeId = Number(id)
  if (isNaN(placeId)) {
    return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: place, error } = await supabase
    .from('places')
    .select(
      'id, name, description, address, website, image_url, image_thumb_url, neighborhood_id, dress_code_id, custom_dress_code, created_at'
    )
    .eq('id', placeId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: assignments } = await supabase
    .from('place_category_assignments')
    .select('category_id')
    .eq('place_id', placeId)
    .order('sort_order')

  return NextResponse.json({
    ...place,
    category_ids: assignments?.map(a => a.category_id) ?? [],
  })
}

/**
 * PUT /api/admin/places/[id]
 * Update a place
 * 
 * Body (JSON): Same fields as POST
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireModerator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const placeId = Number(id)
  if (isNaN(placeId)) {
    return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 })
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

  const { error } = await supabase
    .from('places')
    .update({
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
    .eq('id', placeId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await syncCategoryAssignments(placeId, categoryIds)

  return NextResponse.json({ success: true })
}

/**
 * DELETE /api/admin/places/[id]
 * Delete a place
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireModerator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const placeId = Number(id)
  if (isNaN(placeId)) {
    return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('places')
    .delete()
    .eq('id', placeId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
