import type { Metadata } from 'next'
import { playStoreMetadata } from '@/lib/store-links'
import Hero from './components/hero'
import { Footer } from './components/footer-section'
import { Navbar } from './components/navbar'

export const metadata: Metadata = playStoreMetadata()

export default function Home() {
  return (
    <>
      <Hero />
      <Footer />
      <Navbar />
    </>
  )
}
