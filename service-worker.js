// Service Worker file: service-worker.js

// Declare constants using lowercase 'const'
const CACHE_NAME = 'pixel-racer-cache-v3'; // <--- INCREMENTED CACHE NAME
const urlsToCache = [
  '/', 
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/offline.html', // <--- Offline Fallback page must exist
  '/cargame192.png',
  '/cargame512.png',
  '/cargamebg.mp3',
  '/shieldcargame.mp3'
];

// ---------------------- INSTALLATION ----------------------
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v3...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // All files in urlsToCache MUST be successfully fetched, 
      // or the Service Worker will fail to install.
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ---------------------- ACTIVATION (Cleanup) ----------------------
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that is NOT in the whitelist (i.e., older versions)
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of the current page immediately
  self.clients.claim();
});

// ---------------------- FETCH (Cache-First with Offline Fallback) ----------------------
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 1. Return cached response if found
        if (response) {
          return response;
        }

        // 2. Fetch from network if not in cache
        return fetch(event.request).catch(() => {
          // 3. Network failed: Serve fallback only for HTML navigation requests
          // This ensures images/CSS failing to load don't serve the offline page instead.
          if (event.request.mode === 'navigate' || 
              (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
