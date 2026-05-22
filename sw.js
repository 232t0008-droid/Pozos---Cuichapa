// Service Worker — Campo Cuichapa PWA v6
const CACHE = 'cuichapa-v6';
const ASSETS = [
  '/Pozos---Cuichapa/',
  '/Pozos---Cuichapa/index.html',
  '/Pozos---Cuichapa/manifest.json'
];

// ── Firebase config para SW ──
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyC38U_K7RttexQ0c2y1baOXOtghqY0OBJ8',
  authDomain:        'pozos-cuichapa.firebaseapp.com',
  databaseURL:       'https://pozos-cuichapa-default-rtdb.firebaseio.com',
  projectId:         'pozos-cuichapa',
  storageBucket:     'pozos-cuichapa.firebasestorage.app',
  messagingSenderId: '119353457045',
  appId:             '1:119353457045:web:9b37512f51ae5d764c9e9c'
});

const messaging = firebase.messaging();

// ── Notificación push en background ──
messaging.onBackgroundMessage(function(payload){
  var data = payload.data || {};
  var tipo  = data.tipo  || 'EMERGENCIA';
  var quien = data.quien || 'Campo';
  var pozo  = data.pozo  || 'Campo Cuichapa';
  var hora  = data.hora  || '';

  return self.registration.showNotification('🚨 ALERTA: ' + tipo, {
    body:    'Reportado por: ' + quien + ' · ' + pozo + ' · ' + hora,
    icon:    '/Pozos---Cuichapa/icon-192.png',
    badge:   '/Pozos---Cuichapa/icon-192.png',
    vibrate: [400, 100, 400, 100, 400],
    tag:     'alarma-cuichapa',
    requireInteraction: true,
    data:    { url: '/Pozos---Cuichapa/' }
  });
});

// ── Al tocar la notificación ──
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(cs){
      for(var i=0;i<cs.length;i++){
        if(cs[i].url.includes('Pozos---Cuichapa') && 'focus' in cs[i])
          return cs[i].focus();
      }
      return clients.openWindow('/Pozos---Cuichapa/');
    })
  );
});

// ── Cache e instalación ──
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS).catch(function(){});
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.url.includes('ultramsg.com') ||
     e.request.url.includes('firebaseio.com') ||
     e.request.url.includes('googleapis.com') ||
     e.request.url.includes('gstatic.com')) return;

  if(e.request.url.includes('index.html') ||
     e.request.url.endsWith('/Pozos---Cuichapa/') ||
     e.request.url.endsWith('/Pozos---Cuichapa')){
    e.respondWith(
      fetch(e.request).then(function(r){
        var c = r.clone();
        caches.open(CACHE).then(function(cache){ cache.put(e.request, c); });
        return r;
      }).catch(function(){ return caches.match(e.request); })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(r){
        if(r && r.status === 200){
          var c = r.clone();
          caches.open(CACHE).then(function(cache){ cache.put(e.request, c); });
        }
        return r;
      }).catch(function(){ return caches.match('/Pozos---Cuichapa/index.html'); });
    })
  );
});

self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
