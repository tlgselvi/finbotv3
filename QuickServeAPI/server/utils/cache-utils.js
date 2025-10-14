// @ts-nocheck - Temporary fix for TypeScript errors
import { logger } from '../utils/logger';
class MemoryCache {
    cache = new Map();
    maxSize;
    defaultTTL;
    constructor(maxSize = 1000, defaultTTL = 300000) {
        // 5 minutes default
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
        // Clean up expired items every minute
        setInterval(() => this.cleanup(), 60000);
    }
    set(key, value, ttl) {
        const now = Date.now();
        const expires = now + (ttl || this.defaultTTL);
        // If cache is full, remove oldest item
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey)
                this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            value,
            expires,
            createdAt: now,
        });
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        // Check if expired
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    has(key) {
        const item = this.cache.get(key);
        if (!item) {
            return false;
        }
        // Check if expired
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
    keys() {
        return Array.from(this.cache.keys());
    }
    cleanup() {
        const now = Date.now();
        for (const [key, item] of Array.from(this.cache.entries())) {
            if (now > item.expires) {
                this.cache.delete(key);
            }
        }
    }
    // Get cache statistics
    getStats() {
        const now = Date.now();
        let oldestItem = now;
        let newestItem = 0;
        for (const item of Array.from(this.cache.values())) {
            if (item.createdAt < oldestItem) {
                oldestItem = item.createdAt;
            }
            if (item.createdAt > newestItem) {
                newestItem = item.createdAt;
            }
        }
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: 0, // Would need to track hits/misses for this
            oldestItem: oldestItem === now ? 0 : now - oldestItem,
            newestItem: newestItem === 0 ? 0 : now - newestItem,
        };
    }
}
// Global cache instance
export const cache = new MemoryCache(1000, 300000); // 1000 items, 5 minutes TTL
// Cache decorator for functions
export function cached(ttl, keyGenerator) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const key = keyGenerator
                ? keyGenerator(...args)
                : `${propertyName}:${JSON.stringify(args)}`;
            // Try to get from cache
            const cached = cache.get(key);
            if (cached !== null) {
                return cached;
            }
            // Execute method and cache result
            const result = await method.apply(this, args);
            cache.set(key, result, ttl);
            return result;
        };
        return descriptor;
    };
}
// Cache middleware for Express routes
export function cacheMiddleware(ttl = 300000) {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }
        const key = `route:${req.method}:${req.originalUrl}:${req.headers.authorization || 'anonymous'}`;
        // Try to get from cache
        const cached = cache.get(key);
        if (cached !== null) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }
        // Store original json method
        const originalJson = res.json;
        // Override json method to cache response
        res.json = function (obj) {
            // Cache the response
            cache.set(key, obj, ttl);
            res.setHeader('X-Cache', 'MISS');
            return originalJson.call(this, obj);
        };
        next();
    };
}
// Cache invalidation utilities
export class CacheInvalidator {
    static invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        for (const key of cache.keys()) {
            if (regex.test(key)) {
                cache.delete(key);
            }
        }
    }
    static invalidateUser(userId) {
        this.invalidatePattern(`.*:${userId}:.*`);
    }
    static invalidateRoute(route) {
        this.invalidatePattern(`route:.*:${route}:.*`);
    }
    static invalidateAll() {
        cache.clear();
    }
}
// Cache warming utilities
export class CacheWarmer {
    static async warmUserData(userId, userService) {
        try {
            const userData = await userService.getUserById(userId);
            cache.set(`user:${userId}`, userData, 600000); // 10 minutes
        }
        catch (error) {
            logger.error('Failed to warm user cache: ' + String(error));
        }
    }
    static async warmDashboardData(userId, dashboardService) {
        try {
            const dashboardData = await dashboardService.getDashboardData(userId);
            cache.set(`dashboard:${userId}`, dashboardData, 300000); // 5 minutes
        }
        catch (error) {
            logger.error('Failed to warm dashboard cache: ' + String(error));
        }
    }
}
// Cache health check
export function getCacheHealth() {
    const stats = cache.getStats();
    const memoryUsage = process.memoryUsage();
    return {
        healthy: stats.size < stats.maxSize * 0.9, // Healthy if less than 90% full
        stats,
        memoryUsage,
    };
}
export default {
    cache,
    cached,
    cacheMiddleware,
    CacheInvalidator,
    CacheWarmer,
    getCacheHealth,
};
