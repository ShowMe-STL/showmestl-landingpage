'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, BarChart } from '@/components/analytics/charts'
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

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card className="border-white/10 bg-card">
      <CardHeader className="pb-1">
        <CardDescription>{label}</CardDescription>
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
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-white/10 bg-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
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
        <div>
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
            />
            <Stat
              label="Download → signup"
              value={conversion !== null ? pct(conversion) : '—'}
              sub={
                conversion !== null
                  ? `${signupsInDownloadWindow.toLocaleString()} signups / ${downloadsTotal.toLocaleString()} downloads`
                  : 'needs App Store data'
              }
            />
            <Stat
              label="Activated"
              value={pct(analytics.totals.activationRate)}
              sub={`${analytics.totals.activatedUsers.toLocaleString()} of ${analytics.totals.users.toLocaleString()} users ever did a key action`}
            />
          </div>

          <Panel title="New signups per day" hint="Accounts created (profile row).">
            <LineChart
              data={signups}
              series={[
                { key: 'count', label: 'Signups', color: 'var(--chart-2)', area: true },
              ]}
            />
          </Panel>

          <Panel title="Cumulative users">
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
                    sub={`${activatedFirstWeek} of ${el} users with a full first week`}
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
              } users did nothing in week 1`}
            />
          </div>

          <Panel
            title="Key actions — users reached"
            hint="Distinct users who performed each action within their first 7 days (bar) — hover for all-time."
          >
            <BarChart
              data={analytics.activation.byAction.map((a) => ({
                label: a.label.replace(' ', '\n'),
                value: a.usersFirst7d,
                sub: `${a.usersFirst7d} in first 7 days · ${a.users} ever`,
              }))}
            />
          </Panel>

          <Panel
            title="Meaningful actions in first 7 days"
            hint="How many key actions each new user completed in their first week (users with a full week elapsed)."
          >
            <BarChart
              data={analytics.activation.firstWeek.buckets.map((b) => ({
                label: `${b.bucket} action${b.bucket === '1' ? '' : 's'}`,
                value: b.users,
                sub: `${b.users} users`,
              }))}
              color="var(--chart-4)"
            />
          </Panel>

          <Panel
            title="Activation rate by signup week"
            hint="Share of each weekly signup cohort that did ≥1 key action within 7 days."
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
            <Stat label="DAU" value={analytics.active.current.dau.toLocaleString()} sub="today, Central" />
            <Stat label="WAU" value={analytics.active.current.wau.toLocaleString()} sub="last 7 days" />
            <Stat label="MAU" value={analytics.active.current.mau.toLocaleString()} sub="last 30 days" />
            <Stat
              label="DAU / WAU"
              value={pct(analytics.active.current.ratio)}
              sub="stickiness"
            />
          </div>

          <Panel
            title="Daily active users"
            hint="Active = performed a key action that day. New = signed up the same day."
          >
            <LineChart
              data={activeDaily}
              series={[
                { key: 'total', label: 'Total', color: 'var(--chart-2)', area: true },
                { key: 'new', label: 'New', color: 'var(--chart-1)' },
              ]}
            />
          </Panel>

          <Panel title="Weekly active users" hint="Rolling 7-day distinct active users.">
            <LineChart
              data={wau}
              series={[
                { key: 'count', label: 'WAU', color: 'var(--chart-3)', area: true },
              ]}
            />
          </Panel>

          <Panel title="Stickiness (DAU / WAU)">
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
              />
            ))}
          </div>

          <Panel
            title="Weekly cohort retention"
            hint="Rows = signup week. Wn = share of that cohort active during the nth week after signing up."
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
