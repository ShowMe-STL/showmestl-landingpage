'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import {
  MAX_GALLERY_ITEMS,
  MAX_IMAGE_BYTES,
  MAX_POSTER_BYTES,
  MAX_SOURCE_IMAGE_BYTES,
  MAX_THUMB_BYTES,
  MAX_VIDEO_BYTES,
  PLACE_MEDIA_BUCKET,
  coverMediaId,
  extMatchesSniff,
  galleryObjectPath,
  isGalleryObjectPath,
  isPlaceMediaExt,
  kindForExt,
  mediaSlug,
  pathFromPublicObjectUrl,
  posterObjectPath,
  publicObjectUrl,
  sniffMedia,
  thumbPathFor,
  type PlaceMediaKind,
} from '@/lib/place-media'
import { createAdminClient } from '@/lib/supabase/admin'

export type PlaceMediaItem = {
  id: number
  kind: PlaceMediaKind
  objectPath: string
  posterPath: string | null
  position: number
  url: string
  posterUrl: string | null
}

export type PlaceMediaSnapshot = {
  items: PlaceMediaItem[]
  imageUrl: string | null
  imageThumbUrl: string | null
}

export type PreparedPlaceMediaUpload = {
  objectPath: string
  objectToken: string
  posterPath: string | null
  posterToken: string | null
  thumbPath: string | null
  thumbToken: string | null
}

type MediaRow = {
  id: number
  kind: string
  object_path: string
  poster_path: string | null
  position: number
}

type PlaceRow = {
  id: number
  image_url: string | null
  image_thumb_url: string | null
}

type AdminClient = ReturnType<typeof createAdminClient>

function failure(error: string) {
  return { error }
}

function newToken() {
  return randomBytes(8).toString('hex')
}

function storageBase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set.')
  return url.replace(/\/$/, '')
}

function asBlob(bytes: Uint8Array, type: string) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return new Blob([copy], { type })
}

function extensionOf(objectPath: string) {
  return objectPath.split('.').pop()?.toLowerCase() ?? ''
}

function isPositionConflict(message: string) {
  return message.includes('place_media_place_id_position_key')
}

function toItem(row: MediaRow, base: string): PlaceMediaItem {
  const kind: PlaceMediaKind = row.kind === 'video' ? 'video' : 'image'
  return {
    id: row.id,
    kind,
    objectPath: row.object_path,
    posterPath: row.poster_path,
    position: row.position,
    url: publicObjectUrl(base, row.object_path),
    posterUrl: row.poster_path ? publicObjectUrl(base, row.poster_path) : null,
  }
}

function snapshot(
  rows: MediaRow[],
  place: PlaceRow,
  base: string,
): PlaceMediaSnapshot {
  return {
    items: rows
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((row) => toItem(row, base)),
    imageUrl: place.image_url,
    imageThumbUrl: place.image_thumb_url,
  }
}

async function readPlace(supabase: AdminClient, placeId: number) {
  const { data, error } = await supabase
    .from('places')
    .select('id, image_url, image_thumb_url')
    .eq('id', placeId)
    .maybeSingle()
  if (error) return failure(error.message)
  if (!data) return failure('Place not found.')
  return { place: data }
}

async function listRows(supabase: AdminClient, placeId: number) {
  const { data, error } = await supabase
    .from('place_media')
    .select('id, kind, object_path, poster_path, position')
    .eq('place_id', placeId)
    .order('position')
  if (error) return failure(error.message)
  return { rows: data ?? [] }
}

async function signUpload(supabase: AdminClient, objectPath: string) {
  const { data, error } = await supabase.storage
    .from(PLACE_MEDIA_BUCKET)
    .createSignedUploadUrl(objectPath)
  if (error || !data) {
    return failure(error?.message ?? 'Could not start the upload.')
  }
  return { token: data.token }
}

async function removePaths(supabase: AdminClient, paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))]
  if (unique.length === 0) return
  await supabase.storage.from(PLACE_MEDIA_BUCKET).remove(unique)
}

async function referencedPaths(supabase: AdminClient, placeId: number) {
  const listed = await listRows(supabase, placeId)
  const used = new Set<string>()
  if ('error' in listed) return used
  for (const row of listed.rows) {
    used.add(row.object_path)
    if (row.poster_path) used.add(row.poster_path)
    if (row.kind === 'image') used.add(thumbPathFor(row.object_path))
  }
  return used
}

