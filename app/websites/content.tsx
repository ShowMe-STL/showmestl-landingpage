'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight, Globe, Smartphone, Sparkles } from 'lucide-react'
import { cabinetGroteskBold, clashGroteskSemibold } from '../fonts/config'

const CONTACT_EMAIL = 'mailto:support@showmestl.app?subject=Web%20Services%20Inquiry'

const SERVICES = [
  {
    icon: Globe,
    title: '$100 Website',
    tagline: 'For St. Louis local businesses',
    description: 'A clean, mobile-friendly site hosted on ShowMe STL. We connect it to your own domain too. Every visitor sees your business and discovers ShowMe STL — and every ShowMe STL user can discover you.',
    highlight: true,
    features: ['Mobile-friendly design', 'Hosted on showmestl.app', 'Your own domain connected', 'Drives traffic both ways'],
  },
  {
    icon: Sparkles,
    title: 'Custom Websites',
    tagline: 'Built to your specs',
    description: 'Need something bigger? We build polished marketing sites, landing pages, and web apps. Clean code, fast loading, designed to convert.',
    highlight: false,
    features: ['Modern tech stack', 'Fast & optimized', 'SEO-ready', 'Ongoing support available'],
  },
  {
    icon: Smartphone,
    title: 'Custom Apps',
    tagline: 'iOS, Android, or both',
    description: 'Mobile apps for gyms, restaurants, member clubs, or any business that wants to be in their customers\' pockets. Built with care, shipped to the App Store.',
    highlight: false,
    features: ['Native iOS & Android', 'App Store submission', 'Push notifications', 'Analytics & updates'],
  },
]

const PORTFOLIO = [
  {
    title: 'ShowMe STL',
    description: 'A St. Louis app for finding places and events, seeing where friends are, and making plans. Featured on KSDK\'s Today in St. Louis.',
    image: '/portfolio/showmestl.jpg',
    tags: ['iOS App', '5.0 on App Store'],
  },
  {
    title: 'OpsCompanion',
    description: 'AI governance software that helps teams use AI safely. Named a 2026 Startup to Watch by the St. Louis Business Journal.',
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
        <ServicesSection />
        <HowItWorksSection />
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
        Websites & apps for
        <br />
        <span className="text-[#FF3B30]">St. Louis businesses</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl">
        We build the ShowMe STL app. Now we&apos;re helping local businesses get online with simple, beautiful websites and custom apps.
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
          See services
        </a>
      </div>
    </Reveal>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="mt-32 scroll-mt-24">
      <Reveal>
        <p className="text-sm font-medium tracking-wide text-[#FF3B30] uppercase">Services</p>
        <h2 className={`${clashGroteskSemibold.className} mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl`}>
          Three ways we can help
        </h2>
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
      <div className={`flex size-12 items-center justify-center rounded-xl ${service.highlight ? 'bg-[#FF3B30]/20' : 'bg-white/10'}`}>
        <Icon className={`size-6 ${service.highlight ? 'text-[#FF3B30]' : 'text-white/70'}`} />
      </div>
      <h3 className={`${clashGroteskSemibold.className} mt-4 text-xl font-semibold text-white`}>{service.title}</h3>
      <p className="text-sm text-white/50">{service.tagline}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">{service.description}</p>
      <ul className="mt-4 space-y-2">
        {service.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
            <span className={`size-1.5 rounded-full ${service.highlight ? 'bg-[#FF3B30]' : 'bg-white/40'}`} />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

function HowItWorksSection() {
  return (
    <section className="mt-32">
      <Reveal>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
          <p className="text-sm font-medium tracking-wide text-[#FF3B30] uppercase">The $100 Website</p>
          <h2 className={`${clashGroteskSemibold.className} mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl`}>
            How it works
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Step number={1} title="Send us your info">
              Your logo, photos, menu, hours — whatever you&apos;ve got. We&apos;ll make it work.
            </Step>
            <Step number={2} title="We build your site">
              A clean, mobile-friendly page that loads fast and looks great.
            </Step>
            <Step number={3} title="Hosted on ShowMe STL">
              Your site lives at yourname.showmestl.app (or a subpath). ShowMe STL users can find you directly.
            </Step>
            <Step number={4} title="Your domain connected">
              We also connect your own domain (e.g. yourbusiness.com) so customers find you either way.
            </Step>
          </div>
          <div className="mt-8 rounded-xl bg-white/5 p-6">
            <p className="text-sm font-medium text-white/90">
              Why host on ShowMe STL?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Every site we host is part of the ShowMe STL network. That means your business gets discovered by ShowMe STL users browsing local spots — and visitors to your site see they&apos;re part of something bigger in St. Louis. It&apos;s free marketing that works both ways.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex size-8 items-center justify-center rounded-full bg-[#FF3B30]/20 text-sm font-medium text-[#FF3B30]">
        {number}
      </div>
      <h3 className="mt-3 text-sm font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm text-white/50">{children}</p>
    </div>
  )
}

function PortfolioSection() {
  return (
    <section className="mt-32">
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
    <section className="mt-32">
      <Reveal>
        <div className="rounded-2xl bg-gradient-to-br from-[#FF3B30]/20 to-[#FF3B30]/5 p-8 text-center md:p-12">
          <h2 className={`${clashGroteskSemibold.className} text-2xl font-semibold tracking-tight text-white md:text-3xl`}>
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">
            Reach out and tell us about your business. We&apos;ll get back to you within 24 hours.
          </p>
          <a
            href={CONTACT_EMAIL}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Get in touch
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
