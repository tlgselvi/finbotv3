import { Request, Response, NextFunction } from 'express';

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function apiCache(ttlSeconds: number = 300) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `${req.originalUrl}`;
        const cached = cache.get(key);

        if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
            // Return cached response
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached.data);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = function (body: any) {
            // Cache the response
            cache.set(key, {
                data: body,
                timestamp: Date.now(),
                ttl: ttlSeconds,
            });

            res.setHeader('X-Cache', 'MISS');
            return originalJson(body);
        };

        next();
    };
}

// Clean up expired cache entries
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > value.ttl * 1000) {
            cache.delete(key);
        }
    }
}, 60000); // Clean up every minute
