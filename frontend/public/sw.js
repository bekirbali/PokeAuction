// PokéAuction Lightweight PWA Service Worker
const CACHE_NAME = 'pokeauction-v1';

// Install event - skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event - network first, do NOT intercept socket.io or api calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass socket.io and backend API calls
  if (url.pathname.startsWith('/socket.io') || url.pathname.startsWith('/api') || event.request.method !== 'GET') {
    return;
  }

  // Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
