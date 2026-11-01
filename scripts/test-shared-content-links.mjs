import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { appLinkAssociation } from '../lib/app-link-association.mjs'
import {
  formatEventWhen,
  loadPublicPreview,
  parseSharedContentPath,
  sharedContentDetails,
  sharedContentFallbackHtml,
} from '../lib/shared-content-links.mjs'

// Import the real Worker as ESM even though the website package uses CJS defaults.
const source = readFileSync(new URL('../cloudflare/omen-nfc-worker.js', import.meta.url), 'utf8')
  .replaceAll("'../lib/", `'${new URL('../lib/', import.meta.url).href}`)
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const fixtures = [['profile', '12345678-1234-4234-8234-123456789abc'], ['place', '123'], ['event', '456'], ['playlist', '789']]
for (const host of ['showmestl.app', 'www.showmestl.app']) {
  const aasa = await worker.fetch(new Request(`https://${host}/.well-known/apple-app-site-association`))
  assert.equal(aasa.status, 200)
  assert.equal(aasa.headers.get('content-type'), 'application/json')
  assert.equal(aasa.headers.get('location'), null)
  assert.deepEqual(await aasa.json(), appLinkAssociation)
  for (const [kind, id] of fixtures) {
    const path = `/${kind}/${id}`
    assert.deepEqual(parseSharedContentPath(path), { kind, id })
    assert.equal(sharedContentDetails(kind, id).appUrl, `showmestl-v2://${kind}/${id}`)
    const response = await worker.fetch(new Request(`https://${host}${path}`))
    const html = await response.text()
    assert.equal(response.status, 200)
    assert.match(html, new RegExp(`href="showmestl-v2://${kind}/${id}"`))
    assert.match(html, /Open in ShowMe/)
    assert.match(html, /Don.t have it\?/)
    assert.match(html, /Get it on the App Store/)
    assert.match(html, /app-id=6760572115/)
    assert.match(html, /noindex,nofollow/)
    assert.match(html, /property="og:image" content="https:\/\/showmestl\.app\/og\/showme-share\.jpg"/)
    assert.match(html, /property="og:image:width" content="1200"/)
    assert.match(html, /property="og:image:height" content="630"/)
    assert.match(html, /property="og:video" content="https:\/\/showmestl\.app\/og\/showme-share\.mp4"/)
    assert.match(html, /property="og:video:type" content="video\/mp4"/)
    assert.match(html, /property="og:video:width" content="1200"/)
    assert.match(html, /property="og:video:height" content="630"/)
    assert.match(html, /name="twitter:card" content="summary_large_image"/)
    assert.equal(response.headers.get('location'), null, 'Camera/browser fallbacks must not lose the destination to a domain redirect')
    assert.equal(html, sharedContentFallbackHtml(kind, id))
  }
}
for (const path of ['/place/0', '/place/01', '/place/9007199254740992', '/event/-1', '/playlist/1/extra',
  '/profile/me', '/place/%31', '/place/1?profileId=other', '/event/%3Cscript%3E']) {
  const response = await worker.fetch(new Request(`https://showmestl.app${path}`))
  assert.equal(response.status, 404, path)
  const html = await response.text()
  assert.match(html, /Link unavailable/)
  assert.doesNotMatch(html, /href="showmestl-v2:/)
  assert.doesNotMatch(html, /<script>/)
}
const components = appLinkAssociation.applinks.details[0].components
for (const [kind] of fixtures) assert.ok(components.some(item => item['/'] === `/${kind}/*`))
assert.ok(components.some(item => item['/'] === '/check-in' && item['?'].placeId === '?*'))
assert.ok(components.some(item => item['/'] === '/raffle/omen'))
assert.deepEqual(appLinkAssociation.applinks.details[0].appIDs,
  ['BPWVXN85FK.com.showmestl.app', '23K7BSC7Q8.com.showmestl.mobilev2'])
const when = formatEventWhen('2026-11-01T21:00:00.000Z', '2026-11-01T23:00:00.000Z')
assert.equal(when.time, '3:00 PM')
assert.equal(when.range, '3:00–5:00 PM CT')
assert.equal(when.month, 'Nov')
assert.equal(when.day, '1')
const placeHtml = sharedContentFallbackHtml('place', '1558', {
  name: '<script>alert(1)</script>',
  description: 'Daytime cafe',
  neighborhood: 'Central West End',
  category: 'Breakfast',
  address: '39 N. Euclid Avenue',
  image_url: 'https://images.example/first-watch.jpg',
})
assert.match(placeHtml, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
assert.match(placeHtml, /Central West End/)
assert.match(placeHtml, /Breakfast/)
assert.match(placeHtml, /https:\/\/images\.example\/first-watch\.jpg/)
assert.doesNotMatch(placeHtml, /<script>/)
const profileId = '12345678-1234-4234-8234-123456789abc'
const profileHtml = sharedContentFallbackHtml('profile', profileId, {
  name: 'Secret Name',
  title: 'Secret Name',
  description: 'private bio',
  image_url: 'https://evil.test/avatar.jpg',
  imageUrl: 'https://evil.test/avatar.jpg',
})
assert.doesNotMatch(profileHtml, /Secret Name/)
assert.doesNotMatch(profileHtml, /private bio/)
assert.doesNotMatch(profileHtml, /evil\.test/)
assert.match(profileHtml, /Find me on ShowMe STL/)
const routes = readFileSync(new URL('../cloudflare/omen-nfc-wrangler.toml', import.meta.url), 'utf8')
for (const host of ['showmestl.app', 'www.showmestl.app']) {
  assert.ok(routes.includes(`"${host}/.well-known/apple-app-site-association"`))
  for (const [kind] of fixtures) assert.ok(routes.includes(`"${host}/${kind}/*"`))
}
const previewSource = readFileSync(new URL('../lib/shared-content-preview.ts', import.meta.url), 'utf8')
assert.doesNotMatch(previewSource, /from\('profiles'\)/)
assert.match(previewSource, /kind === 'profile'/)
const originalFetch = globalThis.fetch
let fetches = 0
globalThis.fetch = async (input) => {
  fetches += 1
  const href = String(input.url ?? input)
  if (href.includes('/rest/v1/places')) {
    return Response.json([{
      name: 'First Watch',
      address: '39 N. Euclid Avenue, St. Louis, MO 63108',
      description: 'Daytime cafe in the Central West End.',
      image_url: 'https://images.example/first-watch.jpg',
      image_thumb_url: null,
      place_categories: { name: 'Breakfast' },
      neighborhoods: { name: 'Central West End' },
    }])
  }
  return Response.json([])
}
try {
  assert.equal(await loadPublicPreview('profile', profileId, {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'public-anon',
  }), null)
  assert.equal(fetches, 0)
  const rich = await worker.fetch(new Request('https://showmestl.app/place/1558'), {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'public-anon',
  })
  const richHtml = await rich.text()
  assert.equal(rich.status, 200)
  assert.equal(rich.headers.get('location'), null)
  assert.match(richHtml, /First Watch/)
  assert.match(richHtml, /Central West End/)
  assert.match(richHtml, /Breakfast/)
  assert.match(richHtml, /Open in ShowMe/)
  assert.match(richHtml, /src="https:\/\/images\.example\/first-watch\.jpg"/)
  assert.match(richHtml, /property="og:image" content="https:\/\/showmestl\.app\/og\/showme-share\.jpg"/)
  assert.doesNotMatch(richHtml, /public-anon/)
} finally {
  globalThis.fetch = originalFetch
}
console.log('Shared-link website checks passed: both hosts, all four destinations, fallback HTML, signing identities, invalid links, and existing NFC association paths.')
