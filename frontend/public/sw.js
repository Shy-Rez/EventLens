const CACHE_NAME = 'cig-platform-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/albums',
  '/search',
  '/uploads',
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event Detected');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching structural layout shells...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting()) 
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation Event Detected');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Evicting outdated cache store:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/') || event.request.url.includes('_next/webpack-hmr')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => caches.match('/'));
    })
  );
});