'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { geocodeAddress } from './geocode'

export type ImportEventInput = {
  title: string
  description?: string | null
  start_time: string
  end_time?: string | null
  venue_name?: string | null
  address?: string | null
  website?: string | null
  image_url?: string | null
  image_thumb_url?: string | null
  categories?: string[]
  neighborhood?: string | null
  dress_code?: string | null
  recurrence_rule?: string | null
  recurrence_timezone?: string | null
  latitude?: number | null
  longitude?: number | null
}

export type ValidatedEvent = {
  rowIndex: number
  input: ImportEventInput
  status: 'valid' | 'duplicate' | 'error'
  error?: string
  duplicateOf?: { id: number; title: string; start_time: string }
  resolvedCategoryIds?: number[]
  resolvedNeighborhoodId?: number | null
  resolvedDressCodeId?: number | null
}

export type ParseResult = {
  events: ImportEventInput[]
  errors: { row: number; error: string }[]
}

function parseDate(value: string | undefined | null): string | null {
  if (!value || !value.trim()) return null
  const trimmed = value.trim()
  const date = new Date(trimmed)
  if (isNaN(date.getTime())) return null
  return date.toISOString()
}

function parseCSV(text: string): ParseResult {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    return { events: [], errors: [{ row: 0, error: 'CSV must have a header row and at least one data row' }] }
  }

  const headerLine = lines[0]
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/["\s]/g, '').replace(/_/g, ''))

  const fieldMap: Record<string, string> = {
    title: 'title',
    name: 'title',
    description: 'description',
    starttime: 'start_time',
    starts: 'start_time',
    start: 'start_time',
    startat: 'start_time',
    startdate: 'start_time',
    endtime: 'end_time',
    ends: 'end_time',
    end: 'end_time',
    endat: 'end_time',
    enddate: 'end_time',
    venuename: 'venue_name',
    venue: 'venue_name',
    location: 'venue_name',
    address: 'address',
    website: 'website',
    url: 'website',
    link: 'website',
    imageurl: 'image_url',
    image: 'image_url',
    imagethumburl: 'image_thumb_url',
    thumbnail: 'image_thumb_url',
    thumb: 'image_thumb_url',
    categories: 'categories',
    category: 'categories',
    neighborhood: 'neighborhood',
    dresscode: 'dress_code',
    recurrencerule: 'recurrence_rule',
    rrule: 'recurrence_rule',
    recurrencetimezone: 'recurrence_timezone',
    timezone: 'recurrence_timezone',
    latitude: 'latitude',
    lat: 'latitude',
    longitude: 'longitude',
    lng: 'longitude',
    lon: 'longitude',
  }

  const columnMapping: (string | null)[] = headers.map(h => fieldMap[h] ?? null)

  const events: ImportEventInput[] = []
  const errors: { row: number; error: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCSVLine(line)
    const row: Record<string, string> = {}

    columnMapping.forEach((field, idx) => {
      if (field && values[idx] !== undefined) {
        row[field] = values[idx].trim()
      }
    })

    if (!row.title) {
      errors.push({ row: i + 1, error: 'Missing required field: title' })
      continue
    }

    if (!row.start_time) {
      errors.push({ row: i + 1, error: 'Missing required field: start_time' })
      continue
    }

    const startTime = parseDate(row.start_time)
    if (!startTime) {
      errors.push({ row: i + 1, error: `Invalid start_time: "${row.start_time}"` })
      continue
    }

    const endTime = parseDate(row.end_time)

    events.push({
      title: row.title,
      description: row.description || null,
      start_time: startTime,
      end_time: endTime,
      venue_name: row.venue_name || null,
      address: row.address || null,
      website: row.website || null,
      image_url: row.image_url || null,
      image_thumb_url: row.image_thumb_url || null,
      categories: row.categories ? row.categories.split(/[;|]/).map(c => c.trim()).filter(Boolean) : [],
      neighborhood: row.neighborhood || null,
      dress_code: row.dress_code || null,
      recurrence_rule: row.recurrence_rule || null,
      recurrence_timezone: row.recurrence_timezone || null,
      latitude: row.latitude ? Number(row.latitude) : null,
      longitude: row.longitude ? Number(row.longitude) : null,
    })
  }

  return { events, errors }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)

  return values
}

