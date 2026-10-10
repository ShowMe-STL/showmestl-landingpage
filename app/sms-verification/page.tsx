import type { Metadata } from 'next'
import {
  SmsInformationLayout,
  SmsInformationSection,
  smsSupportEmail,
} from '../components/sms-information-layout'

export const metadata: Metadata = {
  title: 'Verification texts · ShowMe STL',
  description: 'How ShowMe STL’s upcoming phone verification flow requests six-digit sign-in codes.',
  robots: { index: false, follow: false },
}

export default function SmsVerificationPage() {
  return (
    <SmsInformationLayout title="ShowMe STL verification texts">
      <p>
        ShowMe STL is preparing phone sign-in using six-digit one-time codes sent by text.
        These texts verify a new account, sign you in, or verify a phone added to an existing email account.
        This is a transactional authentication service; requesting a code does not subscribe you to marketing texts.
      </p>
      <SmsInformationSection title="How a code is requested in the app">
        <ol className="list-decimal space-y-3 pl-6">
          <li>Open the phone signup or phone login screen and enter a phone number that can receive texts.</li>
          <li>Read the verification-text notice and the Terms of Use and Privacy Policy links before tapping Next.</li>
          <li>Tap Next to request a six-digit code, then enter the received code in the app to verify your number.</li>
        </ol>
        <p>
          For an existing email account, verify your email code first, then add a phone number on the
          Add your phone screen. Read the notice and tap Send Code to request the verification text.
          Completing phone verification preserves that account’s profile, friends, and playlists.
        </p>
      </SmsInformationSection>
      <SmsInformationSection title="The notice before requesting a text">
        <p>The phone signup and login screens display:</p>
        <blockquote className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          By tapping Next, you agree to receive ShowMe STL verification texts at this number.
          Message frequency depends on your requests. Message and data rates may apply.
          Reply STOP to opt out or HELP for help.
        </blockquote>
        <p>The existing-account phone screen displays:</p>
        <blockquote className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          By tapping Send Code, you agree to receive ShowMe STL verification texts at this number.
          Message frequency depends on your requests. Message and data rates may apply.
          Reply STOP to opt out or HELP for help.
        </blockquote>
        <p>Both notices include tappable Terms of Use and Privacy Policy links. This page does not request or send a code.</p>
      </SmsInformationSection>
      <SmsInformationSection title="What the verification text contains">
        <p>Your verification text contains the six-digit code you requested:</p>
        <blockquote className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          Your ShowMe STL code is [six-digit code]. Do not share this code.
        </blockquote>
        <p>Message frequency depends on your requests. Message and data rates may apply. Delivery depends on your carrier and service availability.</p>
      </SmsInformationSection>
      <SmsInformationSection title="Stopping texts and getting help">
        <p>
          For US verification texts, reply STOP to opt out and START to resume.
          STOP blocks further verification texts from this sender, including one-time codes;
          requesting another code in the app does not reverse that opt-out. Reply HELP for support information.
        </p>
        <p>The HELP response is:</p>
        <blockquote className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          ShowMe STL: For account or verification help, contact support@showmestl.app.
          Msg&amp;data rates may apply. Reply STOP to opt out.
        </blockquote>
      </SmsInformationSection>
      <SmsInformationSection title="Support">
        <p>
          For verification support, email{' '}
          <a href={`mailto:${smsSupportEmail}`} className="underline underline-offset-4">{smsSupportEmail}</a>.
        </p>
      </SmsInformationSection>
    </SmsInformationLayout>
  )
}
