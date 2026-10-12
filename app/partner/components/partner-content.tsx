'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Globe,
  Mail,
  MapPin,
  MousePointer2,
  Newspaper,
  Smartphone,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { cabinetGroteskBold, clashGroteskSemibold } from '../../fonts/config'

const CONTACT_EMAIL = 'mailto:hello@showmestl.app?subject=Partner%20Inquiry'

const VALUE_PROPS = [
  { label: 'Get Found', text: 'Show up on Google and in the app' },
  { label: 'Real Crowd', text: 'Reach young locals making plans' },
  { label: 'Fast', text: 'Live in about a week, built by us' },
  { label: 'No Risk', text: "First month free if you don't love it" },
]

const SERVICES = [
  {
    icon: Globe,
    title: 'Starter Site',
    tagline: 'Start here',
    price: '$100 setup',
    perMonth: '+ $49/mo',
    description: 'One mobile page with your hours, menu, map, and a contact or booking link. Basic SEO and a feature in the ShowMe STL app.',
    highlight: true,
  },
  {
    icon: Sparkles,
    title: 'Custom Site',
    tagline: 'Full design',
    price: '$1,500-$3,000',
    perMonth: '+ $79/mo care',
    description: 'A full site designed around your spot. We keep it updated and running every month.',
    highlight: false,
  },
  {
    icon: Smartphone,
    title: 'Branded App',
    tagline: 'Your own app',
    price: '$2,500-$5,000',
    perMonth: '+ $149-$249/mo',
    description: 'Your own app for bars, venues, shops and cafes, with ShowMe events and loyalty built in.',
    highlight: false,
  },
]

const ERAS = [
  {
    label: 'First: Ads',
    title: 'You bought attention.',
    body: 'Newspapers, billboards, radio spots, then Facebook ads. You paid to interrupt people and hoped enough of them showed up.',
    icon: Newspaper,
    visual: 'tv',
    highlighted: false,
  },
  {
    label: 'Then: Reviews & SEO',
    title: 'You competed to be found.',
    body: "Yelp stars and Google rankings. Customers searched, compared strangers' opinions, and picked. You lived or died by your rating.",
    icon: Star,
    visual: 'computer',
    highlighted: false,
  },
  {
    label: 'Now: The feed',
    title: 'Friends and video decide.',
    body: null,
    icon: Smartphone,
    visual: 'glow',
    highlighted: true,
  },
] as const

const BRANDS = [
  {
    category: 'Cookies',
    name: 'Crumbl',
    logo: '/partner/crumbl-logo.png',
    body: 'A rotating weekly flavor drop keeps audiences hooked. Every Monday, thousands of fans post organic taste-test reviews across social platforms.',
    stats: [
      { value: '$1B+', label: 'In total sales' },
      { value: '9.6M', label: 'TikTok followers' },
    ],
  },
  {
    category: 'Apparel',
    name: 'Gymshark',
    logo: '/partner/gymshark-logo.png',
    body: 'Gymshark seeded product to real people and let community posts drive growth, fostering organic brand advocates instead of buying attention.',
    stats: [
      { value: '$1B+', label: 'Brand valuation' },
      { value: '$0', label: 'Traditional paid ad budget' },
    ],
  },
  {
    category: 'Beverage',
    name: 'Chamberlain Coffee',
    logo: '/partner/chamberlain-logo.png',
    body: "Built on a single creator's audience trust, casual native content converted brand affinity into repeat buyers without an ad machine.",
    stats: [
      { value: '1', label: 'Social feed as the entire funnel' },
      { value: '$0', label: 'Spent on traditional ad machines' },
    ],
  },
]

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

const STEPS = [
  {
    title: 'Verified profile',
    body: "Claim your spot and control how St. Louis sees you. Live on your customer's lock and home screen, so you're top of mind at exactly the right time.",
    icon: BadgeCheck,
  },
  {
    title: 'Influencers',
    body: 'Tap into our whole directory of St. Louis influencers ready to feature your business to their followers.',
    icon: Users,
  },
  {
    title: 'Promoted check-ins',
    body: 'Reward customers for checking in, so every visit alerts their friends to come too.',
    icon: MapPin,
  },
  {
    title: 'Foot-traffic insights',
    body: "See who's coming, when they come, and what else they love, so you plan around real demand.",
    icon: BarChart3,
  },
]

