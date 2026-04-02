const CACHE_NAME = 'hermes-v1';
const urlsToCache = [
  '/Hermes-Management-and-Consulting-App/index.html',
  '/Hermes-Management-and-Consulting-App/icon-192x192.png',
  '/Hermes-Management-and-Consulting-App/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});