async function downloadObject(
  supabase: AdminClient,
  objectPath: string,
  maxBytes: number,
) {
  const { data, error } = await supabase.storage
    .from(PLACE_MEDIA_BUCKET)
    .download(objectPath)
  if (error || !data) return null
  if (data.size > maxBytes) return null
  return new Uint8Array(await data.arrayBuffer())
}

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '0.0.0.0'
  ) {
    return true
  }
  if (host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('169.254.')) {
    return true
  }
  const second = host.split('.')[1]
  if (host.startsWith('172.') && second && Number(second) >= 16 && Number(second) <= 31) {
    return true
  }
  return false
}

async function readHttps(url: string) {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' || isBlockedHost(parsed.hostname)) return null
  const response = await fetch(parsed, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) return null
  const advertised = Number(response.headers.get('content-length') ?? 0)
  if (advertised > MAX_SOURCE_IMAGE_BYTES) return null
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > MAX_SOURCE_IMAGE_BYTES) return null
  return bytes
}

async function readHeader(url: string) {
  const head = await fetch(url, { method: 'HEAD' })
  const response = await fetch(url, { headers: { Range: 'bytes=0-63' } })
  if (!response.ok && response.status !== 206) {
    throw new Error('Could not read the uploaded file.')
  }
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Could not read the uploaded file.')
  const { value } = await reader.read()
  await reader.cancel()
  const range = response.headers.get('content-range')
  const rangedSize = range?.match(/\/(\d+)$/)
  const headSize = head.headers.get('content-length')
  const size = rangedSize
    ? Number(rangedSize[1])
    : headSize
      ? Number(headSize)
      : null
  return { bytes: value ?? new Uint8Array(), size }
}

async function uploadCanonical(
  supabase: AdminClient,
  objectPath: string,
  bytes: Uint8Array,
  contentType: string,
) {
  const { error } = await supabase.storage.from(PLACE_MEDIA_BUCKET).upload(
    objectPath,
    asBlob(bytes, contentType),
    { contentType, upsert: true, cacheControl: '60' },
  )
  return !error
}

async function syncLegacyCover(
  supabase: AdminClient,
  placeId: number,
  base: string,
) {
  const listed = await listRows(supabase, placeId)
  if ('error' in listed) return listed
  const coverId = coverMediaId(listed.rows)
  const cover = listed.rows.find((row) => row.id === coverId)
  if (!cover) {
    const place = await readPlace(supabase, placeId)
    if ('error' in place) return place
    return { place: place.place, rows: listed.rows }
  }

  let imageUrl = publicObjectUrl(base, cover.object_path)
  let imageThumbUrl = imageUrl
  const fullBytes =
    cover.object_path.endsWith('.jpg') || cover.object_path.endsWith('.jpeg')
      ? await downloadObject(supabase, cover.object_path, MAX_IMAGE_BYTES)
      : null
  const thumbBytes = await downloadObject(
    supabase,
    thumbPathFor(cover.object_path),
    MAX_THUMB_BYTES,
  )
  const thumbPayload = thumbBytes ?? fullBytes

  if (fullBytes) {
    const wrote = await uploadCanonical(
      supabase,
      `places/${placeId}/full.jpg`,
      fullBytes,
      'image/jpeg',
    )
    if (wrote) imageUrl = publicObjectUrl(base, `places/${placeId}/full.jpg`)
  }
  if (thumbPayload) {
    const wrote = await uploadCanonical(
      supabase,
      `places/${placeId}/thumb.jpg`,
      thumbPayload,
      'image/jpeg',
    )
    if (wrote) {
      imageThumbUrl = publicObjectUrl(base, `places/${placeId}/thumb.jpg`)
    }
  }

  const { error } = await supabase
    .from('places')
    .update({ image_url: imageUrl, image_thumb_url: imageThumbUrl })
    .eq('id', placeId)
  if (error) return failure(error.message)

  return {
    rows: listed.rows,
    place: {
      id: placeId,
      image_url: imageUrl,
      image_thumb_url: imageThumbUrl,
    } satisfies PlaceRow,
  }
}

