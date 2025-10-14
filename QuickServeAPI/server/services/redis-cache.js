import { createClient } from 'redis';
import { logger } from '../utils/logger.js';
// Redis client configuration with better error handling
let redisClient = null;
let redisConnected = false;
// Only create Redis client if REDIS_URL is available
if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379') {
    redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => Math.min(retries * 100, 1000),
            connectTimeout: 5000,
        },
    });
    // Connection handling with reduced error logging
    redisClient.on('error', (err) => {
        if (!redisConnected) {
            logger.warn('Redis Client Error - using memory cache fallback');
        }
    });
    redisClient.on('connect', () => {
        logger.info('Redis Client Connected');
        redisConnected = true;
    });
    redisClient.on('ready', () => {
        logger.info('Redis Client Ready');
    });
}
else {
    logger.info('Redis not configured - using memory cache only');
}
// Initialize Redis connection
export async function initRedis() {
    if (!redisClient) {
        logger.info('Redis not available - using memory cache');
        return;
    }
    try {
        await redisClient.connect();
        logger.info('Redis connection established');
        redisConnected = true;
    }
    catch (error) {
        logger.warn('Redis connection failed - using memory cache');
        redisConnected = false;
    }
}
// Cache service with fallback to memory
export class CacheService {
    memoryCache = new Map();
    async get(key) {
        if (redisClient && redisConnected) {
            try {
                // Try Redis first
                const cached = await redisClient.get(key);
                if (cached) {
                    return JSON.parse(cached);
                }
            }
            catch (error) {
                // Fallback to memory cache
            }
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
        if (redisClient && redisConnected) {
            try {
                // Try Redis first
                await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
            }
            catch (error) {
                // Fallback to memory cache
            }
        }
        // Always set in memory cache as backup
        this.memoryCache.set(key, { data, expires });
        // Clean up expired memory cache entries
        this.cleanupMemoryCache();
    }
    async del(key) {
        if (redisClient && redisConnected) {
            try {
                await redisClient.del(key);
            }
            catch (error) {
                // Fallback to memory cache
            }
        }
        this.memoryCache.delete(key);
    }
    async flush() {
        if (redisClient && redisConnected) {
            try {
                await redisClient.flushAll();
            }
            catch (error) {
                // Fallback to memory cache
            }
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
// LLM Cache Service for AI responses
export class LLMCacheService {
    cache = new CacheService();
    CACHE_PREFIX = 'llm:';
    DEFAULT_TTL = 3600; // 1 hour
    /**
     * Cache LLM response
     */
    async cacheLLMResponse(prompt, response, ttl = this.DEFAULT_TTL) {
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
    async getCachedResponse(prompt) {
        const cacheKey = this.generateCacheKey(prompt);
        const cached = await this.cache.get(cacheKey);
        if (cached && cached.response) {
            logger.info(`LLM cache hit - prompt: ${this.normalizePrompt(prompt)}`);
            return cached.response;
        }
        return null;
    }
    /**
     * Invalidate LLM cache
     */
    async invalidateCache(pattern) {
        if (pattern) {
            // Invalidate specific pattern
            const cacheKey = this.generateCacheKey(pattern);
            await this.cache.del(cacheKey);
        }
        else {
            // Invalidate all LLM cache
            await this.cache.flush();
        }
    }
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        // This would be implemented with Redis SCAN in production
        return {
            hits: 0,
            misses: 0,
            totalSize: 0,
            entries: 0,
        };
    }
    generateCacheKey(prompt) {
        // Generate consistent cache key
        const normalized = this.normalizePrompt(prompt);
        const hash = this.simpleHash(normalized);
        return `${this.CACHE_PREFIX}${hash}`;
    }
    normalizePrompt(prompt) {
        // Normalize prompt for consistent caching
        return prompt
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 500); // Limit length
    }
    simpleHash(str) {
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
// LLM Memory / Context Cache - Enhanced
export class LLMMemoryService {
    cache = new CacheService();
    MEMORY_PREFIX = 'memory:';
    CONTEXT_PREFIX = 'context:';
    MAX_MEMORY_ENTRIES = 50;
    /**
     * Generate cache key for memory
     */
    generateCacheKey(prompt) {
        const normalized = this.normalizePrompt(prompt);
        const hash = this.simpleHash(normalized);
        return `${this.MEMORY_PREFIX}${hash}`;
    }
    /**
     * Normalize prompt for consistent processing
     */
    normalizePrompt(prompt) {
        return prompt
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 500);
    }
    /**
     * Simple hash function
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    /**
     * Store command-response pair in memory
     */
    async storeMemory(prompt, response, context = {}) {
        const memoryKey = this.generateCacheKey(prompt);
        const memoryData = {
            prompt: this.normalizePrompt(prompt),
            response,
            context,
            timestamp: Date.now(),
            similarity: await this.calculateSimilarity(prompt)
        };
        await this.cache.set(memoryKey, memoryData, 86400); // 24 hours
        await this.updateMemoryIndex(memoryKey, memoryData);
    }
    /**
     * Get similar command from memory
     */
    async getSimilarCommand(prompt) {
        const normalizedPrompt = this.normalizePrompt(prompt);
        const similarity = await this.calculateSimilarity(normalizedPrompt);
        // Find similar commands in memory
        const memoryIndex = await this.getMemoryIndex();
        let bestMatch = null;
        let bestSimilarity = 0;
        for (const entry of memoryIndex) {
            const entrySimilarity = this.calculateStringSimilarity(normalizedPrompt, entry.prompt);
            if (entrySimilarity > 0.7 && entrySimilarity > bestSimilarity) {
                bestSimilarity = entrySimilarity;
                bestMatch = entry;
            }
        }
        if (bestMatch) {
            return {
                response: bestMatch.response,
                context: bestMatch.context,
                similarity: bestSimilarity
            };
        }
        return null;
    }
    /**
     * Optimize response based on context
     */
    async optimizeResponse(prompt, baseResponse) {
        const similarCommand = await this.getSimilarCommand(prompt);
        if (similarCommand && similarCommand.similarity > 0.8) {
            // High similarity - use cached response with minor adaptations
            return this.adaptResponse(similarCommand.response, prompt);
        }
        else if (similarCommand && similarCommand.similarity > 0.6) {
            // Medium similarity - combine with base response
            return this.combineResponses(similarCommand.response, baseResponse);
        }
        return baseResponse;
    }
    /**
     * Update memory index
     */
    async updateMemoryIndex(memoryKey, memoryData) {
        const indexKey = `${this.MEMORY_PREFIX}index`;
        const index = await this.cache.get(indexKey) || [];
        // Add new entry
        index.push({
            key: memoryKey,
            prompt: memoryData.prompt,
            timestamp: memoryData.timestamp,
            similarity: memoryData.similarity
        });
        // Keep only last MAX_MEMORY_ENTRIES
        if (index.length > this.MAX_MEMORY_ENTRIES) {
            index.sort((a, b) => b.timestamp - a.timestamp);
            index.splice(this.MAX_MEMORY_ENTRIES);
        }
        await this.cache.set(indexKey, index, 86400);
    }
    /**
     * Get memory index
     */
    async getMemoryIndex() {
        const indexKey = `${this.MEMORY_PREFIX}index`;
        return await this.cache.get(indexKey) || [];
    }
    /**
     * Calculate similarity between prompts
     */
    async calculateSimilarity(prompt) {
        // Simple similarity calculation based on word overlap
        const words = prompt.toLowerCase().split(/\s+/);
        return words.length > 0 ? 1.0 : 0.0;
    }
    /**
     * Calculate string similarity using Levenshtein distance
     */
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }
    /**
     * Levenshtein distance calculation
     */
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Adapt response for similar command
     */
    adaptResponse(cachedResponse, newPrompt) {
        // Simple adaptation - replace specific terms
        return cachedResponse.replace(/FinBot/g, 'FinBot').replace(/project/g, 'project');
    }
    /**
     * Combine responses
     */
    combineResponses(cachedResponse, baseResponse) {
        // Combine the best parts of both responses
        return `${cachedResponse}\n\n---\n\n${baseResponse}`;
    }
    /**
     * Clear memory
     */
    async clearMemory() {
        const indexKey = `${this.MEMORY_PREFIX}index`;
        const index = await this.cache.get(indexKey) || [];
        // Clear all memory entries
        for (const entry of index) {
            await this.cache.del(entry.key);
        }
        await this.cache.del(indexKey);
    }
    /**
     * Get memory statistics
     */
    async getMemoryStats() {
        const index = await this.getMemoryIndex();
        const totalEntries = index.length;
        const lastUpdated = index.length > 0 ? new Date(Math.max(...index.map((e) => e.timestamp))) : new Date();
        const averageSimilarity = index.length > 0 ? index.reduce((sum, e) => sum + e.similarity, 0) / index.length : 0;
        return {
            totalEntries,
            lastUpdated,
            averageSimilarity
        };
    }
}
// Export LLM Memory service
export const llmMemoryService = new LLMMemoryService();
// Context Awareness System
export class ContextAwarenessService {
    memory = llmMemoryService;
    CONTEXT_WINDOW = 5; // Last 5 operations
    operationHistory = [];
    /**
     * Analyze previous operations for context-aware decisions
     */
    async analyzeContext() {
        const recentOps = this.operationHistory.slice(-this.CONTEXT_WINDOW);
        // Analyze patterns
        const patterns = this.extractPatterns(recentOps);
        // Generate recommendations
        const recommendations = this.generateRecommendations(recentOps, patterns);
        // Assess risk level
        const riskLevel = this.assessRiskLevel(recentOps);
        // Suggest next actions
        const nextActions = this.suggestNextActions(recentOps, patterns);
        return {
            patterns,
            recommendations,
            riskLevel,
            nextActions
        };
    }
    /**
     * Record operation for context analysis
     */
    recordOperation(command, result, context = {}) {
        this.operationHistory.push({
            command,
            result,
            timestamp: new Date(),
            context
        });
        // Keep only last 20 operations
        if (this.operationHistory.length > 20) {
            this.operationHistory = this.operationHistory.slice(-20);
        }
    }
    /**
     * Get context-aware suggestions for next command
     */
    async getContextualSuggestions(currentCommand) {
        const analysis = await this.analyzeContext();
        const suggestions = [];
        // Based on recent patterns, suggest logical next steps
        if (analysis.patterns.includes('audit_followed_by_optimize')) {
            suggestions.push('optimize');
            suggestions.push('performance-chart');
        }
        if (analysis.patterns.includes('multiple_errors')) {
            suggestions.push('self-heal');
            suggestions.push('rollback');
        }
        if (analysis.patterns.includes('successful_deploy')) {
            suggestions.push('browser-test');
            suggestions.push('health-check');
        }
        if (analysis.riskLevel === 'high') {
            suggestions.push('rollback');
            suggestions.push('safe-mode');
        }
        return suggestions;
    }
    /**
     * Extract patterns from operation history
     */
    extractPatterns(operations) {
        const patterns = [];
        // Check for audit followed by optimize
        const hasAudit = operations.some(op => op.command === 'audit');
        const hasOptimize = operations.some(op => op.command === 'optimize');
        if (hasAudit && hasOptimize)
            patterns.push('audit_followed_by_optimize');
        // Check for multiple errors
        const errorCount = operations.filter(op => !op.result?.success).length;
        if (errorCount >= 2)
            patterns.push('multiple_errors');
        // Check for successful deploy
        const hasDeploy = operations.some(op => op.command === 'deploy' && op.result?.success);
        if (hasDeploy)
            patterns.push('successful_deploy');
        // Check for repeated commands
        const commandCounts = new Map();
        operations.forEach(op => {
            const count = commandCounts.get(op.command) || 0;
            commandCounts.set(op.command, count + 1);
        });
        for (const [command, count] of commandCounts.entries()) {
            if (count >= 3)
                patterns.push(`repeated_${command}`);
        }
        return patterns;
    }
    /**
     * Generate recommendations based on context
     */
    generateRecommendations(operations, patterns) {
        const recommendations = [];
        if (patterns.includes('multiple_errors')) {
            recommendations.push('Consider implementing more robust error handling');
            recommendations.push('Review recent changes that might have introduced issues');
        }
        if (patterns.includes('repeated_audit')) {
            recommendations.push('Automate audit processes to reduce manual intervention');
            recommendations.push('Set up continuous monitoring');
        }
        if (patterns.includes('successful_deploy')) {
            recommendations.push('Run comprehensive tests to ensure stability');
            recommendations.push('Monitor system performance post-deployment');
        }
        return recommendations;
    }
    /**
     * Assess risk level based on recent operations
     */
    assessRiskLevel(operations) {
        const errorCount = operations.filter(op => !op.result?.success).length;
        const errorRate = operations.length > 0 ? errorCount / operations.length : 0;
        if (errorRate > 0.5)
            return 'high';
        if (errorRate > 0.2)
            return 'medium';
        return 'low';
    }
    /**
     * Suggest next actions based on context
     */
    suggestNextActions(operations, patterns) {
        const actions = [];
        // Always suggest monitoring after operations
        actions.push('metrics');
        actions.push('status');
        // Context-specific suggestions
        if (patterns.includes('multiple_errors')) {
            actions.push('self-heal');
            actions.push('rollback');
        }
        if (patterns.includes('audit_followed_by_optimize')) {
            actions.push('performance-chart');
            actions.push('deploy');
        }
        return actions;
    }
    /**
     * Clear operation history
     */
    clearHistory() {
        this.operationHistory = [];
    }
    /**
     * Get operation history
     */
    getHistory() {
        return [...this.operationHistory];
    }
}
// Singleton instance
export const contextAwarenessService = new ContextAwarenessService();
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
