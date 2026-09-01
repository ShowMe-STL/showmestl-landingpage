import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  addDays,
  dayKey,
  daysBetween,
  eachDay,
  fetchAll,
  mondayOf,
} from '@/lib/analytics/shared'

// Funnel / growth analytics for the admin dashboard. Everything is computed in
// process by paginating the raw event tables — fine at our current scale and
// keeps the query surface trivial.

export type ActionType =
  | 'ai_message'
  | 'place_check_in'
  | 'event_check_in'
  | 'check_in_comment'
  | 'liked_place'
  | 'playlist_created'
  | 'playlist_saved'
  | 'friend_added'
  | 'crowd_created'

export const ACTION_LABELS: Record<ActionType, string> = {
  ai_message: 'AI messages',
  place_check_in: 'Place check-ins',
  event_check_in: 'Event check-ins',
  check_in_comment: 'Check-in comments',
  liked_place: 'Liked places',
  playlist_created: 'Playlists created',
  playlist_saved: 'Playlists saved',
  friend_added: 'Friends added',
  crowd_created: 'Crowds created',
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
  coverage: {
    /** Earliest day any tracked action occurred. */
    activityFrom: string
    /** Day the signups chart starts (post-migration). */
    signupsFrom: string
    /** created_at of the very first account (the migration import day). */
    firstAccount: string
  }
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
      events: number
    }[]
    firstWeek: {
      /** Only counts users who signed up on/after this day (post-migration). */
      since: string
      /** Last signup day whose 7-day window has fully elapsed (today - 7). */
      through: string
      /** Post-migration accounts with a complete first week — the denominator. */
      eligible: number
      /** Post-migration accounts still inside their first 7 days (not counted). */
      inProgress: number
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
    current: {
      dau: number
      wau: number
      mau: number
      /** Mean DAU over the last 7 complete days (today excluded when possible). */
      avgDau: number
      /** avgDau ÷ WAU for that same week — stickiness on a typical day. */
      ratio: number
    }
  }
  retention: {
    weekOffsets: number[]
    headline: { day: 1 | 7 | 30; eligible: number; retained: number; rate: number }[]
    cohorts: { week: string; size: number; values: (number | null)[] }[]
  }
}

type Ev = { userId: string; day: string; type: ActionType }

export async function getGrowthAnalytics(): Promise<GrowthAnalytics> {
  const supabase = createAdminClient()
  const today = dayKey(new Date())

  const [
    profileRows,
    checkInRows,
    commentRows,
    likedPlaceRows,
    playlistRows,
    savedRows,
    friendshipRows,
    crowdRows,
    aiRows,
  ] = await Promise.all([
    fetchAll<{ id: string; created_at: string }>((f, t) =>
      supabase.from('profiles').select('id, created_at').order('created_at').range(f, t),
    ),
    fetchAll<{
      user_id: string
      started_at: string
      event_id: number | null
      archived_event_id: number | null
    }>((f, t) =>
      supabase
        .from('check_ins')
        .select('user_id, started_at, event_id, archived_event_id')
        .order('started_at')
        .range(f, t),
    ),
    fetchAll<{ user_id: string; created_at: string }>((f, t) =>
      supabase.from('check_in_comments').select('user_id, created_at').order('created_at').range(f, t),
    ),
    fetchAll<{ user_id: string; created_at: string }>((f, t) =>
      supabase.from('liked_places').select('user_id, created_at').order('created_at').range(f, t),
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
    fetchAll<{ user_id_a: string; user_id_b: string; created_at: string }>((f, t) =>
      supabase
        .from('friendships')
        .select('user_id_a, user_id_b, created_at')
        .order('created_at')
        .range(f, t),
    ),
    fetchAll<{ owner_id: string; created_at: string }>((f, t) =>
      supabase
        .from('crowds')
        .select('owner_id, created_at')
        .order('created_at')
        .range(f, t),
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

  for (const r of checkInRows) {
    const isEvent = r.event_id != null || r.archived_event_id != null
    pushEv(r.user_id, r.started_at, isEvent ? 'event_check_in' : 'place_check_in')
  }
  for (const r of commentRows) pushEv(r.user_id, r.created_at, 'check_in_comment')
  for (const r of likedPlaceRows) pushEv(r.user_id, r.created_at, 'liked_place')
  for (const r of playlistRows) pushEv(r.owner_id, r.created_at, 'playlist_created')
  for (const r of savedRows) pushEv(r.user_id, r.created_at, 'playlist_saved')
  for (const r of crowdRows) pushEv(r.owner_id, r.created_at, 'crowd_created')
  for (const r of friendshipRows) {
    // One friendship row = both people gained a friend at that moment.
    pushEv(r.user_id_a, r.created_at, 'friend_added')
    pushEv(r.user_id_b, r.created_at, 'friend_added')
  }
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
  const eventCountByType = new Map<ActionType, number>()
  for (const ev of events) {
    eventCountByType.set(ev.type, (eventCountByType.get(ev.type) ?? 0) + 1)
  }
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
      events: eventCountByType.get(type) ?? 0,
    }
  }).sort((a, b) => b.users - a.users)

  // First-week activation is only meaningful for accounts whose real first week
  // we actually tracked — i.e. those that signed up after the migration import.
  // Migration accounts are stamped 2026-08-08 with no genuine onboarding window.
  const firstWeekEligibleUsers = [...signupDay.entries()].filter(
    ([, day]) => day >= SIGNUP_TIMELINE_START && daysBetween(day, today) >= 7,
  )
  const firstWeekInProgress = [...signupDay.values()].filter(
    (day) => day >= SIGNUP_TIMELINE_START && daysBetween(day, today) < 7,
  ).length
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
    // Only weeks that start on/after the migration cutoff — the migration import
    // shares a calendar week with the cutoff, so anything earlier is dominated
    // by untracked v1 accounts.
    .filter(
      ([wk]) =>
        wk >= SIGNUP_TIMELINE_START && daysBetween(addDays(wk, 6), today) >= 7,
    )
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

  // Stickiness off a *typical* day, not today's still-filling-in count: mean DAU
  // over the last 7 complete days (drop today when we have the history), divided
  // by the WAU for that same window.
  const stickWindow =
    activeDays.length > 7 ? activeDays.slice(-8, -1) : activeDays.slice(-7)
  const avgDau = stickWindow.length
    ? stickWindow.reduce((s, d) => s + (activeByDay.get(d)?.size ?? 0), 0) /
      stickWindow.length
    : 0
  const stickWau = stickWindow.length
    ? rollingDistinct(stickWindow[stickWindow.length - 1], stickWindow.length)
    : 0

  const current = {
    dau: activeByDay.get(today)?.size ?? 0,
    wau: rollingDistinct(today, 7),
    mau: rollingDistinct(today, 30),
    avgDau: Math.round(avgDau * 10) / 10,
    ratio: stickWau ? avgDau / stickWau : 0,
  }

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
    coverage: {
      activityFrom: activeFrom,
      signupsFrom: timelineStart,
      firstAccount: firstDay,
    },
    totals: {
      users: totalUsers,
      activatedUsers,
      activationRate: totalUsers ? activatedUsers / totalUsers : 0,
    },
    signups,
    activation: {
      byAction,
      firstWeek: {
        since: SIGNUP_TIMELINE_START,
        through: addDays(today, -7),
        eligible: firstWeekEligibleUsers.length,
        inProgress: firstWeekInProgress,
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
