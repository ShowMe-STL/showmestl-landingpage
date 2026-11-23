'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type DragEvent,
} from 'react'
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Star,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  commitPlaceMediaUpload,
  discardPlaceMediaUpload,
  listPlaceMedia,
  makePlaceMediaCover,
  preparePlaceMediaUpload,
  removePlaceMediaItem,
  reorderPlaceMedia,
  type PlaceMediaItem,
  type PlaceMediaSnapshot,
} from '@/lib/actions/place-media'
import { prepareMediaFile, type PreparedMediaFile } from '@/lib/place-media-client'
import { createClient } from '@/lib/supabase/client'
import { PLACE_MEDIA_BUCKET } from '@/lib/place-media'

export type PlaceMediaGalleryHandle = {
  flushPending: (placeId: number) => Promise<string | null>
}

type PendingMedia = PreparedMediaFile & {
  key: string
  previewUrl: string
}

type GalleryEntry = {
  key: string
  kind: 'image' | 'video'
  previewUrl: string
  label: string
  pending: boolean
}

const ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov'

export const PlaceMediaGallery = forwardRef<
  PlaceMediaGalleryHandle,
  {
    placeId: number | null
    cardImageUrl: string | null
    onCoverChange: (imageUrl: string | null, imageThumbUrl: string | null) => void
    onBusyChange?: (busy: boolean) => void
  }
