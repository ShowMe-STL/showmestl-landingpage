import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { appLinkAssociation } from '../lib/app-link-association.mjs'
import { parseSharedContentPath, sharedContentDetails, sharedContentFallbackHtml } from '../lib/shared-content-links.mjs'

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
    assert.match(html, /app-id=6760572115/)
    assert.match(html, /noindex,nofollow/)
    assert.match(html, /After installing or updating/)
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
const routes = readFileSync(new URL('../cloudflare/omen-nfc-wrangler.toml', import.meta.url), 'utf8')
for (const host of ['showmestl.app', 'www.showmestl.app']) {
  assert.ok(routes.includes(`"${host}/.well-known/apple-app-site-association"`))
  for (const [kind] of fixtures) assert.ok(routes.includes(`"${host}/${kind}/*"`))
}
console.log('Shared-link website checks passed: both hosts, all four destinations, fallback HTML, signing identities, invalid links, and existing NFC association paths.')
