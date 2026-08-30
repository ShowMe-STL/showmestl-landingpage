import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

// Funnel / growth analytics for the admin dashboard. Everything is computed in
// process by paginating the raw event tables — fine at our current scale and
// keeps the query surface trivial. Days are bucketed in America/Chicago so the
// numbers line up with how the team thinks about "a day".

const TZ = 'America/Chicago'

const dayFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export type ActionType =
  | 'ai_message'
  | 'check_in'
  | 'check_in_comment'
  | 'playlist_created'
  | 'playlist_saved'

export const ACTION_LABELS: Record<ActionType, string> = {
  ai_message: 'AI messages',
  check_in: 'Check-ins',
  check_in_comment: 'Check-in comments',
  playlist_created: 'Playlists created',
  playlist_saved: 'Playlists saved',
}

const ACTION_TYPES = Object.keys(ACTION_LABELS) as ActionType[]

// A data migration on 2026-08-08 imported ~370 existing accounts, all stamped
// with that day's created_at — which would render as one giant fake signup
// spike. Start the signup timeline the day after; those users are still counted
// in the cumulative total (just folded into the starting baseline).
const SIGNUP_TIMELINE_START = '2026-08-09'

export type GrowthAnalytics = {
  generatedAt: string
  today: string
  totals: {
    users: number
    activatedUsers: number
    activationRate: number
  }
  signups: { day: string; count: number; cumulative: number }[]
  activation: {
    byAction: {
      type: ActionType
      label: string
      users: number
      usersFirst7d: number
    }[]
    firstWeek: {
      eligible: number
      buckets: { bucket: '0' | '1' | '2' | '3+'; users: number }[]
    }
    weeklyTrend: {
      week: string
      cohortSize: number
      activated: number
      rate: number
    }[]
  }
  active: {
    daily: { day: string; total: number; new: number; returning: number }[]
    wau: { day: string; count: number }[]
    stickiness: { day: string; ratio: number }[]
    current: { dau: number; wau: number; mau: number; ratio: number }
  }
  retention: {
    weekOffsets: number[]
    headline: { day: 1 | 7 | 30; eligible: number; retained: number; rate: number }[]
    cohorts: { week: string; size: number; values: (number | null)[] }[]
  }
}

function dayKey(iso: string | Date): string {
  return dayFmt.format(typeof iso === 'string' ? new Date(iso) : iso)
}

// Anchor day keys at noon UTC so adding/subtracting whole days never lands on a
// timestamp that a US timezone formats back to the neighbouring calendar day.
function keyToUTC(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Date.UTC(y, m - 1, d, 12)
}

function addDays(key: string, n: number): string {
  return dayFmt.format(new Date(keyToUTC(key) + n * 86_400_000))
}

function daysBetween(from: string, to: string): number {
  return Math.round((keyToUTC(to) - keyToUTC(from)) / 86_400_000)
}

function mondayOf(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
  return addDays(key, -dow)
}

function eachDay(from: string, to: string): string[] {
  const out: string[] = []
  for (let k = from; k <= to && out.length < 4000; k = addDays(k, 1)) out.push(k)
  return out
}

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

