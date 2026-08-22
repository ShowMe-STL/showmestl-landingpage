'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DataTable, type Column } from '@/components/data-table'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import { addModeratorByEmail, removeModerator } from '@/lib/actions/moderators'

type ModeratorRow = {
  user_id: string
  created_at: string
  email: string | null
}

export function ModeratorsManager({
  initialModerators,
}: {
  initialModerators: ModeratorRow[]
}) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await addModeratorByEmail(email)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Moderator added.')
      setEmail('')
      setDialogOpen(false)
      router.refresh()
    })
  }

  const columns: Column<ModeratorRow>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (m) => m.email ?? m.user_id,
    },
    {
      key: 'since',
      header: 'Moderator since',
      render: (m) =>
        new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
          new Date(m.created_at),
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="h-4 w-4" />
            Add moderator
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add moderator</DialogTitle>
                <DialogDescription>
                  Grants admin dashboard access to an existing ShowMeSTL account
                  by email.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-2">
                  <Label htmlFor="mod-email">Email</Label>
                  <Input
                    id="mod-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Adding…' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        rows={initialModerators}
        getRowId={(row) => row.user_id}
        emptyMessage="No moderators yet."
        rowActions={(m) => (
          <ConfirmDeleteButton
            title={`Remove ${m.email ?? 'this moderator'}?`}
            description="They'll immediately lose access to this admin dashboard. Their ShowMeSTL app account is unaffected."
            action={async () => {
              const result = await removeModerator(m.user_id)
              if (!result?.error) router.refresh()
              return result
            }}
          />
        )}
      />
    </div>
  )
}
