import Image from 'next/image'
import { requireModerator } from '@/lib/auth'
import { NavLinks } from '@/components/admin-layout/nav-links'
import { SignOutButton } from '@/components/admin-layout/sign-out-button'
import { MobileNav } from '@/components/admin-layout/mobile-nav'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const moderator = await requireModerator()
  const moderatorLabel = moderator.displayName ?? moderator.username

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <div className="relative h-7 w-7 overflow-hidden rounded-md">
            <Image src="/app-icon.png" alt="" fill sizes="28px" className="object-cover" />
          </div>
          <span className="font-semibold">ShowMe STL Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks />
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-3">
            <p className="truncate text-sm font-medium">{moderatorLabel}</p>
            <p className="truncate text-xs text-white/40">{moderator.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4 md:hidden">
          <div className="relative h-6 w-6 overflow-hidden rounded-md">
            <Image src="/app-icon.png" alt="" fill sizes="24px" className="object-cover" />
          </div>
          <span className="font-semibold">ShowMe STL Admin</span>
        </div>
        <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <MobileNav moderatorLabel={moderatorLabel} />
      <Toaster />
    </div>
  )
}
