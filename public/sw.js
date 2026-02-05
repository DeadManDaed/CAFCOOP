// public/sw.js
const CACHE_NAME = 'cafcoop-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL, '/', '/index.html']))
  )
  self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((r) => r || caches.match(OFFLINE_URL)))
  )
})