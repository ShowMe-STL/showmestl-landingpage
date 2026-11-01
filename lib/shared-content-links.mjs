export const sharedContentKinds = ['profile', 'place', 'event', 'playlist']
export const showMeAppStoreUrl = 'https://apps.apple.com/app/id6760572115'

// Brand still + motion for iMessage. The video region in the bubble is not a
// link tap target — the still og:image and the page URL are what open the link.
export const shareOgImage = {
  url: 'https://showmestl.app/og/showme-share.jpg',
  width: 1200,
  height: 630,
  alt: 'ShowMe STL',
}
export const shareOgVideo = {
  url: 'https://showmestl.app/og/showme-share.mp4',
  type: 'video/mp4',
  width: 1200,
  height: 630,
}
const shareTimeZone = 'America/Chicago'

export function isSharedContentId(kind, id) {
  if (!sharedContentKinds.includes(kind) || typeof id !== 'string') return false
  return kind === 'profile'
    ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    : /^[1-9][0-9]{0,15}$/.test(id) && Number.isSafeInteger(Number(id))
}

export function parseSharedContentPath(path) {
  const match = /^\/(profile|place|event|playlist)\/([^/]+)\/?$/.exec(path)
  return match && isSharedContentId(match[1], match[2])
    ? { kind: match[1], id: match[2].toLowerCase() } : null
}

