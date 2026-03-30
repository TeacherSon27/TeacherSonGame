const CACHE_NAME = "whats-wrong-v31";
const ASSETS = [
  "./",
  "./index.html",
  "./backend-config.js",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./game-qr.svg",
  "./share-url.txt",
  "./assets/backgrounds/lab-background.png",
  "./assets/frames/choice-frame.png",
  "./assets/scene-cards/fever.png?v=20260329c",
  "./assets/scene-cards/toothache.png?v=20260329c",
  "./assets/scene-cards/foot-hurts.png?v=20260329c",
  "./assets/scene-cards/hand-hurts.png?v=20260329c",
  "./assets/scene-cards/hands-hurt.png?v=20260329c",
  "./assets/scene-cards/headache.png?v=20260329c",
  "./assets/scene-cards/stomachache.png?v=20260329c",
  "./assets/scene-cards/runny-nose.png?v=20260329c",
  "./assets/scene-cards/sore-throat.png?v=20260329c",
  "./assets/scene-cards/leg-hurts.png?v=20260329c",
  "./assets/scene-cards/eye-hurts-female.png?v=20260329c",
  "./assets/scene-cards/eye-hurts-male.png?v=20260329c",
  "./assets/ppt-images/co1/image38.png?v=20260329b",
  "./assets/ppt-images/co1/image36.png?v=20260329b",
  "./assets/ppt-images/co1/image51.png?v=20260329b",
  "./assets/ppt-images/co1/image66.png?v=20260329b",
  "./assets/body-icons/foot.svg",
  "./assets/body-icons/leg.svg",
  "./assets/pdf-reference/two-hands.png",
  "./assets/pdf-reference/three-arms.png",
  "./assets/pdf-reference/two-feet.png",
  "./assets/pdf-reference/five-legs.png",
  "./assets/pdf-reference/hand-hurts-emoji.png",
  "./assets/pdf-reference/foot-hurts-emoji.png",
  "./assets/pdf-reference/hands-and-legs-boy.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
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
