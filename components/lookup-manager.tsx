'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { Plus, Pencil } from 'lucide-react'
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
import {
  createLookupEntry,
  updateLookupEntry,
  deleteLookupEntry,
  type LookupTable,
} from '@/lib/actions/lookups'

type LookupRow = {
  id: number
  name: string
  sort_order?: number
}

export function LookupManager({
  table,
  initialRows,
  hasSortOrder = true,
  itemLabel,
}: {
  table: LookupTable
  initialRows: LookupRow[]
  hasSortOrder?: boolean
  itemLabel: string
}) {
  const [rows, setRows] = useState(initialRows)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LookupRow | null>(null)
  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setName('')
    setSortOrder('0')
    setDialogOpen(true)
  }

  function openEdit(row: LookupRow) {
    setEditing(row)
    setName(row.name)
    setSortOrder(String(row.sort_order ?? 0))
    setDialogOpen(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const values = {
        name,
        sort_order: hasSortOrder ? Number(sortOrder) || 0 : undefined,
      }

      const result = editing
        ? await updateLookupEntry(table, editing.id, values)
        : await createLookupEntry(table, values)

      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }

      if (editing) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === editing.id ? { ...r, ...values, name } : r,
          ),
        )
      } else {
        // Optimistic id fallback; a page revalidation will reconcile the real id.
        setRows((prev) => [
          ...prev,
          { id: -Date.now(), name, sort_order: values.sort_order },
        ])
      }

      toast.success(editing ? `${itemLabel} updated.` : `${itemLabel} added.`)
      setDialogOpen(false)
    })
  }

  const columns: Column<LookupRow>[] = [
    { key: 'name', header: 'Name', render: (r) => r.name },
    ...(hasSortOrder
      ? [
          {
            key: 'sort_order',
            header: 'Sort order',
            render: (r: LookupRow) => r.sort_order ?? 0,
            className: 'w-32',
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button onClick={openCreate} className="gap-2" />}
          >
            <Plus className="h-4 w-4" />
            Add {itemLabel.toLowerCase()}
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editing
                    ? `Edit ${itemLabel.toLowerCase()}`
                    : `Add ${itemLabel.toLowerCase()}`}
                </DialogTitle>
                <DialogDescription>
                  {editing
                    ? `Update this ${itemLabel.toLowerCase()}.`
                    : `Create a new ${itemLabel.toLowerCase()}.`}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                {hasSortOrder ? (
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        emptyMessage={`No ${itemLabel.toLowerCase()}s yet.`}
        rowActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <ConfirmDeleteButton
              title={`Delete ${row.name}?`}
              description="This can't be undone. Places or events using it will keep their existing reference removed."
              action={async () => {
                const result = await deleteLookupEntry(table, row.id)
                if (!result?.error) {
                  setRows((prev) => prev.filter((r) => r.id !== row.id))
                }
                return result
              }}
            />
          </div>
        )}
      />
    </div>
  )
}
