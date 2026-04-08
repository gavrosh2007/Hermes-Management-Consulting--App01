const CACHE_NAME = 'hermes-v1';
const urlsToCache = [
  '/Hermes-Management-and-Consulting-App/',
  '/Hermes-Management-and-Consulting-App/index.html',
  '/Hermes-Management-and-Consulting-App/manifest.json',
  '/Hermes-Management-and-Consulting-App/icon-192x192.png',
  '/Hermes-Management-and-Consulting-App/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});