import 'server-only'
import { gunzipSync } from 'node:zlib'
import { sign as cryptoSign } from 'node:crypto'

// App Store Connect — daily first-time downloads via the Sales Reports API.
// Used to show downloads and the download -> signup conversion rate. Needs four
// env vars (see .env.local.example); when any is missing the dashboard just
// renders an "unconfigured" state instead of this data.
//
// The SALES/SUMMARY report is per *vendor account* — one daily file contains
// rows for every app under the vendor number — so we filter rows to ShowMe
// STL's Apple ID (from the App Store URL, id6760572115). Override with
// APP_STORE_CONNECT_APP_APPLE_ID if the app ID ever changes.
//
// Sales report TSVs lag ~24-48h, so we only ask for days up to two days back.

const APP_APPLE_ID = process.env.APP_STORE_CONNECT_APP_APPLE_ID ?? '6760572115'

const TZ = 'America/Chicago'
const dayFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

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
  daily: { day: string; downloads: number }[]
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

function parseDownloads(tsv: string): number {
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

async function fetchDay(
  token: string,
  vendorNumber: string,
  day: string,
): Promise<number | null> {
  const params = new URLSearchParams({
    'filter[frequency]': 'DAILY',
    'filter[reportType]': 'SALES',
    'filter[reportSubType]': 'SUMMARY',
    'filter[vendorNumber]': vendorNumber,
    'filter[reportDate]': day,
  })
  const res = await fetch(
    `https://api.appstoreconnect.apple.com/v1/salesReports?${params}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/a-gzip' },
      // Sales data for a given day never changes once published; a long cache
      // keeps the dashboard from replaying dozens of requests on every load.
      next: { revalidate: 12 * 60 * 60 },
    },
  )
  // 404 = no report for that day yet (or no sales); treat as zero.
  if (res.status === 404) return 0
  if (!res.ok) return null
  const buf = Buffer.from(await res.arrayBuffer())
  try {
    return parseDownloads(gunzipSync(buf).toString('utf8'))
  } catch {
    return null
  }
}

export async function getAppStoreDownloads(days = 30): Promise<AppStoreDownloads> {
  const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID
  const privateKey = process.env.APP_STORE_CONNECT_PRIVATE_KEY
  const vendorNumber = process.env.APP_STORE_CONNECT_VENDOR_NUMBER

  if (!issuerId || !keyId || !privateKey || !vendorNumber) {
    return { configured: false, daily: [] }
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
      daily: [],
    }
  }

  const targetDays: string[] = []
  for (let i = 2; i < days + 2; i += 1) {
    targetDays.push(dayFmt.format(new Date(Date.now() - i * 86_400_000)))
  }
  targetDays.reverse()

  const daily: { day: string; downloads: number }[] = []
  let failures = 0
  const chunkSize = 6
  for (let i = 0; i < targetDays.length; i += chunkSize) {
    const chunk = targetDays.slice(i, i + chunkSize)
    const results = await Promise.all(
      chunk.map((day) => fetchDay(token, vendorNumber, day)),
    )
    results.forEach((downloads, j) => {
      if (downloads === null) failures += 1
      else daily.push({ day: chunk[j], downloads })
    })
  }

  if (daily.length === 0) {
    return {
      configured: true,
      error:
        'App Store Connect returned no usable sales reports. Check the vendor number and that the key has the Sales role.',
      daily: [],
    }
  }

  return {
    configured: true,
    error:
      failures > 0
        ? `${failures} day(s) of report data could not be read.`
        : undefined,
    daily,
  }
}
