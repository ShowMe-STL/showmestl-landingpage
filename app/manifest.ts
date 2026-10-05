import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShowMe STL Admin',
    short_name: 'STL Admin',
    description: 'Internal admin dashboard for ShowMe STL.',
    start_url: '/admin',
    scope: '/admin',
    display: 'standalone',
    background_color: '#0f0d10',
    theme_color: '#0f0d10',
    icons: [
      { src: '/app-icon-black.png', sizes: '192x192', type: 'image/png' },
      { src: '/app-icon-black.png', sizes: '512x512', type: 'image/png' },
      { src: '/app-icon-black.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
