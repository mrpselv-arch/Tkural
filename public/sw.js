// Service Worker for Thirukkural PWA with Offline Caching & Daily Morning Notifications
const CACHE_NAME = 'thirukkural-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/data/thirukkural.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Network-first with cache fallback for standard fetches
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For API endpoints, prefer network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(JSON.stringify({ error: 'Offline' }), {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle notification click: Focus active tab or open app window to daily couplet
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/?tab=daily';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If an app tab is already open, focus it and tell it to show the daily view
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TAB', tab: 'daily' });
          return client.focus();
        }
      }
      // If no window is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle client message requesting a notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        ...options,
      })
    );
  }
});

// Background Periodic Sync for Chromium / Android devices
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-kural-sync') {
    event.waitUntil(deliverDailyCoupletFromServiceWorker());
  }
});

async function deliverDailyCoupletFromServiceWorker() {
  try {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match('/data/thirukkural.json');
    if (!response) {
      response = await fetch('/data/thirukkural.json');
    }
    if (!response) return;

    const data = await response.json();
    if (!data || !data.chapters) return;

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const dailyId = (dayOfYear % 1330) + 1;

    let targetCouplet = null;
    let targetChapter = null;

    for (const ch of data.chapters) {
      const found = ch.couplets.find((c) => c.id === dailyId);
      if (found) {
        targetCouplet = found;
        targetChapter = ch;
        break;
      }
    }

    if (!targetCouplet || !targetChapter) return;

    const title = `இன்றைய திருக்குறள் #${targetCouplet.id} • ${targetChapter.nameTamil}`;
    const body = `${targetCouplet.line1}\n${targetCouplet.line2}`;

    await self.registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      tag: `daily-kural-${targetCouplet.id}`,
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: '/?tab=daily',
        coupletId: targetCouplet.id,
      },
    });
  } catch (err) {
    console.warn('Periodic sync notification failed:', err);
  }
}
