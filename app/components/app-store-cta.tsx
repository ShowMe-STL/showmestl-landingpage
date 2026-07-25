'use client'

import * as React from 'react'
import { AppStoreButton } from './app-store-button'
import { InstallQrModal } from './install-qr-modal'

interface AppStoreCtaProps {
  href: string
  desktopBreakpoint?: number
}

export function AppStoreCta({ href, desktopBreakpoint = 1024 }: AppStoreCtaProps) {
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
      <a href={href} onClick={handleClick}>
        <AppStoreButton />
      </a>
      <InstallQrModal href={href} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
