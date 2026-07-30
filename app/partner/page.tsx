import type { Metadata } from 'next'
import { Footer } from '../components/footer-section'
import { PartnerTabs } from './components/partner-tabs'

export const metadata: Metadata = {
  title: 'Partner with ShowMe STL',
  description: 'Get St. Louis to show up to your business.',
}

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-black">
      <PartnerTabs />
      <Footer />
    </div>
  )
}
