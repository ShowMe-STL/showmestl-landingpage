import type { Metadata } from 'next'
import { LegalDocumentLayout, type LegalDocumentSection } from '../components/legal-document-layout'

export const metadata: Metadata = {
  title: 'Terms of Service · ShowMe STL',
  description: 'Terms for using ShowMe STL, including accounts, user content, and verification texts.',
  alternates: { canonical: 'https://www.showmestl.app/terms-of-service' },
  robots: { index: false, follow: false },
}

const sections: readonly LegalDocumentSection[] = [
  {
    id: 'using-showme',
    title: 'Using ShowMe STL',
    content: <>
      <p>These Terms of Service govern your use of the ShowMe STL mobile application (the App), operated by ShowMe Cities LLC (ShowMe STL, we, our, or us). By using the App, you agree to these terms. If you do not agree, do not use the App.</p>
      <p>ShowMe STL helps you discover places and events around St. Louis, create playlists, and connect with friends. You may use it for personal, non-commercial purposes only. You agree not to misuse the App, access it through unauthorized means, or interfere with its operation or other users.</p>
    </>,
  },
  {
    id: 'accounts',
    title: 'Your account',
    content: <>
      <p>Phone-enabled App versions require a phone number that can receive verification texts. Six-digit one-time codes verify your number and sign you in. Existing email accounts verify their email first, then add and verify a phone number on the same account, preserving their existing content. Older App versions may use email verification.</p>
      <p>Maintain access to your phone number and keep verification codes private. You are responsible for maintaining the security of your account and for activity that occurs under it. You may delete your account from Manage Profile inside the App.</p>
      <p>Our <a href="/privacy-policy">Privacy Policy</a> explains how we use account information and the choices available to you.</p>
    </>,
  },
  {
    id: 'verification-texts',
    title: 'Verification texts',
    content: <>
      <p>Entering your phone number and tapping Next or Send Code requests a ShowMe STL verification text at that number for signup, sign-in, or adding a verified phone to an existing account. The verification-text notice and legal links appear before you request the code.</p>
      <p>This consent applies to authentication texts only and does not authorize marketing texts. Message frequency depends on your requests. Message and data rates may apply. Delivery depends on your carrier and service availability.</p>
      <ul>
        <li>Reply <strong>STOP</strong> to opt out of US verification texts from this sender.</li>
        <li>Reply <strong>START</strong> to resume verification texts.</li>
        <li>Reply <strong>HELP</strong> for support information.</li>
      </ul>
      <p>STOP blocks further verification texts from this sender, including one-time codes, and may prevent you from receiving the codes needed to sign in. Requesting another code in the App does not reverse an opt-out.</p>
      <p>For help with verification or SMS preferences, contact <a href="mailto:support@showmestl.app">support@showmestl.app</a>.</p>
    </>,
  },
  {
    id: 'user-content',
    title: 'Content you create',
    content: <>
      <p>You retain ownership of content you create in the App, including playlists, profile information, photos, and check-in content. By creating content, you grant us a limited license to store and display it to operate the App.</p>
      <p>The audience for your content depends on the feature and its visibility settings. Review those settings before sharing profile information, playlists, or check-ins.</p>
    </>,
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions and purchases',
    content: <>
      <p>If an App version offers an auto-renewing subscription, its price and included features are shown when you purchase it. Subscriptions billed through your Apple ID account are governed by Apple’s payment terms.</p>
      <p>You can manage or cancel an Apple-billed subscription through your device’s subscription settings. Cancellation takes effect at the end of the current billing period. We do not offer refunds except as required by applicable law.</p>
    </>,
  },
  {
    id: 'intellectual-property',
    title: 'Our content and design',
    content: <p>All App content, design, and functionality not created by users is owned by or licensed to ShowMe STL. You may not copy, reproduce, or distribute it without our written permission.</p>,
  },
  {
    id: 'warranties',
    title: 'Service availability and accuracy',
    content: <p>The App is provided “as is” without warranties of any kind, express or implied. We do not guarantee that the App will be error-free or uninterrupted, or that place information will always be accurate or up to date.</p>,
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    content: <p>To the fullest extent permitted by law, ShowMe STL is not liable for indirect, incidental, special, or consequential damages arising from your use of the App.</p>,
  },
  {
    id: 'termination',
    title: 'Suspension and termination',
    content: <p>We reserve the right to suspend or terminate access to the App at any time for violations of these terms or for any other reason with reasonable notice.</p>,
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    content: <p>We may update these Terms of Service from time to time. Continued use of the App after changes are posted constitutes your acceptance of the updated terms.</p>,
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    content: <p>These terms are governed by the laws of the State of Missouri, without regard to its conflict-of-law provisions.</p>,
  },
  {
    id: 'contact',
    title: 'Get in touch',
    content: <p>For questions about these terms, contact ShowMe STL at <a href="mailto:support@showmestl.app">support@showmestl.app</a>.</p>,
  },
]

export default function TermsOfServicePage() {
  return <LegalDocumentLayout kind="terms" title="Terms of Service" intro="The terms that apply when you explore St. Louis with ShowMe." updated="October 9, 2026" sections={sections} />
}
