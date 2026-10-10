import type { Metadata } from 'next'
import {
  SmsInformationLayout,
  SmsInformationSection,
  existingPrivacyPolicyUrl,
  smsSupportEmail,
} from '../components/sms-information-layout'

export const metadata: Metadata = {
  title: 'Phone verification privacy supplement · ShowMe STL',
  description: 'Privacy disclosures for ShowMe STL’s upcoming phone verification and SMS delivery.',
  robots: { index: false, follow: false },
}

export default function SmsPrivacyPage() {
  return (
    <SmsInformationLayout title="Phone verification privacy supplement">
      <p>
        This supplement covers phone verification in phone-enabled ShowMe STL app versions.
        Read it together with ShowMe STL’s{' '}
        <a href={existingPrivacyPolicyUrl} className="underline underline-offset-4">existing Privacy Policy</a>.
        The full Privacy Policy continues to apply to your use of the app.
      </p>
      <SmsInformationSection title="Information used for verification">
        <p>
          The upcoming flow uses your phone number and authentication-related information to send and
          verify six-digit one-time codes. An existing email account keeps its email address when a phone
          is verified on the same account. Verification supports signup, sign-in, and adding a phone to an existing account.
        </p>
      </SmsInformationSection>
      <SmsInformationSection title="Authentication and SMS delivery providers">
        <p>
          Supabase handles account authentication, code generation, and verification.
          Bird receives the recipient phone number and the message containing the verification code
          so it can deliver the requested text. Bird and the carriers involved process the message and delivery information needed to deliver it.
        </p>
      </SmsInformationSection>
      <SmsInformationSection title="Verification consent and marketing">
        <p>
          Requesting a verification code does not subscribe you to marketing texts.
          We do not sell or share phone numbers or
          SMS opt-in consent with third parties for their marketing or promotional purposes.
          Information needed to operate and deliver verification is provided to authentication and
          messaging providers, including Supabase and Bird, and the carriers involved.
        </p>
      </SmsInformationSection>
      <SmsInformationSection title="Your choices and support">
        <p>
          For questions about phone verification, SMS preferences, privacy, or account deletion, contact{' '}
          <a href={`mailto:${smsSupportEmail}`} className="underline underline-offset-4">{smsSupportEmail}</a>.
          Account deletion is also available from the app’s Profile screen.
        </p>
        <p>
          For US verification texts, reply STOP to stop verification texts from that sender,
          START to resume them, or HELP for support information. STOP blocks further one-time codes;
          requesting another code does not reverse that preference.
        </p>
        <p>See the existing Privacy Policy for the broader account-data retention and deletion policy.</p>
      </SmsInformationSection>
    </SmsInformationLayout>
  )
}
