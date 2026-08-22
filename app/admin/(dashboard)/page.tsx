import Link from 'next/link'
import { MapPin, CalendarDays, ListMusic, Users, Tags } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

export default async function OverviewPage() {
  const counts = await getCounts()

  const stats = [
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
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-white/50">
          A snapshot of what&apos;s live in ShowMeSTL right now.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="border-white/10 bg-card transition-colors hover:border-white/25">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <Icon className="h-4 w-4 text-white/40" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-3xl">{stat.value}</CardTitle>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="border-white/10 bg-card">
        <CardHeader>
          <CardTitle>Getting around</CardTitle>
          <CardDescription>
            Places and events are curated content — the mobile app only reads
            them, so anything you add, edit, or remove here shows up for
            everyone immediately. Categories, neighborhoods, and dress codes are
            the shared lookup lists used across both.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
