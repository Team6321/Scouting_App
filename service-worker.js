---
---
// Add list of files to cache here.
const cacheName = 'cache-v1';
const precacheResources = [
  '/',
  'index.html',
  'event-data.html',
  'importing-exporting-data.html',
  'season-config.html',
  'team-data.html',
  'styles.css',
  'w3css.css',
  'scripts/jquery.js',
  'scripts/seasonConfigScript.js',
  'scripts/eventDataScript.js',
  'scripts/teamDataScript.js',
  'scripts/importing-Exporting-Config.js',
  'scripts/commonMethodHelpers.js',
  'scripts/autosize-master/dist/autosize.js',
  '{{site.logo}}',
  'images/background.jpg',
  'manifest.json',
];

self.addEventListener('install', event => {
  console.log('Service worker install event!');
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(precacheResources);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service worker activate event!');
});

// going with cach first - if that fails, then actually fetch.
// this is so that the offline experience is fast.
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

// when the service worker is activated (installed), clear the cache.
self.addEventListener('activate', event => {
    console.log('Service worker activating...');
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            // Return true if you want to remove this cache,
            // but remember that caches are shared across
            // the whole origin
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
});

// activate new version immediately
self.skipWaiting();
