import type { PlaceMediaExt, PlaceMediaKind } from '@/lib/place-media'
import { MAX_SOURCE_IMAGE_BYTES, MAX_VIDEO_BYTES } from '@/lib/place-media'

export type PreparedMediaFile = {
  kind: PlaceMediaKind
  ext: PlaceMediaExt
  filename: string
  file: Blob
  contentType: string
  thumb: Blob | null
  poster: Blob | null
}

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export function validateMediaFile(file: File): string | null {
  const name = file.name.toLowerCase()
  if (name.endsWith('.heic') || name.endsWith('.heif') || name.endsWith('.avif')) {
    return 'Convert HEIC or AVIF photos to JPEG before uploading.'
  }
  if (file.type.startsWith('video/') || name.endsWith('.mp4') || name.endsWith('.mov')) {
    if (file.type && file.type !== 'video/mp4' && file.type !== 'video/quicktime') {
      return 'Videos need to be MP4 or MOV.'
    }
    if (file.size > MAX_VIDEO_BYTES) return 'Videos need to be 80MB or smaller.'
    return null
  }
  if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/.test(name)) {
    if (file.type && !IMAGE_TYPES.has(file.type)) {
      return 'Photos need to be JPEG, PNG, WebP, or GIF.'
    }
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      return 'Photos need to be 20MB or smaller.'
    }
    return null
  }
  return 'Use a JPEG, PNG, WebP, GIF, MP4, or MOV file.'
}

export async function prepareMediaFile(file: File): Promise<PreparedMediaFile> {
  const invalid = validateMediaFile(file)
  if (invalid) throw new Error(invalid)

  const name = file.name.toLowerCase()
  const isVideo =
    file.type.startsWith('video/') || name.endsWith('.mp4') || name.endsWith('.mov')
  if (isVideo) {
    const ext: PlaceMediaExt = name.endsWith('.mov') || file.type === 'video/quicktime'
      ? 'mov'
      : 'mp4'
    const poster = await captureVideoPoster(file)
    return {
      kind: 'video',
      ext,
      filename: file.name,
      file,
      contentType: ext === 'mov' ? 'video/quicktime' : 'video/mp4',
      thumb: null,
      poster,
    }
  }

  if (file.type === 'image/gif' || name.endsWith('.gif')) {
    return {
      kind: 'image',
      ext: 'gif',
      filename: file.name,
      file,
      contentType: 'image/gif',
      thumb: await bitmapToJpeg(file, 480, 0.8),
      poster: null,
    }
  }

  return {
    kind: 'image',
    ext: 'jpg',
    filename: file.name,
    file: await bitmapToJpeg(file, 2000, 0.86),
    contentType: 'image/jpeg',
    thumb: await bitmapToJpeg(file, 480, 0.8),
    poster: null,
  }
}

async function bitmapToJpeg(
  file: Blob,
  maxEdge: number,
  quality: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare that photo.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await canvasToJpeg(canvas, quality)
    if (!blob) throw new Error('Could not prepare that photo.')
    return blob
  } finally {
    bitmap.close()
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

function captureVideoPoster(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    let settled = false
    const timer = window.setTimeout(() => {
      finish(new Error('Could not read that video. Use an MP4 or MOV.'))
    }, 8000)

    const finish = (error?: Error, blob?: Blob) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      URL.revokeObjectURL(url)
      if (error) reject(error)
      else if (blob) resolve(blob)
      else reject(new Error('Could not create a poster frame.'))
    }

    const draw = () => {
      if (!video.videoWidth || !video.videoHeight) {
        finish(new Error('Could not read that video. Use an MP4 or MOV.'))
        return
      }
      const scale = Math.min(1, 1280 / video.videoWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
      const context = canvas.getContext('2d')
      if (!context) {
        finish(new Error('Could not create a poster frame.'))
        return
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!blob) finish(new Error('Could not create a poster frame.'))
        else finish(undefined, blob)
      }, 'image/jpeg', 0.85)
    }

    video.onerror = () =>
      finish(new Error('Could not read that video. Use an MP4 or MOV.'))
    video.onloadeddata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0
      const target = duration > 0.25 ? Math.min(0.5, duration / 3) : 0
      if (target === 0) draw()
      else video.currentTime = target
    }
    video.onseeked = () => draw()
    video.src = url
  })
}
