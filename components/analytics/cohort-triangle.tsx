'use client'

import { useState } from 'react'

// Weekly signup-cohort retention triangle. Cell colour is a single-hue
// sequential ramp (chart-2) mixed toward transparent by the retention share —
// magnitude, so one hue light->dark. Hover a cell for the underlying counts.

type Cohort = {
  week: string
  size: number
  values: (number | null)[]
}

function weekLabel(week: string): string {
  const [, m, d] = week.split('-')
  return `${Number(m)}/${Number(d)}`
}

export function CohortTriangle({
  cohorts,
  weekOffsets,
}: {
  cohorts: Cohort[]
  weekOffsets: number[]
}) {
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null)

  if (cohorts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Not enough signup history yet to build cohorts.
      </p>
    )
  }

  const rows = [...cohorts].reverse()

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">Signup week</th>
            <th className="px-2 py-1 text-right font-medium">Users</th>
            {weekOffsets.map((n) => (
              <th key={n} className="px-2 py-1 text-center font-medium">
                W{n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cohort, row) => (
            <tr key={cohort.week}>
              <td className="whitespace-nowrap px-2 py-1 text-left text-muted-foreground">
                {weekLabel(cohort.week)}
              </td>
              <td className="px-2 py-1 text-right tabular-nums text-foreground">
                {cohort.size}
              </td>
              {weekOffsets.map((n, col) => {
                const v = cohort.values[n]
                if (v === null || v === undefined) {
                  return <td key={n} className="px-2 py-1" />
                }
                const isHover = hover?.row === row && hover?.col === col
                return (
                  <td
                    key={n}
                    onMouseEnter={() => setHover({ row, col })}
                    onMouseLeave={() => setHover(null)}
                    className="relative px-2 py-1 text-center tabular-nums"
                    style={{
                      background: `color-mix(in oklab, var(--chart-2) ${Math.round(
                        v * 100,
                      )}%, transparent)`,
                      color: v > 0.55 ? '#0f0d10' : 'var(--foreground)',
                      borderRadius: 4,
                      outline: isHover ? '1px solid var(--ring)' : 'none',
                    }}
                  >
                    {Math.round(v * 100)}%
                    {isHover && (
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-muted-foreground shadow-lg">
                        {Math.round(v * cohort.size)} of {cohort.size} active in
                        week {n}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
