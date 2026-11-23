// Contract for public.place_media and the place-media bucket.
// The mobile repo was not readable from this environment. These rules are the
// ones the database enforces (migration place_media, 20261107150251) and the
// ones the existing Gateway Arch rows already use. The app reads kind,
// object_path, poster_path, and position. There is no separate primary column:
// position 0 is first in the gallery, and the first image is the card cover,
// stored on the places row as image_url / image_thumb_url (historically
// places/{id}/full.jpg and places/{id}/thumb.jpg).

export const PLACE_MEDIA_BUCKET = 'place-media'

export const MAX_GALLERY_ITEMS = 30
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024
export const MAX_POSTER_BYTES = 2 * 1024 * 1024
export const MAX_THUMB_BYTES = 700 * 1024
export const MAX_SOURCE_IMAGE_BYTES = 20 * 1024 * 1024

export type PlaceMediaKind = 'image' | 'video'

export type PlaceMediaExt = 'jpg' | 'gif' | 'png' | 'webp' | 'mp4' | 'mov'

const IMAGE_EXTS = new Set<PlaceMediaExt>(['jpg', 'gif', 'png', 'webp'])
const VIDEO_EXTS = new Set<PlaceMediaExt>(['mp4', 'mov'])

export function kindForExt(ext: PlaceMediaExt): PlaceMediaKind {
  return VIDEO_EXTS.has(ext) ? 'video' : 'image'
}

export function isPlaceMediaExt(value: string): value is PlaceMediaExt {
  return (
    IMAGE_EXTS.has(value as PlaceMediaExt) ||
    VIDEO_EXTS.has(value as PlaceMediaExt)
  )
}

export function mediaSlug(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '')
  const slug = base
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '')
  return slug || 'media'
}

export function isGalleryObjectPath(placeId: number, objectPath: string): boolean {
  if (!Number.isInteger(placeId) || placeId <= 0) return false
  return new RegExp(
    `^places/${placeId}/gallery/[A-Za-z0-9_-][A-Za-z0-9_.-]*$`,
  ).test(objectPath)
}

export function galleryObjectPath(
  placeId: number,
  slug: string,
  token: string,
  ext: PlaceMediaExt,
): string {
  const path = `places/${placeId}/gallery/${slug}-${token}.${ext}`
  if (!isGalleryObjectPath(placeId, path)) {
    throw new Error('Could not build a gallery path.')
  }
  return path
}

export function posterObjectPath(
  placeId: number,
  slug: string,
  token: string,
): string {
  const path = `places/${placeId}/gallery/${slug}-poster-${token}.jpg`
  if (!isGalleryObjectPath(placeId, path)) {
    throw new Error('Could not build a poster path.')
  }
  return path
}

export function thumbPathFor(objectPath: string): string {
  return objectPath.replace(/\.[A-Za-z0-9]+$/, '-thumb.jpg')
}

export function publicObjectUrl(supabaseUrl: string, objectPath: string): string {
  const base = supabaseUrl.replace(/\/$/, '')
  const encoded = objectPath.split('/').map(encodeURIComponent).join('/')
  return `${base}/storage/v1/object/public/${PLACE_MEDIA_BUCKET}/${encoded}`
}

export function pathFromPublicObjectUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const marker = `/storage/v1/object/public/${PLACE_MEDIA_BUCKET}/`
    const index = parsed.pathname.indexOf(marker)
    if (index === -1) return null
    const path = decodeURIComponent(parsed.pathname.slice(index + marker.length))
    if (!path || path.includes('..') || path.includes('\\') || path.startsWith('/')) {
      return null
    }
    return path
  } catch {
    return null
  }
}

export function coverMediaId(
  items: { id: number; kind: string; position: number }[],
): number | null {
  let best: { id: number; position: number } | null = null
  for (const item of items) {
    if (item.kind !== 'image') continue
    if (!best || item.position < best.position) {
      best = { id: item.id, position: item.position }
    }
  }
  return best?.id ?? null
}

export type SniffedMedia =
  | {
      ok: true
      kind: 'image'
      mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
      ext: 'jpg' | 'png' | 'webp' | 'gif'
    }
  | {
      ok: true
      kind: 'video'
      mime: 'video/mp4' | 'video/quicktime'
      ext: 'mp4' | 'mov'
    }
  | { ok: false; error: string }

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let out = ''
  for (let i = start; i < start + length && i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i] ?? 0)
  }
  return out
}

export function sniffMedia(bytes: Uint8Array): SniffedMedia {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ok: true, kind: 'image', mime: 'image/jpeg', ext: 'jpg' }
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { ok: true, kind: 'image', mime: 'image/png', ext: 'png' }
  }
  if (bytes.length >= 6 && ascii(bytes, 0, 6) === 'GIF89a') {
    return { ok: true, kind: 'image', mime: 'image/gif', ext: 'gif' }
  }
  if (bytes.length >= 6 && ascii(bytes, 0, 6) === 'GIF87a') {
    return { ok: true, kind: 'image', mime: 'image/gif', ext: 'gif' }
  }
  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === 'RIFF' &&
    ascii(bytes, 8, 4) === 'WEBP'
  ) {
    return { ok: true, kind: 'image', mime: 'image/webp', ext: 'webp' }
  }
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') {
    const brand = ascii(bytes, 8, 4).toLowerCase()
    if (
      brand.startsWith('hei') ||
      brand.startsWith('avif') ||
      brand === 'mif1' ||
      brand === 'msf1'
    ) {
      return {
        ok: false,
        error: 'Convert HEIC or AVIF photos to JPEG before uploading.',
      }
    }
    if (brand.startsWith('m4a') || brand === 'mp4a') {
      return { ok: false, error: 'That file is audio, not a video.' }
    }
    if (brand.startsWith('qt') || brand.startsWith('mov')) {
      return { ok: true, kind: 'video', mime: 'video/quicktime', ext: 'mov' }
    }
    return { ok: true, kind: 'video', mime: 'video/mp4', ext: 'mp4' }
  }
  return {
    ok: false,
    error: 'Use a JPEG, PNG, WebP, GIF, MP4, or MOV file.',
  }
}

export function extMatchesSniff(ext: string, sniffed: SniffedMedia): boolean {
  if (!sniffed.ok) return false
  if (ext === 'jpeg') return sniffed.ext === 'jpg'
  return ext === sniffed.ext
}
