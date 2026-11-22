'use client'

import * as React from 'react'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/store-links'
import { cn } from '@/lib/utils'
import { AppStoreButton } from './app-store-button'
import { InstallQrModal, type InstallStore } from './install-qr-modal'
import { PlayStoreButton } from './play-store-button'

interface StoreCtaProps {
  href: string
  store: InstallStore
  desktopBreakpoint?: number
}

export function StoreCta({ href, store, desktopBreakpoint = 1024 }: StoreCtaProps) {
  const [open, setOpen] = React.useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= desktopBreakpoint) {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <>
      <a href={href} onClick={handleClick} className="flex sm:inline-flex">
        {store === 'play-store'
          ? <PlayStoreButton className="w-full sm:w-auto" />
          : <AppStoreButton className="w-full sm:w-auto" />}
      </a>
      <InstallQrModal href={href} store={store} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function StoreBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-2.5 min-[340px]:grid-cols-2 sm:flex sm:w-auto sm:items-center sm:gap-4',
        className,
      )}
    >
      <StoreCta href={APP_STORE_URL} store="app-store" />
      <StoreCta href={PLAY_STORE_URL} store="play-store" />
    </div>
  )
}
