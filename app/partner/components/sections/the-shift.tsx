'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Check, MousePointer2, Newspaper, Smartphone, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CountUp, Reveal, SectionHeading } from '../section-ui'

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

const ERAS = [
  {
    label: 'First · Ads',
    title: 'You bought attention.',
    body: 'Newspapers, billboards, radio spots, then Facebook ads. You paid to interrupt people and hoped enough of them showed up.',
    icon: Newspaper,
    visual: 'tv',
    highlighted: false,
  },
  {
    label: 'Then · Reviews & SEO',
    title: 'You competed to be found.',
    body: "Yelp stars and Google rankings. Customers searched, compared strangers' opinions, and picked. You lived or died by your rating.",
    icon: Star,
    visual: 'computer',
    highlighted: false,
  },
  {
    label: 'Now · The feed',
    title: 'Friends and video decide.',
    body: null,
    icon: Smartphone,
    visual: 'glow',
    highlighted: true,
  },
] as const

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
    <div className="flex flex-col items-center">
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
                      <CountUp value="40%" className="text-3xl font-bold text-white" />
                      <p className="text-sm text-white/60">skip Google for TikTok or Instagram.</p>
                    </div>
                    <div>
                      <CountUp value="92%" className="text-3xl font-bold text-white" />
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

export function TheShift() {
  return (
    <div className="space-y-10">
      <Reveal>
        <SectionHeading title="How people are choosing where to go is changing" className="!max-w-4xl" />
      </Reveal>

      <Reveal delay={0.1}>
        <EraCarousel />
      </Reveal>

      <Reveal delay={0.4}>
        <div className="max-w-3xl">
          <p className="text-xl font-light text-white/90">
            Buying decisions are moving to personalized recommendation feeds.
          </p>
          <p className="mt-4 text-xl font-light text-white/90">
            Billboards, dining guides, and &ldquo;Best Of&rdquo; lists used to influence where people went. Today,
            it&rsquo;s a friend&rsquo;s check-in, a creator&rsquo;s video, and a feed that already knows what
            you&rsquo;ll love.
          </p>
        </div>
      </Reveal>
    </div>
  )
}