>(function PlaceMediaGallery(
  { placeId, cardImageUrl, onCoverChange, onBusyChange },
  ref,
) {
  const [items, setItems] = useState<PlaceMediaItem[]>([])
  const [loadedFor, setLoadedFor] = useState<number | null>(null)
  const [pending, setPending] = useState<PendingMedia[]>([])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmKey, setConfirmKey] = useState<string | null>(null)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const pendingRef = useRef(pending)
  const listRequest = useRef(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const onCoverChangeRef = useRef(onCoverChange)
  const onBusyChangeRef = useRef(onBusyChange)
  pendingRef.current = pending
  onCoverChangeRef.current = onCoverChange
  onBusyChangeRef.current = onBusyChange

  function updateBusy(value: boolean) {
    setBusy(value)
    onBusyChangeRef.current?.(value)
  }

  useEffect(() => {
    if (!placeId) return
    const request = ++listRequest.current
    const requested = placeId
    listPlaceMedia(requested).then((result) => {
      if (request !== listRequest.current) return
      if ('error' in result) {
        setError(result.error)
        setLoadedFor(requested)
        return
      }
      setItems(result.items)
      setLoadedFor(requested)
      setError(null)
    })
  }, [placeId])

  useImperativeHandle(ref, () => ({
    async flushPending(targetId: number) {
      const queue = pendingRef.current
      if (queue.length === 0) return null
      updateBusy(true)
      for (let index = 0; index < queue.length; index++) {
        const item = queue[index]!
        setStatus(`Uploading ${index + 1} of ${queue.length}`)
        const uploadError = await uploadPrepared(targetId, item, applySnapshot)
        if (uploadError) {
          const remaining = queue.slice(index)
          pendingRef.current = remaining
          setPending(remaining)
          setStatus(null)
          updateBusy(false)
          return uploadError
        }
        URL.revokeObjectURL(item.previewUrl)
      }
      pendingRef.current = []
      setPending([])
      setStatus(null)
      updateBusy(false)
      return null
    },
  }))

  function applySnapshot(snapshot: PlaceMediaSnapshot) {
    listRequest.current += 1
    setItems(snapshot.items)
    if (placeId != null) setLoadedFor(placeId)
    onCoverChangeRef.current(snapshot.imageUrl, snapshot.imageThumbUrl)
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0 || busy) return
    updateBusy(true)
    setError(null)
    const queued: PendingMedia[] = []
    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index]!
        setStatus(`Preparing ${index + 1} of ${files.length}`)
        let prepared: PreparedMediaFile
        try {
          prepared = await prepareMediaFile(file)
        } catch (caught) {
          const message =
            caught instanceof Error ? caught.message : 'Could not prepare that file.'
          toast.error(message)
          continue
        }
        if (placeId) {
          listRequest.current += 1
          setStatus(`Uploading ${index + 1} of ${files.length}`)
          const uploadError = await uploadPrepared(placeId, prepared, applySnapshot)
          if (uploadError) {
            toast.error(uploadError)
            break
          }
        } else {
          const previewSource = prepared.poster ?? prepared.thumb ?? prepared.file
          queued.push({
            ...prepared,
            key: `${Date.now()}-${index}-${file.name}`,
            previewUrl: URL.createObjectURL(previewSource),
          })
        }
      }
    } finally {
      if (queued.length > 0) {
        setPending((current) => [...current, ...queued])
      }
      setStatus(null)
      updateBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removePending(key: string) {
    setPending((current) => {
      const target = current.find((item) => item.key === key)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return current.filter((item) => item.key !== key)
    })
    setConfirmKey(null)
  }

  function reorderPending(fromKey: string, toIndex: number) {
    setPending((current) => moveEntry(current, fromKey, toIndex, (item) => item.key))
  }

  async function persistOrder(ordered: PlaceMediaItem[]) {
    if (!placeId) return
    listRequest.current += 1
    const previous = items
    setItems(ordered.map((item, position) => ({ ...item, position })))
    const result = await reorderPlaceMedia(
      placeId,
      ordered.map((item) => item.id),
    )
    if ('error' in result) {
      setItems(previous)
      toast.error(result.error)
      return
    }
    applySnapshot(result)
  }

  async function reorderSaved(fromKey: string, toIndex: number) {
    const current = sorted(visibleItems)
    const ordered = moveEntry(current, fromKey, toIndex, itemKey)
    if (ordered === current) return
    await persistOrder(ordered)
  }

  async function moveSaved(key: string, direction: -1 | 1) {
    const ordered = sorted(items)
    const index = ordered.findIndex((item) => itemKey(item) === key)
    const next = index + direction
    if (index < 0 || next < 0 || next >= ordered.length) return
    const swapped = ordered.slice()
    const [moved] = swapped.splice(index, 1)
    swapped.splice(next, 0, moved!)
    await persistOrder(swapped)
  }

  function movePending(key: string, direction: -1 | 1) {
    setPending((current) => {
      const index = current.findIndex((item) => item.key === key)
      const next = index + direction
      if (index < 0 || next < 0 || next >= current.length) return current
      const swapped = current.slice()
      const [moved] = swapped.splice(index, 1)
      swapped.splice(next, 0, moved!)
      return swapped
    })
  }

  async function makeCover(key: string) {
    if (!placeId) return
    const id = Number(key.replace('saved:', ''))
    listRequest.current += 1
    updateBusy(true)
    const result = await makePlaceMediaCover(placeId, id)
    updateBusy(false)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    applySnapshot(result)
    toast.success('Cover updated.')
  }

  async function removeSaved(key: string) {
    if (!placeId) return
    const id = Number(key.replace('saved:', ''))
    listRequest.current += 1
    updateBusy(true)
    const result = await removePlaceMediaItem(placeId, id)
    updateBusy(false)
    setConfirmKey(null)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    applySnapshot(result)
  }

  const visibleItems = placeId != null && loadedFor === placeId ? items : []
  const loading = placeId != null && loadedFor !== placeId
  const savedEntries: GalleryEntry[] = sorted(visibleItems).map((item) => ({
    key: itemKey(item),
    kind: item.kind,
    previewUrl: item.kind === 'video' ? item.posterUrl || item.url : item.url,
    label: item.kind === 'video' ? 'Video' : 'Photo',
    pending: false,
  }))
  const pendingEntries: GalleryEntry[] = pending.map((item) => ({
    key: item.key,
    kind: item.kind,
    previewUrl: item.previewUrl,
    label: item.filename,
    pending: true,
  }))
  const coverKey =
    savedEntries.find((entry) => entry.kind === 'image')?.key ??
    pendingEntries.find((entry) => entry.kind === 'image')?.key ??
    null

  return (
    <section className="space-y-3 rounded-lg border border-white/10 p-3">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Photos and videos</h3>
        <p className="text-xs text-muted-foreground">
          Add several at once. The app shows them in this order. The first photo
          is the card cover, and the original single image stays in place until
          you add gallery media or choose a cover.
        </p>
      </div>

      {cardImageUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardImageUrl}
            alt=""
            className="h-12 w-12 rounded-md object-cover"
          />
          <p className="text-xs text-muted-foreground">
            Current card image. Choosing Make cover, or moving a different photo
            first, updates it.
          </p>
        </div>
      ) : null}

      <div
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 px-4 py-5 text-center"
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes('Files')) return
          event.preventDefault()
        }}
        onDrop={(event) => {
          if (!event.dataTransfer.types.includes('Files')) return
          event.preventDefault()
          void uploadFiles([...event.dataTransfer.files])
        }}
      >
        <ImagePlus className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm">Drop photos or videos here</p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, GIF, MP4, or MOV. Photos up to 20MB, videos up to 80MB.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Working…' : 'Choose files'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(event) => void uploadFiles([...(event.target.files ?? [])])}
        />
      </div>

      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading gallery…</p>
      ) : null}

      {savedEntries.length > 0 ? (
        <GalleryList
          entries={savedEntries}
          coverKey={coverKey}
          busy={busy}
          confirmKey={confirmKey}
          dragKey={dragKey}
          onDragKey={setDragKey}
          onMove={(key, direction) => void moveSaved(key, direction)}
          onReorder={(key, index) => void reorderSaved(key, index)}
          onMakeCover={(key) => void makeCover(key)}
          onAskDelete={setConfirmKey}
          onConfirmDelete={(key) => void removeSaved(key)}
          onCancelDelete={() => setConfirmKey(null)}
        />
      ) : null}

      {pendingEntries.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Uploads when you save this place. The current card image is kept as
            the first photo.
          </p>
          <GalleryList
            entries={pendingEntries}
            coverKey={savedEntries.length > 0 ? null : coverKey}
            busy={busy}
            confirmKey={confirmKey}
            dragKey={dragKey}
            onDragKey={setDragKey}
            onMove={movePending}
            onReorder={(key, index) => {
              reorderPending(key, index)
            }}
            onMakeCover={(key) => reorderPending(key, 0)}
            onAskDelete={setConfirmKey}
            onConfirmDelete={removePending}
            onCancelDelete={() => setConfirmKey(null)}
          />
        </div>
      ) : null}
    </section>
  )
})

