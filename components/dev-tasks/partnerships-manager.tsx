'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { Plus, Pencil, Send, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import {
  createPartnership,
  updatePartnership,
  deletePartnership,
  addPartnershipMessage,
  type PartnershipInput,
  type PartnershipStage,
} from '@/lib/actions/dev-tasks'

export type PartnershipMessage = {
  id: number
  partnership_id: number
  message: string
  sent_at: string
}

export type PartnershipRow = {
  id: number
  name: string
  contact_info: string | null
  stage: string
  notes: string | null
  created_at: string
  updated_at: string
  messages: PartnershipMessage[]
}

const STAGE_META: Record<
  PartnershipStage,
  { label: string; variant: 'outline' | 'default' | 'secondary' | 'destructive' }
> = {
  researching: { label: 'Researching', variant: 'outline' },
  contacted: { label: 'Contacted', variant: 'secondary' },
  in_talks: { label: 'In talks', variant: 'default' },
  partnered: { label: 'Partnered', variant: 'default' },
  declined: { label: 'Declined', variant: 'destructive' },
}

const STAGES = Object.keys(STAGE_META) as PartnershipStage[]

const emptyForm: PartnershipInput = {
  name: '',
  contact_info: '',
  stage: 'researching',
  notes: '',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PartnershipsManager({
  initialPartnerships,
}: {
  initialPartnerships: PartnershipRow[]
}) {
  const [partnerships, setPartnerships] = useState(initialPartnerships)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PartnershipRow | null>(null)
  const [form, setForm] = useState<PartnershipInput>(emptyForm)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [messageDraft, setMessageDraft] = useState('')
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(p: PartnershipRow) {
    setEditing(p)
    setForm({
      name: p.name,
      contact_info: p.contact_info,
      stage: p.stage as PartnershipStage,
      notes: p.notes,
    })
    setDialogOpen(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = editing
        ? await updatePartnership(editing.id, form)
        : await createPartnership(form)

      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }

      if (editing) {
        setPartnerships((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p)),
        )
      } else {
        setPartnerships((prev) => [
          {
            id: -Date.now(),
            ...form,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            messages: [],
          },
          ...prev,
        ])
      }

      toast.success(editing ? 'Partner updated.' : 'Partner added.')
      setDialogOpen(false)
    })
  }

  async function handleDelete(id: number) {
    const result = await deletePartnership(id)
    if (result && 'error' in result && result.error) return result
    setPartnerships((prev) => prev.filter((p) => p.id !== id))
  }

  function handleLogMessage(partnershipId: number) {
    const message = messageDraft.trim()
    if (!message) return
    startTransition(async () => {
      const result = await addPartnershipMessage(partnershipId, message)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }
      setPartnerships((prev) =>
        prev.map((p) =>
          p.id === partnershipId
            ? {
                ...p,
                messages: [
                  {
                    id: -Date.now(),
                    partnership_id: partnershipId,
                    message,
                    sent_at: new Date().toISOString(),
                  },
                  ...p.messages,
                ],
              }
            : p,
        ),
      )
      setMessageDraft('')
      toast.success('Logged.')
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openCreate} className="gap-2" />}>
            <Plus className="h-4 w-4" />
            Add partner
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Edit partner' : 'Add partner'}
                </DialogTitle>
                <DialogDescription>
                  Someone we&rsquo;re reaching out to or partnering with.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Name</Label>
                  <Input
                    id="partner-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-contact">Contact info</Label>
                  <Input
                    id="partner-contact"
                    placeholder="Email, phone, or handle"
                    value={form.contact_info ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contact_info: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-stage">Stage</Label>
                  <Select
                    value={form.stage}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, stage: v as PartnershipStage }))
                    }
                  >
                    <SelectTrigger id="partner-stage" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {STAGE_META[stage].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-notes">Notes</Label>
                  <Textarea
                    id="partner-notes"
                    value={form.notes ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? 'Saving…'
                    : editing
                      ? 'Save changes'
                      : 'Add partner'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {partnerships.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No partners tracked yet.
        </p>
      ) : (
        <div className="space-y-3">
          {partnerships.map((p) => {
            const isOpen = expanded === p.id
            const lastMessage = p.messages[0]
            return (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{p.name}</p>
                        <Badge variant={STAGE_META[p.stage as PartnershipStage].variant}>
                          {STAGE_META[p.stage as PartnershipStage].label}
                        </Badge>
                      </div>
                      {p.contact_info ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {p.contact_info}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <ConfirmDeleteButton
                        title="Delete this partner?"
                        description={`"${p.name}" and its message history will be permanently removed.`}
                        action={() => handleDelete(p.id)}
                      />
                    </div>
                  </div>

                  {p.notes ? (
                    <p className="text-sm text-muted-foreground">{p.notes}</p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                    className="flex items-center gap-1.5 text-left text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                    {lastMessage
                      ? `Last outreach: ${formatDate(lastMessage.sent_at)}`
                      : 'No outreach logged yet'}
                    {' · '}
                    {p.messages.length} message{p.messages.length === 1 ? '' : 's'}
                  </button>

                  {isOpen ? (
                    <div className="space-y-3 border-t pt-3">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Textarea
                          value={messageDraft}
                          onChange={(e) => setMessageDraft(e.target.value)}
                          placeholder="What did we send them?"
                          className="min-h-9 flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1.5 sm:self-start"
                          disabled={isPending || !messageDraft.trim()}
                          onClick={() => handleLogMessage(p.id)}
                        >
                          <Send className="h-3.5 w-3.5" />
                          Log
                        </Button>
                      </div>
                      {p.messages.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Nothing logged yet.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {p.messages.map((m) => (
                            <li key={m.id} className="text-sm">
                              <span className="text-muted-foreground">
                                {formatDate(m.sent_at)} —{' '}
                              </span>
                              {m.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
