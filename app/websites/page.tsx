import type { Metadata } from 'next'
import { WebServicesContent } from './content'
import { Footer } from '../components/footer-section'
import { Navbar } from '../components/navbar'

export const metadata: Metadata = {
  title: 'Your spot deserves to be found | ShowMe STL',
  description: 'A website, an app, and a spot in the app St. Louis uses to find what to do. Starter sites from $100 setup + $49/mo.',
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
