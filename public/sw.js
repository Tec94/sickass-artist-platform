const CACHE_NAME = 'sickass-v1'
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
