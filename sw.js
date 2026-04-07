const CACHE_NAME = 'hermes-mc-v2';
const urlsToCache = [
  '/Hermes-Management-and-Consulting-App/',
  '/Hermes-Management-and-Consulting-App/index.html',
  '/Hermes-Management-and-Consulting-App/offline.html',
  '/Hermes-Management-and-Consulting-App/manifest.json',
  '/Hermes-Management-and-Consulting-App/icon-72x72.png',
  '/Hermes-Management-and-Consulting-App/icon-96x96.png',
  '/Hermes-Management-and-Consulting-App/icon-128x128.png',
  '/Hermes-Management-and-Consulting-App/icon-144x144.png',
  '/Hermes-Management-and-Consulting-App/icon-152x152.png',
  '/Hermes-Management-and-Consulting-App/icon-192x192.png',
  '/Hermes-Management-and-Consulting-App/icon-384x384.png',
  '/Hermes-Management-and-Consulting-App/icon-400x400.png',
  '/Hermes-Management-and-Consulting-App/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/Hermes-Management-and-Consulting-App/offline.html');
          }
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});