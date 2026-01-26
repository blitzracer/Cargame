// Service Worker file: service-worker.js

const CACHE_NAME = 'blitzracer-v18';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/offline.html',
  '/cargame192.png',
  '/cargame512.png',
  '/cargamebg.mp3',
  '/shieldcargame.mp3',
  
  // External libraries
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js'
];

// ---------------------- INSTALLATION ----------------------
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v18...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ---------------------- ACTIVATION ----------------------
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

// ---------------------- FETCH ----------------------
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate' || 
              (event.request.method === 'GET' && 
               event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
