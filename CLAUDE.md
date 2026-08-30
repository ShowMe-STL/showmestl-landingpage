@AGENTS.md

# ShowMe STL — Landing Page

Marketing site for the ShowMe STL iOS app (parent company: ShowMe Cities LLC). Single-page, scroll-driven, deployed to a self-hosted Windows server via Cloudflare tunnel at `https://stl.showmecities.app`.

## Stack

- Next.js 16.2.4 (App Router, Turbopack) — **breaking changes from your training data; read `node_modules/next/dist/docs/` before writing Next-specific code**
- React 19.2.4
- TypeScript (strict)
- Tailwind CSS v4 (PostCSS plugin) — note: no `theme()` function in arbitrary values; use literal `rgba()`
- `motion` v12.38 (Framer Motion successor), imported via `motion/react`
- `ogl` for the WebGL grainient background
- `qrcode` (consumed by a custom `QRCode` SVG renderer)
- `lucide-react` v1.14 — old version, **does NOT ship brand icons** (Instagram/Facebook/TikTok). Use inline SVG paths.

Package manager: **pnpm only** (never npm/yarn). Path alias: `@/*` → project root.

## Hard rules (Alec's globals)

- pnpm only
- No semicolons, single quotes, 2-space indent
- No default exports except React components and Next.js pages
- Components PascalCase, hooks `useX`, files kebab-case
- Never `any` without an inline comment
- Never inline styles when Tailwind can do it
- Conventional commits (feat:, fix:, chore:, docs:)
- Plan before any 3+ step task; ask before destructive actions

## File structure

```
landing-page/
├── app/
│   ├── components/
│   │   ├── app-store-button.tsx       # The "Download on the App Store" button graphic
│   │   ├── app-store-cta.tsx          # Wraps AppStoreButton; opens QR modal on desktop (≥1024px)
│   │   ├── footer-section.tsx         # Footer with brand block, link columns, QR, socials
│   │   ├── grainient.tsx              # WebGL animated gradient (ogl)
│   │   ├── grainient.css
│   │   ├── hero.tsx                   # The whole scroll-driven hero (most of the work)
│   │   ├── install-qr-modal.tsx       # Centered overlay with scaled-up QR
│   │   ├── iphone-mockup.tsx          # Phone frame + screenshot slot
│   │   ├── navbar.tsx                 # Fixed glass pill + mobile slide-out menu
│   │   ├── play-store-button.tsx      # (unused — Android not shipped yet)
│   │   └── qr-code.tsx                # SVG QR renderer with rounded finder patterns
│   ├── favicon.ico
│   ├── globals.css                    # font import, color-scheme: dark, page bg
│   ├── layout.tsx                     # html/body + scroll-reset script
│   └── page.tsx                       # <Hero /> <Footer /> <Navbar /> (order matters — see Stacking below)
├── lib/utils.ts                       # `cn` helper (filter+join classes)
├── public/
│   ├── app-icon.png                   # ShowMe STL app icon
│   ├── mockups/iphone-16-pro-max.png  # phone bezel overlay
│   └── screenshots/{home,explore}.png
├── AGENTS.md                          # "This is NOT the Next.js you know"
└── CLAUDE.md                          # this file (extends AGENTS.md)
```

## Page composition

`app/page.tsx` renders three siblings in this order:

```tsx
<Hero />
<Footer />
<Navbar />
```

**Order matters.** Navbar is rendered last so it stacks above Hero and Footer regardless of z-index stacking contexts (which earlier caused the slide-out menu to render behind the footer / behind the scroll indicator).

## The Hero (the meat)

A scroll-driven sequence built on a tall `<section>` with a `sticky top-0 h-screen` child that pins during scroll. Animations are driven by `useTransform(scrollY, ...)` over a custom MotionValue that tracks `window.scrollY` via a native scroll listener (NOT `useScroll()` — see notes).

### Section height

`h-[calc(2950px+100vh)]` — exactly 2950px of scroll runway + 1 viewport. The sticky child unpins at `scrollY = 2950`, where the next section (Footer) begins.

### Scroll phases (in scrollY pixels)

