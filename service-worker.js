const CACHE_NAME = "alemamy-1352-offline-v1";
const BASE = "/1352/";
const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "jb.js",
  BASE + "jb.js?v=11",
  BASE + "core.js",
  BASE + "core.js?v=10",
  BASE + "mem.js",
  BASE + "int64.js",
  BASE + "ps4_offsets.js",
  BASE + "rpc_worker.js",
  BASE + "logo.png",
  BASE + "favicon.svg",
  BASE + "payload2.bin",
  BASE + "patches/1302.bin",
  BASE + "patches/1350.bin",
  BASE + "patches/1352.bin"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response && response.ok && new URL(request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        if (request.mode === "navigate") {
          return caches.match(BASE + "index.html");
        }
        return new Response("", {status: 503, statusText: "Offline"});
      });
    })
  );
});