async function fetchAll<T>(build: (from: number, to: number) => Page<T>): Promise<T[]> {
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

type Ev = { userId: string; day: string; type: ActionType }

export async function getGrowthAnalytics(): Promise<GrowthAnalytics> {
  const supabase = createAdminClient()
  const today = dayKey(new Date())

  const [
    profileRows,
    checkInRows,
    commentRows,
    playlistRows,
    savedRows,
    aiRows,
  ] = await Promise.all([
    fetchAll<{ id: string; created_at: string }>((f, t) =>
      supabase.from('profiles').select('id, created_at').order('created_at').range(f, t),
    ),
    fetchAll<{ user_id: string; started_at: string }>((f, t) =>
      supabase.from('check_ins').select('user_id, started_at').order('started_at').range(f, t),
    ),
    fetchAll<{ user_id: string; created_at: string }>((f, t) =>
      supabase.from('check_in_comments').select('user_id, created_at').order('created_at').range(f, t),
    ),
    fetchAll<{ owner_id: string; created_at: string }>((f, t) =>
      supabase
        .from('playlists')
        .select('owner_id, created_at')
        .not('owner_id', 'is', null)
        .order('created_at')
        .range(f, t),
    ),
    fetchAll<{ user_id: string; created_at: string }>((f, t) =>
      supabase.from('saved_playlists').select('user_id, created_at').order('created_at').range(f, t),
    ),
    // showme_ai_messages has no user_id of its own — it hangs off the chat.
    fetchAll<{ created_at: string; chat: { user_id: string } | { user_id: string }[] | null }>(
      (f, t) =>
        supabase
          .from('showme_ai_messages')
          .select('created_at, chat:showme_ai_chats!inner(user_id)')
          .eq('role', 'user')
          .order('created_at')
          .range(f, t),
    ),
  ])

  const signupDay = new Map<string, string>()
  for (const p of profileRows) signupDay.set(p.id, dayKey(p.created_at))

  const events: Ev[] = []
  const pushEv = (userId: string | null | undefined, ts: string, type: ActionType) => {
    if (!userId) return
    events.push({ userId, day: dayKey(ts), type })
  }

  for (const r of checkInRows) pushEv(r.user_id, r.started_at, 'check_in')
  for (const r of commentRows) pushEv(r.user_id, r.created_at, 'check_in_comment')
  for (const r of playlistRows) pushEv(r.owner_id, r.created_at, 'playlist_created')
  for (const r of savedRows) pushEv(r.user_id, r.created_at, 'playlist_saved')
  for (const r of aiRows) {
    const chat = Array.isArray(r.chat) ? r.chat[0] : r.chat
    pushEv(chat?.user_id, r.created_at, 'ai_message')
  }

  // ---- Signups -------------------------------------------------------------
  const signupCounts = new Map<string, number>()
  for (const day of signupDay.values()) {
    signupCounts.set(day, (signupCounts.get(day) ?? 0) + 1)
  }
  const firstDay = profileRows.length ? dayKey(profileRows[0].created_at) : today
  const timelineStart =
    firstDay < SIGNUP_TIMELINE_START && SIGNUP_TIMELINE_START <= today
      ? SIGNUP_TIMELINE_START
      : firstDay
  let cumulative = 0
  for (const day of signupDay.values()) {
    if (day < timelineStart) cumulative += 1
  }
  const signups = eachDay(timelineStart, today).map((day) => {
    const count = signupCounts.get(day) ?? 0
    cumulative += count
    return { day, count, cumulative }
  })

  // ---- Per-user event index ----------------------------------------------
  type PerUser = { all: Ev[]; first7: Ev[] }
  const perUser = new Map<string, PerUser>()
  for (const ev of events) {
    const signup = signupDay.get(ev.userId)
    if (!signup) continue
    let bucket = perUser.get(ev.userId)
    if (!bucket) {
      bucket = { all: [], first7: [] }
      perUser.set(ev.userId, bucket)
    }
    bucket.all.push(ev)
    const offset = daysBetween(signup, ev.day)
    if (offset >= 0 && offset < 7) bucket.first7.push(ev)
  }

  const activatedUsers = [...perUser.values()].filter((u) => u.all.length > 0).length
  const totalUsers = profileRows.length

  // ---- Activation -------------------------------------------------------
  const byAction = ACTION_TYPES.map((type) => {
    const users = new Set<string>()
    const usersFirst7d = new Set<string>()
    for (const [userId, u] of perUser) {
      if (u.all.some((e) => e.type === type)) users.add(userId)
      if (u.first7.some((e) => e.type === type)) usersFirst7d.add(userId)
    }
    return {
      type,
      label: ACTION_LABELS[type],
      users: users.size,
      usersFirst7d: usersFirst7d.size,
    }
  })

  const firstWeekEligibleUsers = [...signupDay.entries()].filter(
    ([, day]) => daysBetween(day, today) >= 7,
  )
  const bucketCounts = { '0': 0, '1': 0, '2': 0, '3+': 0 }
  for (const [userId] of firstWeekEligibleUsers) {
    const n = perUser.get(userId)?.first7.length ?? 0
    if (n === 0) bucketCounts['0'] += 1
    else if (n === 1) bucketCounts['1'] += 1
    else if (n === 2) bucketCounts['2'] += 1
    else bucketCounts['3+'] += 1
  }

  // Weekly activation-rate trend: signup-week cohorts that have had a full
  // 7-day activation window for every member (week end <= today - 7).
  const weekCohorts = new Map<string, string[]>()
  for (const [userId, day] of signupDay) {
    const wk = mondayOf(day)
    const arr = weekCohorts.get(wk) ?? []
    arr.push(userId)
    weekCohorts.set(wk, arr)
  }
  const weeklyTrend = [...weekCohorts.entries()]
    .filter(([wk]) => daysBetween(addDays(wk, 6), today) >= 7)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, userIds]) => {
      const activated = userIds.filter(
        (id) => (perUser.get(id)?.first7.length ?? 0) > 0,
      ).length
      return {
        week,
        cohortSize: userIds.length,
        activated,
        rate: userIds.length ? activated / userIds.length : 0,
      }
    })

  // ---- Active users (DAU / WAU / MAU) ----------------------------------
  const activeByDay = new Map<string, Set<string>>()
  for (const ev of events) {
    let set = activeByDay.get(ev.day)
    if (!set) {
      set = new Set()
      activeByDay.set(ev.day, set)
    }
    set.add(ev.userId)
  }

  const activeFrom = events.length
    ? [...activeByDay.keys()].sort()[0]
    : today
  const activeDays = eachDay(activeFrom, today)

  const daily = activeDays.map((day) => {
    const set = activeByDay.get(day) ?? new Set<string>()
    let fresh = 0
    for (const userId of set) {
      if (signupDay.get(userId) === day) fresh += 1
    }
    return { day, total: set.size, new: fresh, returning: set.size - fresh }
  })

  const rollingDistinct = (endDay: string, windowDays: number) => {
    const start = addDays(endDay, -(windowDays - 1))
    const users = new Set<string>()
    for (let k = start; k <= endDay; k = addDays(k, 1)) {
      const set = activeByDay.get(k)
      if (set) for (const u of set) users.add(u)
    }
    return users.size
  }

  const wau = activeDays.map((day) => ({ day, count: rollingDistinct(day, 7) }))
  const stickiness = activeDays.map((day, i) => {
    const w = wau[i].count
    return { day, ratio: w ? (activeByDay.get(day)?.size ?? 0) / w : 0 }
  })

  const current = {
    dau: activeByDay.get(today)?.size ?? 0,
    wau: rollingDistinct(today, 7),
    mau: rollingDistinct(today, 30),
    ratio: 0,
  }
  current.ratio = current.wau ? current.dau / current.wau : 0

  // ---- Retention -----------------------------------------------------
  // Headline Dn = of users who signed up at least n days ago, the share that
  // performed any meaningful action on day n or later ("still around at day n").
  const headline = ([1, 7, 30] as const).map((day) => {
    let eligible = 0
    let retained = 0
    for (const [userId, signup] of signupDay) {
      if (daysBetween(signup, today) < day) continue
      eligible += 1
      const u = perUser.get(userId)
      if (u && u.all.some((e) => daysBetween(signup, e.day) >= day)) retained += 1
    }
    return { day, eligible, retained, rate: eligible ? retained / eligible : 0 }
  })

  // Weekly cohort triangle: value[n] = share of the signup-week cohort active
  // during week n after signup (days [7n, 7n+7)).
  const maxOffset = Math.max(
    0,
    ...[...weekCohorts.keys()].map((wk) => Math.floor(daysBetween(wk, today) / 7)),
  )
  const weekOffsets = Array.from({ length: Math.min(maxOffset + 1, 12) }, (_, i) => i)
  const cohorts = [...weekCohorts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, userIds]) => {
      const elapsed = Math.floor(daysBetween(week, today) / 7)
      const values = weekOffsets.map((n) => {
        if (n > elapsed) return null
        let active = 0
        for (const id of userIds) {
          const u = perUser.get(id)
          if (!u) continue
          const signup = signupDay.get(id)!
          if (
            u.all.some((e) => {
              const o = daysBetween(signup, e.day)
              return o >= n * 7 && o < n * 7 + 7
            })
          ) {
            active += 1
          }
        }
        return userIds.length ? active / userIds.length : 0
      })
      return { week, size: userIds.length, values }
    })

  return {
    generatedAt: new Date().toISOString(),
    today,
    totals: {
      users: totalUsers,
      activatedUsers,
      activationRate: totalUsers ? activatedUsers / totalUsers : 0,
    },
    signups,
    activation: {
      byAction,
      firstWeek: {
        eligible: firstWeekEligibleUsers.length,
        buckets: [
          { bucket: '0', users: bucketCounts['0'] },
          { bucket: '1', users: bucketCounts['1'] },
          { bucket: '2', users: bucketCounts['2'] },
          { bucket: '3+', users: bucketCounts['3+'] },
        ],
      },
      weeklyTrend,
    },
    active: { daily, wau, stickiness, current },
    retention: { weekOffsets, headline, cohorts },
  }
}
