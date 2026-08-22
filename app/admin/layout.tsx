import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ShowMe STL Admin',
  description: 'Manage places, events, categories, and users for ShowMe STL.',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
