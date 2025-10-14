// Service Worker Registration
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, prompt user to refresh
                                    if (confirm('New version available! Refresh to update?')) {
                                        window.location.reload();
                                    }
                                }
                            });
                        }
                    });
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
}

// Cache management utilities
export class CacheManager {
    static async clearAllCaches() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }
    }

    static async getCacheSize() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            let totalSize = 0;

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const requests = await cache.keys();

                for (const request of requests) {
                    const response = await cache.match(request);
                    if (response) {
                        const blob = await response.blob();
                        totalSize += blob.size;
                    }
                }
            }

            return totalSize;
        }
        return 0;
    }

    static async preloadCriticalResources() {
        if ('caches' in window) {
            const cache = await caches.open('finbot-static-v1');
            const criticalResources = [
                '/assets/vendor.js',
                '/assets/utils.js',
                '/assets/ui.js'
            ];

            await cache.addAll(criticalResources);
        }
    }
}
