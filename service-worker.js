// Service Worker file: service-worker.js

// Declare constants using lowercase 'const'
// 🚨 FIXED TYPO and BUMPED VERSION (v13) for a guaranteed update.
const CACHE_NAME = 'blitzracer-v13'; 
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
  
  // CRITICAL: External Tone.js library
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js' 
];

// ---------------------- INSTALLATION ----------------------
self.addEventListener('install', (event) => {
  // 🚨 FIXED: Console log now matches the actual CACHE_NAME (v12).
  console.log('[Service Worker] Installing v12...');
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
  self.clients.claim();
});

// ---------------------- FETCH (Cache-First with Game Fallback) ----------------------
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 1. Return cached response if found (for all assets)
        if (response) {
          return response;
        }

        // 2. Fetch from network if not in cache
        return fetch(event.request).catch(() => {
          // 3. Network failed: Serve the cached game for navigation requests
          if (event.request.mode === 'navigate' || 
              (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
            
            // CORRECT: Serves the full game from cache for offline play
            return caches.match('/Cargame/index.html'); 
          }
          // For all other files (like images or script requests that fail), 
          // the browser will show the standard network error (which is expected)
        });
      })
  );
});