async function ensureLegacyImported(
  supabase: AdminClient,
  place: PlaceRow,
) {
  const { count, error } = await supabase
    .from('place_media')
    .select('id', { count: 'exact', head: true })
    .eq('place_id', place.id)
  if (error || (count ?? 0) > 0) return

  const imagePath = pathFromPublicObjectUrl(place.image_url ?? '')
  if (imagePath && isGalleryObjectPath(place.id, imagePath)) {
    const { data } = await supabase.storage
      .from(PLACE_MEDIA_BUCKET)
      .list(`places/${place.id}/gallery`, { limit: 100 })
    const fileName = imagePath.split('/').pop()
    if (data?.some((entry) => entry.name === fileName)) {
      await supabase.from('place_media').insert({
        place_id: place.id,
        kind: 'image',
        object_path: imagePath,
        poster_path: null,
        position: 0,
      })
    }
    return
  }

  let bytes: Uint8Array | null = null
  if (imagePath && imagePath.startsWith(`places/${place.id}/`)) {
    bytes = await downloadObject(supabase, imagePath, MAX_SOURCE_IMAGE_BYTES)
  } else if (place.image_url) {
    bytes = await readHttps(place.image_url)
  }
  if (!bytes) return

  const sniffed = sniffMedia(bytes)
  if (!sniffed.ok || sniffed.kind !== 'image') return

  const objectPath = galleryObjectPath(place.id, 'cover', newToken(), sniffed.ext)
  const uploaded = await supabase.storage.from(PLACE_MEDIA_BUCKET).upload(
    objectPath,
    asBlob(bytes, sniffed.mime),
    { contentType: sniffed.mime, upsert: false },
  )
  if (uploaded.error) return

  const thumbSource = pathFromPublicObjectUrl(place.image_thumb_url ?? '')
  let thumbBytes: Uint8Array | null = null
  if (thumbSource && thumbSource.startsWith(`places/${place.id}/`)) {
    const downloaded = await downloadObject(supabase, thumbSource, MAX_THUMB_BYTES)
    const thumbSniff = downloaded ? sniffMedia(downloaded) : null
    if (thumbSniff?.ok && thumbSniff.ext === 'jpg') thumbBytes = downloaded
  }
  const derivedThumb = thumbPathFor(objectPath)
  if (thumbBytes) {
    await supabase.storage.from(PLACE_MEDIA_BUCKET).upload(
      derivedThumb,
      asBlob(thumbBytes, 'image/jpeg'),
      { contentType: 'image/jpeg', upsert: false },
    )
  }

  const inserted = await supabase.from('place_media').insert({
    place_id: place.id,
    kind: 'image',
    object_path: objectPath,
    poster_path: null,
    position: 0,
  })
  if (inserted.error) {
    await removePaths(supabase, [objectPath, derivedThumb])
  }
}

async function applyOrder(
  supabase: AdminClient,
  placeId: number,
  orderedIds: number[],
) {
  const listed = await listRows(supabase, placeId)
  if ('error' in listed) return listed
  const ids = new Set(listed.rows.map((row) => row.id))
  if (
    orderedIds.length !== ids.size ||
    orderedIds.some((id) => !ids.has(id))
  ) {
    return failure('The gallery changed. Refresh and try again.')
  }
  if (orderedIds.length === 0) return null

  const base =
    listed.rows.reduce((max, row) => Math.max(max, row.position), 0) +
    orderedIds.length +
    10
  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase
      .from('place_media')
      .update({ position: base + index })
      .eq('id', orderedIds[index]!)
      .eq('place_id', placeId)
    if (error) return failure(error.message)
  }
  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase
      .from('place_media')
      .update({ position: index })
      .eq('id', orderedIds[index]!)
      .eq('place_id', placeId)
    if (error) return failure(error.message)
  }
  return null
}

async function currentSnapshot(supabase: AdminClient, placeId: number) {
  const base = storageBase()
  const [place, listed] = await Promise.all([
    readPlace(supabase, placeId),
    listRows(supabase, placeId),
  ])
  if ('error' in place) return place
  if ('error' in listed) return listed
  return snapshot(listed.rows, place.place, base)
}

function revalidatePlace(placeId: number) {
  revalidatePath('/admin/places')
  revalidatePath(`/place/${placeId}`)
}

