'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Pencil, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet'
import { quickUpdateEvent } from '@/lib/actions/events'
import type { EventRow } from './events-manager'

export function QuickEditPopover({
  event,
  onSaved,
}: {
  event: EventRow
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    website: event.website ?? '',
    image_url: event.image_url ?? '',
    image_thumb_url: event.image_thumb_url ?? '',
  })

  function handleSave() {
    startTransition(async () => {
      const result = await quickUpdateEvent(event.id, {
        website: form.website || null,
        image_url: form.image_url || null,
        image_thumb_url: form.image_thumb_url || null,
      })

      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Event updated')
      setOpen(false)
      onSaved()
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs" />
        }
      >
        <Pencil className="h-3 w-3" />
        Quick Edit
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle className="truncate pr-6">{event.title}</SheetTitle>
          <SheetDescription>
            Quickly edit media and website fields.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="quick-website" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              Website
            </Label>
            <Input
              id="quick-website"
              type="url"
              placeholder="https://"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            />
            {form.website && (
              <a
                href={form.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Open link <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-image-url" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Image URL
            </Label>
            <Input
              id="quick-image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
            />
            {form.image_url && (
              <div className="mt-2 overflow-hidden rounded-md border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-thumb-url" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Thumbnail URL
            </Label>
            <Input
              id="quick-thumb-url"
              type="url"
              placeholder="https://example.com/thumb.jpg"
              value={form.image_thumb_url}
              onChange={(e) => setForm((f) => ({ ...f, image_thumb_url: e.target.value }))}
            />
            {form.image_thumb_url && (
              <div className="mt-2 flex justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_thumb_url}
                  alt="Thumbnail preview"
                  className="h-16 w-16 rounded-md border border-white/10 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
