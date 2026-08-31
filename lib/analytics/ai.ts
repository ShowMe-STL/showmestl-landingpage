import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  dayKey,
  daysBetween,
  eachDay,
  fetchAll,
  median,
} from '@/lib/analytics/shared'

// ShowMe AI usage, measured from our own tables (showme_ai_chats / _messages /
// _response_jobs). Dollar cost lives in lib/analytics/openai.ts.

export type AiAnalytics = {
  today: string
  users: {
    total: number
    shareOfAllUsers: number
    activeLast7: number
    activeLast30: number
    repeat: number
    repeatShare: number
  }
  messages: {
    userMessages: number
    assistantMessages: number
    chats: number
    perUser: number
    perChat: number
    medianPerUser: number
    distribution: { bucket: string; users: number }[]
  }
  reliability: {
    jobs: number
    failed: number
    failureRate: number
    p50LatencySec: number | null
    p90LatencySec: number | null
  }
  daily: { day: string; messages: number; users: number }[]
  coverageStart: string | null
}

const DIST_BUCKETS: { label: string; test: (n: number) => boolean }[] = [
  { label: '1', test: (n) => n === 1 },
  { label: '2–5', test: (n) => n >= 2 && n <= 5 },
  { label: '6–20', test: (n) => n >= 6 && n <= 20 },
  { label: '21+', test: (n) => n >= 21 },
]

export async function getAiAnalytics(): Promise<AiAnalytics> {
  const supabase = createAdminClient()
  const today = dayKey(new Date())

  const [profileCount, chatRows, messageRows, jobRows] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    fetchAll<{ id: string; user_id: string; created_at: string }>((f, t) =>
      supabase
        .from('showme_ai_chats')
        .select('id, user_id, created_at')
        .order('created_at')
        .range(f, t),
    ),
    fetchAll<{ chat_id: string; role: string; created_at: string }>((f, t) =>
      supabase
        .from('showme_ai_messages')
        .select('chat_id, role, created_at')
        .order('created_at')
        .range(f, t),
    ),
    fetchAll<{
      status: string
      started_at: string | null
      completed_at: string | null
    }>((f, t) =>
      supabase
        .from('showme_ai_response_jobs')
        .select('status, started_at, completed_at')
        .order('created_at')
        .range(f, t),
    ),
  ])

  const totalAccounts = profileCount.count ?? 0
  const chatUser = new Map<string, string>()
  for (const c of chatRows) chatUser.set(c.id, c.user_id)

  // Per-user user-message counts and per-user active days.
  const msgsByUser = new Map<string, number>()
  const daysByUser = new Map<string, Set<string>>()
  const msgsByDay = new Map<string, number>()
  const usersByDay = new Map<string, Set<string>>()
  let userMessages = 0
  let assistantMessages = 0
  let earliest: string | null = null

  for (const m of messageRows) {
    const isUser = m.role === 'user'
    if (isUser) userMessages += 1
    else if (m.role === 'assistant') assistantMessages += 1
    if (!isUser) continue

    const uid = chatUser.get(m.chat_id)
    if (!uid) continue
    const day = dayKey(m.created_at)
    if (!earliest || day < earliest) earliest = day

    msgsByUser.set(uid, (msgsByUser.get(uid) ?? 0) + 1)
    if (!daysByUser.has(uid)) daysByUser.set(uid, new Set())
    daysByUser.get(uid)!.add(day)

    msgsByDay.set(day, (msgsByDay.get(day) ?? 0) + 1)
    if (!usersByDay.has(day)) usersByDay.set(day, new Set())
    usersByDay.get(day)!.add(uid)
  }

  const aiUsers = [...msgsByUser.keys()]
  const counts = [...msgsByUser.values()]

  const activeWithin = (n: number) => {
    let s = 0
    for (const days of daysByUser.values()) {
      if ([...days].some((d) => daysBetween(d, today) < n)) s += 1
    }
    return s
  }

  const repeat = [...daysByUser.values()].filter((d) => d.size >= 2).length

  const distribution = DIST_BUCKETS.map((b) => ({
    bucket: b.label,
    users: counts.filter(b.test).length,
  }))

  // Job reliability + latency.
  const latencies: number[] = []
  let failed = 0
  for (const j of jobRows) {
    if (j.status === 'failed' || j.status === 'error') failed += 1
    if (j.started_at && j.completed_at) {
      const ms = Date.parse(j.completed_at) - Date.parse(j.started_at)
      if (ms >= 0 && ms < 1000 * 60 * 30) latencies.push(ms / 1000)
    }
  }
  latencies.sort((a, b) => a - b)
  const pct = (p: number) =>
    latencies.length
      ? latencies[Math.min(latencies.length - 1, Math.floor((p / 100) * latencies.length))]
      : null

  const daily = earliest
    ? eachDay(earliest, today).map((day) => ({
        day,
        messages: msgsByDay.get(day) ?? 0,
        users: usersByDay.get(day)?.size ?? 0,
      }))
    : []

  return {
    today,
    users: {
      total: aiUsers.length,
      shareOfAllUsers: totalAccounts ? aiUsers.length / totalAccounts : 0,
      activeLast7: activeWithin(7),
      activeLast30: activeWithin(30),
      repeat,
      repeatShare: aiUsers.length ? repeat / aiUsers.length : 0,
    },
    messages: {
      userMessages,
      assistantMessages,
      chats: chatRows.length,
      perUser: aiUsers.length ? userMessages / aiUsers.length : 0,
      perChat: chatRows.length ? userMessages / chatRows.length : 0,
      medianPerUser: median(counts),
      distribution,
    },
    reliability: {
      jobs: jobRows.length,
      failed,
      failureRate: jobRows.length ? failed / jobRows.length : 0,
      p50LatencySec: pct(50),
      p90LatencySec: pct(90),
    },
    daily,
    coverageStart: earliest,
  }
}
