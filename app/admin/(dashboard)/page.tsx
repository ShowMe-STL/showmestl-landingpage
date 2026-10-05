import Link from 'next/link'
import {
  MapPin,
  CalendarDays,
  ListMusic,
  Users,
  Tags,
  ArrowDownToLine,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getGrowthAnalytics } from '@/lib/analytics/growth'
import { getAppStoreDownloads, type AppStoreDownloads } from '@/lib/analytics/app-store'
import { getAiAnalytics, type AiAnalytics } from '@/lib/analytics/ai'
import { getOpenAiSpend, type OpenAiSpend } from '@/lib/analytics/openai'
import { GrowthDashboard } from '@/components/analytics/growth-dashboard'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Live dashboard — always rendered per request, never prerendered at build.
export const dynamic = 'force-dynamic'

async function getCounts() {
  const supabase = createAdminClient()

  const [
    places,
    events,
    playlists,
    profiles,
    placeCategories,
    eventCategories,
  ] = await Promise.all([
    supabase.from('places').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('playlists').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('place_categories')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('event_categories')
      .select('id', { count: 'exact', head: true }),
  ])

  return {
    places: places.count ?? 0,
    events: events.count ?? 0,
    playlists: playlists.count ?? 0,
    profiles: profiles.count ?? 0,
    categories: (placeCategories.count ?? 0) + (eventCategories.count ?? 0),
  }
}

async function getAppStoreSafely(): Promise<AppStoreDownloads> {
  try {
    return await getAppStoreDownloads(30)
  } catch (err) {
    return {
      configured: true,
      error: err instanceof Error ? err.message : 'App Store Connect request failed.',
      daily: [],
      allTime: null,
      coverageStart: null,
    }
  }
}

async function getAiSafely(): Promise<AiAnalytics | null> {
  try {
    return await getAiAnalytics()
  } catch {
    return null
  }
}

async function getOpenAiSafely(): Promise<OpenAiSpend> {
  try {
    return await getOpenAiSpend(30)
  } catch (err) {
    return {
      configured: true,
      error: err instanceof Error ? err.message : 'OpenAI usage request failed.',
      scope: 'organization',
      windowDays: 30,
      totalCost: null,
      daily: [],
      tokens: null,
      coverageStart: null,
    }
  }
}

function fmtMonth(key: string): string {
  return new Date(`${key.slice(0, 7)}-15T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    year: 'numeric',
  })
}

export default async function OverviewPage() {
  const [counts, analytics, appStore, ai, openai] = await Promise.all([
    getCounts(),
    getGrowthAnalytics(),
    getAppStoreSafely(),
    getAiSafely(),
    getOpenAiSafely(),
  ])

  const downloadsHint = !appStore.configured
    ? 'App Store Connect not configured'
    : appStore.allTime === null
      ? appStore.error ?? 'App Store Connect request failed'
      : `ShowMe STL first-time App Store downloads${
          appStore.coverageStart
            ? ` since ${fmtMonth(appStore.coverageStart)}`
            : ''
        } (reports lag ~1–2 days)`

  const stats: {
    label: string
    value: number | string
    href?: string
    icon: typeof MapPin
    hint?: string
  }[] = [
    {
      label: 'Places',
      value: counts.places,
      href: '/admin/places',
      icon: MapPin,
    },
    {
      label: 'Events',
      value: counts.events,
      href: '/admin/events',
      icon: CalendarDays,
    },
    {
      label: 'Playlists',
      value: counts.playlists,
      href: '/admin/playlists',
      icon: ListMusic,
    },
    {
      label: 'Users',
      value: counts.profiles,
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Categories',
      value: counts.categories,
      href: '/admin/categories',
      icon: Tags,
    },
    {
      label: 'Downloads',
      value:
        appStore.configured && appStore.allTime !== null
          ? appStore.allTime.toLocaleString()
          : '—',
      icon: ArrowDownToLine,
      hint: downloadsHint,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-white/50">
          A snapshot of what&apos;s live in ShowMeSTL right now.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const card = (
            <Card
              title={stat.hint}
              className={`h-full border-white/10 bg-card transition-colors${
                stat.href ? ' hover:border-white/25' : ''
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <Icon className="h-4 w-4 text-white/40" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardContent>
            </Card>
          )
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          )
        })}
      </div>

      <Card className="border-white/10 bg-card">
        <CardHeader>
          <CardTitle>Getting around</CardTitle>
          <CardDescription>
            The numbers above represent our live metrics within the app. Use
            this dashboard to edit, create, and delete places, events,
            playlists, categories, neighborhoods, and dress codes. To set
            something as trending within the app, just press the trending
            toggle next to the item.
          </CardDescription>
        </CardHeader>
      </Card>

      <Separator className="bg-white/10" />

      <GrowthDashboard
        analytics={analytics}
        appStore={appStore}
        ai={ai}
        openai={openai}
      />
    </div>
  )
}
