'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Mail, X } from 'lucide-react'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClose = () => {
    onClose()
    setStatus('idle')
    setEmail('')
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleClose is recreated each render but stable in behavior
  }, [open])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          website: form.get('website'),
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Contact ShowMe STL"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 px-4"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f0d10] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>

            <div className="flex size-12 items-center justify-center rounded-full bg-[#FF3B30]/15">
              <Mail className="size-6 text-[#FF3B30]" />
            </div>

            {status === 'success' ? (
              <>
                <p className="mt-4 text-lg font-semibold text-white">You&rsquo;re on our list</p>
                <p className="mt-2 text-sm text-white/60">
                  Thanks — we&rsquo;ll respond within 24 hours.
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-lg font-semibold text-white">Let&rsquo;s put you on the map</p>
                <p className="mt-2 text-sm text-white/60">
                  Leave your email and we&rsquo;ll respond within 24 hours.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#FF3B30]/50 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex items-center justify-center rounded-full bg-[#FF3B30] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#FF3B30]/90 disabled:opacity-50"
                  >
                    {status === 'submitting' ? 'Sending…' : 'Submit'}
                  </button>
                  {status === 'error' && (
                    <p className="text-center text-xs text-red-400">
                      Something went wrong. Email us directly at contact@showmestl.com.
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
