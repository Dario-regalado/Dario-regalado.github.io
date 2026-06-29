const CACHE_NAME = "pelu-v3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/main.js",
  "/manifest.webmanifest",
  "/offline.html",
  "/calendario.html",
  "/css/calendar.css",
  "/js/supabase.js",
  "/js/calendar.js",
  "/js/auth.js",
  "/css/admin.css",
  "/admin/index.html",
  "/admin/dashboard.html",
  "/admin/reservas.html",
  "/js/admin-reservas.js",
  "/admin/calendario.html",
  "/js/calendar-admin.js",
  "/admin/manifest.webmanifest",
  "/fotos/icon-192.png",
  "/fotos/icon-512.png",
  "/fotos/logo.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
            return networkResponse;
          })
          .catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("/offline.html");
            }
            return new Response("", { status: 503, statusText: "Offline" });
          });
      })
    );
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
});
