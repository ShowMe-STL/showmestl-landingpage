'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight, Globe, Smartphone, Sparkles, Check } from 'lucide-react'
import { cabinetGroteskBold, clashGroteskSemibold } from '../fonts/config'

const CONTACT_EMAIL = 'mailto:hello@showmestl.app?subject=Web%20Services%20Inquiry'

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
    price: '$1,500–$3,000',
    perMonth: '+ $79/mo care',
    description: 'A full site designed around your spot. We keep it updated and running every month.',
    highlight: false,
  },
  {
    icon: Smartphone,
    title: 'Branded App',
    tagline: 'Your own app',
    price: '$2,500–$5,000',
    perMonth: '+ $149–$249/mo',
    description: 'Your own app for bars, venues, shops and cafes, with ShowMe events and loyalty built in.',
    highlight: false,
  },
]

const VALUE_PROPS = [
  { label: 'Get Found', text: 'Show up on Google and in the app' },
  { label: 'Real Crowd', text: 'Reach young locals making plans' },
  { label: 'Fast', text: 'Live in about a week, built by us' },
  { label: 'No Risk', text: 'First month free if you don\'t love it' },
]

const PORTFOLIO = [
  {
    title: 'ShowMe STL',
    description: 'A St. Louis app for finding places and events, seeing where friends are, and making plans. Featured on KSDK.',
    image: '/portfolio/showmestl.jpg',
    tags: ['iOS App'],
  },
  {
    title: 'OpsCompanion',
    description: 'AI governance software that helps teams use AI safely.',
    image: '/portfolio/opscompanion.jpg',
    tags: ['Website', 'SaaS'],
  },
  {
    title: 'Golf Swing Coach',
    description: 'An Apple Watch app that coaches proper golf ball striking with real-time motion tracking and swing analysis.',
    image: null,
    tags: ['watchOS', 'iOS'],
  },
  {
    title: 'Workout Tracker',
    description: 'A personal fitness app with workout templates, set logging, and progress tracking.',
    image: null,
    tags: ['iOS App'],
  },
]

export function WebServicesContent() {
  return (
    <main className="relative">
      <div className="mx-auto w-full max-w-[72rem] px-4 pb-32 pt-24 sm:px-6">
        <HeroSection />
        <ValuePropsSection />
        <ServicesSection />
        <AddOnsSection />
        <ShowMeSection />
        <PortfolioSection />
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
          href="#services"
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
          {VALUE_PROPS.map((prop, i) => (
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

function ServicesSection() {
  return (
    <section id="services" className="mt-24 scroll-mt-24">
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
    <section className="mt-16">
      <Reveal>
        <div className="flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Extra work</p>
            <p className="mt-1 text-lg font-medium text-white">$75/hr</p>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Booking or ordering add-on</p>
            <p className="mt-1 text-lg font-medium text-white">$300–$600</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function ShowMeSection() {
  return (
    <section className="mt-24">
      <Reveal>
        <div className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className={`${clashGroteskSemibold.className} text-2xl font-semibold tracking-tight text-white md:text-3xl`}>
                ShowMe STL
              </h2>
              <p className="mt-2 text-lg italic text-white/60">Where St. Louis finds what to do.</p>
              <p className="mt-6 text-sm leading-relaxed text-white/70">
                Hundreds of young St. Louis people use ShowMe every day to find where to go next. Your site lives on a ShowMe address and on your own domain, and it links straight to your spot in the app. You keep your domain, always.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-6 items-center justify-center rounded bg-[#FF3B30]/20">
                    <Check className="size-3.5 text-[#FF3B30]" />
                  </div>
                  <p className="text-sm font-medium text-white">First month free if you don&apos;t love it</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-6 items-center justify-center rounded bg-[#FF3B30]/20">
                    <Check className="size-3.5 text-[#FF3B30]" />
                  </div>
                  <p className="text-sm font-medium text-white">Cancel anytime</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[180px] rounded-[28px] border border-white/20 bg-[#1a1a1a] p-2 shadow-2xl">
                <div className="relative flex flex-col rounded-[20px] bg-[#f7f4ee] overflow-hidden" style={{ aspectRatio: '9/16' }}>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-4 rounded-full bg-[#1a1a1a]" />
                  <div className="mt-8 mx-3 rounded-lg bg-[#ece6dc] px-2 py-1.5 text-center text-[8px] text-[#5e5a53] tracking-wide">
                    yourspot.showmestl.app
                  </div>
                  <div className="px-3 pt-3 text-[#151412]" style={{ fontFamily: 'Georgia, serif' }}>
                    <p className="text-lg leading-none">Your Spot</p>
                    <p className="mt-1.5 text-[7px] tracking-wider font-semibold">
                      <span className="text-[#2e7d4f]">OPEN NOW</span> · TIL 10PM
                    </p>
                  </div>
                  <div className="mt-3 px-3 grid grid-cols-2 gap-1.5">
                    <div className="rounded bg-[#151412] py-1.5 text-center text-[7px] font-semibold tracking-wider text-white">BOOK</div>
                    <div className="rounded border border-[#151412] py-1.5 text-center text-[7px] font-semibold tracking-wider text-[#151412]">MENU</div>
                  </div>
                  <div className="mt-3 mx-3 h-14 rounded-lg bg-[#e3dccf] relative">
                    <div className="absolute left-1/2 top-1/3 w-3 h-3 bg-[#c70f2e] rounded-full" style={{ transform: 'rotate(-45deg)', borderRadius: '50% 50% 50% 0' }} />
                  </div>
                  <div className="mt-auto mx-3 mb-3 flex items-center gap-2 rounded-lg bg-[#0e0d0c] px-2 py-2 text-white">
                    <div className="w-2 h-3 bg-[#c70f2e]" />
                    <span className="text-[6px] font-semibold tracking-wider">FIND US ON SHOWME STL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function PortfolioSection() {
  return (
    <section className="mt-24">
      <Reveal>
        <p className="text-sm font-medium tracking-wide text-[#FF3B30] uppercase">Portfolio</p>
        <h2 className={`${clashGroteskSemibold.className} mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl`}>
          Work we&apos;ve shipped
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Apps and websites we&apos;ve built for businesses and startups around St. Louis.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {PORTFOLIO.map((project, i) => (
          <Reveal key={project.title} delay={0.1 * i}>
            <PortfolioCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function PortfolioCard({ project }: { project: typeof PORTFOLIO[number] }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20">
      {project.image ? (
        <div className="relative aspect-video overflow-hidden bg-[#0a0a0a]">
          <Image
            src={project.image}
            alt={`${project.title} screenshot`}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
          <Smartphone className="size-16 text-white/20" />
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className={`${clashGroteskSemibold.className} mt-3 text-lg font-semibold text-white`}>
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{project.description}</p>
      </div>
    </div>
  )
}

function CtaSection() {
  return (
    <section className="mt-24">
      <Reveal>
        <div className="rounded-2xl bg-gradient-to-br from-[#FF3B30]/20 to-[#FF3B30]/5 p-8 text-center md:p-12">
          <h2 className={`${clashGroteskSemibold.className} text-2xl font-semibold tracking-tight text-white md:text-3xl`}>
            Let&apos;s get your spot found this week.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">
            Reach out and tell us about your business. We&apos;ll get back to you within 24 hours.
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
