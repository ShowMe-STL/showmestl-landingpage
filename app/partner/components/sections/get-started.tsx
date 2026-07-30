'use client'

import { useState } from 'react'
import { BadgeCheck, BarChart3, Mail, MapPin, Users } from 'lucide-react'
import { ContactModal } from '../contact-modal'
import { Card, Reveal, SectionHeading } from '../section-ui'

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

export function GetStarted() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <div className="space-y-10">
      <Reveal>
        <SectionHeading title="How we get you there" />
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <Reveal delay={0.5}>
        <div className="flex flex-col items-center text-center">
          <SectionHeading title="Let's put you on the map" className="mx-auto text-center" />
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF3B30] px-8 py-4 text-base font-medium text-white transition-colors hover:bg-[#FF3B30]/90"
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
