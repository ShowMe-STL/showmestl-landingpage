'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/data-table'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deleteEvent } from '@/lib/actions/events'
import { EventDialog } from './event-dialog'

export type EventRow = {
  id: number
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  place_id: number | null
  venue_name: string | null
  address: string | null
  website: string | null
  image_url: string | null
  image_thumb_url: string | null
  neighborhood_id: number | null
  dress_code_id: number | null
  custom_dress_code: string | null
  recurrence_rule: string | null
  recurrence_timezone: string | null
  category_ids: number[]
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function EventsManager({
  initialEvents,
  neighborhoods,
  categories,
  dressCodes,
  places,
}: {
  initialEvents: EventRow[]
  neighborhoods: { id: number; name: string }[]
  categories: { id: number; name: string }[]
  dressCodes: { id: number; name: string }[]
  places: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EventRow | null>(null)

  const categoryNames = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]))
    return (ids: number[]) =>
      ids.map((id) => map.get(id)).filter(Boolean) as string[]
  }, [categories])

  const placeName = useMemo(() => {
    const map = new Map(places.map((p) => [p.id, p.name]))
    return (id: number | null) => (id ? map.get(id) : undefined)
  }, [places])

  const filtered = initialEvents.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase()),
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(event: EventRow) {
    setEditing(event)
    setDialogOpen(true)
  }

  const columns: Column<EventRow>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (e) => (
        <div>
          <p className="font-medium">{e.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {placeName(e.place_id) ?? e.venue_name ?? 'No venue'}
          </p>
        </div>
      ),
    },
    {
      key: 'start_time',
      header: 'Starts',
      render: (e) => dateFormatter.format(new Date(e.start_time)),
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (e) => (
        <div className="flex max-w-56 flex-wrap gap-1">
          {categoryNames(e.category_ids)
            .slice(0, 2)
            .map((name) => (
              <Badge key={name} variant="secondary" className="font-normal">
                {name}
              </Badge>
            ))}
          {e.category_ids.length > 2 ? (
            <Badge variant="outline" className="font-normal">
              +{e.category_ids.length - 2}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: 'website',
      header: '',
      className: 'w-10',
      render: (e) =>
        e.website ? (
          <a
            href={e.website}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search events…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add event
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(row) => row.id}
        emptyMessage="No events match your search."
        rowActions={(event) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <ConfirmDeleteButton
              title={`Delete ${event.title}?`}
              description="This removes the event from the app immediately. This can't be undone."
              action={async () => {
                const result = await deleteEvent(event.id)
                if (!result?.error) router.refresh()
                return result
              }}
            />
          </div>
        )}
      />

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editing}
        neighborhoods={neighborhoods}
        categories={categories}
        dressCodes={dressCodes}
        places={places}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}
