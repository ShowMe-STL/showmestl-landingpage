import type { ReactNode } from 'react'
import Link from 'next/link'
import { cabinetGroteskBold, clashGroteskRegular } from '../fonts/config'

export const smsSupportEmail = 'support@showmestl.app'

export function SmsInformationLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className={`${clashGroteskRegular.className} min-h-svh bg-[#0f0d10] px-6 py-12 text-white sm:py-16`}>
      <article className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm text-white/70 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Back to ShowMe STL
        </Link>
        <header className="mt-8 space-y-4">
          <p className="text-sm text-[#FF3B30]">ShowMe STL · Phone verification</p>
          <h1 className={`${cabinetGroteskBold.className} text-4xl leading-tight sm:text-5xl`}>{title}</h1>
          <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-relaxed text-white/75">
            Phone verification is an upcoming ShowMe STL service.
            These disclosures apply to app versions that use phone sign-in.
          </p>
        </header>
        <div className="mt-8 space-y-8 text-base leading-7 text-white/80">{children}</div>
        <nav aria-label="Phone verification information" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm">
          <Link href="/sms-verification" className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Verification texts</Link>
          <Link href="/terms-of-service" className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Terms of Service</Link>
          <Link href="/privacy-policy" className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Privacy Policy</Link>
        </nav>
      </article>
    </main>
  )
}

export function SmsInformationSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className={`${cabinetGroteskBold.className} text-2xl leading-8 text-white`}>{title}</h2>
      {children}
    </section>
  )
}
