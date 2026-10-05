// Minimal service worker: no offline caching (the admin dashboard is all
// live, moderator-gated data that must never be served stale). It exists so
// the admin PWA meets Chrome/Android's installability requirement of a
// registered service worker with a fetch handler.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
