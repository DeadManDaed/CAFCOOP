// public/sw.js
// Service Worker CAFCOOP - Version Simple

const CACHE_NAME = 'cafcoop-v1'
const urlsToCache = [
  '/',
  '/offline.html',
  '/js/cafcoop_app.js',
  '/js/cafcoop_data.js',
  '/js/supabase-client.js',
  '/manifest.json'
]

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch - Stratégie Network First
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
      .then((response) => response || caches.match('/offline.html'))
  )
})
