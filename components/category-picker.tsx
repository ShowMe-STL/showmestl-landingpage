'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export function CategoryPicker({
  categories,
  selected,
  onChange,
}: {
  categories: { id: number; name: string }[]
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = categories.filter((c) =>
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
        placeholder="Filter categories…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="max-h-48 overflow-y-auto rounded-md border p-2">
        {filtered.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">No matches.</p>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {filtered.map((category) => {
              const id = `category-${category.id}`
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-2 px-1 py-1"
                >
                  <Checkbox
                    id={id}
                    checked={selected.includes(category.id)}
                    onCheckedChange={() => toggle(category.id)}
                  />
                  <Label
                    htmlFor={id}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {category.name}
                  </Label>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {selected.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {selected.length} selected — first checked is the primary category.
        </p>
      ) : null}
    </div>
  )
}
