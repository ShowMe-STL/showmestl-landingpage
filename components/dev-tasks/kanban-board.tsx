'use client'

import { useRef, useState, useTransition, type FormEvent } from 'react'
import Image from 'next/image'
import { Plus, Pencil, ImagePlus, Repeat, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ConfirmDeleteButton } from '@/components/confirm-delete-button'
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  uploadTaskImage,
  setWeeklyCompletion,
  type TaskInput,
  type TaskOwner,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/actions/dev-tasks'

export type TaskRow = {
  id: number
  title: string
  notes: string | null
  status: string
  owner: string | null
  due_date: string | null
  image_url: string | null
  sort_order: number
  is_recurring: boolean
  priority: number | null
}

const NONE = '__none__'

const COLUMNS: {
  status: TaskStatus
  label: string
  dot: string
  drop: string
}[] = [
  { status: 'todo', label: 'To do', dot: 'bg-amber-400', drop: 'border-amber-400/50 bg-amber-400/5' },
  { status: 'in_progress', label: 'In progress', dot: 'bg-sky-400', drop: 'border-sky-400/50 bg-sky-400/5' },
  { status: 'done', label: 'Done', dot: 'bg-emerald-400', drop: 'border-emerald-400/50 bg-emerald-400/5' },
]

const OWNERS: TaskOwner[] = ['Jack', 'Izayah', 'Alec']

const OWNER_COLORS: Record<TaskOwner, string> = {
  Jack: 'bg-violet-500/20 text-violet-300',
  Izayah: 'bg-sky-500/20 text-sky-300',
  Alec: 'bg-orange-500/20 text-orange-300',
}

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  0: { label: 'P0', className: 'bg-rose-500/20 text-rose-300' },
  1: { label: 'P1', className: 'bg-amber-500/20 text-amber-300' },
  2: { label: 'P2', className: 'bg-sky-500/20 text-sky-300' },
}

const emptyForm: TaskInput = {
  title: '',
  notes: '',
  status: 'todo',
  owner: null,
  due_date: null,
  image_url: null,
  is_recurring: false,
  priority: null,
}

function formatDueDate(value: string | null) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function OwnerAvatar({ owner }: { owner: string }) {
  const colorClass =
    OWNER_COLORS[owner as TaskOwner] ?? 'bg-white/10 text-white/70'
  return (
    <span
      title={owner}
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold',
        colorClass,
      )}
    >
      {owner.charAt(0).toUpperCase()}
    </span>
  )
}

