// Service Worker file: service-worker.js

const CACHE_NAME = 'blitzracer-v16';
const urlsToCache = [
  'https://blitzracer.vercel.app/',
  'https://blitzracer.vercel.app/index.html',
  'https://blitzracer.vercel.app/style.css',
  'https://blitzracer.vercel.app/script.js',
  'https://blitzracer.vercel.app/manifest.json',
  'https://blitzracer.vercel.app/offline.html',
  'https://blitzracer.vercel.app/cargame192.png',
  'https://blitzracer.vercel.app/cargame512.png',
  'https://blitzracer.vercel.app/cargamebg.mp3',
  'https://blitzracer.vercel.app/shieldcargame.mp3',
  
  // External libraries
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js'
];

// ---------------------- INSTALLATION ----------------------
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v16...');
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
            return caches.match('https://blitzracer.vercel.app/index.html');
          }
        });
      })
  );
});
