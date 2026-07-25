'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ComponentProps, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { siFacebook, siInstagram, siTiktok } from 'simple-icons'
import { QRCode } from './qr-code'
import { InstallQrModal } from './install-qr-modal'

const APP_STORE_URL = 'https://apps.apple.com/app/id6760572115'

interface FooterLink {
  title: string
  href: string
  external?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

interface FooterColumn {
  label: string
  links: FooterLink[]
}

const footerLinks: FooterColumn[] = [
  {
    label: 'Pages',
    links: [
      { title: 'Home', href: '/' },
      { title: 'About', href: '/#about' },
      { title: 'Support', href: 'mailto:support@showmecities.com' },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'Apps', href: 'https://showmecities.com', external: true },
      { title: 'Privacy', href: 'https://showmecities.com/privacy-policy', external: true },
      { title: 'Terms', href: 'https://showmecities.com/terms-of-service', external: true },
    ],
  },
]

export function Footer() {
  const [qrOpen, setQrOpen] = useState(false)
  return (
    <footer className="relative mx-auto flex w-full max-w-[72rem] flex-col items-center justify-center rounded-t-4xl border-t border-white/10 bg-[radial-gradient(35%_128px_at_50%_0%,rgba(255,255,255,0.08),transparent)] px-6 pt-12 pb-32 md:rounded-t-[3rem] lg:pt-16 lg:pb-48">
      <div className="absolute top-0 left-1/2 right-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur" />

      <div className="grid w-full grid-cols-[1fr_auto_auto] items-start gap-6 sm:gap-8 md:grid-cols-[1fr_auto_auto_auto] md:gap-10 xl:gap-12">
        <AnimatedContainer className="space-y-4">
          <a href="/" className="flex w-fit items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-md">
              <Image
                src="/app-icon.png"
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              ShowMe STL
            </span>
          </a>
          <p className="mt-8 hidden text-sm text-white/50 md:mt-0 md:block">
            <span className="whitespace-nowrap">
              © {new Date().getFullYear()}{' '}
              <a
                href="https://showmecities.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                ShowMe Cities
              </a>{' '}
              LLC.
            </span>{' '}
            <span className="whitespace-nowrap">All rights reserved.</span>
          </p>
          <div className="flex items-center gap-4 pt-2 text-white/60">
            <a
              href="https://www.instagram.com/shome.stl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-colors hover:text-white"
            >
              <InstagramIcon className="size-6" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-colors hover:text-white"
            >
              <FacebookIcon className="size-6" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="transition-colors hover:text-white"
            >
              <TikTokIcon className="size-6" />
            </a>
          </div>
        </AnimatedContainer>

        {footerLinks.map((section, index) => (
          <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
            <div>
              <h3 className="text-xs text-white/80">{section.label}</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/50">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center transition-colors duration-300 hover:text-white"
                    >
                      {link.icon && <link.icon className="me-1 size-4" />}
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedContainer>
        ))}

        <AnimatedContainer delay={0.4} className="hidden justify-self-start md:block xl:justify-self-end">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <AppleIcon className="size-3.5" />
              <span>Scan to install</span>
            </div>
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              aria-label="Show install QR code"
              className="group cursor-pointer rounded-2xl border border-white/20 bg-transparent p-3 transition-colors duration-300 hover:border-transparent hover:bg-white focus-visible:border-transparent focus-visible:bg-white focus-visible:outline-none"
            >
              <QRCode
                value={APP_STORE_URL}
                size={140}
                fgColor="#ffffff"
                bgColor="#0f0d10"
                className="transition-[filter] duration-300 group-hover:invert group-focus-visible:invert"
              />
            </button>
          </div>
        </AnimatedContainer>
      </div>
      <p className="absolute bottom-6 left-6 right-6 whitespace-nowrap text-center text-sm text-white/50 md:hidden">
        © {new Date().getFullYear()}{' '}
        <a
          href="https://showmecities.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-white"
        >
          ShowMe Cities
        </a>{' '}
        LLC. All rights reserved.
      </p>
      <InstallQrModal
        href={APP_STORE_URL}
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </footer>
  )
}

type ViewAnimationProps = {
  delay?: number
  className?: ComponentProps<typeof motion.div>['className']
  children: ReactNode
}

function InstagramIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d={siInstagram.path} />
    </svg>
  )
}

function TikTokIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d={siTiktok.path} />
    </svg>
  )
}

function FacebookIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d={siFacebook.path} />
    </svg>
  )
}

function AppleIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.546,12.763c0.024-1.87,1.004-3.597,2.597-4.576c-1.009-1.442-2.64-2.323-4.399-2.378c-1.851-0.194-3.645,1.107-4.588,1.107c-0.961,0-2.413-1.088-3.977-1.056C6.122,5.927,4.25,7.068,3.249,8.867c-2.131,3.69-0.542,9.114,1.5,12.097c1.022,1.461,2.215,3.092,3.778,3.035c1.529-0.063,2.1-0.975,3.945-0.975c1.828,0,2.364,0.975,3.958,0.938c1.64-0.027,2.674-1.467,3.66-2.942c0.734-1.041,1.299-2.191,1.673-3.408C19.815,16.788,18.548,14.879,18.546,12.763z" />
      <path d="M15.535,3.847C16.429,2.773,16.87,1.393,16.763,0c-1.366,0.144-2.629,0.797-3.535,1.829c-0.895,1.019-1.349,2.351-1.261,3.705C13.352,5.548,14.667,4.926,15.535,3.847z" />
    </svg>
  )
}

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
