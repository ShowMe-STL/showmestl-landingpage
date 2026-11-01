export const sharedContentKinds: string[]
export const showMeAppStoreUrl: string
export const shareOgImage: { url: string; width: number; height: number; alt: string }
export const shareOgVideo: { url: string; type: string; width: number; height: number }

export type ShareMetaKind = 'pin' | 'time' | 'venue' | 'tag'

export type ShareMeta = {
  kind: ShareMetaKind
  text: string
}

export type ShareDateTile = {
  month: string
  day: string
  time: string
}

export type SharePreview = {
  title: string
  description: string
  label: string
  imageUrl: string | null
  imageUrls: string[]
  meta: ShareMeta[]
  dateTile: ShareDateTile | null
}

export type PlacePreviewRow = {
  name?: string | null
  address?: string | null
  description?: string | null
  image_url?: string | null
  image_thumb_url?: string | null
  category?: string | null
  neighborhood?: string | null
}

export type EventPreviewRow = {
  title?: string | null
  start_time?: string | null
  end_time?: string | null
  venue_name?: string | null
  address?: string | null
  description?: string | null
  image_url?: string | null
  image_thumb_url?: string | null
}

export type PlaylistPreviewRow = {
  name?: string | null
  description?: string | null
  image_url?: string | null
  image_thumb_url?: string | null
  imageUrls?: string[] | null
}

export function isSharedContentId(kind: string, id: string): boolean
export function parseSharedContentPath(path: string): { kind: string; id: string } | null
export function sharedContentDetails(kind: string, id: string): {
  title: string
  description: string
  appUrl: string
  url: string
} | null
export function escapeHtml(value: unknown): string
export function plainText(value: unknown, max?: number): string
export function safeHttpsUrl(value: unknown): string | null
export function genericSharePreview(kind: string): SharePreview | null
export function formatEventWhen(startIso: string | null | undefined, endIso?: string | null): {
  weekday: string
  month: string
  day: string
  time: string
  range: string | null
} | null
export function buildPlacePreview(row: PlacePreviewRow): SharePreview
export function buildEventPreview(row: EventPreviewRow): SharePreview
export type ProfilePreviewRow = {
  avatar_url?: string | null
  avatar_thumb_url?: string | null
}

export function buildPlaylistPreview(row: PlaylistPreviewRow, extraImages?: string[]): SharePreview
export function buildProfilePreview(row: ProfilePreviewRow): SharePreview
export function loadPublicPreview(
  kind: string,
  id: string,
  env?: { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string },
): Promise<Record<string, unknown> | null>
export function previewForHtml(kind: string, preview: unknown): SharePreview | null
export function sharedContentFallbackHtml(kind?: string, id?: string, preview?: unknown): string
