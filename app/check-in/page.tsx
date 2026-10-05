import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check in · ShowMe STL',
  description: 'Open ShowMe STL to check in at this location.',
  robots: { index: false, follow: false },
}

export default async function CheckInPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const rawId = query.placeId
  const valid = Object.keys(query).length === 1 && typeof rawId === 'string' &&
    /^[1-9][0-9]{0,15}$/.test(rawId) && Number.isSafeInteger(Number(rawId))
  // This fallback is only followed by an explicit tap. It opens the normal
  // confirmation UI, never impersonates an NFC scan or mutates on an HTTP GET.
  const appUrl = valid ? `showmestl-v2://check-in?placeId=${rawId}` : null

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#090a0c] px-6 py-16 text-white">
      <section className="w-full max-w-sm space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c7403e]">ShowMe STL</p>
        <h1 className="text-4xl font-semibold tracking-tight">{valid ? 'You’re here.' : 'Link unavailable'}</h1>
        <p className="text-base leading-relaxed text-white/65">
          {valid ? 'Open ShowMe to check in at this location. Your account and check-in settings stay in the app.'
            : 'This check-in link is missing a valid place. Ask the venue to check its tag.'}
        </p>
        {appUrl && <a href={appUrl} className="flex min-h-12 items-center justify-center rounded-full bg-[#c8072a] px-6 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Open ShowMe</a>}
        <a href="https://apps.apple.com/app/id6760572115" className="flex min-h-12 items-center justify-center rounded-full bg-white/10 px-6 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Get ShowMe for iPhone</a>
        {valid && <p className="text-sm leading-relaxed text-white/50">After installing or updating ShowMe, scan the tag again. If it opened in Safari, tap Open ShowMe above.</p>}
        <a href="/" className="inline-block py-2 text-sm text-white/60 underline underline-offset-4">About ShowMe STL</a>
      </section>
    </main>
  )
}