function GalleryList({
  entries,
  coverKey,
  busy,
  confirmKey,
  dragKey,
  onDragKey,
  onMove,
  onReorder,
  onMakeCover,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  entries: GalleryEntry[]
  coverKey: string | null
  busy: boolean
  confirmKey: string | null
  dragKey: string | null
  onDragKey: (key: string | null) => void
  onMove: (key: string, direction: -1 | 1) => void
  onReorder: (key: string, index: number) => void
  onMakeCover: (key: string) => void
  onAskDelete: (key: string) => void
  onConfirmDelete: (key: string) => void
  onCancelDelete: () => void
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Place gallery">
      {entries.map((entry, index) => {
        const isCover = entry.key === coverKey
        return (
          <li
            key={entry.key}
            className={`overflow-hidden rounded-lg border bg-muted/30 ${
              dragKey === entry.key ? 'border-white/40' : 'border-white/10'
            }`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              if (!dragKey) return
              onReorder(dragKey, index)
              onDragKey(null)
            }}
          >
            <div className="relative aspect-video bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute left-1.5 top-1.5 flex gap-1">
                {isCover ? <Badge>Cover</Badge> : null}
                {entry.kind === 'video' ? (
                  <Badge variant="secondary">Video</Badge>
                ) : null}
                {entry.pending ? <Badge variant="outline">New</Badge> : null}
              </div>
              <button
                type="button"
                className="absolute right-1.5 top-1.5 rounded-md bg-black/50 p-1 text-white"
                aria-label={`Reorder ${entry.label}`}
                draggable={!busy}
                onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                  event.dataTransfer.effectAllowed = 'move'
                  event.dataTransfer.setData('text/plain', entry.key)
                  onDragKey(entry.key)
                }}
                onDragEnd={() => onDragKey(null)}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1 p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={busy || index === 0}
                aria-label="Move earlier"
                onClick={() => onMove(entry.key, -1)}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={busy || index === entries.length - 1}
                aria-label="Move later"
                onClick={() => onMove(entry.key, 1)}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {entry.kind === 'image' && (!isCover || !entry.pending) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={busy}
                  onClick={() => onMakeCover(entry.key)}
                >
                  <Star className="h-3 w-3" />
                  {isCover ? 'Update card' : 'Make cover'}
                </Button>
              ) : null}
              {confirmKey === entry.key ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    disabled={busy}
                    onClick={() => onConfirmDelete(entry.key)}
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={onCancelDelete}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={busy}
                  aria-label={`Delete ${entry.label}`}
                  onClick={() => onAskDelete(entry.key)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function itemKey(item: PlaceMediaItem) {
  return `saved:${item.id}`
}

function sorted(items: PlaceMediaItem[]) {
  return items.slice().sort((a, b) => a.position - b.position)
}

function moveEntry<T>(items: T[], fromKey: string, toIndex: number, keyOf: (item: T) => string) {
  const fromIndex = items.findIndex((item) => keyOf(item) === fromKey)
  if (fromIndex < 0 || fromIndex === toIndex) return items
  const next = items.slice()
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved!)
  return next
}

async function uploadPrepared(
  placeId: number,
  prepared: PreparedMediaFile,
  applySnapshot: (snapshot: PlaceMediaSnapshot) => void,
) {
  const ticket = await preparePlaceMediaUpload({
    placeId,
    ext: prepared.ext,
    filename: prepared.filename,
  })
  if ('error' in ticket) return ticket.error

  const supabase = createClient()
  const bucket = supabase.storage.from(PLACE_MEDIA_BUCKET)
  const uploaded = await bucket.uploadToSignedUrl(
    ticket.objectPath,
    ticket.objectToken,
    prepared.file,
    { contentType: prepared.contentType, upsert: false },
  )
  if (uploaded.error) {
    await discardPlaceMediaUpload(placeId, [ticket.objectPath])
    return uploaded.error.message
  }

  if (ticket.posterPath && ticket.posterToken && prepared.poster) {
    const poster = await bucket.uploadToSignedUrl(
      ticket.posterPath,
      ticket.posterToken,
      prepared.poster,
      { contentType: 'image/jpeg', upsert: false },
    )
    if (poster.error) {
      await discardPlaceMediaUpload(placeId, [ticket.objectPath, ticket.posterPath])
      return poster.error.message
    }
  }

  if (ticket.thumbPath && ticket.thumbToken && prepared.thumb) {
    const thumb = await bucket.uploadToSignedUrl(
      ticket.thumbPath,
      ticket.thumbToken,
      prepared.thumb,
      { contentType: 'image/jpeg', upsert: false },
    )
    if (thumb.error) {
      await discardPlaceMediaUpload(placeId, [
        ticket.objectPath,
        ticket.posterPath,
        ticket.thumbPath,
      ].filter((path): path is string => Boolean(path)))
      return thumb.error.message
    }
  }

  const committed = await commitPlaceMediaUpload({
    placeId,
    objectPath: ticket.objectPath,
    posterPath: ticket.posterPath,
    thumbPath: ticket.thumbPath,
  })
  if ('error' in committed) return committed.error
  applySnapshot(committed)
  return null
}
