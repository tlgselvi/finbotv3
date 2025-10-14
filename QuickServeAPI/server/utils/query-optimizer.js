// @ts-nocheck - Temporary fix for TypeScript errors
import { logger } from '../utils/logger';
// Optimize query parameters
export function optimizeQueryParams(options) {
    const { limit = 20, offset = 0, orderBy = 'created_at', orderDirection = 'DESC', search = '', filters = {}, } = options;
    // Validate and sanitize parameters
    const sanitizedLimit = Math.min(Math.max(parseInt(limit.toString()) || 20, 1), 100);
    const sanitizedOffset = Math.max(parseInt(offset.toString()) || 0, 0);
    const sanitizedOrderBy = sanitizeColumnName(orderBy);
    const sanitizedOrderDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';
    const sanitizedSearch = search.toString().trim();
    const sanitizedFilters = sanitizeFilters(filters);
    return {
        limit: sanitizedLimit,
        offset: sanitizedOffset,
        orderBy: sanitizedOrderBy,
        orderDirection: sanitizedOrderDirection,
        search: sanitizedSearch,
        filters: sanitizedFilters,
    };
}
// Sanitize column names to prevent SQL injection
function sanitizeColumnName(column) {
    // Only allow alphanumeric characters, underscores, and dots
    const sanitized = column.replace(/[^a-zA-Z0-9_.]/g, '');
    // Common allowed columns
    const allowedColumns = [
        'id',
        'created_at',
        'updated_at',
        'name',
        'email',
        'username',
        'amount',
        'date',
        'description',
        'category',
        'type',
        'balance',
        'bank_name',
        'account_name',
        'currency',
        'is_active',
    ];
    // If column is not in allowed list, default to created_at
    if (!allowedColumns.includes(sanitized)) {
        return 'created_at';
    }
    return sanitized;
}
// Sanitize filter values
function sanitizeFilters(filters) {
    const sanitized = {};
    for (const [key, value] of Object.entries(filters)) {
        const sanitizedKey = sanitizeColumnName(key);
        if (typeof value === 'string') {
            // Sanitize string values
            sanitized[sanitizedKey] = value.trim().slice(0, 255);
        }
        else if (typeof value === 'number') {
            // Validate numeric values
            if (isFinite(value) && value >= 0) {
                sanitized[sanitizedKey] = value;
            }
        }
        else if (typeof value === 'boolean') {
            sanitized[sanitizedKey] = value;
        }
        else if (Array.isArray(value)) {
            // Sanitize array values
            sanitized[sanitizedKey] = value
                .filter(item => typeof item === 'string' || typeof item === 'number')
                .slice(0, 10); // Limit array size
        }
    }
    return sanitized;
}
// Build WHERE clause for filters
export function buildWhereClause(filters) {
    const conditions = [];
    const values = [];
    for (const [key, value] of Object.entries(filters)) {
        if (value === null || value === undefined) {
            continue;
        }
        if (Array.isArray(value)) {
            if (value.length > 0) {
                const placeholders = value.map(() => '?').join(', ');
                conditions.push(`${key} IN (${placeholders})`);
                values.push(...value);
            }
        }
        else if (typeof value === 'string' && value.includes('%')) {
            // LIKE query
            conditions.push(`${key} LIKE ?`);
            values.push(value);
        }
        else {
            // Exact match
            conditions.push(`${key} = ?`);
            values.push(value);
        }
    }
    const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { clause, values };
}
// Build search clause
export function buildSearchClause(search, searchColumns) {
    if (!search || searchColumns.length === 0) {
        return { clause: '', values: [] };
    }
    const conditions = searchColumns.map(column => `${column} ILIKE ?`);
    const clause = `AND (${conditions.join(' OR ')})`;
    const values = searchColumns.map(() => `%${search}%`);
    return { clause, values };
}
// Calculate pagination info
export function calculatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const offset = (page - 1) * limit;
    return {
        totalPages,
        hasNext,
        hasPrev,
        offset,
    };
}
// Create paginated result
export function createPaginatedResult(data, total, page, limit) {
    const { totalPages, hasNext, hasPrev } = calculatePagination(total, page, limit);
    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
    };
}
// Query performance monitoring
export class QueryPerformanceMonitor {
    static queries = new Map();
    static startQuery(queryId) {
        const startTime = Date.now();
        return () => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const existing = this.queries.get(queryId) || {
                count: 0,
                totalTime: 0,
                avgTime: 0,
            };
            existing.count++;
            existing.totalTime += duration;
            existing.avgTime = existing.totalTime / existing.count;
            this.queries.set(queryId, existing);
            // Log slow queries
            if (duration > 1000) {
                logger.warn(`🐌 Slow query detected: ${queryId} took ${duration}ms`);
            }
        };
    }
    static getStats() {
        const stats = {};
        for (const [queryId, data] of Array.from(this.queries.entries())) {
            stats[queryId] = {
                count: data.count,
                totalTime: data.totalTime,
                avgTime: Math.round(data.avgTime * 100) / 100,
            };
        }
        return stats;
    }
    static clearStats() {
        this.queries.clear();
    }
}
// Database connection health check
export async function checkDatabaseHealth(pool) {
    const startTime = Date.now();
    try {
        const result = await pool.query('SELECT 1 as health_check');
        const latency = Date.now() - startTime;
        return {
            healthy: result.rows.length > 0,
            latency,
        };
    }
    catch (error) {
        return {
            healthy: false,
            latency: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
export default {
    optimizeQueryParams,
    buildWhereClause,
    buildSearchClause,
    calculatePagination,
    createPaginatedResult,
    QueryPerformanceMonitor,
    checkDatabaseHealth,
};
