const CACHE_NAME = 'casino-vodka-cache-v3';
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll([
                    '/',
                    '/index.html'
                    '/&.html'
                ]);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});
self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;   
    event.respondWith(
        fetch(event.request)
            .catch(function() {
                return caches.match(event.request) || caches.match('/index.html');
            })
    );
});
