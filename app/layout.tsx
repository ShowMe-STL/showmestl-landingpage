import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const title = 'ShowMe STL'
const description = 'Everything Saint Louis has to offer, right in your pocket.'

export const metadata: Metadata = {
  metadataBase: new URL('https://stl.showmecities.app'),
  title,
  description,
  openGraph: {
    title,
    description,
    url: '/',
    siteName: title,
    images: [{ url: '/opengraph-image.png', width: 1024, height: 1024 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/opengraph-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Script id="scroll-reset" strategy="beforeInteractive">
          {`if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; } if (!location.hash) { window.scrollTo(0, 0); }`}
        </Script>
        {children}
      </body>
    </html>
  )
}
