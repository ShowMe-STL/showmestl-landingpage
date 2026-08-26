'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export function SearchableSelect({
  id,
  items,
  value,
  onChange,
  noneLabel = 'None',
  searchPlaceholder = 'Search…',
}: {
  id?: string
  items: { id: number; name: string }[]
  value: string
  onChange: (value: string) => void
  noneLabel?: string
  searchPlaceholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  )

  const selectedLabel = value
    ? (items.find((item) => String(item.id) === value)?.name ?? noneLabel)
    : noneLabel

  function select(v: string) {
    onChange(v)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
      >
        <span className={cn(!value && 'text-muted-foreground')}>
          {selectedLabel}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
          <div className="border-b border-border p-1.5">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-7"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => select('')}
              className={cn(
                'flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                !value && 'bg-accent text-accent-foreground',
              )}
            >
              {noneLabel}
            </button>
            {filtered.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No matches.
              </p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => select(String(item.id))}
                  className={cn(
                    'flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                    String(item.id) === value &&
                      'bg-accent text-accent-foreground',
                  )}
                >
                  {item.name}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
