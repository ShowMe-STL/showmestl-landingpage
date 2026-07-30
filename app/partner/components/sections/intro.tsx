import Image from 'next/image'
import { Reveal } from '../section-ui'

interface IntroProps {
  onNext?: () => void
}

export function Intro({ onNext }: IntroProps) {
  return (
    <div className="space-y-10">
      <Reveal>
        <div className="relative">
          <Image
            src="/partner/welcome-bg.png"
            alt=""
            fill
            sizes="(min-width: 768px) 72rem, 100vw"
            className="object-cover opacity-70"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black" />
          <div className="relative flex flex-col items-center px-6 py-20 text-center sm:py-28">
            <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">
              Get St. Louis to show up to your business
            </h1>
            <button
              type="button"
              onClick={onNext}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Get Started
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="max-w-4xl">
          <p className="text-xl font-light text-white/90">
            St. Louis has incredible restaurants, bars, and neighborhoods, but somewhere along the way, we stopped
            telling that story.
          </p>
          <p className="mt-4 text-xl font-light text-white/90">
            The way we rebuild St. Louis is by creating places people love. You took the chance to build something
            beautiful. Let us help people discover it.
          </p>
        </div>
      </Reveal>
    </div>
  )
}
