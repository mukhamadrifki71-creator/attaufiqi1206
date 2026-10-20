const CACHE_NAME = 'hub-pwa-v2'; // Naikkan versi setiap ada perubahan
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './background.jpg'
];

// 1. Install & langsung aktifkan Service Worker baru
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Bersihkan cache lama otomatis
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Ambil dari jaringan dulu (Network First) untuk HTML agar HP selalu dapat data terbaru
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Untuk gambar/aset lain, gunakan cache dulu
    e.respondWith(
      caches.match(e.request).then((res) => res || fetch(e.request))
    );
  }
});
