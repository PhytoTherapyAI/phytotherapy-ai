// Service Worker — Doctopal PWA — Sprint 20 v2
// Conservative approach: only cache static assets, never Next.js chunks
const CACHE_NAME = 'doctopal-v2';
const OFFLINE_URL = '/offline';

// Only cache truly static assets
const PRECACHE_URLS = [
  '/manifest.json',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate — clean ALL old caches (including v1 that may have bad data)
self.addEventListener('activate', (event) => {
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

// Fetch — NEVER intercept Next.js assets or HTML navigation
// Only provide offline fallback for navigation requests when network fails
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // NEVER touch Next.js internals, API routes, or auth
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.includes('__next') ||
    url.pathname.includes('webpack')
  ) {
    return;
  }

  // Only handle navigation requests (HTML pages) with network-only + offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL) || new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/html' },
        });
      })
    );
    return;
  }

  // Everything else: network only, no caching
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Doctopal', {
        body: data.body || '',
        icon: '/icon-192.png',
        tag: data.tag || 'doctopal',
        data: { url: data.url || '/' },
      })
    );
  } catch (e) {
    // Silently fail
  }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
