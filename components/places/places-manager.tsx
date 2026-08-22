'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Pencil, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/data-table'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { deletePlace } from '@/lib/actions/places'
import { PlaceDialog } from './place-dialog'

export type Place = {
  id: number
  name: string
  description: string | null
  address: string | null
  website: string | null
  image_url: string | null
  image_thumb_url: string | null
  neighborhood_id: number | null
  dress_code_id: number | null
  custom_dress_code: string | null
  latitude: number | null
  longitude: number | null
  category_ids: number[]
}

export function PlacesManager({
  initialPlaces,
  neighborhoods,
  categories,
  dressCodes,
}: {
  initialPlaces: Place[]
  neighborhoods: { id: number; name: string }[]
  categories: { id: number; name: string }[]
  dressCodes: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Place | null>(null)

  const neighborhoodName = useMemo(() => {
    const map = new Map(neighborhoods.map((n) => [n.id, n.name]))
    return (id: number | null) => (id ? (map.get(id) ?? '—') : '—')
  }, [neighborhoods])

  const categoryNames = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]))
    return (ids: number[]) =>
      ids.map((id) => map.get(id)).filter(Boolean) as string[]
  }, [categories])

  const filtered = initialPlaces.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(place: Place) {
    setEditing(place)
    setDialogOpen(true)
  }

  const columns: Column<Place>[] = [
    {
      key: 'image',
      header: '',
      className: 'w-14',
      render: (p) =>
        p.image_thumb_url || p.image_url ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
            <Image
              src={(p.image_thumb_url || p.image_url) as string}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted" />
        ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (p) => (
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {p.address ?? 'No address'}
          </p>
        </div>
      ),
    },
    {
      key: 'neighborhood',
      header: 'Neighborhood',
      render: (p) => neighborhoodName(p.neighborhood_id),
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (p) => (
        <div className="flex max-w-56 flex-wrap gap-1">
          {categoryNames(p.category_ids)
            .slice(0, 3)
            .map((name) => (
              <Badge key={name} variant="secondary" className="font-normal">
                {name}
              </Badge>
            ))}
          {p.category_ids.length > 3 ? (
            <Badge variant="outline" className="font-normal">
              +{p.category_ids.length - 3}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: 'website',
      header: '',
      className: 'w-10',
      render: (p) =>
        p.website ? (
          <a
            href={p.website}
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
          placeholder="Search places…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add place
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(row) => row.id}
        emptyMessage="No places match your search."
        rowActions={(place) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(place)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <ConfirmDeleteButton
              title={`Delete ${place.name}?`}
              description="This removes the place from the app immediately, including its saved-place and check-in references. This can't be undone."
              action={async () => {
                const result = await deletePlace(place.id)
                if (!result?.error) router.refresh()
                return result
              }}
            />
          </div>
        )}
      />

      <PlaceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        place={editing}
        neighborhoods={neighborhoods}
        categories={categories}
        dressCodes={dressCodes}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}