| Range | What happens |
|---|---|
| 0–400 | "Find Your STL" headline + subtitle + App Store CTA fade out and translate up. Scroll indicator (white circle + arrow) and bottom gradient also fade out. |
| 0–800 | Phone (desktop) translates upward to viewport center (`phoneTargetY` measured at mount). |
| 400–800 (mobile only) | Phone scales 1 → 0.65 and shifts +30vh down. Uses a cubic-bezier ease `(0.42, 0, 0.58, 1)`. |
| 850–1200 | "Friends" copy fades in. Slides on x (-24 → 0) on desktop; on mobile the copy is a centered headline+body at `top-[12vh]` with `pointer-events-none` so taps fall through to nav. |
| 1200–1650 | Hold (read time). |
| 1650–1900 | Home → Explore screenshot crossfade + grainient palette crossfade. Friends copy fades out simultaneously. |
| 1900–2250 | "Curated for You" copy fades in. |
| 2700–2950 | Grainient palette fades back to the original (orange/blue). |

### Grainient palettes

Two stacked WebGL `<Grainient />` layers, crossfaded by `palette1Opacity` / `palette2Opacity`:
- Palette 1: `#FF6E52`, `#0f0d10`, `#3A87FF` (orange/dark/blue)
- Palette 2: `#2DBD8C`, `#0f0d10`, `#F2B840` (green/dark/gold)

The grainient container extends 256px past the section bottom (`-bottom-64`) with a top-to-bottom mask gradient so the colors bleed softly into the footer area.

### Mobile gating

`isMobile` state: `window.matchMedia('(max-width: 767px)').matches`, updated on resize. The phone scale + offset only apply when `isMobile === true` — on desktop, both transforms become identity (no-op) so the layout is untouched.

### Phone centering math

```
phoneY: useTransform(scrollY, [0, 800], [0, phoneTargetY], {ease: cubicBezier(0.42, 0, 0.58, 1)})
```

`phoneTargetY` is computed at mount (and on resize, but ONLY when `scrollY < 1`) by reading the phone wrapper's `getBoundingClientRect()` and calculating the offset needed to put its center at `window.innerHeight / 2`. **Do not recompute mid-scroll** — iOS Safari's URL bar collapse fires a resize event that would otherwise read a transformed rect and snap the phone to a wrong position.

### Scroll indicator

A white pill with a down arrow at the bottom of the viewport, with a gradient blending into the page bg above it. Lives at the bottom of the Hero section (inside the sticky child, outside the centered column). `position: absolute; bottom-10; z-30`. Fades with `contentOpacity` (out by scroll 400).

### Side copies (desktop)

`absolute top-1/2 left-10` / `right-10` with `max-width: min(28rem, calc(50vw - min(100vh * 0.245, 210px) - 64px))` so they shrink to fit the gap between viewport edge and phone, without overlapping the phone. Headings step from `text-3xl` to `text-5xl` at Tailwind breakpoints; paragraphs from `text-base` to `text-lg`.

### Side copies (mobile)

Single centered block at `top-[12vh]` showing only the active phase's heading + body. Uses `pointer-events-none` so it never blocks taps on the navbar/hamburger menu beneath.

## Navbar

Glass-pill design (css.glass aesthetic, customized):

```css
background: rgba(40, 36, 44, 0.3);
backdrop-filter: blur(14px) saturate(160%);
border: 1px solid rgba(255, 255, 255, 0.15);
```

The pill itself (not the wrapper) carries the scroll-driven opacity — applying opacity on an ancestor would create a stacking context that breaks `backdrop-filter` against the page below.

### Behavior

- Fixed top, z-[100]
- Fades out 0–400, hidden through Hero animation, fades back in 2950–3100
- Desktop (≥md): logo + "ShowMe STL" text + nav links (Home, About, Support) + Download button
- Mobile: logo only + hamburger + Download
- Download on desktop (≥1024px) opens `InstallQrModal` (intercepted via `onClick` + `preventDefault`)
- Hamburger opens a right-anchored slide-out (75% width, `max-w-sm`), with a 60% black backdrop. Backdrop click closes the menu (panel uses `stopPropagation`). Panel extends `-right-4` past viewport edge with `pr-10` interior padding so the spring overshoot can't reveal a gap.
- Menu items use native `<a href>` with `onClick={toggleMenu}` to close on tap. Browser handles navigation natively.

### Internal state

