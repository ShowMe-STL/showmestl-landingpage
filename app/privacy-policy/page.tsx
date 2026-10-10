import type { Metadata } from 'next'
import { LegalDocumentLayout, type LegalDocumentSection } from '../components/legal-document-layout'

export const metadata: Metadata = {
  title: 'Privacy Policy · ShowMe STL',
  description: 'How ShowMe STL uses your information, including AI chats, profiles, location, social features, and SMS verification.',
  alternates: { canonical: 'https://www.showmestl.app/privacy-policy' },
  robots: { index: false, follow: false },
}

const sections: readonly LegalDocumentSection[] = [
  {
    id: 'about',
    title: 'About this policy',
    content: <p>ShowMe STL, operated by ShowMe Cities LLC (we, our, or us), helps you discover places and events around St. Louis, save favorites, build playlists, chat with ShowMe AI, and connect with friends. This policy covers the App and related ShowMe STL services, including our website and support, and explains what information we collect, how we use it, and the choices available to you.</p>,
  },
  {
    id: 'information',
    title: 'Information we collect',
    content: <ul>
      <li><strong>Account and profile information.</strong> Your phone number, an email address associated with an existing email account, username, name, photo, bio, neighborhood, and optional social-profile details. Profile information may also include college affiliations and graduation years maintained or assigned by ShowMe STL.</li>
      <li><strong>Saved content and preferences.</strong> Liked places, playlists, saved playlists, interests, discovery preferences, and visit counts and history derived from check-ins.</li>
      <li><strong>Social activity.</strong> Friend requests and relationships, event responses, check-ins and their audience, invitations, comments, stickers, notifications, and the membership of private friend groups called Crowds. The audience for this information depends on the feature and its visibility settings.</li>
      <li><strong>Photos you choose to upload.</strong> Profile photos, playlist covers, and other images you choose to add through available App features.</li>
      <li><strong>Location information.</strong> Approximate or precise location when you grant permission, used for nearby discovery, distance estimates, and location-based actions such as check-ins.</li>
      <li><strong>Chat information.</strong> Messages and prompts you send to ShowMe AI, selected chat photos, conversation context, responses, generated titles, saved chat history, and information about requested actions and their processing status.</li>
      <li><strong>Suggestions, support, and safety information.</strong> Place suggestions, addresses, links, notes, support correspondence, review records, and records of accepted community-guidelines versions.</li>
      <li><strong>Promotion participation.</strong> Entry records and visit-related information for optional promotions, as described below.</li>
      <li><strong>Technical and usage information.</strong> Authentication and SMS-delivery information, device push and Live Activity tokens, diagnostic logs, request status and timing, and App activity records used to operate, troubleshoot, measure usage, and improve the service.</li>
      <li><strong>Purchase information.</strong> Subscription status and transaction-related records provided through Apple if you use a subscription-enabled App version.</li>
    </ul>,
  },
  {
    id: 'use',
    title: 'How we use information',
    content: <ul>
      <li>To create and secure your account and verify requests to sign in.</li>
      <li>To personalize discovery using interests, preferences, likes, visits, saved content, and relevant friend activity.</li>
      <li>To show relevant places and events and sort results by distance.</li>
      <li>To save and sync content across sessions and devices.</li>
      <li>To provide friends, check-ins, comments, private groups, and other social features.</li>
      <li>To answer your ShowMe AI prompts, continue conversations, and perform actions you request, such as creating a playlist.</li>
      <li>To deliver verification texts and notifications related to App activity.</li>
      <li>To process subscriptions and restore eligible purchases where offered.</li>
      <li>To review suggestions, respond to support requests, administer optional promotions, and enforce community standards.</li>
      <li>To monitor reliability, measure engagement and service usage, investigate issues, prevent misuse, and improve the product.</li>
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
    id: 'showme-ai',
    title: 'ShowMe AI and chat history',
    content: <>
      <p>When you use ShowMe AI, our AI service sends your messages, selected chat photos, and conversation context to OpenAI to generate responses. Relevant place and event information, tool results, and the results of actions you request may also be included. ShowMe AI may use web searches to answer your request.</p>
      <p>Saved chats are stored with your account, including messages, responses, titles, and related processing records, so you can reopen them from the chat sidebar. Account authentication is handled by our service; the current chat integration does not automatically send your phone number, profile, interests, check-in history, or device location to OpenAI. Information you include in a message or photo is part of the chat input.</p>
      <p><strong>Temporary Chat</strong> keeps the conversation out of your saved ShowMe STL chat history. Our AI service and providers still process it and may retain information for operating and securing the service. It is not a promise of immediate deletion or zero retention. Requested actions, such as creating a playlist, may save content separately in your account.</p>
      <p>Requests can continue processing after you leave a chat or close the App. Deleting a saved chat removes its ShowMe history, but does not automatically cancel processing, delete playlists created from the chat, or delete information retained by a provider. Provider processing and retention are subject to their policies and service settings; see <a href="https://developers.openai.com/api/docs/guides/your-data">OpenAI’s API data controls</a>.</p>
    </>,
  },
  {
    id: 'location',
    title: 'Location permissions',
    content: <>
      <p>With your permission, the App obtains and temporarily caches approximate or precise location while active. It can send coordinates to our backend to find nearby places and events, estimate distance, and support actions such as check-ins and location-based promotion visits. Location may be prepared before you open the check-in flow so nearby results are ready. These flows do not continuously track your location in the background.</p>
      <p>A check-in records the place or event you choose, its time and audience, and any note you add. Turning off location permission does not end an existing check-in. Ending or letting a check-in expire ends its active display; it does not erase stored check-in records or the visit history derived from them.</p>
      <p>You can disable location access at any time in your device settings. Features that require location may then be limited.</p>
    </>,
  },
  {
    id: 'photos',
    title: 'Photos and media',
    content: <>
      <p>Photo access is optional. ShowMe STL uses images you select for your profile, playlist covers, chat attachments, or other available App features. You can manage photo permissions in your device settings. Selected chat photos are processed as described in the ShowMe AI section.</p>
      <p>Profile photos and playlist covers use public image links. Profile and playlist privacy settings restrict associated App content, but do not prevent someone with an image URL from viewing the image. Replacing a photo or deleting an account does not currently remove every previously uploaded image file; contact us to request removal of retained uploads.</p>
    </>,
  },
  {
    id: 'visibility',
    title: 'Profiles and social visibility',
    content: <>
      <p>Profiles are public by default. Private mode limits some in-app collection sections for people who are not your friends. It does not make all profile information confidential: names, usernames, photos, profile details, and interests can remain accessible to others. Public playlists have their own visibility setting and do not become private when you change your profile setting.</p>
      <p>Check-ins have their own audience controls, including friends, selected friends, Crowds, and private visibility. Participants can also have access to a check-in. Comments and stickers are available to its permitted audience. Event responses are visible to you and your direct friends. Your saved-playlist list and Crowd membership lists are available only to you in the App; visible playlists may show total save counts without identifying who saved them.</p>
      <p>Review each feature’s audience before sharing. Changing settings cannot retract information someone has already seen, copied, or captured, and previously displayed or cached information may not disappear immediately.</p>
    </>,
  },
  {
    id: 'device-surfaces',
    title: 'Notifications, widgets, and Live Activities',
    content: <>
      <p>Depending on the feature, enabled notifications, Home Screen widgets, and Live Activities can display social information such as names, photos, places, check-in notes, stickers, and activity. This information may appear on the Lock Screen or Dynamic Island, or remain visible while the App is closed. Anyone able to see your device may see that content.</p>
      <p>We store device tokens to deliver updates and cache permitted widget and activity content on your device. Device settings let you control notifications, previews, widgets, and Live Activities. Cached or already displayed information may remain until it is refreshed or removed.</p>
    </>,
  },
  {
    id: 'suggestions-promotions',
    title: 'Suggestions and optional promotions',
    content: <>
      <p>When you suggest a place, we store your account identifier and the name, address, category, link, and notes you submit, along with review status and reviewer information. Our team reviews suggestions, and approved catalog details may be published. Support messages and safety concerns are also available to the team handling them.</p>
      <p>For location-based promotions such as the Omen raffle, the App can save a venue identifier, visit time, and distance locally before you finish signup. It can later associate that visit with your account and store entry and eligibility records. The saved visit record does not contain raw GPS coordinates. Separate promotion rules explain eligibility; a visit or check-in alone does not guarantee a valid entry or prize.</p>
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
        <li><strong>OpenAI</strong> processes chat inputs, conversation context, and relevant tool information to generate AI responses.</li>
        <li><strong>Expo and Apple services</strong> support push notifications and App Store services.</li>
        <li><strong>Apple</strong> handles subscription billing and related transactions where offered.</li>
        <li>Hosting, network, email, and logging providers help deliver our website, AI service, support, and diagnostic information.</li>
      </ul>
      <p>Authorized team members may access information to operate the service, review suggestions, provide support, investigate misuse, and analyze usage. We may also disclose information when required by law or necessary to protect users, enforce our terms, or address fraud and security incidents.</p>
      <p>The App may create shareable links for places, events, and playlists. The content available through a shared link depends on the content’s visibility and the feature.</p>
    </>,
  },
  {
    id: 'retention',
    title: 'Retention and deletion',
    content: <>
      <p>We keep account and saved-content data while your account remains active or as needed to provide the service. Historical check-in and visit records can remain after active check-ins end. Some records may be kept longer for legal, security, billing, or fraud-prevention reasons. We do not apply one universal retention period to every type of information.</p>
      <p>Delete Account in Manage Profile removes your authentication account and linked profile and account-owned database records, including saved chat history. It does not automatically erase all uploaded media, provider-held information, backups, or content already copied by others. Some catalog content and notifications belonging to other users may remain after their reference to your account is cleared. Deleting an account also does not cancel an Apple-billed subscription.</p>
      <p>Contact us for account and data deletion requests, including retained uploads. Provider retention and backup handling may affect when every copy is removed; we do not promise instant removal from every system.</p>
    </>,
  },
  {
    id: 'choices',
    title: 'Your choices',
    content: <>
      <ul>
        <li>Update available profile fields and privacy settings inside the App.</li>
        <li>Choose the audience for check-ins and other content where audience controls are offered.</li>
        <li>Manage location, photos, notifications, previews, widgets, and Live Activities in your device settings.</li>
        <li>Use Temporary Chat or delete saved chats through the chat sidebar, subject to the processing and retention limits described above.</li>
        <li>Use STOP or START to manage US verification texts, as described above.</li>
        <li>Request account or data deletion by contacting us or using Delete Account in Manage Profile.</li>
      </ul>
      <p>You can contact us to request access to or correction of account information, ask about deletion, or raise a privacy concern. We may need to verify that a request concerns your account before acting on it.</p>
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
