// Service Worker file: service-worker.js

// Declare constants using lowercase 'const'
const CACHE_NAME = 'pixel-racer-cache-v6'; // <--- INCREMENTED CACHE NAME AND VERSION
const urlsToCache = [
  '/Cargame/', // <--- MUST INCLUDE THE DIRECTORY ROOT
  '/Cargame/index.html', // <--- CORRECTED PATH
  '/Cargame/style.css', // <--- CORRECTED PATH
  '/Cargame/script.js', // <--- CORRECTED PATH
  '/Cargame/manifest.json', // <--- CORRECTED PATH
  '/Cargame/offline.html', // <--- CORRECTED PATH
  '/Cargame/cargame192.png', // <--- CORRECTED PATH
  '/Cargame/cargame512.png', // <--- CORRECTED PATH
  '/Cargame/cargamebg.mp3', // <--- CORRECTED PATH
  '/Cargame/shieldcargame.mp3' // <--- CORRECTED PATH
];

// ---------------------- INSTALLATION ----------------------
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v4...');
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
          // Ensure the fallback path is also corrected
          if (event.request.mode === 'navigate' || 
              (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/Cargame/offline.html'); // <--- CORRECTED PATH
          }
        });
      })
  );
});
