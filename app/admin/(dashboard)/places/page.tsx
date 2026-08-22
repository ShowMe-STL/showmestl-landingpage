import { createAdminClient } from '@/lib/supabase/admin'
import { PlacesManager } from '@/components/places/places-manager'

export default async function PlacesPage() {
  const supabase = createAdminClient()

  const [
    placesRes,
    neighborhoodsRes,
    categoriesRes,
    dressCodesRes,
    assignmentsRes,
  ] = await Promise.all([
    supabase
      .from('places_with_coords')
      .select(
        'id, name, description, address, website, image_url, image_thumb_url, neighborhood_id, dress_code_id, custom_dress_code, lat, lng',
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
  ])

  const assignmentsByPlace = new Map<number, number[]>()
  for (const row of assignmentsRes.data ?? []) {
    const list = assignmentsByPlace.get(row.place_id) ?? []
    list.push(row.category_id)
    assignmentsByPlace.set(row.place_id, list)
  }

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
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
        <p className="text-muted-foreground">
          {places.length} places curated in ShowMeSTL.
        </p>
      </div>
      <PlacesManager
        initialPlaces={places}
        neighborhoods={neighborhoodsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        dressCodes={dressCodesRes.data ?? []}
      />
    </div>
  )
}
