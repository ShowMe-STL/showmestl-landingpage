# V2 legal content review — October 9, 2026

The owner requested a substantive review of the full Privacy Policy and Terms
of Service against the V2 mobile app, its database, and the separate ShowMe AI
service. This review updates content in the existing app-branded layout; it
does not enable SMS, change data access rules, or replace the coordinated app
release checks.

## Evidence and coverage

Reviewed the current mobile source and migrations, read-only live schema,
permissions, storage configuration and account-deletion definition, the
separate Python AI service, and website support and usage-analytics code.
Database checks used metadata and zero-row API requests, not customer records.
Source behavior is not proof that every installed release or hosted service
is running the same revision.

| Area | Content correction | Main source evidence |
| --- | --- | --- |
| Accounts and SMS | Phone-enabled signup, same-account email migration only when no phone is verified, subsequent SMS sign-in; retain staged-version wording and transactional consent | Mobile `auth-data.ts`, onboarding SMS notice, shared legal links, phone-auth rollout documentation |
| Profiles and personalization | Include maintained education affiliations, interests/preferences, saved content, persistent visit history and friend-based recommendations | Mobile profile/current-user stores, theme recommendations, profile and check-in migrations |
| AI | Describe messages, selected photos, conversation context, catalog/tool results, web searches, saved history and detached processing | Mobile `showme-ai-stream.ts`; separate AI `main.py` model input, tools and background-job handling |
| Temporary Chat and deletion | Distinguish no saved ShowMe history from provider processing/retention; created playlists and processing do not disappear when a chat is deleted | AI conversational calls, title calls, response buffers, playlist tools; owned chat-deletion RPC |
| Social privacy | Scope private-profile controls and public image URLs; describe separate playlist visibility, check-in participants, direct-friend event responses, owner-only saved records/Crowds and aggregate counts | Live profile/social/storage policies; profile collection and check-in consumers |
| Location and promotions | Foreground nearby-location preparation, backend coordinates, check-in history, locally stored pre-signup raffle visits and later account association | Mobile location cache, check-in data, Omen raffle flow and entry records |
| Device surfaces | Notification previews, Home Screen widgets, Lock Screen/Dynamic Island Live Activities, device tokens and local caching | Mobile push functions, widget/Live Activity sync and native surfaces |
| Suggestions and support | Suggestion submissions and review, community-guidelines acceptance, support correspondence and staff operations | Mobile suggestions/guidelines; website contact handler and server-side analytics |
| Account deletion | Explain authentication/database deletion separately from uploaded files, provider copies, backups and copies held by others | Live `delete_own_account`, foreign keys, storage triggers and account/profile/playlist cleanup code |
| Terms | Add content rights, community standards, AI uncertainty, separate saved actions, venue verification and separate promotion rules | Implemented V2 behavior and community guidelines |

Official provider references:

- [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data)
  distinguish provider application state and operational retention. Actual
  account-level retention options were not verified; no fixed retention or
  model-training guarantee is added.
- [Apple data-use guideline 5.1.2(i)](https://developer.apple.com/app-store/review/guidelines/#data-use-and-sharing)
  requires disclosure and explicit permission before sharing personal data
  with third-party AI. Policy text is not a substitute for that app flow.
- [Supabase Storage object deletion](https://supabase.com/docs/guides/storage/management/delete-objects)
  is separate from deleting account/database rows.

## V1 carryover decisions

Preserve the operator, support contact, under-13 position, ownership,
intellectual-property, warranty/liability, termination, policy-change, and
Missouri-law provisions. No active V2 purchase flow was found, so subscription
terms remain conditional for versions that offer Apple-billed purchases. Do
not assert V1 plan prices, unlimited Pro features, or a V2 subscription offer.
Existing App Store billing status remains a separate verification item.

Do not promise working in-app Report/Block or data-export controls: these are
not implemented in the audited V2 flows. Safety and privacy requests use the
support address. Do not promise complete immediate erasure, confidential
public media, zero-retention Temporary Chat, or a universal retention schedule.

## Publication and separate follow-up

The canonical routes are unchanged:

- `https://www.showmestl.app/privacy-policy`
- `https://www.showmestl.app/terms-of-service`

Mobile legal-link constants and Bird's saved registration draft already point
to these routes. Publishing updated content requires no link replacement or
carrier resubmission by itself. App Store metadata remains a separate update.

The review also identified implementation follow-up for explicit first-use AI
consent, media-deletion cleanup and privacy/access boundaries. Detailed
security findings are kept outside the public repository. Publishing these
documents does not represent those fixes as completed, establish carrier
approval, or activate the staged phone-auth rollout.

Validation: production build/typecheck, scoped ESLint, diff checks, rendered
section/link checks, and independent source-based content reviews. Confirm
the same complete content at both production URLs after deployment.
