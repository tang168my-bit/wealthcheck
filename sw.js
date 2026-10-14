// 離線功能：第一次打開時把工具存到 iPad，之後沒有網絡也能用。
// 每次更新工具時，把 VERSION 加一，iPad 下次有網絡打開時就會自動換成新版本。
const VERSION = 'wealthcheck-v1';
const FILES = ['./', './index.html', './manifest.json', './icon.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 先用已存的版本（快、離線可用），同時在背景嘗試更新
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => cached);
    return cached || fresh;
  }));
});
