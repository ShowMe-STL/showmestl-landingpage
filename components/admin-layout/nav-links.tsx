'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  ListMusic,
  Tags,
  Building2,
  Shirt,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/places', label: 'Places', icon: MapPin },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/neighborhoods', label: 'Neighborhoods', icon: Building2 },
  { href: '/admin/dress-codes', label: 'Dress codes', icon: Shirt },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/moderators', label: 'Moderators', icon: ShieldCheck },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-white text-black'
                : 'text-white/60 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
