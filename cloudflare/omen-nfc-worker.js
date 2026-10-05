const origin = 'https://nfc-origin.showmestl.app'

const association = {
  applinks: {
    details: [{
      appIDs: [
        'BPWVXN85FK.com.showmestl.app',
        '23K7BSC7Q8.com.showmestl.mobilev2',
      ],
      components: [
        { '/': '/check-in', '?': { placeId: '?*' } },
        { '/': '/raffle/omen' },
      ],
    }],
  },
}

const fallbackPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Omen Coffee raffle · ShowMe STL</title>
<meta name="robots" content="noindex,nofollow"><style>
*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:40px 24px;background:#090a0c;color:white;font-family:system-ui,-apple-system,sans-serif;text-align:center}main{width:min(100%,390px)}.eyebrow{color:#c7403e;font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}h1{font-size:38px;line-height:1.1;margin:24px 0}p{line-height:1.55;color:#aaaab0}a{display:block;padding:14px 18px;margin-top:16px;border-radius:999px;background:#c8072a;color:white;text-decoration:none;font-weight:700}a.secondary{background:#24242a}.fine{font-size:13px;margin-top:24px}
</style></head><body><main><div class="eyebrow">Omen Coffee × ShowMe STL</div><h1>Save your Omen visit.</h1><p>ShowMe will ask for location access to confirm you’re near Omen Coffee. You can finish setting up your account later.</p><a href="showmestl-v2://omen-raffle?source=link">Open ShowMe</a><a class="secondary" href="https://apps.apple.com/app/id6760572115">Get ShowMe for iPhone</a><p class="fine">After installing, tap the NFC tag again. Opening this page alone does not save an entry.</p></main></body></html>`

class RewriteNextAsset {
  constructor(attribute) { this.attribute = attribute }
  element(element) {
    const value = element.getAttribute(this.attribute)
    if (value?.startsWith('/_next/')) {
      element.setAttribute(this.attribute, `${origin}${value}`)
    }
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === '/.well-known/apple-app-site-association') {
      return new Response(JSON.stringify(association), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      })
    }

    if (url.pathname === '/raffle/omen' || url.pathname === '/raffle/omen/') {
      try {
        const response = await fetch(`${origin}/raffle/omen`, { redirect: 'manual' })
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          return new HTMLRewriter()
            .on('link[href]', new RewriteNextAsset('href'))
            .on('script[src]', new RewriteNextAsset('src'))
            .transform(response)
        }
      } catch { /* Keep the NFC fallback available while the local tunnel is offline. */ }
      return new Response(fallbackPage, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      })
    }

    return fetch(request)
  },
}
