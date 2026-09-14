'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, NavLinks } from '@/components/admin-layout/nav-links'
import { SignOutButton } from '@/components/admin-layout/sign-out-button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const PRIMARY_HREFS = ['/admin', '/admin/places', '/admin/events']

export function MobileNav({
  moderatorLabel,
}: {
  moderatorLabel: string
}) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const primaryItems = NAV_ITEMS.filter((item) =>
    PRIMARY_HREFS.includes(item.href),
  )
  const overflowItems = NAV_ITEMS.filter(
    (item) => !PRIMARY_HREFS.includes(item.href),
  )
  const overflowActive = overflowItems.some((item) =>
    pathname.startsWith(item.href),
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[100] flex items-stretch border-t border-white/10 bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {primaryItems.map((item) => {
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
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium',
              active ? 'text-white' : 'text-white/50',
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium',
            overflowActive ? 'text-white' : 'text-white/50',
          )}
        >
          <Menu className="h-5 w-5" />
          More
        </button>
        <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-4">
            <NavLinks
              items={overflowItems}
              onNavigate={() => setMoreOpen(false)}
            />
            <div className="border-t border-border pt-3">
              <p className="truncate px-3 text-sm font-medium">
                {moderatorLabel}
              </p>
              <SignOutButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
