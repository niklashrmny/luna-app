// Offline support: app files are cached on install, fonts on first use.
// Bump VERSION whenever app files change so phones pick up the update.
const VERSION = 'luna-v4';
const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/app.js',
  'js/store.js',
  'js/nutrition.js',
  'js/plan.js',
  'js/ui.js',
  'js/views/home.js',
  'js/views/onboarding.js',
  'js/views/training.js',
  'js/timer.js',
  'js/foods.js',
  'js/scanner.js',
  'js/views/food.js',
  'js/images.js',
  'img/ex/Barbell_Glute_Bridge-0.jpg',
  'img/ex/Barbell_Glute_Bridge-1.jpg',
  'img/ex/Barbell_Hip_Thrust-0.jpg',
  'img/ex/Barbell_Hip_Thrust-1.jpg',
  'img/ex/Butterfly-0.jpg',
  'img/ex/Butterfly-1.jpg',
  'img/ex/Cable_Crunch-0.jpg',
  'img/ex/Cable_Crunch-1.jpg',
  'img/ex/Cable_Seated_Lateral_Raise-0.jpg',
  'img/ex/Cable_Seated_Lateral_Raise-1.jpg',
  'img/ex/Close-Grip_Front_Lat_Pulldown-0.jpg',
  'img/ex/Close-Grip_Front_Lat_Pulldown-1.jpg',
  'img/ex/Cross-Body_Crunch-0.jpg',
  'img/ex/Cross-Body_Crunch-1.jpg',
  'img/ex/Crunches-0.jpg',
  'img/ex/Crunches-1.jpg',
  'img/ex/Dead_Bug-0.jpg',
  'img/ex/Dead_Bug-1.jpg',
  'img/ex/Dumbbell_Bicep_Curl-0.jpg',
  'img/ex/Dumbbell_Bicep_Curl-1.jpg',
  'img/ex/Dumbbell_One-Arm_Triceps_Extension-0.jpg',
  'img/ex/Dumbbell_One-Arm_Triceps_Extension-1.jpg',
  'img/ex/Dumbbell_Rear_Lunge-0.jpg',
  'img/ex/Dumbbell_Rear_Lunge-1.jpg',
  'img/ex/Dumbbell_Shoulder_Press-0.jpg',
  'img/ex/Dumbbell_Shoulder_Press-1.jpg',
  'img/ex/Face_Pull-0.jpg',
  'img/ex/Face_Pull-1.jpg',
  'img/ex/Flat_Bench_Lying_Leg_Raise-0.jpg',
  'img/ex/Flat_Bench_Lying_Leg_Raise-1.jpg',
  'img/ex/Goblet_Squat-0.jpg',
  'img/ex/Goblet_Squat-1.jpg',
  'img/ex/Hyperextensions_Back_Extensions-0.jpg',
  'img/ex/Hyperextensions_Back_Extensions-1.jpg',
  'img/ex/Lateral_Raise_-_With_Bands-0.jpg',
  'img/ex/Lateral_Raise_-_With_Bands-1.jpg',
  'img/ex/Leg_Press-0.jpg',
  'img/ex/Leg_Press-1.jpg',
  'img/ex/Leverage_Chest_Press-0.jpg',
  'img/ex/Leverage_Chest_Press-1.jpg',
  'img/ex/Leverage_Shoulder_Press-0.jpg',
  'img/ex/Leverage_Shoulder_Press-1.jpg',
  'img/ex/Monster_Walk-0.jpg',
  'img/ex/Monster_Walk-1.jpg',
  'img/ex/One-Arm_Dumbbell_Row-0.jpg',
  'img/ex/One-Arm_Dumbbell_Row-1.jpg',
  'img/ex/Plank-0.jpg',
  'img/ex/Plank-1.jpg',
  'img/ex/Pushups-0.jpg',
  'img/ex/Pushups-1.jpg',
  'img/ex/Reverse_Machine_Flyes-0.jpg',
  'img/ex/Reverse_Machine_Flyes-1.jpg',
  'img/ex/Romanian_Deadlift-0.jpg',
  'img/ex/Romanian_Deadlift-1.jpg',
  'img/ex/Seated_Cable_Rows-0.jpg',
  'img/ex/Seated_Cable_Rows-1.jpg',
  'img/ex/Seated_Leg_Curl-0.jpg',
  'img/ex/Seated_Leg_Curl-1.jpg',
  'img/ex/Side_Lateral_Raise-0.jpg',
  'img/ex/Side_Lateral_Raise-1.jpg',
  'img/ex/Single_Leg_Glute_Bridge-0.jpg',
  'img/ex/Single_Leg_Glute_Bridge-1.jpg',
  'img/ex/Split_Squat_with_Dumbbells-0.jpg',
  'img/ex/Split_Squat_with_Dumbbells-1.jpg',
  'img/ex/Standing_Biceps_Cable_Curl-0.jpg',
  'img/ex/Standing_Biceps_Cable_Curl-1.jpg',
  'img/ex/Stiff-Legged_Dumbbell_Deadlift-0.jpg',
  'img/ex/Stiff-Legged_Dumbbell_Deadlift-1.jpg',
  'img/ex/Thigh_Abductor-0.jpg',
  'img/ex/Thigh_Abductor-1.jpg',
  'img/ex/Triceps_Pushdown_-_Rope_Attachment-0.jpg',
  'img/ex/Triceps_Pushdown_-_Rope_Attachment-1.jpg',
  'img/ex/Wide-Grip_Lat_Pulldown-0.jpg',
  'img/ex/Wide-Grip_Lat_Pulldown-1.jpg',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Google Fonts and the barcode library: cache on first use so they work offline afterwards.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(
      caches.open(VERSION + '-fonts').then(async (c) => {
        const hit = await c.match(e.request);
        if (hit) return hit;
        const res = await fetch(e.request);
        c.put(e.request, res.clone());
        return res;
      }),
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // App files: cache first, network as fallback.
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit ?? fetch(e.request)),
  );
});
