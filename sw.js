/* PROJUKTI service worker — offline cache (only active when served over http/https) */
const CACHE = 'projukti-v1';
const CORE = ['./', 'index.html', 'css/style.css', 'manifest.json', 'assets/logo/logo-mark.svg', 'assets/logo/favicon.svg',
  'js/assets.js', 'js/core.js', 'js/v-home.js', 'js/v-subjects.js', 'js/v-focus.js', 'js/v-plan.js', 'js/v-learn.js', 'js/v-practice.js',
  'js/v-well.js', 'js/v-exams.js', 'js/v-res.js', 'js/v-analytics.js', 'js/v-settings.js', 'js/app.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ch => ch.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
