import type { Metadata, Viewport } from 'next'
import { RegisterServiceWorker } from '@/components/admin-layout/register-service-worker'

export const metadata: Metadata = {
  title: 'ShowMe STL Admin',
  description: 'Manage places, events, categories, and users for ShowMe STL.',
  robots: { index: false, follow: false },
  icons: { apple: '/app-icon-black.png' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'STL Admin',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0d10',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegisterServiceWorker />
      {children}
    </>
  )
}
