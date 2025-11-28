const CACHE_NAME = "casino-vodka-cache-v3";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/assets/js/script.js",
  "/assets/js/vodka.js",
  "/assets/images/vod-ka-bet.avif",
  "/assets/images/vod-ka-bet-mobile.avif",
  "/external-links.html",
  "/favicon.ico",
  "/icons/favicon-32x32.png",
];
const EXTENDED_ASSETS = [
  "/casino-vodka/rules.html",
  "/assets/images/rules.jpg",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
  "/icons/apple-touch-icon-180x180.png",
  "/icons/favicon-16x16.png",
  "/icons/favicon-48x48.png",
  "/icons/favicon-64x64.png",
  "/icons/favicon-96x96.png",
  "/manifest.json",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache
          .addAll(CORE_ASSETS)
          .then(() =>
            Promise.allSettled(
              EXTENDED_ASSETS.map((asset) =>
                cache.add(asset).catch(() => null)
              )
            )
          )
      )
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestURL = new URL(event.request.url);
  if (requestURL.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchRequest = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone))
                .catch(() => {});
            }
            return networkResponse;
          })
          .catch(() =>
            cachedResponse ||
            (event.request.mode === "navigate"
              ? caches.match("/index.html")
              : Response.error())
          );
        return cachedResponse || fetchRequest;
      })
    );
  }
});
