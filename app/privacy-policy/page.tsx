import type { Metadata } from 'next'
import { LegalDocumentLayout, type LegalDocumentSection } from '../components/legal-document-layout'

export const metadata: Metadata = {
  title: 'Privacy Policy · ShowMe STL',
  description: 'How ShowMe STL uses your information, including profiles, location, social features, and SMS verification.',
  alternates: { canonical: 'https://www.showmestl.app/privacy-policy' },
  robots: { index: false, follow: false },
}

const sections: readonly LegalDocumentSection[] = [
  {
    id: 'about',
    title: 'About this policy',
    content: <p>ShowMe STL, operated by ShowMe Cities LLC (we, our, or us), helps you discover places and events around St. Louis, save favorites, build playlists, and connect with friends. This policy explains what information we collect, how we use it, and the choices available to you.</p>,
  },
  {
    id: 'information',
    title: 'Information we collect',
    content: <ul>
      <li><strong>Account information.</strong> Your phone number, an email address associated with an existing email account, your name, and profile details you provide.</li>
      <li><strong>Saved content and preferences.</strong> Liked places, playlists, interests, preferences, prompts, and optional notes.</li>
      <li><strong>Social activity.</strong> Friend relationships, event responses, check-ins, comments, stickers, and the membership of private friend groups called Crowds. The audience for this information depends on the feature and its visibility settings.</li>
      <li><strong>Photos you choose to upload.</strong> Profile photos, playlist covers, and other images you choose to add through available App features.</li>
      <li><strong>Location information.</strong> Approximate or precise location when you grant permission, used for nearby discovery, distance estimates, and location-based actions such as check-ins.</li>
      <li><strong>Chat information.</strong> Messages and prompts you send to ShowMe AI, its responses, and saved chat history when you use the saved-chat feature.</li>
      <li><strong>Technical information.</strong> Authentication and SMS-delivery information, push-notification tokens, and limited diagnostics and product events used to operate, troubleshoot, and improve the App.</li>
      <li><strong>Purchase information.</strong> Subscription status and transaction-related records provided through Apple if you use a subscription-enabled App version.</li>
    </ul>,
  },
  {
    id: 'use',
    title: 'How we use information',
    content: <ul>
      <li>To create and secure your account and verify requests to sign in.</li>
      <li>To personalize discovery, favorites, playlists, and profile details.</li>
      <li>To show relevant places and events and sort results by distance.</li>
      <li>To save and sync content across sessions and devices.</li>
      <li>To provide friends, check-ins, comments, private groups, and other social features.</li>
      <li>To answer your ShowMe AI prompts and continue saved conversations.</li>
      <li>To deliver verification texts and notifications related to App activity.</li>
      <li>To process subscriptions and restore eligible purchases where offered.</li>
      <li>To monitor reliability, investigate issues, and improve the product.</li>
    </ul>,
  },
  {
    id: 'phone-verification',
    title: 'Phone numbers and verification texts',
    content: <>
      <p>Phone-enabled App versions use your phone number and authentication-related information to send and verify six-digit one-time codes for signup, sign-in, and adding a phone to an existing account. An existing email account keeps its email address when a phone is verified on the same account.</p>
      <p>Supabase handles account authentication, code generation, and verification. Bird receives the recipient phone number and the message containing the verification code so it can deliver the requested text. Bird and the carriers involved process the message and delivery information needed to deliver it.</p>
      <p>Requesting a verification code does not subscribe you to marketing texts. We do not sell or share phone numbers or SMS opt-in consent with third parties for their marketing or promotional purposes. Information needed to operate and deliver verification is provided to authentication and messaging providers, including Supabase and Bird, and the carriers involved.</p>
      <p>Message frequency depends on your requests. Message and data rates may apply. For US verification texts, reply <strong>STOP</strong> to opt out, <strong>START</strong> to resume, or <strong>HELP</strong> for support information. STOP blocks further one-time codes from that sender; requesting another code does not reverse that preference. See our <a href="/terms-of-service#verification-texts">SMS terms</a> for details.</p>
    </>,
  },
  {
    id: 'location',
    title: 'Location permissions',
    content: <>
      <p>If you allow location access, ShowMe STL uses it to estimate distance to places, improve local discovery results, and support location-based actions you request. You can disable location access at any time in your device settings.</p>
      <p>A check-in records the place or event you choose and is shown according to its audience settings. Turning off the device’s location permission does not itself end a check-in you have already created.</p>
    </>,
  },
  {
    id: 'photos',
    title: 'Photos and media',
    content: <p>Photo library access is optional. If you grant access, ShowMe STL uses selected images for the profile, playlist, or other App content you choose to create. You can manage photo permissions in your device settings.</p>,
  },
  {
    id: 'visibility',
    title: 'Profiles and social visibility',
    content: <>
      <p>Profiles are public by default. Profile details and public playlists may be visible to other ShowMe STL users. You can change your profile’s privacy setting in Manage Profile. A private profile restricts access to profile content; information you separately share through another feature follows that feature’s visibility rules.</p>
      <p>Check-ins have their own audience controls, including friends, selected friends, private Crowds, and private visibility. Comments and stickers on a shared check-in are visible to its permitted audience. Review the audience before posting.</p>
    </>,
  },
  {
    id: 'sharing',
    title: 'Sharing and service providers',
    content: <>
      <p>We do not sell your personal information. We share information with service providers that help us run the App, deliver verification and notifications, store data, process eligible purchases, or maintain reliability. Content you choose to make visible through social features is also available to its permitted audience.</p>
      <ul>
        <li><strong>Supabase</strong> provides authentication, database storage, and file storage.</li>
        <li><strong>Bird and mobile carriers</strong> deliver requested verification texts.</li>
        <li><strong>OpenAI</strong> processes information sent to ShowMe AI to generate responses.</li>
        <li><strong>Expo and Apple services</strong> support push notifications and App Store services.</li>
        <li><strong>Apple</strong> handles subscription billing and related transactions where offered.</li>
        <li>Operations and logging providers receive diagnostic and App event data needed to operate the service.</li>
      </ul>
      <p>The App may create shareable links for places, events, and playlists. The content available through a shared link depends on the content’s visibility and the feature.</p>
    </>,
  },
  {
    id: 'retention',
    title: 'Retention',
    content: <p>We keep account and saved-content data for as long as your account remains active or as needed to provide the service. Some records may be kept longer when required for legal, security, billing, or fraud-prevention reasons.</p>,
  },
  {
    id: 'choices',
    title: 'Your choices',
    content: <>
      <ul>
        <li>Update your profile information and privacy settings inside the App.</li>
        <li>Choose the audience for check-ins and other content where audience controls are offered.</li>
        <li>Manage location, photos, and notification permissions in your device settings.</li>
        <li>Delete saved chats through the chat sidebar.</li>
        <li>Use STOP or START to manage US verification texts, as described above.</li>
        <li>Request account or data deletion by contacting us or using Delete Account in Manage Profile.</li>
      </ul>
      <p>Temporary Chat does not save the conversation in your ShowMe STL chat history. It can still involve processing by our AI provider, and actions such as creating a playlist may save the content you request.</p>
    </>,
  },
  {
    id: 'children',
    title: 'Children’s privacy',
    content: <p>ShowMe STL is not intended for children under 13, and we do not knowingly collect personal information from children under 13.</p>,
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: <p>We may update this Privacy Policy from time to time. When we do, we will post the updated version on this page and change the “Last updated” date above.</p>,
  },
  {
    id: 'contact',
    title: 'Get in touch',
    content: <p>For support, privacy questions, or account and data deletion requests, contact ShowMe STL at <a href="mailto:support@showmestl.app">support@showmestl.app</a>.</p>,
  },
]

export default function PrivacyPolicyPage() {
  return <LegalDocumentLayout kind="privacy" title="Privacy Policy" intro="What you share with ShowMe, how we use it, and the choices you control." updated="October 9, 2026" sections={sections} />
}
