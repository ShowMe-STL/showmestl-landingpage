'use client'

import { useRef, useState, useTransition, type FormEvent } from 'react'
import Image from 'next/image'
import {
  Plus,
  Pencil,
  ImagePlus,
  Repeat,
  Flag,
  Archive,
  ArchiveRestore,
  ChevronDown,
  Filter,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
  archiveTask,
  markTaskDone,
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
  is_archived?: boolean
  updated_at?: string
}

const NONE = '__none__'
const ALL = '__all__'
const ALL_WEEKS = '__all_weeks__'

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

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekKey(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const date = dateStr.includes('T')
    ? new Date(dateStr)
    : new Date(`${dateStr}T00:00:00`)
  const monday = getMondayOfWeek(date)
  return monday.toISOString().split('T')[0]
}

function getWeekLabel(weekKey: string): string {
  const weekDate = new Date(`${weekKey}T00:00:00`)
  const currentMonday = getMondayOfWeek(new Date())
  const diffMs = weekDate.getTime() - currentMonday.getTime()
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))

  if (diffWeeks === 0) return 'This week'
  if (diffWeeks === 1) return 'Next week'
  if (diffWeeks < 0) return `${Math.abs(diffWeeks)} weeks ago`
  return `In ${diffWeeks} weeks`
}

