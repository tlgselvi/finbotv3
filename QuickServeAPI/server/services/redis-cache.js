import { createClient } from 'redis';
import { logger } from '../utils/logger.js';
// Redis client configuration
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
});
// Connection handling
redisClient.on('error', (err) => {
    logger.error({ err }, 'Redis Client Error');
});
redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
});
redisClient.on('ready', () => {
    logger.info('Redis Client Ready');
});
// Initialize Redis connection
export async function initRedis() {
    try {
        await redisClient.connect();
        logger.info('Redis connection established');
    }
    catch (error) {
        logger.error({ error }, 'Redis connection failed');
        // Continue without Redis in development
    }
}
// Cache service with fallback to memory
export class CacheService {
    memoryCache = new Map();
    async get(key) {
        try {
            // Try Redis first
            const cached = await redisClient.get(key);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            logger.warn({ error }, 'Redis get failed, falling back to memory');
        }
        // Fallback to memory cache
        const memoryCached = this.memoryCache.get(key);
        if (memoryCached && memoryCached.expires > Date.now()) {
            return memoryCached.data;
        }
        return null;
    }
    async set(key, data, ttlSeconds = 300) {
        const expires = Date.now() + (ttlSeconds * 1000);
        try {
            // Try Redis first
            await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
        }
        catch (error) {
            logger.warn({ error }, 'Redis set failed, using memory');
        }
        // Always set in memory cache as backup
        this.memoryCache.set(key, { data, expires });
        // Clean up expired memory cache entries
        this.cleanupMemoryCache();
    }
    async del(key) {
        try {
            await redisClient.del(key);
        }
        catch (error) {
            logger.warn({ error }, 'Redis del failed');
        }
        this.memoryCache.delete(key);
    }
    async flush() {
        try {
            await redisClient.flushAll();
        }
        catch (error) {
            logger.warn({ error }, 'Redis flush failed');
        }
        this.memoryCache.clear();
    }
    cleanupMemoryCache() {
        const now = Date.now();
        for (const [key, value] of this.memoryCache.entries()) {
            if (value.expires <= now) {
                this.memoryCache.delete(key);
            }
        }
    }
}
// Export singleton instance
export const cacheService = new CacheService();
// Cache middleware for Express
export function redisCache(ttlSeconds = 300) {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }
        const cacheKey = `api:${req.originalUrl}`;
        try {
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                res.setHeader('X-Cache', 'HIT');
                return res.json(cached);
            }
        }
        catch (error) {
            logger.warn({ error }, 'Cache get failed');
        }
        // Store original json method
        const originalJson = res.json.bind(res);
        // Override json method to cache response
        res.json = async function (body) {
            try {
                await cacheService.set(cacheKey, body, ttlSeconds);
            }
            catch (error) {
                logger.warn({ error }, 'Cache set failed');
            }
            res.setHeader('X-Cache', 'MISS');
            return originalJson(body);
        };
        next();
    };
}
