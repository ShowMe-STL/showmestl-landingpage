'use server'

export type GeocodeResult =
  | { latitude: number; longitude: number }
  | { error: string }

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const query = address.trim()
  if (!query) return { error: 'Enter an address first.' }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ShowMeSTL-Admin/1.0 (support@showmecities.com)',
    },
  })

  if (!res.ok) return { error: 'Geocoding service is unavailable right now.' }

  const results = (await res.json()) as { lat: string; lon: string }[]
  const match = results[0]
  if (!match) return { error: 'No match found for that address.' }

  return { latitude: Number(match.lat), longitude: Number(match.lon) }
}
