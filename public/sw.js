// Service worker mínimo de MonopatinShop.
// Necesario para que Chrome considere el sitio instalable (PWA).
// Estrategia: network-first, con caché de respaldo para navegación offline.

const CACHE = "monopatin-v3";
const OFFLINE_URLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo GET y mismo origen; el resto pasa directo a la red.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Las APIs y zonas privadas siempre deben consultar datos actuales.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/cuenta")
  ) {
    return;
  }

  // Navegación (páginas): red primero, caché de respaldo si no hay conexión.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Otros recursos GET: caché primero, luego red.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached)
    )
  );
});
