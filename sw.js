// 离线缓存：装到主屏幕后断网也能打开。只缓存本站的程序文件，不缓存同步数据。
// 联网时每次都向服务器确认是不是最新版（no-cache），断网时才用缓存。
const C = 'q4-v1.11';
const F = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(F.map(u => new Request(u, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;   // GitHub 同步接口等外部请求不经过缓存
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
