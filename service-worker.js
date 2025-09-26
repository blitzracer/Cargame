// Service Worker file: service-worker.js

// Declare constants using lowercase 'const'
// 🚨 Bumped version to v7 to ensure the new files (Tone.js, correct fallback logic) are cached.
const CACHE_NAME = 'pixel-racer-cache-v7'; 
const urlsToCache = [
  '/Cargame/', 
  '/Cargame/index.html',
  '/Cargame/style.css',
  '/Cargame/script.js',
  '/Cargame/manifest.json',
  '/Cargame/offline.html',
  '/Cargame/cargame192.png',
  '/Cargame/cargame512.png',
  '/Cargame/cargamebg.mp3',
  '/Cargame/shieldcargame.mp3',
  
  // 🚨 CRITICAL ADDITION: External Tone.js library must be cached for offline audio
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js' 
];

// ---------------------- INSTALLATION ----------------------
self.addEventListener('install', (event) => {
  // 🚨 Console log message now matches the actual CACHE_NAME (v7)
  console.log('[Service Worker] Installing v7...');
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
          if (event.request.mode === 'navigate' || 
              (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
            
            // 🚨 CRITICAL CHANGE: Serve the cached main game page for OFFLINE PLAY.
            return caches.match('/Cargame/index.html');
          }
        });
      })
  );
});
