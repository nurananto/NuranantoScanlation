// Service Worker for Nurananto Scanlation
// Cache static assets for faster loading & offline support

const CACHE_NAME = 'nurananto-scanlation-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/info-manga.html',
    '/reader.html',
    '/style.min.css',
    '/info-manga.min.css',
    '/reader.min.css',
    '/script.min.js',
    '/info-manga.min.js',
    '/reader.min.js',
    '/manga-config.min.js',
    '/assets/logo.png',
    '/assets/Logo 2.png',
    '/assets/star.png',
    '/assets/mangadex-logo.png',
    '/assets/book.png',
    '/assets/trakteer-icon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Service Worker: Caching static assets');
            return cache.addAll(STATIC_ASSETS.map(url => {
                return new Request(url, { cache: 'reload' });
            })).catch(err => {
                console.warn('⚠️ Some assets failed to cache:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip caching for:
    // 1. External URLs (GitHub raw, MangaDex)
    // 2. API calls
    // 3. Dynamic manga data
    if (
        url.origin !== location.origin ||
        url.pathname.includes('manga.json') ||
        url.pathname.includes('chapters.json') ||
        url.pathname.startsWith('/covers/')
    ) {
        // Network only for dynamic content
        event.respondWith(fetch(request));
        return;
    }
    
    // Cache-first strategy for static assets
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('💾 Serving from cache:', request.url);
                return cachedResponse;
            }
            
            // Not in cache, fetch from network
            return fetch(request).then((response) => {
                // Don't cache if not successful
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                
                // Clone response for cache
                const responseToCache = response.clone();
                
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });
                
                return response;
            }).catch(err => {
                console.error('❌ Fetch failed:', err);
                // Return offline page if available
                return caches.match('/index.html');
            });
        })
    );
});

// Message event - handle cache updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('🗑️ All caches cleared');
            })
        );
    }
});
