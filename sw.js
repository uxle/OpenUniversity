// public/sw.js — offline-first service worker for OpenKnowledge.
//
// The app is a static, no-backend SPA: every asset (JS modules, JSON
// registries, .zl lessons, fonts-as-SVG, icons) is same-origin and
// immutable-ish between deploys. That makes a simple, dependency-free
// strategy both possible and sufficient:
//
//   - Precache the app shell at install (index.html + bundled CSS +
//     bootstrap module), so a repeat visit works with zero network.
//   - Stale-while-revalidate for other same-origin GETs: cached copy
//     answers instantly, network refreshes it in the background. Lesson
//     content barely ever changes between visits; when it does, the
//     refresh means the NEXT visit sees it — the usual trade for offline
//     reading apps.
//   - Network-first for navigations, falling back to the cached shell
//     (this is what makes a cold reload work on a plane).
//
// Bump CACHE_VERSION on any release that changes precached files. Old
// caches are deleted on activate; clients are claimed so the first
// page after an update is already controllerless-safe.

const CACHE_VERSION = "openknowledge-v8-fluid-menu";
const PRECACHE = [
  "./",
  "./index.html",
  "./src/styles/main.bundle.css",
  "./src/app/bootstrap.js",
  "./public/fonts/fa-solid-900.min.woff2",
  "./public/fonts/pdf-symbols-subset.ttf",
  "./public/manifest.json",
  "./public/icons/icon-192.png",
  "./public/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  // Navigations: network-first so users get fresh shells when online,
  // cached shell when offline (SPA re-routes from index.html anyway).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((c) => c.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Everything else: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const refresh = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