function parseJSON(text: string): ParseResult {
  const errors: { row: number; error: string }[] = []

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { events: [], errors: [{ row: 0, error: 'Invalid JSON' }] }
  }

  const items = Array.isArray(data) ? data : [data]
  const events: ImportEventInput[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>
    const rowNum = i + 1

    const title = item.title ?? item.name
    if (typeof title !== 'string' || !title.trim()) {
      errors.push({ row: rowNum, error: 'Missing required field: title' })
      continue
    }

    const startRaw = item.start_time ?? item.starts ?? item.start ?? item.startAt ?? item.startDate
    if (!startRaw) {
      errors.push({ row: rowNum, error: 'Missing required field: start_time' })
      continue
    }

    const startTime = parseDate(String(startRaw))
    if (!startTime) {
      errors.push({ row: rowNum, error: `Invalid start_time: "${startRaw}"` })
      continue
    }

    const endRaw = item.end_time ?? item.ends ?? item.end ?? item.endAt ?? item.endDate
    const endTime = parseDate(endRaw ? String(endRaw) : null)

    const categoriesRaw = item.categories ?? item.category
    let categories: string[] = []
    if (Array.isArray(categoriesRaw)) {
      categories = categoriesRaw.map(c => String(c).trim()).filter(Boolean)
    } else if (typeof categoriesRaw === 'string') {
      categories = categoriesRaw.split(/[,;|]/).map(c => c.trim()).filter(Boolean)
    }

    events.push({
      title: String(title).trim(),
      description: item.description ? String(item.description) : null,
      start_time: startTime,
      end_time: endTime,
      venue_name: item.venue_name ?? item.venue ?? item.location ? String(item.venue_name ?? item.venue ?? item.location) : null,
      address: item.address ? String(item.address) : null,
      website: item.website ?? item.url ?? item.link ? String(item.website ?? item.url ?? item.link) : null,
      image_url: item.image_url ?? item.image ? String(item.image_url ?? item.image) : null,
      image_thumb_url: item.image_thumb_url ?? item.thumbnail ? String(item.image_thumb_url ?? item.thumbnail) : null,
      categories,
      neighborhood: item.neighborhood ? String(item.neighborhood) : null,
      dress_code: item.dress_code ?? item.dressCode ? String(item.dress_code ?? item.dressCode) : null,
      recurrence_rule: item.recurrence_rule ?? item.rrule ? String(item.recurrence_rule ?? item.rrule) : null,
      recurrence_timezone: item.recurrence_timezone ?? item.timezone ? String(item.recurrence_timezone ?? item.timezone) : null,
      latitude: typeof item.latitude === 'number' ? item.latitude : (item.latitude ? Number(item.latitude) : null),
      longitude: typeof item.longitude === 'number' ? item.longitude : (item.longitude ? Number(item.longitude) : null),
    })
  }

  return { events, errors }
}

export async function parseImportFile(content: string, format: 'csv' | 'json'): Promise<ParseResult> {
  return format === 'csv' ? parseCSV(content) : parseJSON(content)
}

export async function validateImportEvents(events: ImportEventInput[]): Promise<ValidatedEvent[]> {
  await requireModerator()

  const supabase = createAdminClient()

  const [categoriesRes, neighborhoodsRes, dressCodesRes, existingEventsRes] = await Promise.all([
    supabase.from('event_categories').select('id, name'),
    supabase.from('neighborhoods').select('id, name'),
    supabase.from('dress_codes').select('id, name'),
    supabase.from('events').select('id, title, start_time, venue_name, address'),
  ])

  const categoryMap = new Map((categoriesRes.data ?? []).map(c => [c.name.toLowerCase(), c.id]))
  const neighborhoodMap = new Map((neighborhoodsRes.data ?? []).map(n => [n.name.toLowerCase(), n.id]))
  const dressCodeMap = new Map((dressCodesRes.data ?? []).map(d => [d.name.toLowerCase(), d.id]))
  const existingEvents = existingEventsRes.data ?? []

  const validated: ValidatedEvent[] = []

  for (let i = 0; i < events.length; i++) {
    const input = events[i]
    const rowIndex = i + 1

    const resolvedCategoryIds = input.categories
      ?.map(c => categoryMap.get(c.toLowerCase()))
      .filter((id): id is number => id !== undefined) ?? []

    const resolvedNeighborhoodId = input.neighborhood
      ? neighborhoodMap.get(input.neighborhood.toLowerCase()) ?? null
      : null

    const resolvedDressCodeId = input.dress_code
      ? dressCodeMap.get(input.dress_code.toLowerCase()) ?? null
      : null

    const eventDate = new Date(input.start_time)
    const dateStr = eventDate.toISOString().split('T')[0]

    const duplicate = existingEvents.find(existing => {
      const existingDate = new Date(existing.start_time).toISOString().split('T')[0]
      const titleMatch = existing.title.toLowerCase() === input.title.toLowerCase()
      const dateMatch = existingDate === dateStr
      const venueMatch = (existing.venue_name?.toLowerCase() === input.venue_name?.toLowerCase()) ||
        (existing.address?.toLowerCase() === input.address?.toLowerCase()) ||
        (!existing.venue_name && !input.venue_name && !existing.address && !input.address)

      return titleMatch && dateMatch && venueMatch
    })

    if (duplicate) {
      validated.push({
        rowIndex,
        input,
        status: 'duplicate',
        duplicateOf: {
          id: duplicate.id,
          title: duplicate.title,
          start_time: duplicate.start_time,
        },
        resolvedCategoryIds,
        resolvedNeighborhoodId,
        resolvedDressCodeId,
      })
    } else {
      validated.push({
        rowIndex,
        input,
        status: 'valid',
        resolvedCategoryIds,
        resolvedNeighborhoodId,
        resolvedDressCodeId,
      })
    }
  }

  return validated
}

