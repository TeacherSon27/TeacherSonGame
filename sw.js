const CACHE_NAME = "whats-wrong-v41";
const ASSETS = [
  "./",
  "./index.html",
  "./backend-config.js",
  "./styles.css?v=20260731-gold2",
  "./app.js?v=20260731-gold2",
  "./manifest.json?v=20260731-gold2",
  "./game-qr.svg",
  "./share-url.txt",
  "./assets/og.png",
  "./assets/backgrounds/lab-background.png",
  "./assets/custom-whats-wrong/one-eye.png?v=20260401b",
  "./assets/custom-whats-wrong/two-hands.png?v=20260401b",
  "./assets/custom-whats-wrong/three-arms.png?v=20260401b",
  "./assets/custom-whats-wrong/two-feet.png?v=20260401b",
  "./assets/custom-whats-wrong/five-legs.png?v=20260401b",
  "./assets/custom-whats-wrong/fever.png?v=20260401b",
  "./assets/custom-whats-wrong/toothache.png?v=20260401b",
  "./assets/custom-whats-wrong/foot-hurts.png?v=20260401b",
  "./assets/custom-whats-wrong/feet-hurt.png?v=20260401b",
  "./assets/custom-whats-wrong/hand-hurts.png?v=20260401b",
  "./assets/custom-whats-wrong/hands-hurt.png?v=20260401b",
  "./assets/custom-whats-wrong/arm-hurts.png?v=20260401b",
  "./assets/custom-whats-wrong/arms-hurt.png?v=20260401b",
  "./assets/custom-whats-wrong/headache.png?v=20260401b",
  "./assets/custom-whats-wrong/stomachache.png?v=20260401b",
  "./assets/custom-whats-wrong/nose-hurts.png?v=20260401b",
  "./assets/custom-whats-wrong/runny-nose.png?v=20260401b",
  "./assets/custom-whats-wrong/sore-throat.png?v=20260401b",
  "./assets/custom-whats-wrong/leg-hurts.png?v=20260401b",
  "./assets/custom-whats-wrong/ear-hurts.png?v=20260401b",
  "./assets/custom-whats-wrong/ears-hurt.png?v=20260401b",
  "./assets/custom-whats-wrong/eye-hurts-female.png?v=20260401b",
  "./assets/custom-whats-wrong/eye-hurts-male.png?v=20260401b",
  "./assets/custom-whats-wrong/group-sick.png?v=20260401b",
  "./assets/custom-whats-wrong/hands-and-legs-hurt.png?v=20260401b",
  "./assets/custom-whats-wrong/male-fever.png?v=20260401b",
  "./assets/custom-whats-wrong/female-toothache.png?v=20260401b",
  "./assets/custom-whats-wrong/male-foot-hurts.png?v=20260401b",
  "./assets/custom-whats-wrong/female-headache.png?v=20260401b",
  "./assets/custom-whats-wrong/female-sore-throat.png?v=20260401b",
  "./assets/custom-whats-wrong/female-stomachache.png?v=20260401b",
  "./assets/custom-whats-wrong/male-headache.png?v=20260401b",
  "./assets/custom-whats-wrong/male-stomachache.png?v=20260401b"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (
    event.request.mode === "navigate" ||
    ["document", "style", "script"].includes(event.request.destination)
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