Navbar manages its own `scrollY` MotionValue via a scroll listener (does NOT receive it as a prop) so it can be rendered as a top-level sibling outside Hero.

## Footer

`<footer>` with `max-w-[72rem]`, rounded top corners. Grid: `grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_auto_auto_auto]`. Always horizontal (no vertical stacking until the QR column hides on mobile via `md:block`).

### Columns

1. **Brand block** — logo + "ShowMe STL" → `/`, copyright with "ShowMe Cities" → `https://showmecities.com`, social icons (Instagram → `https://www.instagram.com/shome.stl`, Facebook + TikTok placeholders).
2. **Pages** — Home (`/`), About (`/#about`), Support (`mailto:support@showmecities.com`).
3. **Company** — Apps (`https://showmecities.com`), Privacy, Terms (both external to showmecities.com).
4. **Get the app (QR)** — `Scan to install` label + clickable QR code that opens the install modal. QR is white-on-dark normally; on hover, container fades to white bg and QR inverts via CSS `filter: invert(1)`. Hidden on mobile (`md:block`).

### Copyright bottom strip

Absolutely positioned `bottom-6 lg:bottom-8`, single line (`whitespace-nowrap`), centered on mobile and left-aligned on desktop. Wraps only between "LLC." and "All rights reserved." via two `whitespace-nowrap` spans.

### Social icons

Inline SVG paths copied from simple-icons (Instagram, Facebook, TikTok). Originally imported from `simple-icons` npm package but switched to inline strings — the package ships a 5MB module which made the client bundle slow.

## iPhone mockup

`relative aspect-[1470/3000]` with `height: min(calc(100vh - 48px), 858px)`. The screenshot lives in a clipped `absolute` inner container with carefully tuned insets (`top: 2.1% bottom: 2.1% left: 5% right: 5%`) so the screenshot sits inside the bezel cutout. The mockup PNG is rendered as a `Image fill object-contain` overlay on top.

Accepts `children` for content stacked inside the cutout (used for crossfading screenshots).

## URLs and config

- App Store URL: `https://apps.apple.com/app/id6760572115` (short form — also encodes more compactly into QR codes)
- Parent company site: `https://showmecities.com`
- Support email: `support@showmecities.com`
- Instagram: `https://www.instagram.com/shome.stl`
- Production deploy URL: `https://stl.showmecities.app`

In `next.config.ts`:
```ts
{
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.191', '192.168.1.191:3000'], // for LAN mobile testing
  output: 'standalone', // for the Windows server deploy
}
```

`allowedDevOrigins` is required for HMR to work when accessing the dev server from a phone on the same WiFi. Without it, `pnpm dev -H 0.0.0.0` serves HTML but JS never hydrates on the phone (the HMR websocket fails). **If you change networks, update the IP in this file.**

## Admin dashboard (`/admin`)

Moderator-gated (`requireModerator()` in `lib/auth.ts`, checks the `moderators`
table). CRUD pages for places/events/playlists/etc. live under
`app/admin/(dashboard)/`. All server reads use the service-role client
(`lib/supabase/admin.ts`), which bypasses RLS.

The Overview page (`app/admin/(dashboard)/page.tsx`, `dynamic = 'force-dynamic'`)
renders the live count cards **and** `<GrowthDashboard />` — a YC-style funnel
view (Signups · Activation · Active users · Retention):