export async function listPlaceMedia(
  placeId: number,
): Promise<PlaceMediaSnapshot | { error: string }> {
  await requireModerator()
  if (!Number.isInteger(placeId) || placeId <= 0) return failure('Invalid place.')
  const supabase = createAdminClient()
  return currentSnapshot(supabase, placeId)
}

export async function preparePlaceMediaUpload(input: {
  placeId: number
  ext: string
  filename: string
}): Promise<PreparedPlaceMediaUpload | { error: string }> {
  await requireModerator()
  if (!Number.isInteger(input.placeId) || input.placeId <= 0) {
    return failure('Invalid place.')
  }
  if (!isPlaceMediaExt(input.ext)) {
    return failure('Use a JPEG, PNG, WebP, GIF, MP4, or MOV file.')
  }
  const filename = input.filename.trim().slice(0, 200)
  if (!filename) return failure('Choose a file to upload.')

  const supabase = createAdminClient()
  const place = await readPlace(supabase, input.placeId)
  if ('error' in place) return place

  const { count, error } = await supabase
    .from('place_media')
    .select('id', { count: 'exact', head: true })
    .eq('place_id', input.placeId)
  if (error) return failure(error.message)
  if ((count ?? 0) >= MAX_GALLERY_ITEMS) {
    return failure(`A place can have up to ${MAX_GALLERY_ITEMS} photos and videos.`)
  }

  const kind = kindForExt(input.ext)
  const slug = mediaSlug(filename)
  const token = newToken()
  const objectPath = galleryObjectPath(input.placeId, slug, token, input.ext)
  const thumbPath = kind === 'image' ? thumbPathFor(objectPath) : null
  const posterPath =
    kind === 'video' ? posterObjectPath(input.placeId, slug, newToken()) : null

  const objectUpload = await signUpload(supabase, objectPath)
  if ('error' in objectUpload) return objectUpload
  let posterToken: string | null = null
  let thumbToken: string | null = null
  if (posterPath) {
    const posterUpload = await signUpload(supabase, posterPath)
    if ('error' in posterUpload) return posterUpload
    posterToken = posterUpload.token
  }
  if (thumbPath) {
    const thumbUpload = await signUpload(supabase, thumbPath)
    if ('error' in thumbUpload) return thumbUpload
    thumbToken = thumbUpload.token
  }

  return {
    objectPath,
    objectToken: objectUpload.token,
    posterPath,
    posterToken,
    thumbPath,
    thumbToken,
  }
}

export async function discardPlaceMediaUpload(
  placeId: number,
  paths: string[],
) {
  await requireModerator()
  if (!Number.isInteger(placeId) || placeId <= 0) return failure('Invalid place.')
  const supabase = createAdminClient()
  const used = await referencedPaths(supabase, placeId)
  const removable = paths.filter(
    (path) => isGalleryObjectPath(placeId, path) && !used.has(path),
  )
  await removePaths(supabase, removable)
  return { ok: true }
}

async function cleanupUpload(
  supabase: AdminClient,
  placeId: number,
  paths: Array<string | null>,
) {
  const used = await referencedPaths(supabase, placeId)
  const removable = paths.filter((path): path is string => path != null && !used.has(path))
  await removePaths(supabase, removable)
}

