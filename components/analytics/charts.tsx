'use client'

import { useId, useMemo, useRef, useState } from 'react'

// Lightweight inline-SVG charts for the admin growth dashboard. No charting
// dependency — the site ships a standalone bundle and we keep it lean. Marks
// follow the house dataviz rules: thin 2px lines, recessive grid, a hover
// crosshair/tooltip by default, direct-labelled final value, legend for >1
// series.

const AXIS = 'rgba(255,255,255,0.55)'
const GRID = 'rgba(255,255,255,0.08)'
const VB_W = 760
const PAD = { top: 12, right: 16, bottom: 24, left: 44 }

function niceMax(value: number): number {
  if (value <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(value))
  const norm = value / pow
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return step * pow
}

function shortDate(day: string): string {
  const [, m, d] = day.split('-')
  return `${Number(m)}/${Number(d)}`
}

export type Series = {
  key: string
  label: string
  color: string
  area?: boolean
}

type Row = { day: string } & Record<string, number | string>

export function LineChart({
  data,
  series,
  height = 240,
  format = (n) => `${n}`,
  percent = false,
}: {
  data: Row[]
  series: Series[]
  height?: number
  format?: (n: number) => string
  percent?: boolean
}) {
  const gradId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const { points, ticks } = useMemo(() => {
    const rawMax = Math.max(
      1,
      ...data.flatMap((r) => series.map((s) => Number(r[s.key]) || 0)),
    )
    const m = percent ? 1 : niceMax(rawMax)
    const innerW = VB_W - PAD.left - PAD.right
    const innerH = height - PAD.top - PAD.bottom
    const x = (i: number) =>
      PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y = (v: number) => PAD.top + innerH - (v / m) * innerH
    const pts = series.map((s) => ({
      s,
      d: data.map((r, i) => ({ x: x(i), y: y(Number(r[s.key]) || 0) })),
    }))
    const tickVals = [0, 0.25, 0.5, 0.75, 1].map((f) => f * m)
    return {
      points: pts,
      ticks: tickVals.map((v) => ({ v, y: y(v) })),
    }
  }, [data, series, height, percent])

  const innerW = VB_W - PAD.left - PAD.right
  const labelEvery = Math.max(1, Math.ceil(data.length / 6))

  const onMove = (clientX: number) => {
    const el = wrapRef.current
    if (!el || data.length === 0) return
    const rect = el.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    const vbX = ratio * VB_W
    const i = Math.round(
      ((vbX - PAD.left) / innerW) * (data.length - 1),
    )
    setHover(Math.min(data.length - 1, Math.max(0, i)))
  }

  const fmt = percent ? (n: number) => `${Math.round(n * 100)}%` : format

  return (
    <div className="relative" ref={wrapRef}>
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${VB_W} ${height}`}
        className="w-full"
        style={{ height: 'auto' }}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        <defs>
          {points.map(
            ({ s }) =>
              s.area && (
                <linearGradient
                  key={s.key}
                  id={`${gradId}-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ),
          )}
        </defs>

        {ticks.map((t) => (
          <g key={t.v}>
            <line
              x1={PAD.left}
              x2={VB_W - PAD.right}
              y1={t.y}
              y2={t.y}
              stroke={GRID}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={t.y + 3}
              textAnchor="end"
              fontSize={10}
              fill={AXIS}
            >
              {fmt(t.v)}
            </text>
          </g>
        ))}

        {data.map((r, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text
              key={r.day}
              x={
                PAD.left +
                (data.length <= 1
                  ? innerW / 2
                  : (i / (data.length - 1)) * innerW)
              }
              y={height - 8}
              textAnchor="middle"
              fontSize={10}
              fill={AXIS}
            >
              {shortDate(r.day)}
            </text>
          ) : null,
        )}

        {points.map(({ s, d }) => {
          const line = d
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
            .join(' ')
          const areaPath =
            `M${d[0]?.x ?? 0},${height - PAD.bottom} ` +
            d.map((p) => `L${p.x},${p.y}`).join(' ') +
            ` L${d[d.length - 1]?.x ?? 0},${height - PAD.bottom} Z`
          return (
            <g key={s.key}>
              {s.area && (
                <path d={areaPath} fill={`url(#${gradId}-${s.key})`} />
              )}
              <path
                d={line}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {d.length > 0 && (
                <circle
                  cx={d[d.length - 1].x}
                  cy={d[d.length - 1].y}
                  r={3}
                  fill={s.color}
                />
              )}
            </g>
          )
        })}

        {hover !== null && points[0]?.d[hover] && (
          <line
            x1={points[0].d[hover].x}
            x2={points[0].d[hover].x}
            y1={PAD.top}
            y2={height - PAD.bottom}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1}
          />
        )}
        {hover !== null &&
          points.map(({ s, d }) =>
            d[hover] ? (
              <circle
                key={s.key}
                cx={d[hover].x}
                cy={d[hover].y}
                r={4}
                fill={s.color}
                stroke="var(--card)"
                strokeWidth={2}
              />
            ) : null,
          )}
      </svg>

      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute top-0 z-10 min-w-32 -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-2 text-xs shadow-lg"
          style={{
            left: `${
              ((PAD.left +
                (data.length <= 1
                  ? innerW / 2
                  : (hover / (data.length - 1)) * innerW)) /
                VB_W) *
              100
            }%`,
          }}
        >
          <div className="mb-1 font-medium text-foreground">
            {data[hover].day}
          </div>
          {series.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between gap-3 text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="tabular-nums text-foreground">
                {fmt(Number(data[hover][s.key]) || 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Horizontal bars — better for many categories with wordy labels. Baseline is
// the left edge; value sits just past the bar end, an optional muted note after.
export function HBarChart({
  data,
  color = 'var(--chart-2)',
  format = (n) => n.toLocaleString(),
}: {
  data: { label: string; value: number; note?: string }[]
  color?: string
  format?: (n: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const rowH = 30
  const labelW = 150
  const valueW = 150
  const height = data.length * rowH + 8
  const trackW = VB_W - labelW - valueW
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)))

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${height}`}
      className="w-full"
      style={{ height: 'auto' }}
    >
      {data.map((d, i) => {
        const w = (d.value / max) * trackW
        const y = i * rowH + 4
        const dim = hover !== null && hover !== i
        return (
          <g
            key={d.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            opacity={dim ? 0.45 : 1}
          >
            <rect
              x={0}
              y={y}
              width={VB_W}
              height={rowH}
              fill="transparent"
            />
            <text
              x={labelW - 10}
              y={y + rowH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={11}
              fill={AXIS}
            >
              {d.label}
            </text>
            <rect
              x={labelW}
              y={y + rowH / 2 - 8}
              width={Math.max(2, w)}
              height={16}
              rx={4}
              fill={color}
            />
            <text
              x={labelW + Math.max(2, w) + 8}
              y={y + rowH / 2}
              dominantBaseline="central"
              fontSize={11}
              fill="var(--foreground)"
            >
              {format(d.value)}
              {d.note ? (
                <tspan fill={AXIS}>{`  ${d.note}`}</tspan>
              ) : null}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function BarChart({
  data,
  color = 'var(--chart-2)',
  height = 220,
  format = (n) => `${n}`,
  percent = false,
}: {
  data: { label: string; value: number; sub?: string }[]
  color?: string
  height?: number
  format?: (n: number) => string
  percent?: boolean
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = percent ? 1 : niceMax(Math.max(1, ...data.map((d) => d.value)))
  const innerH = height - PAD.top - PAD.bottom
  const innerW = VB_W - PAD.left - PAD.right
  const band = innerW / Math.max(1, data.length)
  const barW = Math.min(64, band * 0.6)
  const fmt = percent ? (n: number) => `${Math.round(n * 100)}%` : format

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${VB_W} ${height}`} className="w-full" style={{ height: 'auto' }}>
        {[0, 0.5, 1].map((f) => {
          const y = PAD.top + innerH - f * innerH
          return (
            <g key={f}>
              <line
                x1={PAD.left}
                x2={VB_W - PAD.right}
                y1={y}
                y2={y}
                stroke={GRID}
                strokeWidth={1}
              />
              <text x={PAD.left - 8} y={y + 3} textAnchor="end" fontSize={10} fill={AXIS}>
                {fmt(f * max)}
              </text>
            </g>
          )
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * innerH
          const x = PAD.left + i * band + (band - barW) / 2
          const y = PAD.top + innerH - h
          return (
            <g
              key={d.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={innerH}
                fill="transparent"
              />
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(0, h)}
                rx={4}
                fill={color}
                opacity={hover === null || hover === i ? 1 : 0.5}
              />
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize={11}
                fill="var(--foreground)"
              >
                {fmt(d.value)}
              </text>
              <text
                x={PAD.left + i * band + band / 2}
                y={height - 9}
                textAnchor="middle"
                fontSize={10}
                fill={AXIS}
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
      {hover !== null && data[hover]?.sub && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-muted-foreground shadow-lg"
          style={{
            left: `${((PAD.left + hover * band + band / 2) / VB_W) * 100}%`,
          }}
        >
          {data[hover].sub}
        </div>
      )}
    </div>
  )
}
