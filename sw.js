const CACHE_NAME = "streamscape-v1"
const urlsToCache = [
  "/",
  "/login",
  "/signup",
  "/dashboard",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache abierto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Interceptar requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - devolver respuesta
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Activar Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      ),
    ),
  )
})