function toLocation(lat: number | null, lng: number | null) {
  if (lat === null || lng === null) return undefined
  return `SRID=4326;POINT(${lng} ${lat})`
}

export async function importEvents(
  events: ValidatedEvent[],
  options: { skipDuplicates: boolean; geocodeMissing: boolean }
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  await requireModerator()

  const supabase = createAdminClient()
  const errors: string[] = []
  let imported = 0
  let skipped = 0

  const toImport = options.skipDuplicates
    ? events.filter(e => e.status === 'valid')
    : events.filter(e => e.status !== 'error')

  for (const event of toImport) {
    const { input, resolvedCategoryIds, resolvedNeighborhoodId, resolvedDressCodeId } = event

    let latitude = input.latitude ?? null
    let longitude = input.longitude ?? null

    if (options.geocodeMissing && input.address && (latitude === null || longitude === null)) {
      const geoResult = await geocodeAddress(input.address)
      if ('latitude' in geoResult) {
        latitude = geoResult.latitude
        longitude = geoResult.longitude
      }
    }

    const location = toLocation(latitude, longitude)

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: input.title,
        description: input.description || null,
        start_time: input.start_time,
        end_time: input.end_time || null,
        venue_name: input.venue_name || null,
        address: input.address || null,
        website: input.website || null,
        image_url: input.image_url || null,
        image_thumb_url: input.image_thumb_url || null,
        neighborhood_id: resolvedNeighborhoodId,
        category_id: resolvedCategoryIds?.[0] ?? null,
        dress_code_id: resolvedDressCodeId,
        recurrence_rule: input.recurrence_rule || null,
        recurrence_timezone: input.recurrence_timezone || null,
        location: location ?? 'SRID=4326;POINT(-90.199404 38.627003)',
      })
      .select('id')
      .single()

    if (error) {
      errors.push(`Row ${event.rowIndex}: ${error.message}`)
      continue
    }

    if (resolvedCategoryIds && resolvedCategoryIds.length > 0) {
      await supabase.from('event_category_assignments').insert(
        resolvedCategoryIds.map((category_id, index) => ({
          event_id: data.id,
          category_id,
          sort_order: index,
        }))
      )
    }

    imported++
  }

  skipped = events.length - toImport.length

  revalidatePath('/events')
  return { imported, skipped, errors }
}

export async function generateCSVTemplate(): Promise<string> {
  const headers = [
    'title',
    'start_time',
    'end_time',
    'venue_name',
    'address',
    'website',
    'image_url',
    'image_thumb_url',
    'categories',
    'neighborhood',
    'dress_code',
    'description',
  ]

  const example = [
    'Example Event',
    '2026-10-15T19:00:00',
    '2026-10-15T22:00:00',
    'The Fox Theatre',
    '527 N Grand Blvd, St. Louis, MO 63103',
    'https://example.com/event',
    'https://example.com/image.jpg',
    'https://example.com/thumb.jpg',
    'Music;Concerts',
    'Grand Center',
    'Casual',
    'A great event description',
  ]

  return [headers.join(','), example.join(',')].join('\n')
}

export async function generateJSONTemplate(): Promise<string> {
  return JSON.stringify([
    {
      title: 'Example Event',
      start_time: '2026-10-15T19:00:00',
      end_time: '2026-10-15T22:00:00',
      venue_name: 'The Fox Theatre',
      address: '527 N Grand Blvd, St. Louis, MO 63103',
      website: 'https://example.com/event',
      image_url: 'https://example.com/image.jpg',
      image_thumb_url: 'https://example.com/thumb.jpg',
      categories: ['Music', 'Concerts'],
      neighborhood: 'Grand Center',
      dress_code: 'Casual',
      description: 'A great event description',
    }
  ], null, 2)
}
