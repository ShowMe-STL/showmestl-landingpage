'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'
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
import { CategoryPicker } from '@/components/category-picker'
import { createPlace, updatePlace, type PlaceInput } from '@/lib/actions/places'
import type { Place } from './places-manager'

const NONE = '__none__'

export function PlaceDialog({
  open,
  onOpenChange,
  place,
  neighborhoods,
  categories,
  dressCodes,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  place: Place | null
  neighborhoods: { id: number; name: string }[]
  categories: { id: number; name: string }[]
  dressCodes: { id: number; name: string }[]
  onSaved: () => void
}) {
  const [form, setForm] = useState(() => toFormState(place))
  const [isPending, startTransition] = useTransition()

  // Reset local state whenever a different place (or "new") is opened.
  const key = place?.id ?? 'new'
  const [lastKey, setLastKey] = useState(key)
  if (lastKey !== key) {
    setLastKey(key)
    setForm(toFormState(place))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const input: PlaceInput = {
        name: form.name,
        description: form.description || null,
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
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      }

      const result = place
        ? await updatePlace(place.id, input)
        : await createPlace(input)

      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }

      toast.success(place ? 'Place updated.' : 'Place added.')
      onOpenChange(false)
      onSaved()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{place ? 'Edit place' : 'Add place'}</DialogTitle>
            <DialogDescription>
              Changes are live in the app immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, latitude: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, longitude: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <CategoryPicker
                categories={categories}
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
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function toFormState(place: Place | null) {
  return {
    name: place?.name ?? '',
    description: place?.description ?? '',
    address: place?.address ?? '',
    website: place?.website ?? '',
    image_url: place?.image_url ?? '',
    image_thumb_url: place?.image_thumb_url ?? '',
    neighborhood_id: place?.neighborhood_id
      ? String(place.neighborhood_id)
      : '',
    category_ids: place?.category_ids ?? [],
    dress_code_id: place?.dress_code_id ? String(place.dress_code_id) : '',
    custom_dress_code: place?.custom_dress_code ?? '',
    latitude: place?.latitude ? String(place.latitude) : '',
    longitude: place?.longitude ? String(place.longitude) : '',
  }
}
