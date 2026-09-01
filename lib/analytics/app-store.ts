import 'server-only'
import { gunzipSync } from 'node:zlib'
import { sign as cryptoSign } from 'node:crypto'

// App Store Connect — first-time downloads via the Sales Reports API. Powers the
// "Downloads" count, the downloads chart, and the download -> signup conversion
// rate. Needs four env vars (see .env.local.example); when any is missing the
// dashboard renders an "unconfigured" state instead.
//
// The SALES/SUMMARY report is per *vendor account* — one file has rows for every
// app under the vendor number — so rows are filtered to ShowMe STL's Apple ID
// (from the App Store URL, id6760572115). Override with
// APP_STORE_CONNECT_APP_APPLE_ID if the app ID ever changes.
//
// All-time is stitched together from MONTHLY reports for every complete month
// plus DAILY reports for the current (partial) month. Report TSVs lag ~24-48h,
// so we never ask for the last two days.

const TZ = 'America/Chicago'
const dayFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const APP_APPLE_ID = process.env.APP_STORE_CONNECT_APP_APPLE_ID ?? '6760572115'

// How far back to look for the first monthly report when
// APP_STORE_CONNECT_FIRST_MONTH isn't set. Pre-launch months just 404 (→ 0).
const DEFAULT_LOOKBACK_MONTHS = 15

// Product Type Identifiers that count as a first-time download (an "app unit"),
// per Apple's Product Type Identifiers reference. Re-downloads (3, 3F) and
// updates (7, 7F, 7T, F7) are deliberately excluded. For a free consumer iOS
// app in practice only "1F" ever shows up; the rest are here for completeness
// (iPad-only "1T", legacy "1", Mac "F1", custom/B2B apps, app bundles).
const FIRST_TIME = new Set([
  '1',
  '1F',
  '1T',
  '1E',
  '1EP',
  '1EU',
  '1-B',
  'F1',
  'F1-B',
])

export type AppStoreDownloads = {
  configured: boolean
  error?: string
  /** Daily first-time downloads for the chart window (oldest first). */
  daily: { day: string; downloads: number }[]
  /** Sum of first-time downloads across all available history, or null. */
  allTime: number | null
  /** Earliest date (YYYY-MM-DD) a report was available for, or null. */
  coverageStart: string | null
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function buildJwt(issuerId: string, keyId: string, privateKey: string): string {
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 15 * 60,
    aud: 'appstoreconnect-v1',
  }
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload),
  )}`
  // p8 keys pasted into env often arrive with literal "\n" — normalise both.
  const key = privateKey.includes('\\n')
    ? privateKey.replace(/\\n/g, '\n')
    : privateKey
  const signature = cryptoSign('sha256', Buffer.from(unsigned), {
    key,
    dsaEncoding: 'ieee-p1363',
  })
  return `${unsigned}.${base64url(signature)}`
}

function parseReport(tsv: string): number {
  const lines = tsv.split('\n').filter(Boolean)
  if (lines.length < 2) return 0
  const header = lines[0].split('\t')
  const unitsIdx = header.indexOf('Units')
  const typeIdx = header.indexOf('Product Type Identifier')
  // "Apple Identifier" is the numeric app ID column. If Apple ever renames it we
  // fall back to counting every app rather than silently returning zero.
  const appIdIdx = header.indexOf('Apple Identifier')
  if (unitsIdx === -1 || typeIdx === -1) return 0
  let total = 0
  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split('\t')
    if (!FIRST_TIME.has(cols[typeIdx]?.trim())) continue
    if (appIdIdx !== -1 && cols[appIdIdx]?.trim() !== APP_APPLE_ID) continue
    total += Number(cols[unitsIdx]) || 0
  }
  return total
}

type ReportResult = { downloads: number } | 'missing' | 'error'

async function fetchReport(
  token: string,
  vendorNumber: string,
  frequency: 'DAILY' | 'MONTHLY',
  reportDate: string,
): Promise<ReportResult> {
  const params = new URLSearchParams({
    'filter[frequency]': frequency,
    'filter[reportType]': 'SALES',
    'filter[reportSubType]': 'SUMMARY',
    'filter[vendorNumber]': vendorNumber,
    'filter[reportDate]': reportDate,
  })
  const res = await fetch(
    `https://api.appstoreconnect.apple.com/v1/salesReports?${params}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/a-gzip' },
      // A published report for a past date never changes; cache hard so the
      // dashboard doesn't replay dozens of requests on every load.
      next: { revalidate: frequency === 'MONTHLY' ? 24 * 60 * 60 : 12 * 60 * 60 },
    },
  )
  if (res.status === 404) return 'missing'
  if (!res.ok) return 'error'
  try {
    const buf = Buffer.from(await res.arrayBuffer())
    return { downloads: parseReport(gunzipSync(buf).toString('utf8')) }
  } catch {
    return 'error'
  }
}

async function runChunked<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))))
  }
  return out
}

function ymd(date: Date): string {
  return dayFmt.format(date)
}

