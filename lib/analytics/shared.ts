import 'server-only'

// Shared helpers for the admin analytics modules. Days are bucketed in
// America/Chicago so the numbers line up with how the team thinks about "a day".

const TZ = 'America/Chicago'

const dayFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function dayKey(iso: string | Date): string {
  return dayFmt.format(typeof iso === 'string' ? new Date(iso) : iso)
}

// Anchor day keys at noon UTC so adding/subtracting whole days never lands on a
// timestamp that a US timezone formats back to the neighbouring calendar day.
function keyToUTC(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Date.UTC(y, m - 1, d, 12)
}

export function addDays(key: string, n: number): string {
  return dayFmt.format(new Date(keyToUTC(key) + n * 86_400_000))
}

export function daysBetween(from: string, to: string): number {
  return Math.round((keyToUTC(to) - keyToUTC(from)) / 86_400_000)
}

export function mondayOf(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
  return addDays(key, -dow)
}

export function eachDay(from: string, to: string): string[] {
  const out: string[] = []
  for (let k = from; k <= to && out.length < 4000; k = addDays(k, 1)) out.push(k)
  return out
}

export function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

// Drains a Supabase select past the 1000-row cap by walking .range() windows.
export async function fetchAll<T>(
  build: (from: number, to: number) => Page<T>,
): Promise<T[]> {
  const pageSize = 1000
  const out: T[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    out.push(...data)
    if (data.length < pageSize) break
  }
  return out
}
