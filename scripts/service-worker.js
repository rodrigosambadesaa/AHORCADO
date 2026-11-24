/* Generated version and exact local asset allowlist; no arbitrary runtime caching. */
const VERSION = __VERSION__;
const ASSETS = __ASSETS__;
const PREFIX = 'ahorcado-pwa:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const urls = new Set(ASSETS.map(path => new URL(path, self.registration.scope).href));
const index = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([...urls].map(url => new Request(url, {cache: 'reload'})));
    // Do not skip waiting: an old tab must not mix chunks from two builds.
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await (await caches.open(CACHE)).match(index);
      // A synthetic response keeps the navigation URL rather than /index.html.
      return cached ? new Response(cached.body, {status: cached.status, headers: cached.headers}) : fetch(request);
    })());
  } else if (urls.has(request.url)) {
    event.respondWith((async () => (await (await caches.open(CACHE)).match(request)) || fetch(request))());
  }
});
