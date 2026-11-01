# Profile QR and shared content links

The mobile app creates permanent HTTPS links with only the database identity:

- `https://showmestl.app/profile/PROFILE_UUID`
- `https://showmestl.app/place/PLACE_ID`
- `https://showmestl.app/event/EVENT_ID`
- `https://showmestl.app/playlist/PLAYLIST_ID`

The profile QR encodes the same profile URL. An installed mobile build routes
to the existing detail modal, preserving the destination through session
restoration and the login, phone migration, and onboarding flows. Recipients
still use their own normal data access rules; sharing never grants friendship
or access to private profile collections.

The website offers an explicit Open ShowMe button using the matching
`showmestl-v2://KIND/ID` route, an App Store link, and a reminder to return to the
original link after installing. There is no automatic deferred handoff from an
App Store installation. Public fallback pages intentionally do not fetch profile
names, photos, or private content.

## Hosting

The live apex association file is served by the existing Cloudflare Worker,
ahead of Vercel. Updating Next.js alone will not change that live response.
`lib/app-link-association.mjs` is shared by the Next association route and Worker
so their app IDs and path families stay aligned. Existing check-in and Omen
routes remain present.

The Worker serves standalone share fallback pages for both hosts without the
local NFC origin. It handles only the explicit content paths, the association
file, and the pre-existing Omen route; other website traffic keeps its origin.
No DNS, tunnel, check-in rollout, or app signing changes are needed.

Validate with `pnpm run test:shared-content-links`, `pnpm exec tsc --noEmit`,
scoped ESLint, and `pnpm build`. Preview Worker bundling with
`pnpm dlx wrangler deploy --dry-run -c cloudflare/omen-nfc-wrangler.toml`.
Publish the prepared Worker using the authenticated account's normal
`pnpm dlx wrangler deploy -c cloudflare/omen-nfc-wrangler.toml` command.
The Next.js routes are included for the normal website deployment too.

After publication, both domains must return HTTP 200 JSON without redirects
at `/.well-known/apple-app-site-association`, with all four `/*` content paths.
Check Apple's `https://app-site-association.cdn-apple.com/a/v1/HOST` cache too.
Install/update a mobile build containing the shared-link handler, then use
Messages and the iPhone Camera app to test warm/cold launches, a signed-out
recipient, each content kind, and unavailable/private content. Existing App
Store binaries do not gain the new route handler from a website update.
