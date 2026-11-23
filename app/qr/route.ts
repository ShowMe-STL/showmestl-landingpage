import { userAgent } from 'next/server'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/store-links'

const storeByPlatform = new Map([
  ['iOS', APP_STORE_URL],
  ['Android', PLAY_STORE_URL],
])

export function GET(request: Request) {
  const { os } = userAgent(request)

  return new Response(null, {
    status: 302,
    headers: {
      Location: storeByPlatform.get(os.name ?? '') ?? '/',
      'Cache-Control': 'no-store',
    },
  })
}
