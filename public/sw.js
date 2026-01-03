const CACHE_NAME = 'splitsmart-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Simple network-first strategy for development, can be optimized later
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
