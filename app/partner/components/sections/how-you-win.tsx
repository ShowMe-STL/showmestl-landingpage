import Image from 'next/image'
import { Smartphone, Sparkles, Users } from 'lucide-react'
import { Card, Reveal, SectionHeading } from '../section-ui'

const WINS = [
  {
    title: 'Top of mind',
    body: "People check their phone 205 times a day. That's 205 chances to be seen, without fighting for space in a crowded feed.",
    icon: Smartphone,
  },
  {
    title: 'Influencers',
    body: 'St. Louis creators put you in front of followers who actually act on where they go.',
    icon: Users,
  },
  {
    title: 'Personalized, not promoted',
    body: 'People have gotten good at tuning out ads. What breaks through now is content that feels made for them.',
    icon: Sparkles,
  },
]

export function HowYouWin() {
  return (
    <div className="space-y-10">
      <Reveal>
        <SectionHeading
          title="Buyers now expect a higher level of trust before purchasing a product"
          className="!max-w-4xl"
        />
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {WINS.map((win, i) => (
          <Reveal key={win.title} delay={0.1 + i * 0.1}>
            <Card className="h-full">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                <win.icon strokeWidth={1.5} className="size-5 text-white/80" />
              </div>
              <p className="mt-4 text-xl font-semibold text-white">{win.title}</p>
              <p className="mt-3 text-sm text-white/60">{win.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <div
          className="relative -mt-6 mx-auto aspect-[560/446] w-full max-w-3xl opacity-60"
          style={{
            maskImage:
              'linear-gradient(to bottom, black 55%, transparent 100%), linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 55%, transparent 100%), linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <Image
            src="/partner/welcome.png"
            alt="Friends gathered around a table at a St. Louis restaurant"
            fill
            sizes="(min-width: 768px) 42rem, 100vw"
            className="object-contain object-bottom"
          />
        </div>
      </Reveal>
    </div>
  )
}
