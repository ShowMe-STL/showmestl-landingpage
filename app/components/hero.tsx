'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cubicBezier, motion, useScroll, useTransform } from 'motion/react'
import Grainient from './grainient'
import IPhoneMockup from './iphone-mockup'
import { AppStoreCta } from './app-store-cta'

export default function Hero() {
  const { scrollY } = useScroll()
  const phoneRef = useRef<HTMLDivElement>(null)
  const [phoneTargetY, setPhoneTargetY] = useState(-360)

  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const contentY = useTransform(scrollY, [0, 400], [0, -40])
  const phoneY = useTransform(scrollY, [0, 800], [0, phoneTargetY], {
    ease: cubicBezier(0.42, 0, 0.58, 1),
  })
  const homeOpacity = useTransform(scrollY, [1650, 1900], [1, 0])
  const exploreOpacity = useTransform(scrollY, [1650, 1900], [0, 1])
  const palette1Opacity = useTransform(
    scrollY,
    [1650, 1900, 2700, 2950],
    [1, 0, 0, 1]
  )
  const palette2Opacity = useTransform(
    scrollY,
    [1650, 1900, 2700, 2950],
    [0, 1, 1, 0]
  )
  const friendsOpacity = useTransform(
    scrollY,
    [850, 1200, 1650, 1900],
    [0, 1, 1, 0]
  )
  const friendsX = useTransform(
    scrollY,
    [850, 1200, 1650, 1900],
    [-24, 0, 0, -24]
  )
  const curatedOpacity = useTransform(scrollY, [1900, 2250], [0, 1])
  const curatedX = useTransform(scrollY, [1900, 2250], [24, 0])
  const friendsHeadlineOpacity = useTransform(
    scrollY,
    [850, 1200, 1650, 1900],
    [0, 1, 1, 0]
  )
  const curatedHeadlineOpacity = useTransform(
    scrollY,
    [1900, 2250],
    [0, 1]
  )
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  const phoneScale = useTransform(scrollY, [400, 800], isMobile ? [1, 0.65] : [1, 1], {
    ease: cubicBezier(0.42, 0, 0.58, 1),
  })
  const phoneOffsetY = useTransform(scrollY, [400, 800], isMobile ? ['0vh', '30vh'] : ['0vh', '0vh'], {
    ease: cubicBezier(0.42, 0, 0.58, 1),
  })

  useEffect(() => {
    const measure = () => {
      if (window.scrollY > 1) return
      const el = phoneRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const restingCenter = rect.top + rect.height / 2
      const targetCenter = window.innerHeight / 2
      setPhoneTargetY(targetCenter - restingCenter)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <section className="relative w-full h-[calc(2950px+100vh)]">
      <div id="about" className="absolute top-[1200px] left-0 h-px w-px" aria-hidden="true" />
      <div className="sticky top-0 h-screen w-full overflow-visible">
        <div
          className="absolute inset-x-0 top-0 -bottom-64 opacity-10 pointer-events-none"
          style={{
            maskImage:
              'linear-gradient(to bottom, black 0%, black calc(100% - 256px), transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, black calc(100% - 256px), transparent 100%)',
          }}
        >
          <motion.div style={{ opacity: palette1Opacity }} className="absolute inset-0">
            <Grainient color1="#FF6E52" color2="#0f0d10" color3="#3A87FF" />
          </motion.div>
          <motion.div style={{ opacity: palette2Opacity }} className="absolute inset-0">
            <Grainient color1="#2DBD8C" color2="#0f0d10" color3="#F2B840" />
          </motion.div>
        </div>
        <motion.div
          style={{
            opacity: friendsOpacity,
            x: friendsX,
            maxWidth: 'min(28rem, calc(50vw - min(100vh * 0.245, 210px) - 64px))',
          }}
          className="absolute top-1/2 left-10 hidden -translate-y-1/2 text-left md:block"
        >
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl xl:text-5xl">
            STL is more fun with friends.
          </h2>
          <p className="mt-5 text-base font-light text-white/60 md:text-lg">
            Follow people, see their check-ins, and find out where everyone&rsquo;s at — without the group chat chaos.
          </p>
        </motion.div>
        <motion.div
          style={{
            opacity: curatedOpacity,
            x: curatedX,
            maxWidth: 'min(28rem, calc(50vw - min(100vh * 0.245, 210px) - 64px))',
          }}
          className="absolute top-1/2 right-10 hidden -translate-y-1/2 text-left md:block"
        >
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl xl:text-5xl">
            Curated for You
          </h2>
          <p className="mt-5 text-base font-light text-white/60 md:text-lg">
            Browse hundreds of places by category, dive into featured playlists, and discover spots you never knew existed.
          </p>
        </motion.div>
        <motion.div
          style={{ opacity: friendsHeadlineOpacity }}
          className="pointer-events-none absolute inset-x-6 top-[12vh] z-30 text-center md:hidden"
        >
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white">
            STL is more fun with friends.
          </h2>
          <p className="mt-3 text-left text-base font-light text-white/70">
            Follow people, see their check-ins, and find out where everyone&rsquo;s at — without the group chat chaos.
          </p>
        </motion.div>
        <motion.div
          style={{ opacity: curatedHeadlineOpacity }}
          className="pointer-events-none absolute inset-x-6 top-[12vh] z-30 text-center md:hidden"
        >
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white">
            Curated for You
          </h2>
          <p className="mt-3 text-left text-base font-light text-white/70">
            Browse hundreds of places by category, dive into featured playlists, and discover spots you never knew existed.
          </p>
        </motion.div>
        <div className="absolute left-1/2 top-36 flex -translate-x-1/2 flex-col items-center text-center">
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl leading-none font-semibold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem]">
              Find Your STL
            </h1>
            <p className="mt-4 text-xl font-light text-white/60">
              Everything Saint Louis has to offer, right in your pocket.
            </p>
            <div className="mt-12 flex items-center justify-center gap-4">
              <AppStoreCta href="https://apps.apple.com/app/id6760572115" />
            </div>
          </motion.div>
          <motion.div ref={phoneRef} style={{ y: phoneY }} className="relative mt-16">
            <motion.div
              style={{ scale: phoneScale, y: phoneOffsetY }}
              className="origin-top"
            >
            <IPhoneMockup>
              <motion.div
                style={{ opacity: homeOpacity }}
                className="absolute inset-0"
              >
                <Image
                  src="/screenshots/home.png"
                  alt="App home screen"
                  fill
                  sizes="420px"
                  className="object-cover object-top"
                  priority
                />
              </motion.div>
              <motion.div
                style={{ opacity: exploreOpacity }}
                className="absolute inset-0"
              >
                <Image
                  src="/screenshots/explore.png"
                  alt="App explore screen"
                  fill
                  sizes="420px"
                  className="object-cover object-top"
                  priority
                />
              </motion.div>
            </IPhoneMockup>
            </motion.div>
          </motion.div>
        </div>
        <motion.div
          style={{ opacity: contentOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-48 bg-gradient-to-b from-transparent to-[#0f0d10]"
          aria-hidden="true"
        />
        <motion.div
          style={{ opacity: contentOpacity }}
          className="absolute left-1/2 bottom-10 z-30 -translate-x-1/2"
        >
          <button
            type="button"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
            }
            aria-label="Scroll down"
            className="flex size-14 animate-bounce items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-white/90"
          >
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
