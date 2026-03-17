/**
 * Service Worker
 * 提供离线缓存功能
 */

const CACHE_NAME = 'comic-hero-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/base.css',
    '/css/components.css',
    '/css/layout.css',
    '/css/views.css',
    '/css/responsive.css',
    '/css/animations.css',
    '/js/data/index.js',
    '/js/data/origins.js',
    '/js/data/attributes.js',
    '/js/data/powers.js',
    '/js/data/specialties.js',
    '/js/core/index.js',
    '/js/core/dice.js',
    '/js/core/character.js',
    '/js/core/storage.js',
    '/js/ui/toast.js',
    '/js/ui/modal.js',
    '/js/main.js',
    '/manifest.json'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('缓存失败:', error);
            })
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
    // 跳过非GET请求
    if (event.request.method !== 'GET') {
        return;
    }

    // 跳过外部请求
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 缓存命中，返回缓存
                if (response) {
                    return response;
                }

                // 缓存未命中，发起网络请求
                return fetch(event.request)
                    .then((networkResponse) => {
                        // 检查响应是否有效
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // 克隆响应（响应流只能读取一次）
                        const responseToCache = networkResponse.clone();

                        // 将响应添加到缓存
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('网络请求失败:', error);
                        // 可以在这里返回离线页面
                    });
            })
    );
});

// 后台同步（可选）
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-characters') {
        event.waitUntil(syncCharacters());
    }
});

// 推送通知（可选）
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png'
            })
        );
    }
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});