const base = (() => {
  const path = self.location.pathname.split('/');
  path.pop();
  return path.join('/') + '/';
})();

const CACHE_NAME = 'hermes-v2';
const urlsToCache = [
  base,
  base + 'index.html',
  base + 'offline.html',
  base + 'manifest.json',
  base + 'icon-192x192.png',
  base + 'icon-512x512.png',
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
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
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