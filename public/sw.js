const CACHE = "carlogs-v1";
const SHELL = ["/", "/cars", "/manifest.json", "/android-chrome-192x192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Cache First — Next.js immutable static assets
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Stale While Revalidate — Cloudinary images
  if (url.hostname === "res.cloudinary.com") {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((res) => {
          cache.put(request, res.clone());
          return res;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network First — HTML navigation
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Network Only — everything else (API routes, etc.)
});

self.addEventListener("push", (e) => {
  if (!e.data) return;
  const { title, body, icon, badge, tag, data } = e.data.json();
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || "/android-chrome-192x192.png",
      badge: badge || "/favicon-32x32.png",
      tag,
      data,
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url;
  if (url) {
    e.waitUntil(clients.openWindow(url));
  }
});
