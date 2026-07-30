'use client'

import { useEffect, useRef } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

export function SectionHeading({ eyebrow, title, className }: { eyebrow?: string; title: string; className?: string }) {
  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow && (
        <p className="text-sm font-medium tracking-wide text-[#FF3B30] uppercase">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl xl:text-5xl">
        {title}
      </h2>
    </div>
  )
}

export function Card({ children, className, highlighted = false }: { children: ReactNode; className?: string; highlighted?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 transition-colors',
        highlighted
          ? 'border-[#FF3B30]/40 bg-[#FF3B30]/[0.06]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={cn('text-4xl font-bold tracking-tight md:text-5xl', accent ? 'text-[#FF3B30]' : 'text-white')}>
        {value}
      </p>
      <p className="mt-2 text-sm text-white/60 md:text-base">{label}</p>
    </div>
  )
}

export function CountUp({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^([\d,]+)(.*)$/)
  const target = match ? Number(match[1].replace(/,/g, '')) : 0
  const suffix = match ? match[2] : ''
  const ref = useRef<HTMLParagraphElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const count = useMotionValue(0)
  const display = useTransform(count, (v) => Math.round(v).toLocaleString() + suffix)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(count, target, { duration: 1.4, ease: 'easeOut' })
    return () => controls.stop()
  }, [isInView, target, count])

  return (
    <motion.p ref={ref} className={className}>
      {display}
    </motion.p>
  )
}

type AnimatedProps = {
  delay?: number
  className?: ComponentProps<typeof motion.div>['className']
  children: ReactNode
}

export function Reveal({ className, delay = 0, children }: AnimatedProps) {
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