export async function getAppStoreDownloads(
  chartDays = 30,
): Promise<AppStoreDownloads> {
  const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID
  const privateKey = process.env.APP_STORE_CONNECT_PRIVATE_KEY
  const vendorNumber = process.env.APP_STORE_CONNECT_VENDOR_NUMBER

  const empty = { daily: [], allTime: null, coverageStart: null }

  if (!issuerId || !keyId || !privateKey || !vendorNumber) {
    return { configured: false, ...empty }
  }

  let token: string
  try {
    token = buildJwt(issuerId, keyId, privateKey)
  } catch (err) {
    return {
      configured: true,
      error: `Could not sign the App Store Connect token: ${
        err instanceof Error ? err.message : 'unknown error'
      }`,
      ...empty,
    }
  }

  const todayKey = ymd(new Date())
  const [curY, curM] = todayKey.split('-').map(Number)
  const monthStartKey = `${curY}-${String(curM).padStart(2, '0')}-01`

  // Daily reports: cover the chart window, the whole current month, AND the whole
  // previous month. That last part matters because Apple doesn't publish a
  // month's MONTHLY report until a few days into the next month — so from the 1st
  // to ~the 5th "last month" has no monthly report and we reconstruct its total
  // by summing dailies instead. Iterated from noon UTC so day steps never land on
  // a DST-shifted instant.
  const noon = (ms: number) => {
    const [y, m, d] = ymd(new Date(ms)).split('-').map(Number)
    return Date.UTC(y, m - 1, d, 12)
  }
  const lastDailyMs = noon(Date.now() - 2 * 86_400_000)
  const prevMonthStartMs = Date.UTC(
    curM === 1 ? curY - 1 : curY,
    curM === 1 ? 11 : curM - 2,
    1,
    12,
  )
  const dailyStartMs = Math.min(
    noon(Date.now() - (chartDays + 2) * 86_400_000),
    prevMonthStartMs,
  )
  const dailyDates: string[] = []
  for (let ms = dailyStartMs; ms <= lastDailyMs; ms += 86_400_000) {
    dailyDates.push(ymd(new Date(ms)))
  }

  // Monthly reports: every complete month from the configured/guessed first
  // month up to last month.
  const firstMonth =
    process.env.APP_STORE_CONNECT_FIRST_MONTH ??
    (() => {
      const d = new Date(Date.UTC(curY, curM - 1 - DEFAULT_LOOKBACK_MONTHS, 1))
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    })()
  const monthDates: string[] = []
  {
    const [fy, fm] = firstMonth.split('-').map(Number)
    for (
      let y = fy, m = fm;
      y < curY || (y === curY && m < curM);
      m === 12 ? ((y += 1), (m = 1)) : (m += 1)
    ) {
      monthDates.push(`${y}-${String(m).padStart(2, '0')}`)
    }
  }

  const [dailyResults, monthResults] = await Promise.all([
    runChunked(dailyDates, 6, (d) => fetchReport(token, vendorNumber, 'DAILY', d)),
    runChunked(monthDates, 6, (m) =>
      fetchReport(token, vendorNumber, 'MONTHLY', m),
    ),
  ])

  let errors = 0
  let coverageStart: string | null = null
  const note = (date: string) => {
    if (!coverageStart || date < coverageStart) coverageStart = date
  }

  const dailyAll: { day: string; downloads: number }[] = []
  dailyResults.forEach((r, i) => {
    if (r === 'error') errors += 1
    else if (r === 'missing') dailyAll.push({ day: dailyDates[i], downloads: 0 })
    else {
      dailyAll.push({ day: dailyDates[i], downloads: r.downloads })
      note(dailyDates[i])
    }
  })

  // Downloads per calendar month reconstructed from the daily reports — the
  // fallback for any complete month whose MONTHLY report Apple hasn't published
  // yet (or that errored).
  const dailyByMonth = new Map<string, number>()
  for (const d of dailyAll) {
    const mk = d.day.slice(0, 7)
    dailyByMonth.set(mk, (dailyByMonth.get(mk) ?? 0) + d.downloads)
  }

  let completeMonthsTotal = 0
  monthResults.forEach((r, i) => {
    const mk = monthDates[i]
    if (r !== 'missing' && r !== 'error') {
      completeMonthsTotal += r.downloads
      if (r.downloads > 0) note(`${mk}-01`)
      return
    }
    if (r === 'error') errors += 1
    // MONTHLY unavailable: pre-launch months have no dailies either (→ 0);
    // a just-ended month gets its total from the dailies we fetched above.
    const fromDaily = dailyByMonth.get(mk) ?? 0
    completeMonthsTotal += fromDaily
    if (fromDaily > 0) note(`${mk}-01`)
  })

  const gotAnything =
    dailyAll.some((d) => d.downloads > 0) ||
    completeMonthsTotal > 0 ||
    coverageStart

  if (!gotAnything && errors > 0) {
    return {
      configured: true,
      error:
        'App Store Connect returned no usable sales reports. Check the vendor number and that the key has the Sales and Reports role.',
      ...empty,
    }
  }

  const currentMonthDaily = dailyByMonth.get(monthStartKey.slice(0, 7)) ?? 0

  const chartCutoffMs = Date.now() - (chartDays + 2) * 86_400_000
  const daily = dailyAll.filter(
    (d) => Date.parse(`${d.day}T12:00:00Z`) >= chartCutoffMs,
  )

  return {
    configured: true,
    error:
      errors > 0
        ? `${errors} report(s) could not be read; totals may be low.`
        : undefined,
    daily,
    allTime: completeMonthsTotal + currentMonthDaily,
    coverageStart,
  }
}
