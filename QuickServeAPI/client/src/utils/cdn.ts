// CDN Configuration for FinBot v3
export const CDN_CONFIG = {
    // Cloudflare CDN
    cloudflare: {
        baseUrl: 'https://cdn.finbot-v3.com',
        enabled: import.meta.env.PROD,
    },
    // AWS CloudFront CDN
    cloudfront: {
        baseUrl: 'https://d1234567890.cloudfront.net',
        enabled: false,
    },
    // Local fallback
    local: {
        baseUrl: '/assets',
        enabled: true,
    },
};

// Get CDN URL for assets
export function getCDNUrl(path: string): string {
    const cdn = CDN_CONFIG.cloudflare.enabled ? CDN_CONFIG.cloudflare : CDN_CONFIG.local;
    return `${cdn.baseUrl}${path}`;
}

// Preload critical resources
export function preloadCriticalResources() {
    if (typeof window === 'undefined') return;

    const criticalResources = [
        '/assets/vendor.js',
        '/assets/utils.js',
        '/assets/ui.js',
        '/assets/main.css',
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = getCDNUrl(resource);
        link.as = resource.endsWith('.css') ? 'style' : 'script';

        if (resource.endsWith('.css')) {
            link.onload = () => {
                link.rel = 'stylesheet';
            };
        }

        document.head.appendChild(link);
    });
}

// Lazy load non-critical resources
export function lazyLoadResources() {
    if (typeof window === 'undefined') return;

    const lazyResources = [
        '/assets/charts.js',
        '/assets/icons.js',
    ];

    // Load after page is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            lazyResources.forEach(resource => {
                const script = document.createElement('script');
                script.src = getCDNUrl(resource);
                script.async = true;
                document.head.appendChild(script);
            });
        }, 1000);
    });
}

// Initialize CDN optimizations
export function initCDNOptimizations() {
    preloadCriticalResources();
    lazyLoadResources();
}
