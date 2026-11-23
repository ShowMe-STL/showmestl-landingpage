import assert from 'node:assert/strict'
import { APP_STORE_URL, PLAY_STORE_URL } from '../lib/store-links.mjs'

const url = new URL('/qr', process.argv[2] ?? 'http://localhost:3000')
const devices = [
  ['iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', APP_STORE_URL],
  ['Android', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/143.0.0.0 Mobile Safari/537.36', PLAY_STORE_URL],
  ['iPad', 'Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', APP_STORE_URL],
  ['desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/143.0.0.0 Safari/537.36', '/'],
  ['unknown', '', '/'],
]

for (const [device, userAgent, destination] of devices) {
  const response = await fetch(url, {
    redirect: 'manual',
    headers: { 'User-Agent': userAgent },
  })

  assert.equal(response.status, 302, device)
  assert.equal(response.headers.get('Location'), destination, device)
  assert.match(response.headers.get('Cache-Control') ?? '', /\bno-store\b/, device)
}

console.log('QR redirects passed for iPhone, Android, iPad, desktop, and unknown devices.')