- **`lib/analytics/growth.ts`** — `getGrowthAnalytics()`. Paginates the raw event
  tables (`profiles`, `check_ins`, `check_in_comments`, `playlists` w/ non-null
  `owner_id`, `saved_playlists`, `showme_ai_messages` joined to its chat) and
  computes everything in process. Days bucketed in `America/Chicago`. **Day keys
  are anchored at noon UTC** — anchoring at midnight makes `Intl` format them
  back a day and `addDays` loops forever (this OOM'd the build once).
  - "Activated" = user ever did ≥1 meaningful action (AI message, check-in,
    check-in comment, playlist created, playlist saved). No "playlist comments"
    metric — there's no such table.
  - `SIGNUP_TIMELINE_START` ('2026-08-09') clips the migration-day import
    (~370 accounts stamped 2026-08-08) off the signups chart; those users
    still count toward the cumulative/all-time totals.
  - Every stat tile and panel takes an `info` prop rendered as a hover/focus
    `ⓘ` tooltip (`InfoDot` in `growth-dashboard.tsx`) explaining the metric.
  - DAU/WAU/MAU active = performed a meaningful action that day. No app-open
    telemetry exists.
  - Retention headline Dn = still active on/after day n; cohort triangle =
    weekly signup cohorts × week-n active.
- **`lib/analytics/app-store.ts`** — `getAppStoreDownloads()`. App Store Connect
  Sales Reports API (ES256 JWT signed with `node:crypto`, no dep; gunzip + TSV
  parse). Needs the 4 `APP_STORE_CONNECT_*` env vars (see `.env.local.example`);
  returns `{ configured: false }` when absent and the UI hides those cards.
  Daily reports lag ~1–2 days; each day's fetch is cached 12h. The SALES report
  is per *vendor account*, so rows are filtered to ShowMe STL's Apple ID
  (`6760572115`, overridable via `APP_STORE_CONNECT_APP_APPLE_ID`). All-time
  downloads = MONTHLY reports for every complete month (from
  `APP_STORE_CONNECT_FIRST_MONTH`, default 15 months back) + DAILY for the
  current partial month; shown as a top-of-Overview count card.
- **`components/analytics/`** — inline-SVG charts (no charting dep), using the
  `--chart-1..5` tokens. `charts.tsx` (line/area + bar, hover tooltips),
  `cohort-triangle.tsx`, `growth-dashboard.tsx` (client; 7/30/90/All range
  toggle + tabs).

## Deployment

1. `pnpm build` produces a standalone Node server bundle in `.next/standalone/`
2. The deploy zip (`landing-page-deploy.zip`) is assembled by combining:
   - `.next/standalone/.` → root
   - `.next/static` → `.next/static`
   - `public` → `public`
   - A `start.bat` and `start.ps1` for Windows
   - A README
3. Bundle is dropped on Google Drive, synced to the always-on Windows server.
4. On Windows, run `node server.js` (or `start.ps1`) from the extracted folder.
5. Cloudflared tunnel maps `https://stl.showmecities.app` → `localhost:3000`.

## Known gotchas / lessons learned

- **Tailwind v4 doesn't support `theme()` function in arbitrary values.** Use literal `rgba()`.
- **`useScroll()` from motion can fail silently on certain mobile setups.** We use `useMotionValue(0)` + a manual `window.addEventListener('scroll')` instead.
- **HMR websocket fails for LAN devices** without `allowedDevOrigins`. Symptom: HTML loads but JS never runs.
- **`backdrop-filter` breaks when an ancestor has opacity.** Apply scroll-driven opacity directly to the backdrop-filtered element, not its parent.
- **Brand icons (Instagram/Facebook/TikTok) are NOT in this lucide-react version.** Use inline SVG paths.
- **Stacking contexts can trap fixed elements.** A `position: fixed` child of a `transform`/`opacity`/`filter`-ancestor becomes positioned relative to that ancestor, not the viewport. We avoid this by rendering the Navbar as a top-level sibling.
- **iOS Safari URL bar collapse fires resize events.** Don't recompute layout-dependent values (like `phoneTargetY`) on resize unless `scrollY === 0`.
- **`overflow-x: hidden` on `<body>` breaks `position: fixed` in iOS Safari.** If you need it, use `overflow-x: clip` instead — though we currently don't need either.
- **`text-center` + responsive text sizes alone don't prevent layout from feeling weird** when phone size varies. We use viewport-relative max-widths on side copy.
- **Next.js standalone build ships only prod dependencies.** Don't expect `simple-icons` or other large libs to be pre-bundled — inline what you need.

## Routing / pages

Just `/`. The "About" link in the nav and footer is `/#about` — an anchor to an invisible `<div id="about">` placed at `top-[1200px]` inside the Hero section, which corresponds to the scroll position where the Friends copy is fully visible. `scroll-behavior: smooth` on `<html>` makes the hash jump animate.

## Memory / persistence

If a project context folder is needed in Obsidian, it would live at `/Users/alech/Obsidian/Claude & Code/Claude Code Projects/ShowMe STL/`. Not currently initialized — running `/obsidian-init` would set it up. The vault is the source of truth for cross-session project memory.
