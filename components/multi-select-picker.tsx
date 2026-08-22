'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function MultiSelectPicker({
  items,
  selected,
  onChange,
  placeholder = 'Filter…',
  emptyLabel = 'No matches.',
  helperText,
}: {
  items: { id: number; name: string }[]
  selected: number[]
  onChange: (ids: number[]) => void
  placeholder?: string
  emptyLabel?: string
  helperText?: (count: number) => string
}) {
  const [query, setQuery] = useState('')
  const filtered = items.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  )

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="max-h-48 overflow-y-auto rounded-md border p-2">
        {filtered.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {filtered.map((item) => {
              const id = `picker-${item.id}`
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-1 py-1"
                >
                  <Checkbox
                    id={id}
                    checked={selected.includes(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                  />
                  <Label
                    htmlFor={id}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {item.name}
                  </Label>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {selected.length > 0 && helperText ? (
        <p className="text-xs text-muted-foreground">
          {helperText(selected.length)}
        </p>
      ) : null}
    </div>
  )
}
