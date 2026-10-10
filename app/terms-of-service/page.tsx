import type { Metadata } from 'next'
import {
  SmsInformationLayout,
  SmsInformationSection,
  existingTermsUrl,
  smsSupportEmail,
} from '../components/sms-information-layout'

export const metadata: Metadata = {
  title: 'Phone verification terms supplement · ShowMe STL',
  description: 'Terms for ShowMe STL’s upcoming transactional verification texts.',
  robots: { index: false, follow: false },
}

export default function SmsTermsPage() {
  return (
    <SmsInformationLayout title="Phone verification terms supplement">
      <p>
        This supplement covers phone verification in phone-enabled ShowMe STL app versions.
        Read it together with ShowMe STL’s{' '}
        <a href={existingTermsUrl} className="underline underline-offset-4">existing Terms of Use</a>.
        The full Terms of Use continue to apply to your use of the app.
        For phone-enabled app versions, the phone-verification requirements below replace the
        email-registration requirement in the full Terms of Use.
      </p>
      <SmsInformationSection title="Phone verification and your account">
        <p>
          Phone-enabled app versions require a phone number that can receive verification texts.
          Six-digit one-time codes verify the number and sign you in. Existing email accounts verify
          their email first, then add and verify a phone on the same account, preserving its existing content.
        </p>
        <p>Maintain access to your phone number and keep verification codes private. You remain responsible for activity under your account.</p>
      </SmsInformationSection>
      <SmsInformationSection title="Consent to verification texts">
        <p>
          Entering a phone number and tapping Next or Send Code in the app requests a verification text
          at that number for signup, sign-in, or adding a verified phone to your existing account.
          The verification-text notice and legal links appear before that request action.
        </p>
        <p>
          This consent applies to authentication texts only and does not authorize marketing texts.
          Message frequency depends on your requests. Message and data rates may apply.
          Delivery depends on your carrier and service availability.
        </p>
      </SmsInformationSection>
      <SmsInformationSection title="SMS support">
        <p>
          For assistance with phone verification or SMS preferences, contact{' '}
          <a href={`mailto:${smsSupportEmail}`} className="underline underline-offset-4">{smsSupportEmail}</a>.
        </p>
        <p>
          For US verification texts, reply STOP to opt out, START to resume verification texts,
          or HELP for support information. STOP prevents further verification texts from this sender,
          including one-time codes, and may prevent you from receiving the codes needed to sign in.
          Requesting another code in the app does not reverse an opt-out.
        </p>
      </SmsInformationSection>
    </SmsInformationLayout>
  )
}
