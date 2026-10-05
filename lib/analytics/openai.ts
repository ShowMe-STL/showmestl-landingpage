import 'server-only'
import { dayKey } from '@/lib/analytics/shared'

// Dollar cost + token usage for ShowMe AI, from the OpenAI organization
// Usage/Costs Admin API. Needs OPENAI_ADMIN_KEY (an Admin key — sk-admin-…,
// created by an org owner under Settings → Admin keys). Set OPENAI_PROJECT_ID
// to scope the numbers to the project the app runs in; otherwise the figures
// cover the whole OpenAI organization.

export type OpenAiSpend = {
  configured: boolean
  error?: string
  scope: 'organization' | 'project'
  windowDays: number
  totalCost: number | null
  daily: { day: string; cost: number }[]
  tokens: {
    input: number
    output: number
    cached: number
    requests: number
  } | null
  coverageStart: string | null
}

type Bucket = {
  start_time: number
  results: Record<string, unknown>[]
}
type Page = { data: Bucket[]; has_more?: boolean; next_page?: string | null }

async function pagedBuckets(
  path: string,
  params: URLSearchParams,
  key: string,
): Promise<Bucket[]> {
  const buckets: Bucket[] = []
  let page: string | null = null
  for (let i = 0; i < 20; i += 1) {
    const qs = new URLSearchParams(params)
    if (page) qs.set('page', page)
    const res = await fetch(`https://api.openai.com/v1/${path}?${qs}`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 6 * 60 * 60 },
    })
    if (!res.ok) {
      throw new Error(
        `OpenAI ${path} ${res.status}: ${(await res.text()).slice(0, 200)}`,
      )
    }
    const json = (await res.json()) as Page
    buckets.push(...(json.data ?? []))
    if (!json.has_more || !json.next_page) break
    page = json.next_page
  }
  return buckets
}

export async function getOpenAiSpend(days = 30): Promise<OpenAiSpend> {
  const key = process.env.OPENAI_ADMIN_KEY
  const projectId = process.env.OPENAI_PROJECT_ID
  const base: Omit<OpenAiSpend, 'configured'> = {
    scope: projectId ? 'project' : 'organization',
    windowDays: days,
    totalCost: null,
    daily: [],
    tokens: null,
    coverageStart: null,
  }

  if (!key) return { configured: false, ...base }

  const startTime = Math.floor(Date.now() / 1000) - days * 86_400

  try {
    const costParams = new URLSearchParams({
      start_time: String(startTime),
      bucket_width: '1d',
      limit: String(Math.min(180, days + 1)),
    })
    if (projectId) costParams.set('group_by', 'project_id')

    const usageParams = new URLSearchParams({
      start_time: String(startTime),
      bucket_width: '1d',
      limit: String(Math.min(31, days + 1)),
    })
    if (projectId) usageParams.set('project_ids', projectId)

    const [costBuckets, usageBuckets] = await Promise.all([
      pagedBuckets('organization/costs', costParams, key),
      pagedBuckets('organization/usage/completions', usageParams, key).catch(
        () => [] as Bucket[],
      ),
    ])

    const matchesProject = (r: Record<string, unknown>) =>
      !projectId || r.project_id === projectId || r.project_id == null

    let totalCost = 0
    let coverageStart: string | null = null
    const daily = costBuckets
      .map((b) => {
        const day = dayKey(new Date(b.start_time * 1000))
        let cost = 0
        for (const r of b.results) {
          if (!matchesProject(r)) continue
          const amount = r.amount as { value?: number } | undefined
          cost += amount?.value ?? 0
        }
        if (cost > 0 && (!coverageStart || day < coverageStart)) {
          coverageStart = day
        }
        totalCost += cost
        return { day, cost }
      })
      .sort((a, b) => a.day.localeCompare(b.day))

    const tokens = { input: 0, output: 0, cached: 0, requests: 0 }
    for (const b of usageBuckets) {
      for (const r of b.results) {
        tokens.input += Number(r.input_tokens) || 0
        tokens.output += Number(r.output_tokens) || 0
        tokens.cached += Number(r.input_cached_tokens) || 0
        tokens.requests += Number(r.num_model_requests) || 0
      }
    }

    return {
      configured: true,
      ...base,
      totalCost,
      daily,
      tokens: tokens.requests > 0 || tokens.input > 0 ? tokens : null,
      coverageStart,
    }
  } catch (err) {
    return {
      configured: true,
      ...base,
      error:
        err instanceof Error
          ? err.message
          : 'OpenAI usage request failed. Check that OPENAI_ADMIN_KEY is an Admin key.',
    }
  }
}
