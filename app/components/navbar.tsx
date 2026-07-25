'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { InstallQrModal } from './install-qr-modal'

const APP_STORE_URL = 'https://apps.apple.com/app/id6760572115'

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Support', href: 'mailto:support@showmecities.com' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => setIsOpen(!isOpen)
  const [qrOpen, setQrOpen] = useState(false)
  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= 1024) {
      e.preventDefault()
      setQrOpen(true)
    }
  }
  const scrollY = useMotionValue(0)
  useEffect(() => {
    const onScroll = () => scrollY.set(window.scrollY)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollY])
  const opacity = useTransform(scrollY, [0, 400, 2950, 3100], [1, 0, 0, 1])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex w-full justify-center px-4 py-6">
      <motion.div
        className="relative flex w-full max-w-[60rem] items-center justify-between rounded-full px-5 py-2"
        style={{
          opacity,
          background: 'rgba(40, 36, 44, 0.3)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <a href="/" className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.3 }}
            className="relative h-7 w-7 overflow-hidden rounded-md"
          >
            <Image src="/app-icon.png" alt="" fill sizes="28px" className="object-cover" priority />
          </motion.div>
          <span className="text-sm font-semibold tracking-tight text-white">ShowMe STL</span>
        </a>

        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden items-center space-x-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                >
                <a href={item.href} className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                  {item.label}
                </a>
              </motion.div>
            ))}
          </nav>

          <motion.button
            className="flex items-center md:hidden"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-white" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <a
              href="https://apps.apple.com/app/id6760572115"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/90"
            >
              <AppleIcon className="size-3.5" />
              Download
            </a>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/60 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleMenu}
          >
            <motion.div
              className="absolute -right-4 top-0 bottom-0 w-3/4 max-w-sm bg-[#0f0d10] px-6 pt-24 pr-10 shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
            <motion.button
              className="absolute right-6 top-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block w-full py-4 text-lg font-medium text-white"
                  onClick={() => toggleMenu()}
                >
                  {item.label}
                </a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <a
                  href="https://apps.apple.com/app/id6760572115"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-base font-medium text-black transition-colors hover:bg-white/90"
                  onClick={() => setTimeout(toggleMenu, 0)}
                >
                  <AppleIcon className="size-4" />
                  Download
                </a>
              </motion.div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <InstallQrModal href={APP_STORE_URL} open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  )
}

function AppleIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.546,12.763c0.024-1.87,1.004-3.597,2.597-4.576c-1.009-1.442-2.64-2.323-4.399-2.378c-1.851-0.194-3.645,1.107-4.588,1.107c-0.961,0-2.413-1.088-3.977-1.056C6.122,5.927,4.25,7.068,3.249,8.867c-2.131,3.69-0.542,9.114,1.5,12.097c1.022,1.461,2.215,3.092,3.778,3.035c1.529-0.063,2.1-0.975,3.945-0.975c1.828,0,2.364,0.975,3.958,0.938c1.64-0.027,2.674-1.467,3.66-2.942c0.734-1.041,1.299-2.191,1.673-3.408C19.815,16.788,18.548,14.879,18.546,12.763z" />
      <path d="M15.535,3.847C16.429,2.773,16.87,1.393,16.763,0c-1.366,0.144-2.629,0.797-3.535,1.829c-0.895,1.019-1.349,2.351-1.261,3.705C13.352,5.548,14.667,4.926,15.535,3.847z" />
    </svg>
  )
}