export async function commitPlaceMediaUpload(input: {
  placeId: number
  objectPath: string
  posterPath: string | null
  thumbPath: string | null
}): Promise<PlaceMediaSnapshot | { error: string }> {
  await requireModerator()
  const placeId = input.placeId
  if (!Number.isInteger(placeId) || placeId <= 0) return failure('Invalid place.')
  if (!isGalleryObjectPath(placeId, input.objectPath)) {
    return failure('Invalid gallery path.')
  }

  const supabase = createAdminClient()
  const base = storageBase()
  const place = await readPlace(supabase, placeId)
  if ('error' in place) return place

  const paths = [input.objectPath, input.posterPath, input.thumbPath]
  try {
    await ensureLegacyImported(supabase, place.place)

    const { count, error: countError } = await supabase
      .from('place_media')
      .select('id', { count: 'exact', head: true })
      .eq('place_id', placeId)
    if (countError) {
      await cleanupUpload(supabase, placeId, paths)
      return failure(countError.message)
    }
    if ((count ?? 0) >= MAX_GALLERY_ITEMS) {
      await cleanupUpload(supabase, placeId, paths)
      return failure(`A place can have up to ${MAX_GALLERY_ITEMS} photos and videos.`)
    }

    const header = await readHeader(publicObjectUrl(base, input.objectPath))
    if (header.size == null) {
      await cleanupUpload(supabase, placeId, paths)
      return failure('Could not confirm the uploaded file. Try again.')
    }
    const sniffed = sniffMedia(header.bytes)
    if (!sniffed.ok) {
      await cleanupUpload(supabase, placeId, paths)
      return failure(sniffed.error)
    }
    if (!extMatchesSniff(extensionOf(input.objectPath), sniffed)) {
      await cleanupUpload(supabase, placeId, paths)
      return failure('The file contents do not match its type.')
    }
    const limit = sniffed.kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (header.size > limit) {
      await cleanupUpload(supabase, placeId, paths)
      return failure(
        sniffed.kind === 'video'
          ? 'Videos need to be 80MB or smaller.'
          : 'Photos need to be 8MB or smaller after preparation.',
      )
    }

    let posterPath: string | null = null
    if (sniffed.kind === 'video') {
      if (!input.posterPath || !isGalleryObjectPath(placeId, input.posterPath)) {
        await cleanupUpload(supabase, placeId, paths)
        return failure('A video needs a poster frame.')
      }
      const poster = await readHeader(publicObjectUrl(base, input.posterPath))
      const posterSniff = sniffMedia(poster.bytes)
      if (
        !posterSniff.ok ||
        posterSniff.ext !== 'jpg' ||
        poster.size == null ||
        poster.size > MAX_POSTER_BYTES
      ) {
        await cleanupUpload(supabase, placeId, paths)
        return failure('A video needs a JPEG poster frame.')
      }
      posterPath = input.posterPath
    } else if (input.posterPath) {
      await cleanupUpload(supabase, placeId, paths)
      return failure('Photos do not use a poster frame.')
    }

    if (input.thumbPath) {
      if (input.thumbPath !== thumbPathFor(input.objectPath)) {
        await cleanupUpload(supabase, placeId, paths)
        return failure('Invalid thumbnail path.')
      }
      const thumb = await readHeader(publicObjectUrl(base, input.thumbPath))
      const thumbSniff = sniffMedia(thumb.bytes)
      if (
        !thumbSniff.ok ||
        thumbSniff.ext !== 'jpg' ||
        thumb.size == null ||
        thumb.size > MAX_THUMB_BYTES
      ) {
        await cleanupUpload(supabase, placeId, paths)
        return failure('Could not save the photo thumbnail.')
      }
    }

    const before = await listRows(supabase, placeId)
    if ('error' in before) {
      await cleanupUpload(supabase, placeId, paths)
      return before
    }
    const beforeCover = coverMediaId(before.rows)
    let insertedId: number | null = null
    let insertError: string | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: latest, error: latestError } = await supabase
        .from('place_media')
        .select('position')
        .eq('place_id', placeId)
        .order('position', { ascending: false })
        .limit(1)
      if (latestError) {
        insertError = latestError.message
        break
      }
      const position = (latest?.[0]?.position ?? -1) + 1
      const { data, error } = await supabase
        .from('place_media')
        .insert({
          place_id: placeId,
          kind: sniffed.kind,
          object_path: input.objectPath,
          poster_path: posterPath,
          position,
        })
        .select('id')
        .single()
      if (!error) {
        insertedId = data.id
        insertError = null
        break
      }
      insertError = error.message
      if (!isPositionConflict(error.message)) break
    }
    if (insertedId == null) {
      await cleanupUpload(supabase, placeId, paths)
      return failure(insertError ?? 'Could not save the gallery item.')
    }

    const after = await listRows(supabase, placeId)
    if ('error' in after) return after
    const afterCover = coverMediaId(after.rows)
    if (afterCover != null && afterCover !== beforeCover) {
      const synced = await syncLegacyCover(supabase, placeId, base)
      if ('error' in synced) return synced
      revalidatePlace(placeId)
      return snapshot(synced.rows, synced.place, base)
    }
    revalidatePlace(placeId)
    return snapshot(after.rows, place.place, base)
  } catch (error) {
    await cleanupUpload(supabase, placeId, paths)
    return failure(error instanceof Error ? error.message : 'Upload failed.')
  }
}