function getTaskWeekKey(task: TaskRow): string | null {
  if (task.status === 'done') {
    return getWeekKey(task.updated_at)
  }
  return getWeekKey(task.due_date)
}

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
  const [ownerFilter, setOwnerFilter] = useState<string>(ALL)
  const [weekFilter, setWeekFilter] = useState<string>(ALL_WEEKS)
  const [showArchive, setShowArchive] = useState(false)

  const activeTasks = tasks.filter((t) => !t.is_archived)
  const archivedTasks = tasks.filter((t) => t.is_archived)

  const thisWeekKey = getMondayOfWeek(new Date()).toISOString().split('T')[0]

  const filteredByOwner =
    ownerFilter === ALL
      ? activeTasks
      : ownerFilter === NONE
        ? activeTasks.filter((t) => !t.owner)
        : activeTasks.filter((t) => t.owner === ownerFilter)

  const filteredTasks =
    weekFilter === ALL_WEEKS
      ? filteredByOwner
      : filteredByOwner.filter((t) => {
          const taskWeek = getTaskWeekKey(t)
          return taskWeek === weekFilter
        })

  const recurringTasks = filteredTasks.filter((t) => t.is_recurring)
  const boardTasks = filteredTasks.filter((t) => !t.is_recurring)

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

  function handleArchive(task: TaskRow, archived: boolean) {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_archived: archived } : t)),
    )
    startTransition(async () => {
      const result = await archiveTask(task.id, archived)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
      } else {
        toast.success(archived ? 'Task archived.' : 'Task restored.')
      }
    })
  }

  function handleMarkDone(task: TaskRow) {
    if (task.status === 'done') return
    const newSortOrder = tasks.filter(
      (t) => t.status === 'done' && !t.is_archived,
    ).length
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: 'done', sort_order: newSortOrder }
          : t,
      ),
    )
    startTransition(async () => {
      const result = await markTaskDone(task.id)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
      } else {
        toast.success('Task marked as done.')
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-zinc-900/50 p-1">
          <button
            type="button"
            onClick={() => setWeekFilter(ALL_WEEKS)}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              weekFilter === ALL_WEEKS
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200',
            )}
          >
            All weeks
          </button>
          <button
            type="button"
            onClick={() => setWeekFilter(thisWeekKey)}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              weekFilter === thisWeekKey
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200',
            )}
          >
            This week
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={ownerFilter} onValueChange={(v) => v && setOwnerFilter(v)}>
            <SelectTrigger className="h-8 w-36 border-zinc-700 bg-zinc-900/50 text-sm">
              <Filter className="mr-1.5 h-3.5 w-3.5 text-zinc-500" />
              <SelectValue placeholder="Person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value={NONE}>None</SelectItem>
              {OWNERS.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ownerFilter !== ALL && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOwnerFilter(ALL)}
              className="h-8 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg flex-col overflow-hidden sm:w-full">
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <DialogHeader className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
              <DialogTitle>{editing ? 'Edit task' : 'Add task'}</DialogTitle>
              <DialogDescription>
                Track something the team needs to work on.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  className="h-11 text-base sm:h-9 sm:text-sm"
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
                  className="min-h-[80px] text-base sm:text-sm"
                />
              </div>
              <label className="flex min-h-[44px] items-center gap-3 text-sm sm:min-h-0 sm:gap-2">
                <Checkbox
                  checked={form.is_recurring}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, is_recurring: checked === true }))
                  }
                  className="h-5 w-5 sm:h-4 sm:w-4"
                />
                <span className="leading-tight">
                  Recurring weekly task (shown as a standing checklist item)
                </span>
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <SelectTrigger id="task-owner" className="h-11 w-full text-base sm:h-9 sm:text-sm">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
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
                    <SelectTrigger id="task-priority" className="h-11 w-full text-base sm:h-9 sm:text-sm">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      className="h-11 text-base sm:h-9 sm:text-sm"
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
                      <SelectTrigger id="task-status" className="h-11 w-full text-base sm:h-9 sm:text-sm">
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
                  className="h-11 gap-2 text-base sm:h-9 sm:text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  {imagePreview ? 'Replace image' : 'Add image'}
                </Button>
              </div>
            </div>
            <DialogFooter className="shrink-0 border-t border-zinc-800 bg-zinc-950/80 px-4 py-4 sm:px-6">
              <Button type="submit" disabled={isPending} className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm">
                {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Repeat className="h-4 w-4 text-zinc-500" />
            Recurring tasks
            <span className="text-zinc-500">{recurringTasks.length}</span>
          </h3>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
            onClick={openCreateRecurring}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {recurringTasks.length === 0 ? (
          <p className="py-2 text-xs text-zinc-600">
            No standing weekly tasks yet.
          </p>
        ) : (
          <div className="space-y-1">
            {recurringTasks.map((task) => {
              const done = completedIds.has(task.id)
              return (
                <div
                  key={task.id}
                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-800/50"
                >
                  <button
                    type="button"
                    onClick={() => toggleWeeklyCompletion(task, !done)}
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      done
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-zinc-600 hover:border-zinc-400',
                    )}
                  >
                    {done && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      done ? 'text-zinc-500 line-through' : 'text-zinc-300',
                    )}
                  >
                    {task.title}
                  </span>
                  {task.owner && <OwnerAvatar owner={task.owner} />}
                  <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-5 w-5 text-zinc-500 hover:text-zinc-300"
                      onClick={() => openEdit(task)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <ConfirmDeleteButton
                      title="Delete this weekly task?"
                      description={`"${task.title}" will be permanently removed.`}
                      action={() => handleDelete(task.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((column) => {
          const columnTasks = boardTasks
            .filter((t) => t.status === column.status)
            .sort((a, b) => a.sort_order - b.sort_order)

          const isDragOver = dragOverStatus === column.status

          return (
            <div
              key={column.status}
              className="w-[85vw] shrink-0 snap-start sm:w-72"
            >
              <div className="mb-2 flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full border-2',
                      column.status === 'todo' && 'border-zinc-500',
                      column.status === 'in_progress' && 'border-sky-500 bg-sky-500/20',
                      column.status === 'done' && 'border-emerald-500 bg-emerald-500',
                    )}
                  >
                    {column.status === 'done' && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm font-medium text-zinc-300">
                    {column.label}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {columnTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
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
                  'min-h-32 space-y-2 rounded-lg p-1.5 transition-colors',
                  isDragOver ? 'bg-zinc-800/50' : 'bg-transparent',
                )}
              >
                {columnTasks.map((task) => {
                  const priority =
                    task.priority !== null
                      ? PRIORITY_META[task.priority as TaskPriority]
                      : null
                  const isDone = task.status === 'done'
                  const taskWeek = getWeekKey(task.due_date)
                  const weekLabel = taskWeek ? getWeekLabel(taskWeek) : null

                  return (
                    <div
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
                        'group cursor-grab rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 transition-all hover:border-zinc-700 hover:bg-zinc-900 active:cursor-grabbing',
                        draggedId === task.id && 'opacity-50',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => !isDone && handleMarkDone(task)}
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                              isDone
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-zinc-600 hover:border-zinc-400',
                            )}
                            title={isDone ? 'Done' : 'Mark as done'}
                          >
                            {isDone && (
                              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span className="text-sm font-medium text-zinc-200 leading-snug">
                            {task.title}
                          </span>
                        </div>
                        {task.owner && <OwnerAvatar owner={task.owner} />}
                      </div>

                      {task.notes && (
                        <p className="mt-1.5 line-clamp-2 pl-6 text-xs text-zinc-500">
                          {task.notes}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-2 pl-6">
                        {priority && (
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[0.65rem] font-medium',
                              priority.className,
                            )}
                          >
                            {priority.label}
                          </span>
                        )}
                        {weekLabel && weekFilter === ALL_WEEKS && (
                          <span className="flex items-center gap-1 text-[0.65rem] text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            {weekLabel}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-[0.65rem] text-zinc-500">
                            {formatDueDate(task.due_date)}
                          </span>
                        )}
                        <div className="ml-auto flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-5 w-5 text-zinc-500 hover:text-zinc-300"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArchive(task, true)
                            }}
                            title="Archive"
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-5 w-5 text-zinc-500 hover:text-zinc-300"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(task)
                            }}
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {task.image_url && (
                        <div className="relative mt-2 h-24 w-full overflow-hidden rounded-md">
                          <Image
                            src={task.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
                {columnTasks.length === 0 && (
                  <p className="py-8 text-center text-xs text-zinc-600">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {archivedTasks.length > 0 && (
        <div className="mt-4 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
          <button
            type="button"
            onClick={() => setShowArchive(!showArchive)}
            className="flex w-full items-center justify-between px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm text-zinc-500">
              <Archive className="h-4 w-4" />
              Archived
              <span className="text-zinc-600">{archivedTasks.length}</span>
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-zinc-600 transition-transform',
                showArchive && 'rotate-180',
              )}
            />
          </button>
          {showArchive && (
            <div className="space-y-1 border-t border-zinc-800/50 p-2">
              {archivedTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 opacity-60 hover:bg-zinc-800/30 hover:opacity-80"
                >
                  <span className="flex-1 text-sm text-zinc-500">
                    {task.title}
                  </span>
                  {task.owner && <OwnerAvatar owner={task.owner} />}
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[0.6rem] font-medium',
                      task.status === 'todo' && 'bg-zinc-800 text-zinc-400',
                      task.status === 'in_progress' && 'bg-sky-900/50 text-sky-400',
                      task.status === 'done' && 'bg-emerald-900/50 text-emerald-400',
                    )}
                  >
                    {COLUMNS.find((c) => c.status === task.status)?.label}
                  </span>
                  <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-5 w-5 text-zinc-500 hover:text-zinc-300"
                      onClick={() => handleArchive(task, false)}
                      title="Restore"
                    >
                      <ArchiveRestore className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-5 w-5 text-zinc-500 hover:text-zinc-300"
                      onClick={() => openEdit(task)}
                      title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <ConfirmDeleteButton
                      title="Delete this archived task?"
                      description={`"${task.title}" will be permanently removed.`}
                      action={() => handleDelete(task.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
