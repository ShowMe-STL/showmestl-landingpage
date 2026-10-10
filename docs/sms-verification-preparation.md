# ShowMe STL legal pages and SMS verification

The owner authorized publication of the SMS disclosures and then a rebuild
of the full, app-branded Terms of Service and Privacy Policy at the existing
ShowMe STL routes. The full documents replace the earlier SMS supplements;
they no longer depend on externally hosted full-policy pages. Publication uses
the existing GitHub/Vercel deployment. Verify the deployed full-document
content using the publication checklist below.

The V2 content review in `docs/legal-content-review.md` adds detailed AI,
social/location, device-surface and deletion disclosures while preserving
the transactional SMS notice and canonical links. Separate implementation
findings are not resolved by publishing policy text.

This website publication does not enable phone authentication or establish
carrier approval. Phone verification remains an upcoming service, the mobile
Auth rollout remains disabled, and delivery/device checks remain pending.
The separate NFC/AASA routes, domain configuration, and deferred rollout are
untouched.

## Routes and links

- `https://www.showmestl.app/terms-of-service`: the full ShowMe STL Terms of
  Service, including app use, accounts, user content, service availability,
  and transactional verification texts. It distinguishes phone-enabled app
  versions from older email-auth versions.
- `https://www.showmestl.app/privacy-policy`: the full ShowMe STL Privacy
  Policy, including account information, social features, photos, location,
  chat, notifications, service providers, and phone/SMS processing.
- `/sms-verification`: explains the implemented upcoming phone signup/login
  and same-account migration request actions, repeats their exact consent
  notice, and shows the six-digit-code template. It has no form or send
  operation and is not the actual opt-in screen.

The legal documents use the shared legal-document layout. Homepage footer
links and the SMS information page link directly to these canonical routes.
The mobile shared legal-link constants and Bird's saved registration draft
also use the same two public URLs. App Store metadata is managed separately;
changing website or mobile source does not update the store listing.

The support address `support@showmestl.app` matches public website navigation,
mobile Legal & Support, and the configured HELP reply. Inbox delivery has not
been tested and should be verified before the SMS release. No private business
identifiers, sender numbers, or credentials are added. The policies make no
unsupported consent-logging or exact provider-retention claim. The privacy
policy distinguishes service-provider processing from the commitment not to
sell or share phone numbers or SMS opt-in consent for third-party marketing.

US default STOP/START behavior and the number-specific HELP rule have been
verified in Bird configuration. Recipient-device behavior has not yet been
tested. The mobile notice and both website quotations include “Reply STOP to
opt out or HELP for help.” The SMS message body is unchanged.

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

## Actual opt-in evidence

The owner captured the implemented signup screen on a physical iPhone and
authorized its use. The original `1-Photo-1.jpg` (about 72 KB) shows a fictional
example phone number, the complete verification-text notice, tappable Terms
of Use and Privacy Policy labels, and the Next action together. It is attached
to Bird's existing registration draft; the draft was saved and reopened to
verify that the attachment persisted.

This is evidence of the implemented upcoming signup UI, not an SMS delivery
test or proof of carrier approval. The website information page is not used
as a substitute for that capture. The temporary development screenshot launch
was disabled after capture. Separate login and migration captures have not
been supplied.

## Publish and verify checklist

1. Complete deployment of the full legal documents. Check both canonical URLs
   without login or deployment protection, verify HTTP 200 and the complete
   Terms of Service / Privacy Policy content, and confirm that they no longer
   render the previous supplements. Check their section links and homepage
   footer links.
2. Confirm that the mobile consent notice, Legal & Support screen, and Bird
   registration all use the same canonical Terms and Privacy URLs. Website
   publication does not install updated mobile code or update App Store
   metadata; verify those destinations separately where applicable.
3. Complete carrier verification using the saved actual opt-in evidence and
   public policies. Submission and carrier approval are separate states;
   neither website publication nor a submitted application enables the Auth
   rollout on its own.
4. Validate actual STOP suppression of OTPs, START resumption, HELP delivery,
   normal OTP delivery, and the support inbox. The US keyword configuration
   is verified; recipient tests remain pending.
5. Resolve supported destination scope and complete legacy email migration,
   app release, and privileged-service checks before mandatory phone-auth
   cutover. Maintain the disabled rollout until the combined system is ready.

The public pages describe SMS behavior for phone-enabled app versions and
identify phone verification as upcoming. Configuration details and pending
release checks belong in this document, not in the customer-facing legal
flow. Public legal pages and opt-in evidence support carrier review, while
provider/device verification and the coordinated app/backend release remain
separate work.