export function sharedContentDetails(kind, id) {
  if (!isSharedContentId(kind, id)) return null
  const preview = genericSharePreview(kind)
  return {
    title: preview.title,
    description: preview.description,
    appUrl: `showmestl-v2://${kind}/${id.toLowerCase()}`,
    url: `https://showmestl.app/${kind}/${id.toLowerCase()}`,
  }
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function plainText(value, max = 420) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export function safeHttpsUrl(value) {
  if (typeof value !== 'string' || value.length > 2000) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

function copyFor(kind) {
  if (kind === 'profile') {
    return {
      title: 'Find me on ShowMe STL',
      description: 'Open this profile in ShowMe STL. Your account and privacy settings stay in the app.',
      label: 'Profile',
    }
  }
  if (kind === 'place') {
    return {
      title: 'Explore this place on ShowMe STL',
      description: 'Open this place in ShowMe STL.',
      label: 'Place',
    }
  }
  if (kind === 'event') {
    return {
      title: 'Explore this event on ShowMe STL',
      description: 'Open this event in ShowMe STL.',
      label: 'Event',
    }
  }
  if (kind === 'playlist') {
    return {
      title: 'A playlist on ShowMe STL',
      description: 'Open this playlist in ShowMe STL. Private lists stay in the app.',
      label: 'Playlist',
    }
  }
  return null
}

export function genericSharePreview(kind) {
  const copy = copyFor(kind)
  if (!copy) return null
  return { ...copy, imageUrl: null, imageUrls: [], meta: [], dateTile: null }
}

function clockParts(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const format = (options) => new Intl.DateTimeFormat('en-US', { timeZone: shareTimeZone, ...options })
    .format(date)
    .replace(/[\u202f\u00a0]/g, ' ')
  return {
    month: format({ month: 'short' }),
    day: format({ day: 'numeric' }),
    weekday: format({ weekday: 'short' }),
    time: format({ hour: 'numeric', minute: '2-digit' }),
    key: new Intl.DateTimeFormat('en-CA', {
      timeZone: shareTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date),
  }
}

function compactRange(start, end) {
  const startMatch = /^(.*) (AM|PM)$/.exec(start)
  const endMatch = /^(.*) (AM|PM)$/.exec(end)
  if (startMatch && endMatch && startMatch[2] === endMatch[2]) {
    return `${startMatch[1]}–${endMatch[1]} ${endMatch[2]} CT`
  }
  return `${start}–${end} CT`
}

export function formatEventWhen(startIso, endIso) {
  const start = clockParts(startIso)
  if (!start) return null
  const end = endIso ? clockParts(endIso) : null
  const range = end
    ? (end.key === start.key ? compactRange(start.time, end.time) : `${start.weekday}, ${start.month} ${start.day}, ${start.time} – ${end.weekday}, ${end.month} ${end.day}, ${end.time} CT`)
    : null
  return {
    weekday: start.weekday,
    month: start.month,
    day: start.day,
    time: start.time,
    range,
  }
}

const heicPattern = /\.(heic|heif)(?:$|[?#])/i

// iOS avatars are often HEIC. Chrome will not paint that, but Supabase can
// render the same public object as a JPEG.
function browserImageUrl(value) {
  const safe = safeHttpsUrl(value)
  if (!safe || !heicPattern.test(safe)) return safe
  const url = new URL(safe)
  if (!url.hostname.endsWith('.supabase.co') || !url.pathname.includes('/storage/v1/object/public/')) return null
  url.pathname = url.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
  url.searchParams.set('width', '1200')
  url.searchParams.set('quality', '75')
  return url.toString()
}

function paintOrder(urls) {
  const raw = []
  for (const url of urls) {
    const value = safeHttpsUrl(url)
    if (value && !raw.includes(value)) raw.push(value)
  }
  const web = raw.filter((url) => !heicPattern.test(url))
  const chosen = web.length ? web : raw.map(browserImageUrl).filter(Boolean)
  const images = []
  for (const url of chosen) {
    if (!images.includes(url) && images.length < 4) images.push(url)
  }
  return images
}

function withPrimaryImage(preview, urls) {
  const imageUrl = paintOrder(urls)[0] ?? null
  return { ...preview, imageUrl, imageUrls: imageUrl ? [imageUrl] : [] }
}

export function buildPlacePreview(row) {
  const base = genericSharePreview('place')
  const name = plainText(row?.name, 140)
  const neighborhood = plainText(row?.neighborhood, 80)
  const category = plainText(row?.category, 80)
  const address = plainText(row?.address, 180)
  const meta = []
  if (category) meta.push({ kind: 'tag', text: category })
  if (address) meta.push({ kind: 'pin', text: address })
  return withPrimaryImage({
    ...base,
    title: name || base.title,
    description: plainText(row?.description, 420) || base.description,
    label: neighborhood ? `Place · ${neighborhood}` : 'Place',
    meta,
    dateTile: null,
  }, [row?.image_url, row?.image_thumb_url])
}

export function buildEventPreview(row) {
  const base = genericSharePreview('event')
  const when = formatEventWhen(row?.start_time, row?.end_time)
  const venue = plainText(row?.venue_name, 160)
  const address = plainText(row?.address, 180)
  const meta = []
  if (when?.range) meta.push({ kind: 'time', text: when.range })
  if (venue) meta.push({ kind: 'venue', text: venue })
  if (address) meta.push({ kind: 'pin', text: address })
  return withPrimaryImage({
    ...base,
    title: plainText(row?.title, 140) || base.title,
    description: plainText(row?.description, 420) || base.description,
    label: when ? `Event · ${when.weekday}, ${when.month} ${when.day}` : 'Event',
    meta,
    dateTile: when ? { month: when.month, day: when.day, time: when.time } : null,
  }, [row?.image_url, row?.image_thumb_url])
}

async function restRows(env, path, params) {
  const url = new URL(`/rest/v1/${path}`, env.SUPABASE_URL)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const response = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      accept: 'application/json',
    },
    signal: AbortSignal.timeout(4000),
  })
  if (!response.ok) return []
  const body = await response.json()
  return Array.isArray(body) ? body : []
}

// Used by the Cloudflare Worker, which has no Next.js Supabase client.
// SUPABASE_URL and SUPABASE_ANON_KEY are public-read values set in the
// Worker dashboard. Never pass the service role. Profile reads are avatar
// URLs only — names and bios stay out of the public HTML.
export async function loadPublicPreview(kind, id, env) {
  if (!isSharedContentId(kind, id)) return null
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) return null
  try {
    if (kind === 'profile') {
      const [row] = await restRows(env, 'profiles', {
        id: `eq.${id}`,
        select: 'avatar_url,avatar_thumb_url',
      })
      if (!row) return null
      return {
        avatar_url: row.avatar_url ?? null,
        avatar_thumb_url: row.avatar_thumb_url ?? null,
      }
    }
    if (kind === 'place') {
      const [row] = await restRows(env, 'places', {
        id: `eq.${id}`,
        select: 'name,address,description,image_url,image_thumb_url,place_categories!places_category_id_fkey(name),neighborhoods(name)',
      })
      if (!row) return null
      return {
        name: row.name,
        address: row.address,
        description: row.description,
        image_url: row.image_url,
        image_thumb_url: row.image_thumb_url,
        category: row.place_categories?.name ?? null,
        neighborhood: row.neighborhoods?.name ?? null,
      }
    }
    if (kind === 'event') {
      const [row] = await restRows(env, 'events', {
        id: `eq.${id}`,
        select: 'title,start_time,end_time,venue_name,address,description,image_url,image_thumb_url',
      })
      return row ?? null
    }
    if (kind === 'playlist') {
      const [row] = await restRows(env, 'playlists', {
        id: `eq.${id}`,
        privacy: 'eq.public',
        select: 'name,description,image_url,image_thumb_url',
      })
      if (!row) return null
      const items = await restRows(env, 'playlist_items', {
        playlist_id: `eq.${id}`,
        select: 'target_id,target_type,sort_order',
        order: 'sort_order',
        limit: '4',
      })
      const placeIds = items.filter((item) => item.target_type === 'place').map((item) => item.target_id)
      const eventIds = items.filter((item) => item.target_type === 'event').map((item) => item.target_id)
      const [places, events] = await Promise.all([
        placeIds.length ? restRows(env, 'places', { id: `in.(${placeIds.join(',')})`, select: 'id,image_url,image_thumb_url' }) : [],
        eventIds.length ? restRows(env, 'events', { id: `in.(${eventIds.join(',')})`, select: 'id,image_url,image_thumb_url' }) : [],
      ])
      const byTarget = new Map()
      for (const place of places) byTarget.set(`place:${place.id}`, place.image_url || place.image_thumb_url)
      for (const event of events) byTarget.set(`event:${event.id}`, event.image_url || event.image_thumb_url)
      return {
        ...row,
        imageUrls: items.map((item) => byTarget.get(`${item.target_type}:${item.target_id}`)).filter(Boolean),
      }
    }
    return null
  } catch {
    return null
  }
}

export function buildPlaylistPreview(row, extraImages = []) {
  const base = genericSharePreview('playlist')
  const name = plainText(row?.name, 140)
  const cover = paintOrder([row?.image_url, row?.image_thumb_url])[0] ?? null
  // A cover and its thumbnail are the same picture. Item photos fill in only
  // when the playlist has no cover of its own.
  const imageUrls = cover ? [cover] : paintOrder(extraImages)
  return {
    ...base,
    title: name || base.title,
    description: plainText(row?.description, 420) || base.description,
    label: 'Playlist',
    meta: [],
    dateTile: null,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
  }
}

// Names, bios, and arbitrary image fields are ignored. Only avatar URLs render.
export function buildProfilePreview(row) {
  const base = genericSharePreview('profile')
  return withPrimaryImage(base, [row?.avatar_url, row?.avatar_thumb_url])
}

export function previewForHtml(kind, preview) {
  if (!preview || typeof preview !== 'object') return genericSharePreview(kind)
  if (kind === 'profile') return buildProfilePreview(preview)
  if (kind === 'place') return buildPlacePreview(preview)
  if (kind === 'event') return buildEventPreview(preview)
  if (kind === 'playlist') return buildPlaylistPreview(preview, preview.imageUrls ?? [])
  return null
}

const icons = {
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
  time: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>',
  venue: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/></svg>',
  tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13l-7 7-9-9V4h7l9 9z"/><circle cx="8.5" cy="8.5" r="1.2"/></svg>',
}

const mark = '<span class="mark" aria-hidden="true"><svg viewBox="118 6 122 362"><path fill="#fff" d="M146.873 247.048h20.721c-.229-2.052-.305-3.032-.697-5.782-2.138-14.99-8.841-29.7-23.787-52.204-17.383-26.173-22.498-39.718-22.395-59.296.11-20.621 4.821-31.885 28.021-67 15.181-22.979 29.671-53.221 30.267-53.974.595.753 15.085 31 30.267 53.974 23.199 35.115 27.91 46.379 28.02 67 .104 19.578-5.011 33.123-22.394 59.296-14.947 22.504-21.65 37.214-23.788 52.204-.392 2.75-.468 3.73-.697 5.782h20.72c5.689 0 10.3 4.611 10.3 10.3v2.345c0 5.689-4.611 10.3-10.3 10.3h-64.258c-5.689 0-10.3-4.611-10.3-10.3v-2.345c0-5.689 4.611-10.3 10.3-10.3z"/><path fill="#fff" d="M179.003 365.214s-13.646-30.477-44.713-44.491c23.712-15.928 29.619-38.454 29.619-38.454h30.187s5.907 22.526 29.619 38.454c-31.067 14.014-44.712 44.491-44.712 44.491"/></svg></span>'

function heroMarkup(preview) {
  if (preview.imageUrls.length >= 2) {
    const rows = preview.imageUrls.length > 2 ? ' rows-2' : ''
    return `<div class="collage${rows}">${preview.imageUrls.map((src) => `<img src="${escapeHtml(src)}" alt="">`).join('')}</div>`
  }
  if (preview.imageUrl) {
    return `<img class="photo" src="${escapeHtml(preview.imageUrl)}" alt="">`
  }
  return '<div class="fallback-hero"></div>'
}

function sheetMarkup(preview) {
  const tile = preview.dateTile
    ? `<div class="tile"><div class="month">${escapeHtml(preview.dateTile.month)}</div><div class="day">${escapeHtml(preview.dateTile.day)}</div><div class="when">${escapeHtml(preview.dateTile.time)}</div></div>`
    : ''
  const meta = preview.meta.map((item) => {
    const icon = icons[item.kind] ?? icons.pin
    return `<li>${icon}<span>${escapeHtml(item.text)}</span></li>`
  }).join('')
  const faded = preview.description.length > 180 ? ' fade' : ''
  return `<section class="sheet"><div class="heading">${tile}<div><p class="label">${escapeHtml(preview.label)}</p><h1>${escapeHtml(preview.title)}</h1></div></div>${meta ? `<ul class="meta">${meta}</ul>` : ''}<p class="body${faded}">${escapeHtml(preview.description)}</p></section>`
}

function openGraphMeta(details, preview) {
  const description = plainText(preview.description, 200)
  return [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta property="og:title" content="${escapeHtml(preview.title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(details.url)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="ShowMe STL">',
    `<meta property="og:image" content="${shareOgImage.url}">`,
    `<meta property="og:image:width" content="${shareOgImage.width}">`,
    `<meta property="og:image:height" content="${shareOgImage.height}">`,
    `<meta property="og:image:alt" content="${escapeHtml(preview.title)}">`,
    // iMessage plays og:video inside the bubble, but that area is not a tap target.
    `<meta property="og:video" content="${shareOgVideo.url}">`,
    `<meta property="og:video:type" content="${shareOgVideo.type}">`,
    `<meta property="og:video:width" content="${shareOgVideo.width}">`,
    `<meta property="og:video:height" content="${shareOgVideo.height}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(preview.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${shareOgImage.url}">`,
    `<meta name="apple-itunes-app" content="app-id=6760572115, app-argument=${escapeHtml(details.url)}">`,
    `<link rel="canonical" href="${escapeHtml(details.url)}">`,
  ].join('')
}

const pageStyle = `<style>
*{box-sizing:border-box}
html,body{margin:0;background:#090a0c;color:#171412}
body{font-family:system-ui,-apple-system,sans-serif}
.frame{position:relative;width:min(100%,430px);height:100svh;margin:0 auto;overflow:hidden}
.bar{position:absolute;top:0;left:0;right:0;z-index:20;height:48px;display:flex;align-items:center;padding:0 16px;color:#fff}
.brand{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:650}
.mark{width:28px;height:28px;border-radius:8px;background:#C00828;display:grid;place-items:center}
.mark svg{width:16px;height:18px}
.cta:focus-visible{outline:2px solid #fff;outline-offset:4px}
.hero{position:absolute;left:0;right:0;top:48px;bottom:calc(58svh - 24px);background:#141218;overflow:hidden}
.photo,.fallback-hero,.collage{position:absolute;inset:0;width:100%;height:100%}
.photo{object-fit:cover;object-position:center;display:block}
.collage{display:grid;grid-template-columns:1fr 1fr}
.collage.rows-2{grid-template-rows:1fr 1fr}
.collage img{width:100%;height:100%;object-fit:cover;object-position:center}
.fallback-hero{background:radial-gradient(120% 80% at 80% 0%,rgba(192,8,40,.55),transparent 55%),radial-gradient(90% 70% at 0% 100%,rgba(58,135,255,.35),transparent 50%),#141218}
.sheet{position:absolute;left:0;right:0;bottom:0;z-index:10;height:58svh;overflow:auto;border-radius:20px 20px 0 0;background:#f6f1ea;padding:24px 20px 112px}
.heading{display:flex;gap:14px;align-items:flex-start}
.tile{width:64px;flex:none;background:#fff;border-radius:16px;text-align:center;overflow:hidden;box-shadow:0 8px 24px rgba(22,19,17,.08)}
.tile .month{background:#C00828;color:#fff;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:5px 0 4px}
.tile .day{font-size:26px;font-weight:700;line-height:1;padding-top:6px}
.tile .when{font-size:10px;color:#6b625c;padding:4px 4px 7px}
.label{margin:0;color:#C00828;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
h1{margin:4px 0 0;font-size:32px;line-height:1.05;letter-spacing:-.03em}
.meta{list-style:none;margin:16px 0 0;padding:0;display:grid;gap:10px}
.meta li{display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.35;color:#3f3935}
.meta svg{width:16px;height:16px;flex:none;margin-top:2px;stroke:#C00828;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.body{margin:16px 0 0;font-size:15px;line-height:1.55;color:#4e4742}
.body.fade{position:static;height:auto;max-height:6em;overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 62%,transparent);mask-image:linear-gradient(to bottom,#000 62%,transparent);background:none}
.dock{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,430px);background:rgba(246,241,234,.96);padding:12px 16px max(12px,env(safe-area-inset-bottom))}
.cta{display:flex;align-items:center;justify-content:center;height:56px;border-radius:16px;background:#C00828;color:#fff;text-decoration:none;font-size:17px;font-weight:700}
.missing{padding:72px 24px 120px;color:#fff}
.missing h1{font-size:36px}
.missing p{color:#c8c2bc;line-height:1.5}
</style>`

// Places, events, public playlists, and profile avatars may pass a public
// preview. Profile names and bios are dropped. This string is also the Worker
// response, so it has to stay self-contained.
export function sharedContentFallbackHtml(kind, id, preview) {
  const details = sharedContentDetails(kind, id)
  const content = details ? previewForHtml(kind, preview) ?? genericSharePreview(kind) : null
  const head = content
    ? `<title>${escapeHtml(content.title)} · ShowMe STL</title>${openGraphMeta(details, content)}`
    : '<title>Link unavailable · ShowMe STL</title>'
  const body = content
    ? `<div class="frame"><header class="bar"><div class="brand">${mark}<span>Showme STL</span></div></header><div class="hero">${heroMarkup(content)}</div>${sheetMarkup(content)}<div class="dock"><a class="cta" href="${escapeHtml(details.appUrl)}">Open in ShowMe</a></div></div>`
    : `<div class="frame"><header class="bar"><div class="brand">${mark}<span>Showme STL</span></div></header><main class="missing"><h1>Link unavailable</h1><p>Ask for a new ShowMe link and try again.</p><div class="dock"><a class="cta" href="${showMeAppStoreUrl}">Get it on the App Store</a></div></main></div>`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">${head}${pageStyle}</head><body>${body}</body></html>`
}