export function KanbanBoard({
  initialTasks,
  completedTaskIds,
}: {
  initialTasks: TaskRow[]
  completedTaskIds: number[]
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [completedIds, setCompletedIds] = useState(new Set(completedTaskIds))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TaskRow | null>(null)
  const [form, setForm] = useState<TaskInput>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const recurringTasks = tasks.filter((t) => t.is_recurring)
  const boardTasks = tasks.filter((t) => !t.is_recurring)

  function openCreate(status: TaskStatus) {
    setEditing(null)
    setForm({ ...emptyForm, status })
    setImageFile(null)
    setImagePreview(null)
    setDialogOpen(true)
  }

  function openCreateRecurring() {
    setEditing(null)
    setForm({ ...emptyForm, is_recurring: true })
    setImageFile(null)
    setImagePreview(null)
    setDialogOpen(true)
  }

  function openEdit(task: TaskRow) {
    setEditing(task)
    setForm({
      title: task.title,
      notes: task.notes,
      status: task.status as TaskStatus,
      owner: task.owner as TaskOwner | null,
      due_date: task.due_date,
      image_url: task.image_url,
      is_recurring: task.is_recurring,
      priority: task.priority as TaskPriority | null,
    })
    setImageFile(null)
    setImagePreview(task.image_url)
    setDialogOpen(true)
  }

  function toggleWeeklyCompletion(task: TaskRow, completed: boolean) {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (completed) next.add(task.id)
      else next.delete(task.id)
      return next
    })
    startTransition(async () => {
      const result = await setWeeklyCompletion(task.id, completed)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
      }
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      let imageUrl = form.image_url

      if (imageFile) {
        const fd = new FormData()
        fd.set('file', imageFile)
        const uploadResult = await uploadTaskImage(fd)
        if ('error' in uploadResult && uploadResult.error) {
          toast.error(uploadResult.error)
          return
        }
        imageUrl = uploadResult.url ?? null
      }

      const payload: TaskInput = { ...form, image_url: imageUrl }
      const result = editing
        ? await updateTask(editing.id, payload)
        : await createTask(payload)

      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        return
      }

      if (editing) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editing.id ? { ...t, ...payload } : t)),
        )
      } else {
        const sortOrder =
          tasks.filter((t) => t.status === payload.status).length
        setTasks((prev) => [
          ...prev,
          { id: -Date.now(), ...payload, sort_order: sortOrder },
        ])
      }

      toast.success(editing ? 'Task updated.' : 'Task added.')
      setDialogOpen(false)
    })
  }

  async function handleDelete(id: number) {
    const result = await deleteTask(id)
    if (result && 'error' in result && result.error) return result
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function changeStatus(task: TaskRow, status: TaskStatus) {
    if (status === task.status) return
    const sortOrder = tasks.filter((t) => t.status === status).length
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status, sort_order: sortOrder } : t,
      ),
    )
    startTransition(async () => {
      const result = await moveTask(task.id, status, sortOrder)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
      }
    })
  }

  function handleDrop(status: TaskStatus) {
    setDragOverStatus(null)
    if (draggedId === null) return
    const task = tasks.find((t) => t.id === draggedId)
    setDraggedId(null)
    if (!task) return
    changeStatus(task, status)
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit task' : 'Add task'}</DialogTitle>
              <DialogDescription>
                Track something the team needs to work on.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-notes">Notes</Label>
                <Textarea
                  id="task-notes"
                  value={form.notes ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.is_recurring}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, is_recurring: checked === true }))
                  }
                />
                Recurring weekly task (shown as a standing checklist item)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-owner">Owner</Label>
                  <Select
                    value={form.owner ?? NONE}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        owner: v === NONE ? null : (v as TaskOwner),
                      }))
                    }
                  >
                    <SelectTrigger id="task-owner" className="w-full">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Unassigned</SelectItem>
                      {OWNERS.map((owner) => (
                        <SelectItem key={owner} value={owner}>
                          {owner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={form.priority === null ? NONE : String(form.priority)}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        priority: v === NONE ? null : (Number(v) as TaskPriority),
                      }))
                    }
                  >
                    <SelectTrigger id="task-priority" className="w-full">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No priority</SelectItem>
                      {([0, 1, 2] as TaskPriority[]).map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          {PRIORITY_META[p].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!form.is_recurring ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-due">Due date</Label>
                    <Input
                      id="task-due"
                      type="date"
                      value={form.due_date ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          due_date: e.target.value || null,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, status: v as TaskStatus }))
                      }
                    >
                      <SelectTrigger id="task-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLUMNS.map((c) => (
                          <SelectItem key={c.status} value={c.status}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {imagePreview ? (
                  <div className="relative h-32 w-full overflow-hidden rounded-lg border">
                    <Image
                      src={imagePreview}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {imagePreview ? 'Replace image' : 'Add image'}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <Repeat className="h-3.5 w-3.5" />
              This week
            </h3>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={openCreateRecurring}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {recurringTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No standing weekly tasks yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {recurringTasks.map((task) => {
                const done = completedIds.has(task.id)
                return (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 rounded-lg border px-2.5 py-2"
                  >
                    <Checkbox
                      checked={done}
                      onCheckedChange={(checked) =>
                        toggleWeeklyCompletion(task, checked === true)
                      }
                    />
                    <span
                      className={`flex-1 text-sm ${done ? 'text-muted-foreground line-through' : ''}`}
                    >
                      {task.title}
                    </span>
                    {task.owner ? <OwnerAvatar owner={task.owner} /> : null}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(task)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <ConfirmDeleteButton
                      title="Delete this weekly task?"
                      description={`"${task.title}" will be permanently removed.`}
                      action={() => handleDelete(task.id)}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((column) => {
          const items = boardTasks
            .filter((t) => t.status === column.status)
            .sort((a, b) => a.sort_order - b.sort_order)
          const isDragOver = dragOverStatus === column.status

          return (
            <div
              key={column.status}
              className="w-[85vw] shrink-0 snap-start space-y-3 sm:w-72"
            >
              <div className="flex items-center justify-between px-0.5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn('h-2 w-2 rounded-full', column.dot)} />
                  {column.label}
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-xs font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openCreate(column.status)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  if (dragOverStatus !== column.status)
                    setDragOverStatus(column.status)
                }}
                onDragLeave={() =>
                  setDragOverStatus((prev) =>
                    prev === column.status ? null : prev,
                  )
                }
                onDrop={() => handleDrop(column.status)}
                className={cn(
                  'min-h-24 space-y-2 rounded-xl border border-dashed p-2 transition-colors',
                  isDragOver ? column.drop : 'border-border/60',
                )}
              >
                {items.map((task) => {
                  const priority =
                    task.priority !== null
                      ? PRIORITY_META[task.priority as TaskPriority]
                      : null
                  return (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedId(task.id)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={() => {
                        setDraggedId(null)
                        setDragOverStatus(null)
                      }}
                      className={cn(
                        'cursor-grab gap-3 py-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
                        draggedId === task.id && 'opacity-50',
                      )}
                    >
                      {task.image_url ? (
                        <div className="relative -mt-3 h-28 w-full overflow-hidden">
                          <Image
                            src={task.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <CardContent className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          {priority ? (
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[0.65rem] font-semibold',
                                priority.className,
                              )}
                            >
                              {priority.label}
                            </span>
                          ) : (
                            <span />
                          )}
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(task)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <ConfirmDeleteButton
                              title="Delete this task?"
                              description={`"${task.title}" will be permanently removed.`}
                              action={() => handleDelete(task.id)}
                            />
                          </div>
                        </div>
                        <p className="text-sm font-medium leading-snug">
                          {task.title}
                        </p>
                        {task.notes ? (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {task.notes}
                          </p>
                        ) : null}
                        {task.owner || task.due_date ? (
                          <div className="flex items-center justify-between border-t pt-2">
                            {task.owner ? (
                              <div className="flex items-center gap-1.5">
                                <OwnerAvatar owner={task.owner} />
                                <span className="text-xs text-muted-foreground">
                                  {task.owner}
                                </span>
                              </div>
                            ) : (
                              <span />
                            )}
                            {task.due_date ? (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Flag className="h-3 w-3" />
                                {formatDueDate(task.due_date)}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  )
                })}
                {items.length === 0 ? (
                  <p className="p-2 text-center text-xs text-muted-foreground">
                    Drag tasks here or tap + to add one.
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
