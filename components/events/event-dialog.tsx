'use client'

import { useState, useTransition, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'
import { ImageOff, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MultiSelectPicker } from '@/components/multi-select-picker'
import {
  createEvent,
  updateEvent,
  checkEventDuplicates,
  type EventInput,
  type DuplicateMatch,
} from '@/lib/actions/events'
import type { EventRow } from './events-manager'

const NONE = '__none__'

type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error'

function useImagePreview(url: string) {
  const [state, setState] = useState<{
    status: ImageLoadState
    debouncedUrl: string
    currentUrl: string
  }>({ status: 'idle', debouncedUrl: '', currentUrl: '' })

  useEffect(() => {
    const trimmed = url.trim()
    if (!trimmed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state when URL is cleared
      setState({ status: 'idle', debouncedUrl: '', currentUrl: '' })
      return
    }

    setState((prev) => ({
      ...prev,
      status: 'loading',
      currentUrl: trimmed,
    }))

    const timeout = setTimeout(() => {
      const img = new window.Image()
      img.onload = () =>
        setState((prev) =>
          prev.currentUrl === trimmed
            ? { ...prev, status: 'loaded', debouncedUrl: trimmed }
            : prev,
        )
      img.onerror = () =>
        setState((prev) =>
          prev.currentUrl === trimmed
            ? { ...prev, status: 'error', debouncedUrl: trimmed }
            : prev,
        )
      img.src = trimmed
    }, 400)

    return () => clearTimeout(timeout)
  }, [url])

  return state
}

function ImageUrlPreview({
  url,
  label,
}: {
  url: string
  label: string
}) {
  const { status, debouncedUrl } = useImagePreview(url)

  if (!url.trim()) return null

  return (
    <div className="mt-2">
      {status === 'loading' && (
        <div className="flex h-20 w-32 items-center justify-center rounded-md border border-white/10 bg-black/20">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        </div>
      )}
      {status === 'loaded' && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={debouncedUrl}
            alt={`${label} preview`}
            className="h-20 w-auto max-w-[200px] rounded-md border border-white/10 object-cover"
          />
          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white/80">
            {label}
          </span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex h-20 w-32 flex-col items-center justify-center gap-1 rounded-md border border-red-500/30 bg-red-500/10">
          <ImageOff className="h-5 w-5 text-red-400" />
          <span className="text-[10px] text-red-400">Failed to load</span>
        </div>
      )}
    </div>
  )
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(local: string) {
  if (!local) return ''
  return new Date(local).toISOString()
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  neighborhoods,
  categories,
  dressCodes,
  places,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventRow | null
  neighborhoods: { id: number; name: string }[]
  categories: { id: number; name: string }[]
  dressCodes: { id: number; name: string }[]
  places: { id: number; name: string }[]
  onSaved: () => void
}) {
  const [form, setForm] = useState(() => toFormState(event))
  const [isPending, startTransition] = useTransition()
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [skipDuplicateCheck, setSkipDuplicateCheck] = useState(false)

  const key = event?.id ?? 'new'
  const [lastKey, setLastKey] = useState(key)
  if (lastKey !== key) {
    setLastKey(key)
    setForm(toFormState(event))
    setDuplicates([])
    setShowDuplicateWarning(false)
    setSkipDuplicateCheck(false)
  }

  const placeNameLookup = (id: string) => {
    const p = places.find((pl) => String(pl.id) === id)
    return p?.name ?? null
  }

  async function performSave() {
    const input: EventInput = {
      title: form.title,
      description: form.description || null,
      start_time: fromDatetimeLocal(form.start_time),
      end_time: form.end_time ? fromDatetimeLocal(form.end_time) : null,
      place_id: form.place_id ? Number(form.place_id) : null,
      venue_name: form.venue_name || null,
      address: form.address || null,
      website: form.website || null,
      image_url: form.image_url || null,
      image_thumb_url: form.image_thumb_url || null,
      neighborhood_id: form.neighborhood_id
        ? Number(form.neighborhood_id)
        : null,
      category_ids: form.category_ids,
      dress_code_id: form.dress_code_id ? Number(form.dress_code_id) : null,
      custom_dress_code: form.dress_code_id
        ? null
        : form.custom_dress_code || null,
      recurrence_rule: form.recurrence_rule || null,
      recurrence_timezone: form.recurrence_timezone || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    }

    const result = event
      ? await updateEvent(event.id, input)
      : await createEvent(input)

    if (result && 'error' in result && result.error) {
      toast.error(result.error)
      return
    }

    toast.success(event ? 'Event updated.' : 'Event added.')
    onOpenChange(false)
    onSaved()
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      if (skipDuplicateCheck) {
        await performSave()
        return
      }

      const { duplicates: found } = await checkEventDuplicates({
        title: form.title,
        start_time: fromDatetimeLocal(form.start_time),
        place_id: form.place_id ? Number(form.place_id) : null,
        venue_name: form.venue_name || null,
        excludeId: event?.id,
      })

      if (found.length > 0) {
        setDuplicates(found)
        setShowDuplicateWarning(true)
        return
      }

      await performSave()
    })
  }

  function handleProceedAnyway() {
    setShowDuplicateWarning(false)
    setSkipDuplicateCheck(true)
    startTransition(async () => {
      await performSave()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{event ? 'Edit event' : 'Add event'}</DialogTitle>
            <DialogDescription>
              Changes are live in the app immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Starts</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  required
                  value={form.start_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start_time: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Ends</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_time: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_id">Linked place</Label>
              <Select
                value={form.place_id || NONE}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    place_id: v === NONE || v === null ? '' : v,
                  }))
                }
              >
                <SelectTrigger id="place_id">
                  <SelectValue placeholder="None — standalone venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None — standalone venue</SelectItem>
                  {places.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue name</Label>
                <Input
                  id="venue_name"
                  placeholder="Only if not using a linked place"
                  value={form.venue_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, venue_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Select
                value={form.neighborhood_id || NONE}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    neighborhood_id: v === NONE || v === null ? '' : v,
                  }))
                }
              >
                <SelectTrigger id="neighborhood">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n.id} value={String(n.id)}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">
                  Latitude{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder={event ? 'Leave blank to keep current' : ''}
                  value={form.latitude}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, latitude: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">
                  Longitude{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder={event ? 'Leave blank to keep current' : ''}
                  value={form.longitude}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, longitude: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <MultiSelectPicker
                items={categories}
                placeholder="Filter categories…"
                emptyLabel="No matches."
                helperText={(count) =>
                  `${count} selected — first checked is the primary category.`
                }
                selected={form.category_ids}
                onChange={(ids) =>
                  setForm((f) => ({ ...f, category_ids: ids }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dress_code">Dress code</Label>
                <Select
                  value={form.dress_code_id || NONE}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      dress_code_id: v === NONE || v === null ? '' : v,
                    }))
                  }
                >
                  <SelectTrigger id="dress_code">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None / custom</SelectItem>
                    {dressCodes.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!form.dress_code_id ? (
                <div className="space-y-2">
                  <Label htmlFor="custom_dress_code">Custom dress code</Label>
                  <Input
                    id="custom_dress_code"
                    value={form.custom_dress_code}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        custom_dress_code: e.target.value,
                      }))
                    }
                  />
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurrence_rule">
                  Recurrence rule{' '}
                  <span className="text-muted-foreground">(RRULE)</span>
                </Label>
                <Input
                  id="recurrence_rule"
                  placeholder="e.g. FREQ=WEEKLY;BYDAY=FR"
                  value={form.recurrence_rule}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, recurrence_rule: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurrence_timezone">Recurrence timezone</Label>
                <Input
                  id="recurrence_timezone"
                  placeholder="America/Chicago"
                  value={form.recurrence_timezone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      recurrence_timezone: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://"
                value={form.website}
                onChange={(e) =>
                  setForm((f) => ({ ...f, website: e.target.value }))
                }
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={form.image_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image_url: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_thumb_url">Thumbnail URL</Label>
                  <Input
                    id="image_thumb_url"
                    type="url"
                    value={form.image_thumb_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image_thumb_url: e.target.value }))
                    }
                  />
                </div>
              </div>
              {(form.image_url || form.image_thumb_url) && (
                <div className="flex flex-wrap gap-4">
                  {form.image_url && (
                    <ImageUrlPreview url={form.image_url} label="Full" />
                  )}
                  {form.image_thumb_url && (
                    <ImageUrlPreview url={form.image_thumb_url} label="Thumb" />
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <AlertDialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </AlertDialogMedia>
            <AlertDialogTitle>Possible duplicate event</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="mb-3 block">
                An event with a similar title on the same day at the same venue already exists:
              </span>
              <ul className="space-y-2 text-left">
                {duplicates.map((d) => (
                  <li
                    key={d.id}
                    className="rounded border border-white/10 bg-white/5 p-2 text-xs"
                  >
                    <strong className="text-foreground">{d.title}</strong>
                    <br />
                    <span className="text-muted-foreground">
                      {new Date(d.start_time).toLocaleDateString('en-US', {
                        dateStyle: 'medium',
                      })}
                      {' at '}
                      {d.place_id
                        ? placeNameLookup(String(d.place_id)) ?? 'Unknown place'
                        : d.venue_name ?? 'Unknown venue'}
                    </span>
                    {d.website && (
                      <>
                        <br />
                        <a
                          href={d.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {d.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProceedAnyway}
              disabled={isPending}
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              {isPending ? 'Saving…' : 'Save anyway'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

function toFormState(event: EventRow | null) {
  return {
    title: event?.title ?? '',
    description: event?.description ?? '',
    start_time: toDatetimeLocal(event?.start_time ?? null),
    end_time: toDatetimeLocal(event?.end_time ?? null),
    place_id: event?.place_id ? String(event.place_id) : '',
    venue_name: event?.venue_name ?? '',
    address: event?.address ?? '',
    website: event?.website ?? '',
    image_url: event?.image_url ?? '',
    image_thumb_url: event?.image_thumb_url ?? '',
    neighborhood_id: event?.neighborhood_id
      ? String(event.neighborhood_id)
      : '',
    category_ids: event?.category_ids ?? [],
    dress_code_id: event?.dress_code_id ? String(event.dress_code_id) : '',
    custom_dress_code: event?.custom_dress_code ?? '',
    recurrence_rule: event?.recurrence_rule ?? '',
    recurrence_timezone: event?.recurrence_timezone ?? '',
    latitude: '',
    longitude: '',
  }
}
