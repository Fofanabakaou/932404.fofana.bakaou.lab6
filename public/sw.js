// Service worker: кеширование статики и работа офлайн

const CACHE = 'status-pwa-v1';

// Файлы, которые кладём в кеш при установке
const STATIC_FILES = [
  '/',
  '/about',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 1. install — сохраняем статику в кеш
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC_FILES)));
  self.skipWaiting(); // сразу активировать новую версию
});

// 2. activate — удаляем старые версии кеша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 3. fetch — перехватываем запросы
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // API: сначала сеть (свежие данные), при офлайне — последний ответ из кеша
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Статика: сначала кеш, если нет — сеть
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
