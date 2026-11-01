import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sharedContentDetails, showMeAppStoreUrl } from '@/lib/shared-content-links.mjs'

export type SharedContentPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function sharedContentMetadata(kind: string, props: SharedContentPageProps): Promise<Metadata> {
  const { id } = await props.params
  const details = sharedContentDetails(kind, id)
  if (!details) return { title: 'Link unavailable · ShowMe STL', robots: { index: false, follow: false } }
  return {
    title: `${details.title} · ShowMe STL`,
    description: details.description,
    robots: { index: false, follow: false },
    alternates: { canonical: details.url },
    openGraph: { title: details.title, description: details.description, url: details.url },
    itunes: { appId: '6760572115', appArgument: details.url },
  }
}

export async function SharedContentPage({ kind, params, searchParams }: SharedContentPageProps & { kind: string }) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const details = sharedContentDetails(kind, id)
  if (!details || Object.keys(query).length) notFound()
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#090a0c] px-6 py-16 text-white">
      <section className="w-full max-w-sm space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c7403e]">ShowMe STL</p>
        <h1 className="text-4xl font-semibold tracking-tight">{details.title}</h1>
        <p className="text-base leading-relaxed text-white/75">{details.description}</p>
        <a href={details.appUrl} className="flex min-h-12 items-center justify-center rounded-full bg-[#c8072a] px-6 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Open ShowMe</a>
        <a href={showMeAppStoreUrl} className="flex min-h-12 items-center justify-center rounded-full bg-[#15151d] px-6 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Get ShowMe for iPhone</a>
        <p className="text-sm leading-relaxed text-white/60">After installing or updating ShowMe, return to this link and tap Open ShowMe.</p>
        <Link href="/" className="inline-block py-2 text-sm text-white/75 underline underline-offset-4">About ShowMe STL</Link>
      </section>
    </main>
  )
}
