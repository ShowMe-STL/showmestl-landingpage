export const sharedContentKinds = ['profile', 'place', 'event', 'playlist']
export const showMeAppStoreUrl = 'https://apps.apple.com/app/id6760572115'

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
  return {
    title: kind === 'profile' ? 'Find me on ShowMe STL' : `Explore this ${kind} on ShowMe STL`,
    description: `Open this ${kind} in ShowMe STL. Your account and privacy settings stay in the app.`,
    appUrl: `showmestl-v2://${kind}/${id.toLowerCase()}`,
    url: `https://showmestl.app/${kind}/${id.toLowerCase()}`,
  }
}

// This response needs no local origin or database. Never put profile names,
// photos, private collection details, or account credentials into public HTML.
export function sharedContentFallbackHtml(kind, id) {
  const details = sharedContentDetails(kind, id)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${details?.title ?? 'Link unavailable'} · ShowMe STL</title>${details ? `<meta name="description" content="${details.description}"><meta property="og:title" content="${details.title}"><meta property="og:description" content="${details.description}"><meta property="og:url" content="${details.url}"><meta property="og:type" content="website"><meta name="apple-itunes-app" content="app-id=6760572115, app-argument=${details.url}"><link rel="canonical" href="${details.url}">` : ''}<style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:40px 24px;background:#090a0c;color:white;font-family:system-ui,-apple-system,sans-serif;text-align:center}main{width:min(100%,390px)}.brand{color:#c7403e;font-size:14px;font-weight:700;letter-spacing:.12em}h1{font-size:36px;line-height:1.15}p{line-height:1.6;color:#bdbdc5}a{display:block;min-height:48px;padding:14px 18px;margin-top:16px;border-radius:999px;background:#c8072a;color:white;text-decoration:none;font-weight:600}a.secondary{background:#15151d}a:focus-visible{outline:2px solid white;outline-offset:4px}.fine{font-size:14px}</style></head><body><main><div class="brand">ShowMe STL</div><h1>${details?.title ?? 'Link unavailable'}</h1><p>${details?.description ?? 'Ask for a new ShowMe link and try again.'}</p>${details ? `<a href="${details.appUrl}">Open ShowMe</a>` : ''}<a class="secondary" href="${showMeAppStoreUrl}">Get ShowMe for iPhone</a>${details ? '<p class="fine">After installing or updating ShowMe, return to this link and tap Open ShowMe.</p>' : ''}<a class="secondary" href="https://showmestl.app/">About ShowMe STL</a></main></body></html>`
}
