const CACHE_NAME = 'cafcoop-v3'; // On incrémente la version

const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json'
  // On ne met plus forcément le CSS ici si on veut qu'il soit toujours frais
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => {
        if (name !== CACHE_NAME) return caches.delete(name);
      }));
    })
  );
  self.clients.claim();
});

// STRATÉGIE CORRIGÉE : Network First (Priorité Réseau)
self.addEventListener('fetch', (event) => {
  // On ne gère que les requêtes GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si le réseau répond, on clone la réponse et on met à jour le cache
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Si le réseau échoue (mode hors-ligne), on cherche dans le cache
        return caches.match(event.request).then((file) => {
          if (file) return file;
          if (event.request.mode === 'navigate') return caches.match('/offline.html');
        });
      })
  );
});
