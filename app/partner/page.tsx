import type { Metadata } from 'next'
import { Footer } from '../components/footer-section'
import { Navbar } from '../components/navbar'
import { PartnerContent } from './components/partner-content'

export const metadata: Metadata = {
  title: 'Your spot deserves to be found | ShowMe STL',
  description: 'A website, an app, and a spot in the app St. Louis uses to find what to do. Starter sites from $100 setup + $49/mo.',
}

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-[#0f0d10]">
      <PartnerContent />
      <Footer />
      <Navbar />
    </div>
  )
}
