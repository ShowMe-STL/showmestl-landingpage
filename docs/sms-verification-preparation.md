# SMS verification website preparation

This is an **unpublished, unapproved preparation patch** for ShowMe STL's
upcoming mobile phone-auth release. No push, deployment, SMS send, carrier
submission, or NFC/AASA rollout is part of this patch.

## Proposed routes

- `/sms-verification`: explains the actual locally implemented phone
  signup/login and existing-account migration request actions, repeats their
  exact basic disclosure, and shows the sender's six-digit-code template.
  It states that the app flow is upcoming. It has no form or send operation
  and must not be represented as the actual opt-in screen.
- `/terms-of-service`: clearly labeled phone-verification **supplement**,
  linking the existing full Terms at `https://www.vivastl.com/terms/`.
- `/privacy-policy`: clearly labeled phone-verification **supplement**,
  linking the existing full Privacy Policy at
  `https://www.vivastl.com/privacy/`.

The main landing-page source contains no full Terms or Privacy policy, and
the source hosting the existing Viva policies was not located. These pages
supplement them rather than invent unrelated terms or silently replace them.
The new pages share an accessible, static information layout using the
existing fonts and palette. Existing pages, navigation, root layout, domain
metadata, proxy, AASA routes, and deploy configuration are unchanged.

The support address `support@showmestl.app` matches the existing public
website navigation and mobile Legal & Support screen. The owner must confirm
that inbox is operational before final publication; the configured HELP reply
already uses this same public address, but inbox delivery is not tested.
No owner names, private business identifiers, sender numbers, or credentials
are added. No unsupported consent-logging or exact provider-retention claim
is made. US default STOP/START behavior and the number-specific HELP rule have
been verified in Bird configuration. Recipient-device behavior is not yet
tested. The local mobile notice and both website quotations now include
“Reply STOP to opt out or HELP for help.” The SMS message body is unchanged.

The persisted sender-specific HELP reply is:

> ShowMe STL: For account or verification help, contact support@showmestl.app.
> Msg&data rates may apply. Reply STOP to opt out.

STOP blocks further authentication texts from that sender, START resumes
them, and HELP returns support information according to the verified US
rules. A fresh in-app code request does not cancel suppression. These are
configured behaviors; actual recipient testing and carrier approval remain
pending. Verify other countries separately before enabling them.
Mobile entry currently accepts international E.164 numbers and describes
country-code entry; this patch does not restrict that acceptance. Supported
destination scope must be resolved or validated before release, since the
US rule checks do not establish keyword readiness for every accepted number.

## Review and publication requirements

1. Owner reviews the proposed supplements, including the no-marketing-sharing
   commitment, and decides whether the full Viva documents should instead
   be revised at their current locations. Verify the final complete public
   policy plus supplement arrangement meets the carrier's requirement.
2. Validate actual STOP suppression of OTPs, START resumption, HELP delivery,
   and the normal OTP delivery flow on a recipient device. The US sender's
   keyword configuration is verified; recipient tests are pending. This source
   preparation does not complete sender verification or carrier approval.
3. The user captures actual physical-iPhone phone signup/login and migration
   screens showing the input, full notice, legal links, and Next/Send Code
   action. A screenshot of this informational page, draft, or fabricated
   mockup is not evidence that the app implements opt-in. No screenshots
   have been created or inserted in this patch.
4. Authorize publication separately. Check the chosen routes without login
   or deployment protection and verify complete, approved legal content.
   These paths are proposed local routes, not currently working public URLs.
5. Coordinate mobile legal URLs and carrier evidence with the actual
   published destinations. Mobile currently links the existing Viva pages;
   those URLs have not been changed by this website patch.
6. Complete provider delivery, legacy email migration, app release, and
   privileged-service checks before mandatory phone-auth cutover. Maintain
   the disabled rollout until the combined system is ready.

The website pages use publication-ready customer wording, with a brief
statement that phone verification is an upcoming service and that the
disclosures apply to phone-enabled app versions. Legal-adoption warnings,
configuration details, and pending-test notes stay in this review document
and the draft PR. **The policy language is proposed and has not been adopted;
owner approval is required before publication**, including the direct
no-marketing-sharing commitment. The phone-auth feature remains not ready
for release while public policy publication, provider/device checks, and
real opt-in evidence are pending.
