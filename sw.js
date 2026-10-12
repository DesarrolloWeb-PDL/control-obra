/**
 * Control de Obra - Service worker
 * Cache-first app shell for offline use.
 */

var CACHE_NAME = 'control-obra-v3';

var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icons/icon.svg',
];

// Install: pre-cache the app shell.
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: drop old caches and take control immediately.
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: NETWORK-FIRST so updates show immediately when online.
// Cache is only a fallback for offline use.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
