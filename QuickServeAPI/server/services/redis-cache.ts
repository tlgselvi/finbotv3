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
redisClient.on('error', (err: any) => {
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
  } catch (error: any) {
    logger.error({ error }, 'Redis connection failed');
    // Continue without Redis in development
  }
}

// Cache service with fallback to memory
export class CacheService {
  private memoryCache = new Map<string, { data: any; expires: number }>();

  async get(key: string): Promise<any> {
    try {
      // Try Redis first
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached as string);
      }
    } catch (error: any) {
      logger.warn({ error }, 'Redis get failed, falling back to memory');
    }

    // Fallback to memory cache
    const memoryCached = this.memoryCache.get(key);
    if (memoryCached && memoryCached.expires > Date.now()) {
      return memoryCached.data;
    }

    return null;
  }

  async set(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    const expires = Date.now() + (ttlSeconds * 1000);

    try {
      // Try Redis first
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
    } catch (error: any) {
      logger.warn({ error }, 'Redis set failed, using memory');
    }

    // Always set in memory cache as backup
    this.memoryCache.set(key, { data, expires });

    // Clean up expired memory cache entries
    this.cleanupMemoryCache();
  }

  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error: any) {
      logger.warn({ error }, 'Redis del failed');
    }
    this.memoryCache.delete(key);
  }

  async flush(): Promise<void> {
    try {
      await redisClient.flushAll();
    } catch (error: any) {
      logger.warn({ error }, 'Redis flush failed');
    }
    this.memoryCache.clear();
  }

  private cleanupMemoryCache(): void {
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

// LLM Cache Service for AI responses
export class LLMCacheService {
  private cache = new CacheService();
  private readonly CACHE_PREFIX = 'llm:';
  private readonly DEFAULT_TTL = 3600; // 1 hour

  /**
   * Cache LLM response
   */
  async cacheLLMResponse(prompt: string, response: string, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const cacheKey = this.generateCacheKey(prompt);
    const cacheData = {
      prompt: this.normalizePrompt(prompt),
      response,
      timestamp: Date.now(),
      ttl,
    };

    await this.cache.set(cacheKey, cacheData, ttl);
  }

  /**
   * Get cached LLM response
   */
  async getCachedResponse(prompt: string): Promise<string | null> {
    const cacheKey = this.generateCacheKey(prompt);
    const cached = await this.cache.get(cacheKey);

    if (cached && cached.response) {
      logger.info('LLM cache hit', { prompt: this.normalizePrompt(prompt) });
      return cached.response;
    }

    return null;
  }

  /**
   * Invalidate LLM cache
   */
  async invalidateCache(pattern?: string): Promise<void> {
    if (pattern) {
      // Invalidate specific pattern
      const cacheKey = this.generateCacheKey(pattern);
      await this.cache.del(cacheKey);
    } else {
      // Invalidate all LLM cache
      await this.cache.flush();
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    hits: number;
    misses: number;
    totalSize: number;
    entries: number;
  }> {
    // This would be implemented with Redis SCAN in production
    return {
      hits: 0,
      misses: 0,
      totalSize: 0,
      entries: 0,
    };
  }

  private generateCacheKey(prompt: string): string {
    // Generate consistent cache key
    const normalized = this.normalizePrompt(prompt);
    const hash = this.simpleHash(normalized);
    return `${this.CACHE_PREFIX}${hash}`;
  }

  private normalizePrompt(prompt: string): string {
    // Normalize prompt for consistent caching
    return prompt
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500); // Limit length
  }

  private simpleHash(str: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Export LLM cache service
export const llmCacheService = new LLMCacheService();

// Cache middleware for Express
export function redisCache(ttlSeconds: number = 300) {
  return async (req: any, res: any, next: any) => {
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
    } catch (error: any) {
      logger.warn({ error }, 'Cache get failed');
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = async function (body: any) {
      try {
        await cacheService.set(cacheKey, body, ttlSeconds);
      } catch (error: any) {
        logger.warn({ error }, 'Cache set failed');
      }

      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}
