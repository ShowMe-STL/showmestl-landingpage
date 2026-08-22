'use client'

import { useMemo, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { DataTable, type Column } from '@/components/data-table'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import {
  updateProfile,
  deleteUser,
  type ProfileInput,
} from '@/lib/actions/users'

type UserRow = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  instagram_handle: string | null
  neighborhood_id: number | null
  privacy_state: 'public' | 'private'
  created_at: string
  email: string | null
  is_moderator: boolean
}

const NONE = '__none__'

export function UsersManager({
  initialUsers,
  neighborhoods,
}: {
  initialUsers: UserRow[]
  neighborhoods: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<UserRow | null>(null)

  const neighborhoodName = useMemo(() => {
    const map = new Map(neighborhoods.map((n) => [n.id, n.name]))
    return (id: number | null) => (id ? (map.get(id) ?? '—') : '—')
  }, [neighborhoods])

  const filtered = initialUsers.filter((u) => {
    const q = query.toLowerCase()
    return (
      u.username.toLowerCase().includes(q) ||
      (u.display_name ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q)
    )
  })

  const columns: Column<UserRow>[] = [
    {
      key: 'avatar',
      header: '',
      className: 'w-12',
      render: (u) =>
        u.avatar_url ? (
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
            <Image
              src={u.avatar_url}
              alt=""
              fill
              sizes="36px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full bg-muted" />
        ),
    },
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div>
          <p className="font-medium">
            {u.display_name || u.username}{' '}
            {u.is_moderator ? (
              <Badge
                variant="secondary"
                className="ml-1 align-middle font-normal"
              >
                Moderator
              </Badge>
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground">
            @{u.username} {u.email ? `· ${u.email}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'neighborhood',
      header: 'Neighborhood',
      render: (u) => neighborhoodName(u.neighborhood_id),
    },
    {
      key: 'privacy',
      header: 'Privacy',
      render: (u) => (
        <Badge variant={u.privacy_state === 'public' ? 'outline' : 'secondary'}>
          {u.privacy_state}
        </Badge>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (u) =>
        new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
          new Date(u.created_at),
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name, username, or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs"
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(row) => row.id}
        emptyMessage="No users match your search."
        rowActions={(user) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(user)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <ConfirmDeleteButton
              title={`Delete @${user.username}?`}
              description="This permanently deletes their account and everything tied to it: profile, check-ins, playlists, and social graph. This can't be undone."
              action={async () => {
                const result = await deleteUser(user.id)
                if (!result?.error) router.refresh()
                return result
              }}
            />
          </div>
        )}
      />

      <EditUserDialog
        user={editing}
        neighborhoods={neighborhoods}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}

function EditUserDialog({
  user,
  neighborhoods,
  onOpenChange,
  onSaved,
}: {
  user: UserRow | null
  neighborhoods: { id: number; name: string }[]
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [form, setForm] = useState(() => toFormState(user))
  const [isPending, startTransition] = useTransition()

  const key = user?.id ?? 'none'
  const [lastKey, setLastKey] = useState(key)
  if (lastKey !== key) {
    setLastKey(key)
    setForm(toFormState(user))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    startTransition(async () => {
      const input: ProfileInput = {
        username: form.username,
        display_name: form.display_name || null,
        bio: form.bio || null,
        instagram_handle: form.instagram_handle || null,
        neighborhood_id: form.neighborhood_id
          ? Number(form.neighborhood_id)
          : null,
        privacy_state: form.privacy_state as 'public' | 'private',
      }

      const result = await updateProfile(user.id, input)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Profile updated.')
      onOpenChange(false)
      onSaved()
    })
  }

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>@{user?.username}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  required
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input
                  id="display_name"
                  value={form.display_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, display_name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram_handle">Instagram</Label>
                <Input
                  id="instagram_handle"
                  value={form.instagram_handle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instagram_handle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood_id">Neighborhood</Label>
                <Select
                  value={form.neighborhood_id || NONE}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      neighborhood_id: v === NONE || v === null ? '' : v,
                    }))
                  }
                >
                  <SelectTrigger id="neighborhood_id">
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
            <div className="space-y-2">
              <Label htmlFor="privacy_state">Privacy</Label>
              <Select
                value={form.privacy_state}
                onValueChange={(v) =>
                  v &&
                  setForm((f) => ({
                    ...f,
                    privacy_state: v as 'public' | 'private',
                  }))
                }
              >
                <SelectTrigger id="privacy_state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
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

function toFormState(user: UserRow | null) {
  return {
    username: user?.username ?? '',
    display_name: user?.display_name ?? '',
    bio: user?.bio ?? '',
    instagram_handle: user?.instagram_handle ?? '',
    neighborhood_id: user?.neighborhood_id ? String(user.neighborhood_id) : '',
    privacy_state: user?.privacy_state ?? 'public',
  }
}
