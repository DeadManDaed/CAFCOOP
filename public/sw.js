// public/sw.js
// Service Worker CAFCOOP - Version Corrigée

// 1. On change le nom pour forcer la mise à jour du cache
const CACHE_NAME = 'cafcoop-v2'

const urlsToCache = [
  '/',
  '/offline.html',
  // AJOUT CRUCIAL ICI :
  '/css/main.css', 
  // Assure-toi que ce chemin correspond exactement à l'endroit où tu as mis le fichier
  '/js/cafcoop_app.js',
  '/js/cafcoop_data.js',
  '/js/supabase-client.js',
  '/manifest.json'
]

// Installation (Mise en cache des fichiers)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert, ajout des fichiers...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  )
})

// Activation (Nettoyage des vieux caches v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression du vieux cache:', cacheName);
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch - Stratégie Hybride (Plus robuste pour le CSS)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. Si le fichier est dans le cache (ex: CSS), on le sert TOUT DE SUITE
      if (response) {
        return response;
      }
      
      // 2. Sinon, on essaie de le télécharger (Network)
      return fetch(event.request).then((networkResponse) => {
          return networkResponse;
      }).catch(() => {
          // 3. Si pas de réseau et pas dans le cache, on montre la page hors ligne
          // (Seulement si c'est une navigation vers une page HTML)
          if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
          }
      });
    })
  );
});
