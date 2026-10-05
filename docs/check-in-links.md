# NFC check-in links

Write one NDEF **URL / URI** record to each tag:

`https://showmestl.app/check-in?placeId=PLACE_ID`

Replace `PLACE_ID` with the positive integer `public.places.id` from ShowMe V2.
Do not write a text record, custom scheme, user token, tag code, or Shortcuts URL.
Use the HTTPS link as the tag's first/only URI record. Do not permanently lock
the tag until a physical-device test succeeds. Tags are copyable; the URL is not
proof of physical presence. No per-tag backend registry is needed.

The current mobile implementation uses 30 minutes, preserves the user's current
audience (or last check-in audience on cold start; private if none), and does not
extend an existing check-in. Another active location must be checked out first.
The public web GET only shows a fallback page; it never creates a check-in.

## Deployment checklist

1. Deploy `app/check-in/page.tsx` and
   `app/.well-known/apple-app-site-association/route.ts` through the usual
   GitHub → Vercel flow. No website credentials or Supabase environment changes
   are required by these routes. The existing landing page stays at `/`.
2. In Vercel → this project → Settings → Domains, change `showmestl.app` from
   **Redirect to www.showmestl.app** to **Connect to an environment → Production**.
   Keep `www.showmestl.app` connected too. The domain-wide redirect currently
   intercepts Apple's association URL before Next.js sees it. Both hosts must
   serve the association file directly with HTTP 200, JSON, no authentication,
   and no redirect. Don't change DNS or other projects.
3. Verify `https://showmestl.app/.well-known/apple-app-site-association` and the
   same URL on `www.showmestl.app`. Expected app IDs:
   `BPWVXN85FK.com.showmestl.app` (production) and
   `23K7BSC7Q8.com.showmestl.mobilev2` (development).
4. Ship/reinstall the mobile binary with both Associated Domains and the native
   NFC bridge. The old App Store binary cannot use this feature. Apple's CDN
   caches association files, so publishing the website before installing the
   new binary is preferable. CDN endpoints can be checked at
   `https://app-site-association.cdn-apple.com/a/v1/showmestl.app` (and www).
5. Test a real tag on an unlocked iPhone XS or later: tap the system NFC
   notification, confirm the correct account/place, and verify the check-in,
   widget, and Live Activity. Repeat scans must retain the original expiry.
   Also test cold launch, signed out/sign in, offline/retry, invalid place,
   already checked in elsewhere, and an ordinary pasted link (confirmation).

NFC does not silently open the app: iOS requires tapping its notification and
may require unlocking. If no app is installed, Safari displays this page.

References: [Apple background tag reading](https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading),
[Associated Domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains).
