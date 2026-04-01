const CACHE_NAME = "whats-wrong-v34";
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
  "./assets/custom-whats-wrong/one-eye.png?v=20260401a",
  "./assets/custom-whats-wrong/two-hands.png?v=20260401a",
  "./assets/custom-whats-wrong/three-arms.png?v=20260401a",
  "./assets/custom-whats-wrong/two-feet.png?v=20260401a",
  "./assets/custom-whats-wrong/five-legs.png?v=20260401a",
  "./assets/custom-whats-wrong/fever.png?v=20260401a",
  "./assets/custom-whats-wrong/toothache.png?v=20260401a",
  "./assets/custom-whats-wrong/foot-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/hand-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/hands-hurt.png?v=20260401a",
  "./assets/custom-whats-wrong/headache.png?v=20260401a",
  "./assets/custom-whats-wrong/stomachache.png?v=20260401a",
  "./assets/custom-whats-wrong/runny-nose.png?v=20260401a",
  "./assets/custom-whats-wrong/sore-throat.png?v=20260401a",
  "./assets/custom-whats-wrong/leg-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/ear-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/eye-hurts-female.png?v=20260401a",
  "./assets/custom-whats-wrong/eye-hurts-male.png?v=20260401a",
  "./assets/custom-whats-wrong/group-sick.png?v=20260401a",
  "./assets/custom-whats-wrong/hands-and-legs-hurt.png?v=20260401a",
  "./assets/custom-whats-wrong/female-fever.png?v=20260401a",
  "./assets/custom-whats-wrong/male-fever.png?v=20260401a",
  "./assets/custom-whats-wrong/female-toothache.png?v=20260401a",
  "./assets/custom-whats-wrong/male-toothache.png?v=20260401a",
  "./assets/custom-whats-wrong/female-foot-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/male-foot-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/male-hands-hurt.png?v=20260401a",
  "./assets/custom-whats-wrong/female-hand-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/female-hands-hurt.png?v=20260401a",
  "./assets/custom-whats-wrong/female-headache.png?v=20260401a",
  "./assets/custom-whats-wrong/female-stomachache.png?v=20260401a",
  "./assets/custom-whats-wrong/male-runny-nose.png?v=20260401a",
  "./assets/custom-whats-wrong/female-runny-nose.png?v=20260401a",
  "./assets/custom-whats-wrong/female-eye-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/male-eye-hurts.png?v=20260401a",
  "./assets/custom-whats-wrong/male-hands-and-legs-hurt.png?v=20260401a"
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
