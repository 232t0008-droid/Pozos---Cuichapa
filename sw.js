// Service Worker — Campo Cuichapa PWA v8
const CACHE = 'cuichapa-v8';
const ASSETS = [
  '/Pozos---Cuichapa/',
  '/Pozos---Cuichapa/index.html',
  '/Pozos---Cuichapa/manifest.json',
  '/Pozos---Cuichapa/alarma.mp3'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.url.includes('ultramsg.com')||
     e.request.url.includes('firebaseio.com')||
     e.request.url.includes('googleapis.com')||
     e.request.url.includes('gstatic.com')) return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(r){
        if(r&&r.status===200){var c=r.clone();caches.open(CACHE).then(function(cache){cache.put(e.request,c)});}
        return r;
      }).catch(function(){ return caches.match('/Pozos---Cuichapa/index.html'); });
    })
  );
});

self.addEventListener('message', function(e){
  if(e.data&&e.data.type==='SKIP_WAITING') self.skipWaiting();
  if(e.data&&e.data.type==='PLAY_ALARM'){
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){
      cs.forEach(function(c){ c.postMessage({type:'PLAY_ALARM'}); });
    });
  }
});
