const CACHE_NAME = 'splitsmart-v1';
const ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon-512x512.png',
    '/hero-illustration.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
