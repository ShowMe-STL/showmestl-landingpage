import type { Metadata } from 'next'
import { WebServicesContent } from './content'
import { Footer } from '../components/footer-section'
import { Navbar } from '../components/navbar'

export const metadata: Metadata = {
  title: 'Websites & Apps for St. Louis Businesses | ShowMe STL',
  description: 'Get a beautiful website or custom app for your St. Louis business. $100 websites hosted on ShowMe STL, custom builds, and mobile apps.',
}

export default function WebsitesPage() {
  return (
    <div className="min-h-screen bg-[#0f0d10]">
      <WebServicesContent />
      <Footer />
      <Navbar />
    </div>
  )
}
