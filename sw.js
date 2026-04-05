const CACHE_NAME = 'hermes-mc-v1.0.0';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/H-wallpaper.jpeg',
  '/dervish.mp4',
  // ДОКУМЕНТЫ (ВСЕ БЛОКИ ИЗ index.html)
  '/doc-offshore1-ru',
  '/doc-offshore1-en',
  '/doc-offshore1-el',
  '/doc-offshore1-ua',
  '/doc-offshore2-ru',
  '/doc-offshore2-en',
  '/doc-offshore2-el',
  '/doc-offshore2-ua',
  '/doc-offshore3-ru',
  '/doc-offshore3-en',
  '/doc-offshore3-el',
  '/doc-offshore3-ua',
  '/doc-tax1-ru',
  '/doc-tax1-en',
  '/doc-tax1-el',
  '/doc-tax1-ua',
  '/doc-tax2-ru',
  '/doc-tax2-en',
  '/doc-tax2-el',
  '/doc-tax2-ua',
  '/doc-arch1-ru',
  '/doc-arch1-en',
  '/doc-arch1-el',
  '/doc-arch1-ua',
  '/doc-arch2-ru',
  '/doc-arch2-en',
  '/doc-arch2-el',
  '/doc-arch2-ua'
];

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Установка');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Кеширование основных ресурсов и документов');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function() {
        console.log('[Service Worker] Установка завершена');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[Service Worker] Ошибка при кешировании:', error);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Активация');
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Удаление старого кеша:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        console.log('[Service Worker] Активация завершена');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);
  
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          if (response && response.status === 200) {
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(function() {
          return caches.match(request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            fetch(request)
              .then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME)
                    .then(function(cache) {
                      cache.put(request, networkResponse);
                    });
                }
              })
              .catch(function() {});
            return cachedResponse;
          }
          return fetch(request)
            .then(function(networkResponse) {
              if (networkResponse && networkResponse.status === 200) {
                var responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(request, responseToCache);
                  });
              }
              return networkResponse;
            })
            .catch(function() {
              return new Response('', { 
                status: 200, 
                headers: { 'Content-Type': 'image/svg+xml' } 
              });
            });
        })
    );
    return;
  }
  
  if (request.destination === 'video' || url.pathname.match(/\.(mp4|webm)$/i)) {
    event.respondWith(
      caches.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then(function(networkResponse) {
              if (networkResponse && networkResponse.status === 200) {
                var responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(request, responseToCache);
                  });
              }
              return networkResponse;
            });
        })
    );
    return;
  }
  
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then(function(networkResponse) {
              if (networkResponse && networkResponse.status === 200) {
                var responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(request, responseToCache);
                  });
              }
              return networkResponse;
            });
        })
    );
    return;
  }
  
  event.respondWith(
    fetch(request)
      .catch(function(error) {
        console.warn('[Service Worker] Ошибка запроса:', url.pathname, error);
        return new Response(JSON.stringify({ error: 'Нет соединения с интернетом' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        });
      })
  );
});

self.addEventListener('push', function(event) {
  var data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Hermes MC', body: event.data.text() };
    }
  }
  
  var options = {
    body: data.body || 'Новое обновление от Hermes Management & Consulting',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Hermes MC', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});