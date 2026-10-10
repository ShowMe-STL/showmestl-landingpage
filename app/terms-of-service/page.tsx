import type { Metadata } from 'next'
import { LegalDocumentLayout, type LegalDocumentSection } from '../components/legal-document-layout'

export const metadata: Metadata = {
  title: 'Terms of Service · ShowMe STL',
  description: 'Terms for using ShowMe STL, including accounts, ShowMe AI, community content, and verification texts.',
  alternates: { canonical: 'https://www.showmestl.app/terms-of-service' },
  robots: { index: false, follow: false },
}

const sections: readonly LegalDocumentSection[] = [
  {
    id: 'using-showme',
    title: 'Using ShowMe STL',
    content: <>
      <p>These Terms of Service govern your use of the ShowMe STL mobile application (the App), operated by ShowMe Cities LLC (ShowMe STL, we, our, or us). By using the App, you agree to these terms. If you do not agree, do not use the App.</p>
      <p>ShowMe STL helps you discover places and events around St. Louis, create playlists, use ShowMe AI, and connect with friends. You may use it for personal, non-commercial purposes only. You agree not to misuse the App, access it through unauthorized means, or interfere with its operation or other users. The App is not intended for children under 13.</p>
    </>,
  },
  {
    id: 'accounts',
    title: 'Your account',
    content: <>
      <p>Phone-enabled App versions require a phone number that can receive verification texts. Six-digit one-time codes verify your number and sign you in. Existing email accounts without a verified phone verify their email first, then add and verify a phone number on the same account, preserving their existing content. After migration, sign-in uses SMS. Older App versions may use email verification.</p>
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
      <p>You retain ownership of content you create in the App, including playlists, profile information, photos, and check-in content. You must have the rights and permission needed to upload or share that content, including photos and information about other people.</p>
      <p>You grant us a limited license to host, process, transmit, and display your content to provide the features you request, including processing through service providers described in our <a href="/privacy-policy">Privacy Policy</a>.</p>
      <p>The audience for your content depends on the feature and its visibility settings. Private profile mode does not make every profile field or uploaded image confidential. Public playlists have separate visibility settings, and shared information can be copied or captured by others. Review the <a href="/privacy-policy#visibility">visibility rules</a> and <a href="/privacy-policy#photos">media details</a> before sharing.</p>
    </>,
  },
  {
    id: 'community',
    title: 'Community standards',
    content: <>
      <p>Follow the App’s community guidelines and treat other people respectfully. Do not post harassment, threats, hate, spam, impersonation, misleading information, unlawful content, or content that violates another person’s privacy or rights. Do not abuse verification, social features, or the AI service.</p>
      <p>We may review content and restrict or remove content or accounts that violate these terms or the community guidelines. Contact <a href="mailto:support@showmestl.app">support@showmestl.app</a> to report safety concerns or misuse.</p>
    </>,
  },
  {
    id: 'showme-ai',
    title: 'Using ShowMe AI',
    content: <>
      <p>ShowMe AI uses OpenAI and our App tools to respond to your messages and selected photos. Your inputs, conversation context, and relevant tool information are processed as described in our <a href="/privacy-policy#showme-ai">AI privacy disclosure</a>. Only send information you are permitted to share.</p>
      <p>AI responses may be incomplete, incorrect, or out of date. Verify venue and event details with the original source before relying on a recommendation. A generated answer is not a guarantee that a place is open, an event is available, or a suggested activity is suitable for you.</p>
      <p>Requests may continue processing after you leave the chat or close the App. Requested actions, such as creating a playlist, may save content separately in your account. Temporary Chat keeps the conversation out of your saved ShowMe history, but does not prevent those actions or guarantee zero retention by our service or providers. Deleting a chat does not automatically delete a created playlist or cancel processing.</p>
    </>,
  },
  {
    id: 'places-events',
    title: 'Places, events, and promotions',
    content: <>
      <p>Listings, recommendations, distance estimates, and links help you explore; they do not guarantee hours, prices, availability, admission, accessibility, or safety. Confirm important details with the venue or organizer. Third-party websites, venues, and events have their own terms and policies.</p>
      <p>Age-related discovery preferences do not verify your age or replace a venue’s admission requirements. You are responsible for following applicable laws and venue rules.</p>
      <p>Optional raffles, giveaways, and other promotions are subject to their separate official rules, including eligibility, entry periods, and prize conditions. A recorded visit or check-in does not by itself guarantee eligibility, a valid entry, or a prize.</p>
    </>,
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions and purchases',
    content: <>
      <p>If an App version offers an auto-renewing subscription, its price and included features are shown when you purchase it. Subscriptions billed through your Apple ID account are governed by Apple’s payment terms.</p>
      <p>You can manage or cancel an Apple-billed subscription through your device’s subscription settings. Cancellation takes effect at the end of the current billing period. We do not offer refunds except as required by applicable law.</p>
      <p>Deleting your ShowMe STL account does not cancel a subscription billed through Apple. Use Apple’s subscription controls to cancel it.</p>
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
    content: <p>The App is provided “as is” without warranties of any kind, express or implied, to the extent permitted by law. We do not guarantee that the App will be error-free or uninterrupted, or that place, event, or AI information will always be accurate or up to date.</p>,
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
