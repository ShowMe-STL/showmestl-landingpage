import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Omen Coffee raffle · ShowMe STL',
  description: 'Open ShowMe to verify your visit to Omen Coffee and save it for later.',
  robots: { index: false, follow: false },
}

export default function OmenRafflePage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#090a0c] px-6 py-16 text-white">
      <section className="w-full max-w-sm space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c7403e]">Omen Coffee × ShowMe STL</p>
        <h1 className="text-4xl font-semibold tracking-tight">Save your Omen visit.</h1>
        <p className="text-base leading-relaxed text-white/65">
          ShowMe will ask for location access to confirm you’re near Omen Coffee. You can finish setting up your account later.
        </p>
        <a href="showmestl-v2://omen-raffle?source=link" className="flex min-h-12 items-center justify-center rounded-full bg-[#c8072a] px-6 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Open ShowMe</a>
        <a href="https://apps.apple.com/app/id6760572115" className="flex min-h-12 items-center justify-center rounded-full bg-white/10 px-6 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Get ShowMe for iPhone</a>
        <p className="text-sm leading-relaxed text-white/50">If you install ShowMe now, tap the NFC tag again afterward. Opening this page alone does not save an entry.</p>
      </section>
    </main>
  )
}
