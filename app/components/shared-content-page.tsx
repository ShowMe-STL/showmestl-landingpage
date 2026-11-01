import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShareLanding } from '@/app/components/share-landing'
import { loadSharePreview } from '@/lib/shared-content-preview'
import {
  plainText,
  shareOgImage,
  shareOgVideo,
  sharedContentDetails,
} from '@/lib/shared-content-links.mjs'

export type SharedContentPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// iMessage renders og:video in the bubble, but that video region is not a
// link tap target. The still (public/og/showme-share.jpg) and the page URL
// are what open the link. Twitter stays on that still.
export async function sharedContentMetadata(kind: string, props: SharedContentPageProps): Promise<Metadata> {
  const { id } = await props.params
  const details = sharedContentDetails(kind, id)
  if (!details) return { title: 'Link unavailable · ShowMe STL', robots: { index: false, follow: false } }
  const preview = await loadSharePreview(kind, id)
  const title = preview?.title ?? details.title
  const description = plainText(preview?.description ?? details.description, 200)
  return {
    title: `${title} · ShowMe STL`,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: details.url },
    openGraph: {
      title,
      description,
      url: details.url,
      siteName: 'ShowMe STL',
      type: 'website',
      images: [{
        url: shareOgImage.url,
        width: shareOgImage.width,
        height: shareOgImage.height,
        alt: title,
      }],
      videos: [{
        url: shareOgVideo.url,
        type: shareOgVideo.type,
        width: shareOgVideo.width,
        height: shareOgVideo.height,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareOgImage.url],
    },
    itunes: { appId: '6760572115', appArgument: details.url },
  }
}

export async function SharedContentPage({ kind, params, searchParams }: SharedContentPageProps & { kind: string }) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const details = sharedContentDetails(kind, id)
  if (!details || Object.keys(query).length) notFound()
  const preview = await loadSharePreview(kind, id)
  if (!preview) notFound()
  return <ShareLanding appUrl={details.appUrl} preview={preview} />
}
