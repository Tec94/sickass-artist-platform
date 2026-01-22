// Bump this when changing app shell caching behavior.
const CACHE_NAME = 'sickass-v2'
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/offline.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE)
    })
  )
  // Activate updated service worker ASAP so we don't keep serving stale app code.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Remove old caches.
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      // Take control of all clients immediately.
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response
      }

      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // Fallback on network error
        return caches.match('/offline.html')
      })
    })
  )
})