export async function reorderPlaceMedia(
  placeId: number,
  orderedIds: number[],
): Promise<PlaceMediaSnapshot | { error: string }> {
  await requireModerator()
  if (!Number.isInteger(placeId) || placeId <= 0) return failure('Invalid place.')
  const supabase = createAdminClient()
  const base = storageBase()
  const before = await listRows(supabase, placeId)
  if ('error' in before) return before
  const beforeCover = coverMediaId(before.rows)
  const ordered = await applyOrder(supabase, placeId, orderedIds)
  if (ordered && 'error' in ordered) return ordered
  const after = await listRows(supabase, placeId)
  if ('error' in after) return after
  const afterCover = coverMediaId(after.rows)
  if (afterCover != null && afterCover !== beforeCover) {
    const synced = await syncLegacyCover(supabase, placeId, base)
    if ('error' in synced) return synced
    revalidatePlace(placeId)
    return snapshot(synced.rows, synced.place, base)
  }
  const place = await readPlace(supabase, placeId)
  if ('error' in place) return place
  revalidatePlace(placeId)
  return snapshot(after.rows, place.place, base)
}

export async function makePlaceMediaCover(
  placeId: number,
  mediaId: number,
): Promise<PlaceMediaSnapshot | { error: string }> {
  await requireModerator()
  if (!Number.isInteger(placeId) || placeId <= 0) return failure('Invalid place.')
  const supabase = createAdminClient()
  const base = storageBase()
  const listed = await listRows(supabase, placeId)
  if ('error' in listed) return listed
  const target = listed.rows.find((row) => row.id === mediaId)
  if (!target) return failure('That photo is no longer in the gallery.')
  if (target.kind !== 'image') return failure('Only a photo can be the card image.')

  if (target.position !== 0) {
    const orderedIds = [
      target.id,
      ...listed.rows
        .filter((row) => row.id !== target.id)
        .sort((a, b) => a.position - b.position)
        .map((row) => row.id),
    ]
    const ordered = await applyOrder(supabase, placeId, orderedIds)
    if (ordered && 'error' in ordered) return ordered
  }

  const synced = await syncLegacyCover(supabase, placeId, base)
  if ('error' in synced) return synced
  revalidatePlace(placeId)
  return snapshot(synced.rows, synced.place, base)
}

export async function removePlaceMediaItem(
  placeId: number,
  mediaId: number,
): Promise<PlaceMediaSnapshot | { error: string }> {
  await requireModerator()
  if (!Number.isInteger(placeId) || placeId <= 0) return failure('Invalid place.')
  const supabase = createAdminClient()
  const base = storageBase()
  const listed = await listRows(supabase, placeId)
  if ('error' in listed) return listed
  const target = listed.rows.find((row) => row.id === mediaId)
  if (!target) return failure('That photo or video is no longer in the gallery.')
  const beforeCover = coverMediaId(listed.rows)

  const { error } = await supabase
    .from('place_media')
    .delete()
    .eq('id', mediaId)
    .eq('place_id', placeId)
  if (error) return failure(error.message)

  await removePaths(
    supabase,
    [
      target.object_path,
      target.poster_path,
      target.kind === 'image' ? thumbPathFor(target.object_path) : null,
    ].filter((path): path is string => path != null),
  )

  const remaining = listed.rows
    .filter((row) => row.id !== mediaId)
    .sort((a, b) => a.position - b.position)
    .map((row) => row.id)
  const ordered = await applyOrder(supabase, placeId, remaining)
  if (ordered && 'error' in ordered) return ordered

  const after = await listRows(supabase, placeId)
  if ('error' in after) return after
  const afterCover = coverMediaId(after.rows)
  if (afterCover != null && afterCover !== beforeCover) {
    const synced = await syncLegacyCover(supabase, placeId, base)
    if ('error' in synced) return synced
    revalidatePlace(placeId)
    return snapshot(synced.rows, synced.place, base)
  }
  const place = await readPlace(supabase, placeId)
  if ('error' in place) return place
  revalidatePlace(placeId)
  return snapshot(after.rows, place.place, base)
}

