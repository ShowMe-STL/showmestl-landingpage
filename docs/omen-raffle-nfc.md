# Omen Coffee NFC raffle link

Write one NDEF URL record to the counter tag:

`https://showmestl.app/raffle/omen`

Use that URL as the first and only URI record. Test on a physical iPhone before
locking the tag. After the user taps the iOS NFC notification, the installed app
shows the Omen entry explanation, requests foreground location permission, and
saves a local visit record only after a fresh precise reading near Omen Coffee.
The website is a fallback for phones without the app; after installing, users
need to tap the tag again. A normal web page cannot save to the future app.

The public URL stays on the `showmestl.app` apex. Its DNS CNAME still targets
Vercel, with Cloudflare proxying enabled. The Worker in
`cloudflare/omen-nfc-worker.js` handles only the association file and the
raffle URL; all other apex traffic keeps going to Vercel. It serves the Apple
App Site Association response directly without a redirect. For the raffle
page it proxies the local landing-page build through a Cloudflare Tunnel at
`nfc-origin.showmestl.app`, rewriting its Next static-asset URLs. If the
local server or tunnel is offline, the Worker serves a small self-contained
fallback page, so the NFC link and association file remain available.

The local origin currently uses port 3107 and the tunnel config at
`~/.cloudflared/showmestl-nfc-test.yml`. To resume the full page after a
restart, run the landing-page production server on that port and then run
`cloudflared tunnel --config ~/.cloudflared/showmestl-nfc-test.yml run`.
The Worker can be redeployed with
`pnpm dlx wrangler deploy -c cloudflare/omen-nfc-wrangler.toml`.
Keep the Worker association data in sync with the website's
`app/.well-known/apple-app-site-association/route.ts` until the website
deployment replaces this temporary tunnel arrangement.

Before testing Universal Links, verify that
`https://showmestl.app/.well-known/apple-app-site-association` returns JSON
with HTTP 200 and no redirect. Apple's association CDN may continue returning
an older error response for a while after the DNS change; iOS uses that CDN
for ordinary builds. Reinstall a fresh app build on the physical iPhone after
the CDN updates when testing the NFC open.
This local visit record is not a server-side raffle submission. The promotion
rules and final entry process must be completed before a public launch.
