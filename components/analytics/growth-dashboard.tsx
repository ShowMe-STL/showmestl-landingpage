'use client'

import { useMemo, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, BarChart, HBarChart } from '@/components/analytics/charts'
import { CohortTriangle } from '@/components/analytics/cohort-triangle'
import type { GrowthAnalytics } from '@/lib/analytics/growth'
import type { AppStoreDownloads } from '@/lib/analytics/app-store'

type RangeKey = '7' | '30' | '90' | 'all'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7', label: '7d' },
  { key: '30', label: '30d' },
  { key: '90', label: '90d' },
  { key: 'all', label: 'All' },
]

const pct = (n: number) => `${(n * 100).toFixed(n < 0.1 ? 1 : 0)}%`

// Kept in sync with ACTION_LABELS in lib/analytics/growth.ts (can't import that
// value here — it's a server-only module).
const KEY_ACTIONS =
  'sending an AI message, checking into a place or an event, commenting on a check-in, liking a place, creating or saving a playlist, or adding a friend'

const fmtDay = (key: string) =>
  new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const fmtMonth = (key: string) =>
  new Date(`${key.slice(0, 7)}-15T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    year: 'numeric',
  })

// Fixed-position so the tooltip escapes the Card's `overflow-hidden` and every
// stacking context on the page. Coordinates are measured from the trigger on
// hover / focus and clamped to the viewport.
function InfoDot({ text }: { text: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const x = Math.min(
      Math.max(r.left + r.width / 2, 132),
      window.innerWidth - 132,
    )
    setPos({ x, y: r.bottom + 6 })
  }
  const hide = () => setPos(null)

  return (
    <span className="inline-flex shrink-0">
      <button
        ref={ref}
        type="button"
        aria-label={text}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {pos && (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[200] w-60 max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-relaxed font-normal text-muted-foreground shadow-xl"
          style={{ left: pos.x, top: pos.y }}
        >
          {text}
        </span>
      )}
    </span>
  )
}

function Stat({
  label,
  value,
  sub,
  info,
}: {
  label: string
  value: string
  sub?: string
  info?: string
}) {
  return (
    <Card className="border-white/10 bg-card">
      <CardHeader className="pb-1">
        <CardDescription className="flex items-center gap-1.5">
          {label}
          {info && <InfoDot text={info} />}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function Panel({
  title,
  hint,
  info,
  children,
}: {
  title: string
  hint?: string
  info?: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-white/10 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-base">
          {title}
          {info && <InfoDot text={info} />}
        </CardTitle>
        {hint && <CardDescription>{hint}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function GrowthDashboard({
  analytics,
  appStore,
}: {
  analytics: GrowthAnalytics
  appStore: AppStoreDownloads
}) {
  const [range, setRange] = useState<RangeKey>('30')

  const cutoff = useMemo(() => {
    if (range === 'all') return '0000-00-00'
    const n = Number(range)
    const [y, m, d] = analytics.today.split('-').map(Number)
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' })
      .format(new Date(Date.UTC(y, m - 1, d) - n * 86_400_000))
  }, [range, analytics.today])

  const inRange = <T extends { day: string }>(rows: T[]) =>
    rows.filter((r) => r.day >= cutoff)

  const signups = inRange(analytics.signups)
  const activeDaily = inRange(analytics.active.daily)
  const wau = inRange(analytics.active.wau)
  const stickiness = inRange(analytics.active.stickiness)

  const downloadsWindow = appStore.daily.filter((d) => d.day >= cutoff)
  const downloadsTotal = downloadsWindow.reduce((s, d) => s + d.downloads, 0)
  const signupsInDownloadWindow = analytics.signups
    .filter(
      (s) =>
        downloadsWindow.length > 0 &&
        s.day >= downloadsWindow[0].day &&
        s.day <= downloadsWindow[downloadsWindow.length - 1].day,
    )
    .reduce((sum, s) => sum + s.count, 0)
  const conversion =
    downloadsTotal > 0
      ? Math.min(1, signupsInDownloadWindow / downloadsTotal)
      : null

  const downloadVsSignup = downloadsWindow.map((d) => {
    const s = analytics.signups.find((x) => x.day === d.day)
    return { day: d.day, downloads: d.downloads, signups: s?.count ?? 0 }
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Growth</h2>
          <p className="text-xs text-muted-foreground">
            Where people enter the funnel and where they drop off. Updated{' '}
            {new Date(analytics.generatedAt).toLocaleString('en-US', {
              timeZone: 'America/Chicago',
              dateStyle: 'medium',
              timeStyle: 'short',
            })}{' '}
            · times in Central.
          </p>
          <p className="text-xs text-muted-foreground">
            Data range: in-app activity since{' '}
            <span className="text-foreground">
              {fmtDay(analytics.coverage.activityFrom)}
            </span>
            ; signups charted from{' '}
            <span className="text-foreground">
              {fmtDay(analytics.coverage.signupsFrom)}
            </span>{' '}
            (
            {(
              (analytics.signups[0]?.cumulative ?? 0) -
              (analytics.signups[0]?.count ?? 0)
            ).toLocaleString()}{' '}
            accounts imported {fmtDay(analytics.coverage.firstAccount)} in a
            migration are folded into the cumulative baseline).
            {appStore.configured && appStore.coverageStart
              ? ` App Store downloads since ${fmtMonth(appStore.coverageStart)}.`
              : ''}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-[3px]">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors ' +
                (range === r.key
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground')
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="signups">
        <TabsList variant="line">
          <TabsTrigger value="signups">Signups</TabsTrigger>
          <TabsTrigger value="activation">Activation</TabsTrigger>
          <TabsTrigger value="active">Active users</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        {/* ---- Signups ------------------------------------------------ */}
        <TabsContent value="signups" className="space-y-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="New signups"
              value={signups.reduce((s, d) => s + d.count, 0).toLocaleString()}
              sub={`in the selected range · ${analytics.totals.users.toLocaleString()} all-time`}
              info="Accounts created (a profile row) within the selected date range. The all-time number includes ~370 existing accounts imported in the 2026-08-08 migration; the range count starts the day after so it isn't skewed by that."
            />
            <Stat
              label="Downloads"
              value={
                appStore.configured && downloadsWindow.length
                  ? downloadsTotal.toLocaleString()
                  : '—'
              }
              sub={
                appStore.configured
                  ? downloadsWindow.length
                    ? 'App Store first-time downloads'
                    : 'no report data in range'
                  : 'App Store Connect not configured'
              }
              info="First-time App Store downloads of ShowMe STL (Apple's 'app units') in the selected range, from the App Store Connect Sales Reports API. Filtered to this app only; re-downloads and updates are excluded. Reports lag ~1–2 days."
            />
            <Stat
              label="Download → signup"
              value={conversion !== null ? pct(conversion) : '—'}
              sub={
                conversion !== null
                  ? `${signupsInDownloadWindow.toLocaleString()} signups / ${downloadsTotal.toLocaleString()} downloads`
                  : 'needs App Store data'
              }
              info="Signups divided by first-time downloads over the same days — roughly, the share of people who install the app and then create an account. Capped at 100%."
            />
            <Stat
              label="Activated"
              value={pct(analytics.totals.activationRate)}
              sub={`${analytics.totals.activatedUsers.toLocaleString()} of ${analytics.totals.users.toLocaleString()} users ever did a key action`}
              info={`Share of all accounts that have ever completed at least one key action: ${KEY_ACTIONS}.`}
            />
          </div>

          <Panel
            title="New signups per day"
            hint="Accounts created (profile row)."
            info="One point per day = accounts created that day. The timeline starts 2026-08-09 — the 2026-08-08 migration import (~370 accounts) is left off so it doesn't read as a real spike."
          >
            <LineChart
              data={signups}
              series={[
                { key: 'count', label: 'Signups', color: 'var(--chart-2)', area: true },
              ]}
            />
          </Panel>

          <Panel
            title="Cumulative users"
            info="Running total of all accounts. Starts from the post-migration baseline (~370) on 2026-08-09 and climbs with each day's real signups."
          >
            <LineChart
              data={signups}
              series={[
                {
                  key: 'cumulative',
                  label: 'Total users',
                  color: 'var(--chart-3)',
                  area: true,
                },
              ]}
            />
          </Panel>

          {appStore.configured ? (
            downloadVsSignup.length ? (
              <Panel
                title="Downloads vs signups"
                hint="App Store first-time downloads against accounts created, same day."
                info="Two lines: daily first-time App Store downloads and daily signups. The gap between them is the drop-off between installing and signing up."
              >
                <LineChart
                  data={downloadVsSignup}
                  series={[
                    { key: 'downloads', label: 'Downloads', color: 'var(--chart-1)' },
                    { key: 'signups', label: 'Signups', color: 'var(--chart-2)' },
                  ]}
                />
              </Panel>
            ) : (
              <Panel title="Downloads vs signups">
                <p className="text-sm text-muted-foreground">
                  {appStore.error ??
                    'No App Store sales reports were returned for this range yet (reports lag ~1–2 days).'}
                </p>
              </Panel>
            )
          ) : (
            <Panel title="Downloads vs signups">
              <p className="text-sm text-muted-foreground">
                Add <code className="text-foreground">APP_STORE_CONNECT_ISSUER_ID</code>,{' '}
                <code className="text-foreground">APP_STORE_CONNECT_KEY_ID</code>,{' '}
                <code className="text-foreground">APP_STORE_CONNECT_PRIVATE_KEY</code>, and{' '}
                <code className="text-foreground">APP_STORE_CONNECT_VENDOR_NUMBER</code>{' '}
                to pull first-time downloads and the download → signup conversion
                rate. The key needs the Sales &amp; Reports role.
              </p>
            </Panel>
          )}
        </TabsContent>

        {/* ---- Activation ------------------------------------------- */}
        <TabsContent value="activation" className="space-y-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Activation rate"
              value={pct(analytics.totals.activationRate)}
              sub="users who ever did ≥1 key action"
              info={`Share of all accounts that have ever done at least one key action: ${KEY_ACTIONS}. Same number as 'Activated' on the Signups tab.`}
            />
            {analytics.activation.firstWeek.buckets
              .filter((b) => b.bucket !== '0')
              .slice(0, 1)
              .map((b) => {
                const el = analytics.activation.firstWeek.eligible
                const activatedFirstWeek = analytics.activation.firstWeek.buckets
                  .filter((x) => x.bucket !== '0')
                  .reduce((s, x) => s + x.users, 0)
                return (
                  <Stat
                    key={b.bucket}
                    label="Activated in first 7 days"
                    value={el ? pct(activatedFirstWeek / el) : '—'}
                    sub={`${activatedFirstWeek} of ${el} accounts that signed up ${fmtDay(
                      analytics.activation.firstWeek.since,
                    )} – ${fmtDay(analytics.activation.firstWeek.through)}`}
                    info={`Denominator = accounts that signed up on/after ${fmtDay(
                      analytics.activation.firstWeek.since,
                    )} AND whose first 7 days have fully elapsed (so signed up on/before ${fmtDay(
                      analytics.activation.firstWeek.through,
                    )}). ${
                      analytics.activation.firstWeek.inProgress
                    } more recent accounts are still inside their first week and aren't counted yet. The ~${(
                      (analytics.signups[0]?.cumulative ?? 0) -
                      (analytics.signups[0]?.count ?? 0)
                    ).toLocaleString()} migration-imported accounts are excluded entirely.`}
                  />
                )
              })}
            <Stat
              label="Never activated"
              value={
                analytics.activation.firstWeek.eligible
                  ? pct(
                      (analytics.activation.firstWeek.buckets.find(
                        (b) => b.bucket === '0',
                      )?.users ?? 0) / analytics.activation.firstWeek.eligible,
                    )
                  : '—'
              }
              sub={`${
                analytics.activation.firstWeek.buckets.find((b) => b.bucket === '0')
                  ?.users ?? 0
              } of ${analytics.activation.firstWeek.eligible} accounts did nothing in week 1`}
              info={`Same denominator as "Activated in first 7 days" — accounts that signed up ${fmtDay(
                analytics.activation.firstWeek.since,
              )} – ${fmtDay(
                analytics.activation.firstWeek.through,
              )} — showing the share that completed zero key actions in their first 7 days. This is the main early-funnel drop-off.`}
            />
          </div>

          <Panel
            title="Key actions — users reached"
            hint="Each bar = how many different people have ever done that action. Hover a bar for the first-week and lifetime breakdown."
            info="For each key action, the number of distinct users who have ever done it at least once — a feature-adoption funnel. Hover a bar to see how many reached it within their first 7 days and how many times it's happened in total."
          >
            <HBarChart
              unit="users"
              data={analytics.activation.byAction.map((a) => ({
                label: a.label,
                value: a.users,
                tooltip: `${a.users.toLocaleString()} users have ever done this — ${a.usersFirst7d.toLocaleString()} of them within their first 7 days. It has happened ${a.events.toLocaleString()} times in total.`,
              }))}
            />
          </Panel>

          <Panel
            title="Meaningful actions in first 7 days"
            hint={`The same ${analytics.activation.firstWeek.eligible} accounts (signed up ${fmtDay(
              analytics.activation.firstWeek.since,
            )} – ${fmtDay(
              analytics.activation.firstWeek.through,
            )}), bucketed by how many key actions they did in week 1.`}
            info={`The ${analytics.activation.firstWeek.eligible} accounts that signed up ${fmtDay(
              analytics.activation.firstWeek.since,
            )} – ${fmtDay(
              analytics.activation.firstWeek.through,
            )}, bucketed by how many key actions (any type, counting repeats) they completed in their first 7 days. The '0 actions' bar is the group that never engaged. Migration-imported accounts and accounts still in their first week are excluded.`}
          >
            <BarChart
              data={analytics.activation.firstWeek.buckets.map((b) => ({
                label: `${b.bucket} action${b.bucket === '1' ? '' : 's'}`,
                value: b.users,
                sub: `${b.users} accounts`,
              }))}
              color="var(--chart-4)"
            />
          </Panel>

          <Panel
            title="Activation rate by signup week"
            hint="Share of each weekly signup cohort that did ≥1 key action within 7 days (post-migration cohorts only)."
            info="Each point is one weekly signup cohort: the share of that week's new accounts that did ≥1 key action within 7 days of signing up. Only post-migration weeks with a full 7-day window for every member are shown. Watch the trend, not any single week."
          >
            <LineChart
              percent
              data={analytics.activation.weeklyTrend.map((w) => ({
                day: w.week,
                rate: w.rate,
              }))}
              series={[
                { key: 'rate', label: 'Activated', color: 'var(--chart-3)', area: true },
              ]}
            />
          </Panel>
        </TabsContent>

        {/* ---- Active users --------------------------------------- */}
        <TabsContent value="active" className="space-y-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="DAU"
              value={analytics.active.current.dau.toLocaleString()}
              sub="today, Central"
              info="Distinct users who did a key action so far today (America/Chicago). Today is still in progress, so this climbs through the day."
            />
            <Stat
              label="WAU"
              value={analytics.active.current.wau.toLocaleString()}
              sub="last 7 days"
              info="Distinct users who did a key action at least once in the last 7 days (including today)."
            />
            <Stat
              label="MAU"
              value={analytics.active.current.mau.toLocaleString()}
              sub="last 30 days"
              info="Distinct users who did a key action at least once in the last 30 days."
            />
            <Stat
              label="DAU / WAU"
              value={pct(analytics.active.current.ratio)}
              sub="stickiness"
              info="Today's DAU divided by WAU — the share of weekly-active users who show up on an average day. Higher means people come back more often; ~20%+ is healthy for a consumer social app."
            />
          </div>

          <Panel
            title="Daily active users"
            hint="Active = performed a key action that day. New = signed up the same day."
            info={`Distinct active users per day. 'New' is the slice that signed up that same day; the rest are returning. There's no app-open telemetry, so 'active' means a key action (${KEY_ACTIONS}) — not just launching the app.`}
          >
            <LineChart
              data={activeDaily}
              series={[
                { key: 'total', label: 'Total', color: 'var(--chart-2)', area: true },
                { key: 'new', label: 'New', color: 'var(--chart-1)' },
              ]}
            />
          </Panel>

          <Panel
            title="Weekly active users"
            hint="Rolling 7-day distinct active users."
            info="For each day, the number of distinct users active in the trailing 7-day window ending that day. Smoother than DAU; the trend is what matters."
          >
            <LineChart
              data={wau}
              series={[
                { key: 'count', label: 'WAU', color: 'var(--chart-3)', area: true },
              ]}
            />
          </Panel>

          <Panel
            title="Stickiness (DAU / WAU)"
            info="DAU ÷ WAU plotted per day. Rising = the same weekly users are coming back more often; falling = growth is coming from one-off visits."
          >
            <LineChart
              percent
              data={stickiness}
              series={[{ key: 'ratio', label: 'DAU / WAU', color: 'var(--chart-4)' }]}
            />
          </Panel>
        </TabsContent>

        {/* ---- Retention ---------------------------------------- */}
        <TabsContent value="retention" className="space-y-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {analytics.retention.headline.map((h) => (
              <Stat
                key={h.day}
                label={`D${h.day} retention`}
                value={h.eligible ? pct(h.rate) : '—'}
                sub={`${h.retained} of ${h.eligible} users active on/after day ${h.day}`}
                info={`Of users who signed up at least ${h.day} day${
                  h.day === 1 ? '' : 's'
                } ago, the share that did a key action on day ${h.day} or later — i.e. were still around ${h.day} day${
                  h.day === 1 ? '' : 's'
                } in. Shows "—" until enough accounts are that old.`}
              />
            ))}
          </div>

          <Panel
            title="Weekly cohort retention"
            hint="Rows = signup week. Wn = share of that cohort active during the nth week after signing up."
            info="Each row is a signup-week cohort. Column Wn = the share of that cohort that did a key action during the nth week after signing up (W0 = signup week). Darker = higher. Blank cells are weeks that haven't happened yet. Read down a column to see if retention is improving for newer cohorts."
          >
            <CohortTriangle
              cohorts={analytics.retention.cohorts}
              weekOffsets={analytics.retention.weekOffsets}
            />
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  )
}
