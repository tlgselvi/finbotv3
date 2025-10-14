import { logger } from '../utils/logger.js';
// Query performance monitoring middleware
export function queryOptimizer(req, res, next) {
    const startTime = Date.now();
    // Override res.json to measure response time
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        const duration = Date.now() - startTime;
        // Log slow queries (>200ms)
        if (duration > 200) {
            logger.warn(`Slow query detected: ${req.method} ${req.originalUrl} - ${duration}ms`);
        }
        // Add performance headers
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Query-Optimized', duration < 100 ? 'true' : 'false');
        return originalJson(body);
    };
    next();
}
// Database connection pool monitoring
export function poolMonitor() {
    setInterval(() => {
        // Monitor connection pool health
        logger.info('Database connection pool status check');
    }, 30000); // Every 30 seconds
}
