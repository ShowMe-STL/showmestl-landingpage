'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/data-table'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { TrendingSwitch } from '@/components/trending-switch'
import { deletePlaylist } from '@/lib/actions/playlists'
import { PlaylistDialog } from './playlist-dialog'

export type Playlist = {
  id: number
  name: string
  description: string | null
  image_url: string | null
  privacy: 'public' | 'private'
  featured: boolean
  isOfficial: boolean
  created_at: string
  place_ids: number[]
  trending: boolean
}

export function PlaylistsManager({
  initialPlaylists,
  places,
}: {
  initialPlaylists: Playlist[]
  places: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Playlist | null>(null)

  const filtered = initialPlaylists.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(playlist: Playlist) {
    setEditing(playlist)
    setDialogOpen(true)
  }

  const columns: Column<Playlist>[] = [
    {
      key: 'image',
      header: '',
      className: 'w-14',
      render: (p) =>
        p.image_url ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
            <Image
              src={p.image_url}
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
            {p.isOfficial ? 'ShowMe STL official' : 'User playlist'} ·{' '}
            {p.place_ids.length} places
          </p>
        </div>
      ),
    },
    {
      key: 'privacy',
      header: 'Privacy',
      render: (p) => (
        <Badge variant={p.privacy === 'public' ? 'outline' : 'secondary'}>
          {p.privacy}
        </Badge>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      render: (p) =>
        p.featured ? <Badge variant="secondary">Featured</Badge> : null,
    },
    {
      key: 'trending',
      header: 'Trending',
      className: 'w-20',
      render: (p) => (
        <TrendingSwitch
          targetType="playlist"
          targetId={p.id}
          initialEnabled={p.trending}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search playlists…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add playlist
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(row) => row.id}
        emptyMessage="No playlists match your search."
        rowActions={(playlist) => (
          <div className="flex justify-end gap-1">
            {playlist.isOfficial ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(playlist)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
            <ConfirmDeleteButton
              title={`Delete ${playlist.name}?`}
              description={
                playlist.isOfficial
                  ? "This removes the playlist from the app immediately. This can't be undone."
                  : "This deletes a user's playlist. Only do this for moderation reasons — this can't be undone."
              }
              action={async () => {
                const result = await deletePlaylist(playlist.id)
                if (!result?.error) router.refresh()
                return result
              }}
            />
          </div>
        )}
      />

      <PlaylistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        playlist={editing}
        places={places}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}