export function PartnerContent() {
  return (
    <main className="relative">
      <div className="mx-auto w-full max-w-[72rem] px-4 pb-32 pt-24 sm:px-6">
        <HeroSection />
        <ValuePropsSection />
        <TheShiftSection />
        <ProofSection />
        <PricingSection />
        <AddOnsSection />
        <TractionSection />
        <HowWeGetYouThereSection />
        <CtaSection />
      </div>
    </main>
  )
}

function HeroSection() {
  return (
    <Reveal className="text-center">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        <span>←</span> Back to ShowMe STL
      </Link>
      <h1 className={`${cabinetGroteskBold.className} text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl md:text-6xl`}>
        Your spot deserves
        <br />
        <span className="text-[#FF3B30]">to be found.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl">
        A website, an app, and a spot in the app St. Louis uses to find what to do.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href={CONTACT_EMAIL}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
        >
          Get in touch
          <ArrowRight className="size-4" />
        </a>
        <a
          href="#pricing"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
        >
          See pricing
        </a>
      </div>
    </Reveal>
  )
}

function ValuePropsSection() {
  return (
    <section className="mt-20">
      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop) => (
            <div
              key={prop.label}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center"
            >
              <p className="text-xs font-semibold tracking-wider text-[#FF3B30] uppercase">{prop.label}</p>
              <p className="mt-2 text-sm text-white/80">{prop.text}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

function TheShiftSection() {
  return (
    <section className="mt-24">
      <Reveal>
        <SectionHeading title="How people choose where to go is changing" />
      </Reveal>

      <Reveal delay={0.1}>
        <EraCarousel />
      </Reveal>

      <Reveal delay={0.4}>
        <div className="mt-10 max-w-3xl">
          <p className="text-xl font-light text-white/90">
            Buying decisions are moving to personalized recommendation feeds.
          </p>
          <p className="mt-4 text-xl font-light text-white/90">
            Billboards, dining guides, and "Best Of" lists used to influence where people went. Today,
            it's a friend's check-in, a creator's video, and a feed that already knows what
            you'll love.
          </p>
        </div>
      </Reveal>
    </section>
  )
}

function ProofSection() {
  return (
    <section className="mt-24">
      <Reveal>
        <SectionHeading title="Businesses that don't reach the next generation become invisible" />
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <Image
            src="/partner/case-study.png"
            alt="Friends laughing together at a bar"
            fill
            sizes="(min-width: 768px) 72rem, 100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black" />
          <div className="relative flex h-full items-end p-6 sm:p-10">
            <div>
              <p className="text-4xl font-bold tracking-tight text-[#FF3B30] md:text-5xl">73%</p>
              <p className="mt-2 text-sm text-white/60 md:text-base">of Gen Z and Millennials visited a restaurant because of a social media review in the past three months.</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-16">
          <p className="text-xs font-medium tracking-wide text-[#FF3B30] uppercase">Case studies</p>
          <h3 className={`${clashGroteskSemibold.className} mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl`}>
            Brands that grew by being where people already trust
          </h3>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {BRANDS.map((brand, i) => (
          <Reveal key={brand.name} delay={0.2 + i * 0.1}>
            <Card className="flex h-full flex-col">
              <p className="text-xs font-medium text-white/50">{brand.category}</p>
              <div className="relative mt-3 h-9 w-32">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  sizes="140px"
                  className="object-contain object-left brightness-0 invert"
                />
              </div>
              <p className="mt-4 text-sm text-white/60">{brand.body}</p>
              <div className="mt-6 flex flex-1 items-end gap-6">
                {brand.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold tracking-tight text-[#FF3B30]">{stat.value}</p>
                    <p className="mt-1 text-xs text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="mt-24 scroll-mt-24">
      <Reveal>
        <p className="text-sm font-medium tracking-wide text-[#FF3B30] uppercase">Pricing</p>
        <h2 className={`${clashGroteskSemibold.className} mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl`}>
          Three ways to work with us.
        </h2>
        <p className="mt-3 text-white/60">Start small. Grow into more whenever you want.</p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {SERVICES.map((service, i) => (
          <Reveal key={service.title} delay={0.1 * i}>
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function ServiceCard({ service }: { service: typeof SERVICES[number] }) {
  const Icon = service.icon
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-6 transition-colors ${
        service.highlight
          ? 'border-[#FF3B30]/40 bg-[#FF3B30]/[0.06]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl ${service.highlight ? 'bg-[#FF3B30]/20' : 'bg-white/10'}`}>
          <Icon className={`size-5 ${service.highlight ? 'text-[#FF3B30]' : 'text-white/70'}`} />
        </div>
        {service.highlight && (
          <span className="text-xs font-semibold tracking-wider text-[#FF3B30] uppercase">Start here</span>
        )}
      </div>
      <h3 className={`${clashGroteskSemibold.className} mt-4 text-lg font-semibold text-white`}>{service.title}</h3>
      <div className="mt-3">
        <span className={`${clashGroteskSemibold.className} text-3xl font-semibold text-white`}>{service.price}</span>
        <p className="mt-1 text-sm text-white/50">{service.perMonth}</p>
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">{service.description}</p>
    </div>
  )
}

function AddOnsSection() {
  return (
    <section className="mt-8">
      <Reveal>
        <div className="flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Extra work</p>
            <p className="mt-1 text-lg font-medium text-white">$75/hr</p>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Booking or ordering add-on</p>
            <p className="mt-1 text-lg font-medium text-white">$300-$600</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded bg-[#FF3B30]/20">
              <Check className="size-3.5 text-[#FF3B30]" />
            </div>
            <p className="text-sm font-medium text-white">First month free if you don't love it</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded bg-[#FF3B30]/20">
              <Check className="size-3.5 text-[#FF3B30]" />
            </div>
            <p className="text-sm font-medium text-white">Cancel anytime</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function TractionSection() {
  return (
    <section className="mt-24">
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <h2 className={`${clashGroteskSemibold.className} text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl`}>
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
                  // eslint-disable-next-line @next/next/no-img-element
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
                <p className="text-4xl font-bold tracking-tight text-[#FF3B30] md:text-5xl">{stat.value}</p>
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
                src="/screenshots/discover.png"
                alt="ShowMe STL app discover screen"
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
    </section>
  )
}

function HowWeGetYouThereSection() {
  return (
    <section className="mt-24">
      <Reveal>
        <SectionHeading title="How we get you there" />
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={0.1 + i * 0.1}>
            <Card className="h-full">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF3B30]/15">
                <step.icon strokeWidth={1.5} className="size-5 text-[#FF3B30]" />
              </div>
              <p className="mt-4 text-lg font-semibold text-white">{step.title}</p>
              <p className="mt-3 text-sm text-white/60">{step.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="mt-24">
      <Reveal>
        <div className="rounded-2xl bg-gradient-to-br from-[#FF3B30]/20 to-[#FF3B30]/5 p-8 text-center md:p-12">
          <h2 className={`${clashGroteskSemibold.className} text-2xl font-semibold tracking-tight text-white md:text-3xl`}>
            Let's get your spot found this week.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">
            Reach out and tell us about your business. We'll get back to you within 24 hours.
          </p>
          <a
            href={CONTACT_EMAIL}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            hello@showmestl.app
            <ArrowRight className="size-4" />
          </a>
        </div>
      </Reveal>
    </section>
  )
}

// Shared components

function SectionHeading({ title, className }: { title: string; className?: string }) {
  return (
    <h2 className={cn(`${clashGroteskSemibold.className} text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl`, className)}>
      {title}
    </h2>
  )
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20', className)}>
      {children}
    </div>
  )
}

type RevealProps = {
  delay?: number
  className?: ComponentProps<typeof motion.div>['className']
  children: ReactNode
}

function Reveal({ className, delay = 0, children }: RevealProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Era carousel components

const ROTATE_MS = 7000

function EraCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ERAS.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  const goNext = () => setIndex((i) => (i + 1) % ERAS.length)
  const goPrev = () => setIndex((i) => (i - 1 + ERAS.length) % ERAS.length)

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="relative flex h-[26rem] w-full items-center justify-center overflow-hidden">
        {ERAS.map((era, i) => {
          const diff = (i - index + ERAS.length) % ERAS.length
          const pos = diff === 0 ? 0 : diff === 1 ? 1 : -1
          return (
            <motion.div
              key={era.label}
              className="absolute w-full max-w-sm rounded-2xl bg-black"
              style={{ zIndex: pos === 0 ? 30 : 10 }}
              animate={{
                x: pos * 220,
                scale: pos === 0 ? 1 : 0.85,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              drag={pos === 0 ? 'x' : false}
              dragConstraints={{ left: -160, right: 160 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60 || info.velocity.x < -400) goNext()
                else if (info.offset.x > 60 || info.velocity.x > 400) goPrev()
              }}
            >
              <Card className="relative h-[26rem] overflow-hidden">
                {(era.visual === 'tv' || era.visual === 'computer') && (
                  <div className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-red-500/15">
                    <X strokeWidth={2.5} className="size-4 text-red-500" />
                  </div>
                )}
                {era.visual === 'glow' && (
                  <div className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-green-500/15">
                    <Check strokeWidth={2.5} className="size-4 text-green-500" />
                  </div>
                )}
                {era.visual === 'glow' && (
                  <Image
                    src="/partner/noise.jpg"
                    alt=""
                    fill
                    sizes="24rem"
                    draggable={false}
                    className="pointer-events-none object-cover opacity-20 select-none"
                  />
                )}
                {era.visual === 'glow' && <FeedGlow />}
                {era.visual === 'computer' && <RetroComputer />}
                {era.visual === 'tv' && <RetroTV Icon={era.icon} />}
                <span className="mt-3 inline-block w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
                  {era.label}
                </span>
                <p className="mt-3 text-xl font-semibold text-white">{era.title}</p>
                {era.body && <p className="mt-4 text-sm text-white/60">{era.body}</p>}
                {era.highlighted && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-white">40%</p>
                      <p className="text-sm text-white/60">skip Google for TikTok or Instagram.</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">92%</p>
                      <p className="text-sm text-white/60">trust a friend over any traditional ad.</p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {ERAS.map((e, i) => (
          <button
            key={e.label}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${e.label}`}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'
            )}
          />
        ))}
      </div>
    </div>
  )
}

function RetroTV({ Icon }: { Icon: typeof Newspaper }) {
  return (
    <div className="relative mx-auto h-32 w-44">
      <div className="absolute left-1/2 -top-2 flex -translate-x-1/2 gap-4">
        <div className="h-3 w-0.5 -rotate-[20deg] bg-white/20" />
        <div className="h-3 w-0.5 rotate-[20deg] bg-white/20" />
      </div>
      <div className="relative h-full w-full overflow-hidden rounded-2xl border-4 border-white/15 bg-black shadow-[inset_0_0_16px_rgba(0,0,0,0.8)]">
        <motion.div
          className="absolute inset-1.5 rounded-xl bg-white/[0.06]"
          animate={{ opacity: [0.5, 0.8, 0.45, 0.7, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="pointer-events-none absolute inset-1.5 overflow-hidden rounded-xl opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)',
          }}
        />
        <motion.div
          className="pointer-events-none absolute inset-x-1.5 h-6 rounded-full bg-white/10 blur-[2px]"
          animate={{ y: ['0%', '280%'] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon strokeWidth={1.25} className="size-9 text-white/70" />
        </div>
      </div>
      <div className="mx-auto mt-1 h-1.5 w-10 rounded-b-md bg-white/10" />
    </div>
  )
}

const REVIEWS = [
  { rating: 5, width: '85%' },
  { rating: 4, width: '65%' },
  { rating: 5, width: '75%' },
]

function RetroComputer() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-32 w-44 overflow-hidden rounded-xl border-4 border-white/15 bg-black shadow-[inset_0_0_16px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-1.5 rounded-lg bg-white/[0.05]" />
        <div className="absolute inset-1.5 flex flex-col justify-center gap-3 px-3">
          {REVIEWS.map((review, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={cn('size-2.5', s < review.rating ? 'fill-white/70 text-white/70' : 'text-white/20')}
                  />
                ))}
              </div>
              <div className="h-1 rounded-full bg-white/15" style={{ width: review.width }} />
            </div>
          ))}
        </div>
        <motion.div
          className="absolute"
          animate={{
            left: ['22%', '62%', '62%', '38%', '38%', '22%'],
            top: ['28%', '24%', '24%', '62%', '62%', '28%'],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.22, 0.3, 0.52, 0.72, 1] }}
        >
          <MousePointer2
            strokeWidth={1.5}
            className="size-4 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          />
          <motion.span
            className="absolute -left-1.5 -top-1.5 size-6 rounded-full border border-white/70"
            animate={{ scale: [0, 1.5], opacity: [0.8, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5, ease: 'easeOut' }}
          />
        </motion.div>
      </div>
      <div className="h-3 w-7 bg-white/15" />
      <div className="h-1.5 w-20 rounded-full bg-white/10" />
    </div>
  )
}

function FeedGlow() {
  return (
    <div className="relative flex h-40 items-center justify-center">
      <div className="relative aspect-[558/447] h-40">
        <Image
          src="/partner/shift.png"
          alt="Two friends checking their phones together"
          fill
          sizes="200px"
          draggable={false}
          className="pointer-events-none object-contain select-none"
        />
      </div>
    </div>
  )
}
