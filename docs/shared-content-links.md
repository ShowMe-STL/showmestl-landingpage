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

The website offers one primary action, Open in ShowMe, using the matching
`showmestl-v2://KIND/ID` route. A smaller “Don’t have it? Get it on the App Store”
line sits under that button. There is no automatic deferred handoff from an
App Store installation, and no second primary action.

Place, event, and public-playlist pages on the Next.js site load public fields
(name or title, photo, neighborhood, address, venue, time, short description)
with the anon Supabase client and no user session. Private playlists stay on
the generic page. Profile links stay generic: the page does not read the
profiles table, and a caller-supplied name or photo is dropped from the
Worker HTML too.

The Worker still answers these paths with `sharedContentFallbackHtml` so an
apex request does not 308 to www. That HTML uses the same photo, cream sheet,
and sticky button. When the Worker has `SUPABASE_URL` and `SUPABASE_ANON_KEY`
(the public anon key, never the service role), it loads the same public
fields. Without those bindings, or if the read fails, the page stays generic. iMessage `og:video` points at
`https://showmestl.app/og/showme-share.mp4` (silent H.264, 1200×630). The video
area in the bubble is not a link tap target. `og:image` is the matching still
at `https://showmestl.app/og/showme-share.jpg`. Twitter uses
`summary_large_image` on that still. Titles and descriptions stay content-aware.

Live apex still 308s `/place/1` to www, and the live apex association file is
missing the four share paths, until this Worker is deployed. `wrangler deploy`
needs the Cloudflare account credentials. The association source in this repo
already includes `/profile/*`, `/place/*`, `/event/*`, and `/playlist/*` for
both app IDs. Do not turn the apex domain back into a redirect to www.

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
