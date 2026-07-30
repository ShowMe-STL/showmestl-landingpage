'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Intro } from './sections/intro'
import { TheShift } from './sections/the-shift'
import { Proof } from './sections/proof'
import { HowYouWin } from './sections/how-you-win'
import { Traction } from './sections/traction'
import { GetStarted } from './sections/get-started'

const TABS = [
  { id: 'intro', label: 'Welcome', content: Intro },
  { id: 'the-shift', label: 'The Shift', content: TheShift },
  { id: 'proof', label: 'Case Studies', content: Proof },
  { id: 'how-you-win', label: 'How You Win', content: HowYouWin },
  { id: 'traction', label: 'Why Us', content: Traction },
  { id: 'get-started', label: 'Get Started', content: GetStarted },
]

export function PartnerTabs() {
  const [activeId, setActiveId] = useState(TABS[0].id)
  const activeIndex = TABS.findIndex((tab) => tab.id === activeId)
  const active = TABS[activeIndex] ?? TABS[0]
  const ActiveContent = active.content
  const goToNextTab = () => {
    const next = TABS[activeIndex + 1]
    if (next) setActiveId(next.id)
  }

  return (
    <div className="mx-auto w-full max-w-[72rem] px-4 pb-32 sm:px-6">
      <div className="sticky top-0 z-[100] border-b border-white/10 bg-black/85 pt-6 backdrop-blur-md">
        <a href="/" className="inline-flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-md">
            <Image src="/app-icon.png" alt="" fill sizes="24px" className="object-cover" priority />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">ShowMe STL</span>
        </a>

        <div
          className="mt-5 flex items-center gap-6 overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={cn(
                'shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors',
                tab.id === activeId
                  ? 'border-[#FF3B30] text-white'
                  : 'border-transparent text-white/50 hover:text-white/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {active.id === 'intro' ? <Intro onNext={goToNextTab} /> : <ActiveContent />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
