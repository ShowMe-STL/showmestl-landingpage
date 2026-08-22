'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { MultiSelectPicker } from '@/components/multi-select-picker'
import {
  createPlaylist,
  updatePlaylist,
  type PlaylistInput,
} from '@/lib/actions/playlists'
import type { Playlist } from './playlists-manager'

export function PlaylistDialog({
  open,
  onOpenChange,
  playlist,
  places,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist: Playlist | null
  places: { id: number; name: string }[]
  onSaved: () => void
}) {
  const [form, setForm] = useState(() => toFormState(playlist))
  const [isPending, startTransition] = useTransition()

  const key = playlist?.id ?? 'new'
  const [lastKey, setLastKey] = useState(key)
  if (lastKey !== key) {
    setLastKey(key)
    setForm(toFormState(playlist))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const input: PlaylistInput = {
        name: form.name,
        description: form.description || null,
        image_url: form.image_url || null,
        privacy: form.privacy as 'public' | 'private',
        featured: form.featured,
        place_ids: form.place_ids,
      }

      const result = playlist
        ? await updatePlaylist(playlist.id, input)
        : await createPlaylist(input)

      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }

      toast.success(playlist ? 'Playlist updated.' : 'Playlist added.')
      onOpenChange(false)
      onSaved()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {playlist ? 'Edit playlist' : 'Add playlist'}
            </DialogTitle>
            <DialogDescription>
              Official ShowMe STL curation. Changes are live in the app
              immediately.
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

            <div className="space-y-2">
              <Label htmlFor="image_url">Cover image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={form.image_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_url: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy</Label>
                <Select
                  value={form.privacy}
                  onValueChange={(v) =>
                    v && setForm((f) => ({ ...f, privacy: v }))
                  }
                >
                  <SelectTrigger id="privacy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border border-input px-3">
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured
                </Label>
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, featured: v }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Places</Label>
              <MultiSelectPicker
                items={places}
                placeholder="Filter places…"
                emptyLabel="No matches."
                helperText={(count) =>
                  `${count} places — in the order checked.`
                }
                selected={form.place_ids}
                onChange={(ids) => setForm((f) => ({ ...f, place_ids: ids }))}
              />
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

function toFormState(playlist: Playlist | null) {
  return {
    name: playlist?.name ?? '',
    description: playlist?.description ?? '',
    image_url: playlist?.image_url ?? '',
    privacy: playlist?.privacy ?? 'public',
    featured: playlist?.featured ?? false,
    place_ids: playlist?.place_ids ?? [],
  }
}
