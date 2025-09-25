const CACHE_NAME = 'pixel-racer-cache-v2'; // <--- UPDATED CACHE NAME
const urlsToCache = [
  '/', 
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/offline.html', // <--- Added for offline fallback
  '/cargame192.png',
  '/cargame512.png',
  '/cargamebg.mp3',
  '/shieldcargame.mp3'
];

// --- INSTALLATION ---
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v2...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// --- ACTIVATION ---
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
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

// --- FETCH (Cache-First with Offline Fallback) ---
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          // Check if the request is for a navigation (HTML page)
          if (event.request.mode === 'navigate' || 
              (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
