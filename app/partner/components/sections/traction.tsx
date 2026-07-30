'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { ContactModal } from '../contact-modal'
import { CountUp, Reveal } from '../section-ui'

const TRACTION = [
  { value: '130%', label: 'Month-over-month growth in app downloads' },
  { value: '1,000+', label: 'Local places featured' },
  { value: '300,000+', label: 'Combined followers from our influencers' },
]

const PRESS = [
  {
    name: 'KSDK',
    href: 'https://www.ksdk.com/article/tech/new-app-showme-stl-aims-to-help-st-louisans-explore-and-connect/63-676f8ee5-e4eb-4d5e-ae2a-ac2722969610',
    logo: '/partner/ksdk-logo.svg',
  },
  {
    name: 'Yahoo Tech',
    href: 'https://tech.yahoo.com/apps/articles/app-aims-help-st-louisans-150333686.html',
    logo: '/partner/yahoo-logo.png',
  },
]

export function Traction() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl xl:text-5xl">
            ShowMe STL
          </h2>
          <p className="mt-3 text-lg font-light text-white/60">Where people are choosing where to go</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5">
            <span className="text-xs font-medium tracking-wide text-white/40 uppercase">As featured in</span>
            {PRESS.map((press) => (
              <a
                key={press.name}
                href={press.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center opacity-80 transition-opacity hover:opacity-100"
              >
                {press.logo.endsWith('.svg') ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local SVG logo, next/image svg optimization needs extra config
                  <img src={press.logo} alt={press.name} className="h-6 w-auto" />
                ) : (
                  <Image src={press.logo} alt={press.name} width={160} height={90} className="h-6 w-auto" />
                )}
              </a>
            ))}
          </div>

          <div className="mt-10 grid w-full max-w-2xl gap-10 sm:grid-cols-3">
            {TRACTION.map((stat) => (
              <div key={stat.label}>
                <CountUp value={stat.value} className="text-4xl font-bold tracking-tight text-[#FF3B30] md:text-5xl" />
                <p className="mt-2 text-sm text-white/60 md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="relative mx-auto flex h-[26rem] w-full max-w-sm items-center justify-center sm:h-[30rem]">
          <div className="absolute aspect-[1470/3000] h-full -translate-x-10 -rotate-6">
            <div
              className="absolute overflow-hidden rounded-[12%/6%]"
              style={{ top: '2.1%', bottom: '2.1%', left: '5%', right: '5%' }}
            >
              <Image
                src="/screenshots/explore.png"
                alt="ShowMe STL app explore screen"
                fill
                sizes="240px"
                className="object-cover object-top"
              />
            </div>
            <Image
              src="/mockups/iphone-16-pro-max.png"
              alt=""
              fill
              sizes="240px"
              className="pointer-events-none object-contain select-none"
            />
          </div>
          <div className="relative z-10 aspect-[1470/3000] h-full translate-x-10 rotate-6">
            <div
              className="absolute overflow-hidden rounded-[12%/6%]"
              style={{ top: '2.1%', bottom: '2.1%', left: '5%', right: '5%' }}
            >
              <Image
                src="/screenshots/home.png"
                alt="ShowMe STL app home screen"
                fill
                sizes="240px"
                className="object-cover object-top"
              />
            </div>
            <Image
              src="/mockups/iphone-16-pro-max.png"
              alt=""
              fill
              sizes="240px"
              className="pointer-events-none object-contain select-none"
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.3}>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF3B30] px-8 py-4 text-base font-medium text-white transition-colors hover:bg-[#FF3B30]/90"
          >
            <Mail strokeWidth={2} className="size-5" />
            Get in touch
          </button>
        </div>
      </Reveal>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}
