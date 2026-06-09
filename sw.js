const CACHE = "magyar-szavak-v2"; // Incremented version to force update
const ASSETS = [
  "/Hungarian-flashcards/",
  "/Hungarian-flashcards/index.html",
  "/Hungarian-flashcards/manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FIXED: Network-First, fallback to Cache
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // If successful, clone response and update cache dynamically
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, resClone));
        }
        return response;
      })
      .catch(() => caches.match(e.request)) // Offline? Serve from cache
  );
});
