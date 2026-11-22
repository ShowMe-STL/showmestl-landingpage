import type { Metadata } from 'next'
import { PLAY_STORE_APP_ID } from './store-links.mjs'

export { APP_STORE_URL, PLAY_STORE_APP_ID, PLAY_STORE_URL } from './store-links.mjs'

export function playStoreMetadata(contentUrl?: string): Metadata {
  return {
    other: {
      'google-play-app': `app-id=${PLAY_STORE_APP_ID}`,
    },
    appLinks: {
      android: {
        package: PLAY_STORE_APP_ID,
        app_name: 'ShowMe STL',
        ...(contentUrl ? { url: contentUrl } : {}),
      },
    },
  }
}
