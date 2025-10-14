// Success response helper
export function sendSuccess(res, data, message, statusCode = 200) {
    const response = {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(statusCode).json(response);
}
// Error response helper
export function sendError(res, error, statusCode = 500, code) {
    const response = {
        success: false,
        error,
        code,
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(statusCode).json(response);
}
// Validation error response helper
export function sendValidationError(res, errors, message = 'Validation failed') {
    const response = {
        success: false,
        error: message,
        code: 'VALIDATION_ERROR',
        data: { errors },
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(400).json(response);
}
// Not found response helper
export function sendNotFound(res, resource = 'Resource') {
    const response = {
        success: false,
        error: `${resource} not found`,
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(404).json(response);
}
// Unauthorized response helper
export function sendUnauthorized(res, message = 'Unauthorized access') {
    const response = {
        success: false,
        error: message,
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(401).json(response);
}
// Forbidden response helper
export function sendForbidden(res, message = 'Access forbidden') {
    const response = {
        success: false,
        error: message,
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(403).json(response);
}
// Paginated response helper
export function sendPaginated(res, data, pagination, message) {
    const response = {
        success: true,
        data,
        message,
        pagination,
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(200).json(response);
}
// Created response helper
export function sendCreated(res, data, message = 'Resource created successfully') {
    const response = {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(201).json(response);
}
// No content response helper
export function sendNoContent(res, message = 'Operation completed successfully') {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(204).json(response);
}
// Rate limit response helper
export function sendRateLimit(res, retryAfter, message = 'Too many requests') {
    const response = {
        success: false,
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json(response);
}
// Service unavailable response helper
export function sendServiceUnavailable(res, message = 'Service temporarily unavailable') {
    const response = {
        success: false,
        error: message,
        code: 'SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(503).json(response);
}
// Conflict response helper
export function sendConflict(res, message = 'Resource conflict') {
    const response = {
        success: false,
        error: message,
        code: 'CONFLICT',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(409).json(response);
}
// Bad request response helper
export function sendBadRequest(res, message = 'Bad request', code) {
    const response = {
        success: false,
        error: message,
        code: code || 'BAD_REQUEST',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(400).json(response);
}
// Internal server error response helper
export function sendInternalError(res, message = 'Internal server error') {
    const response = {
        success: false,
        error: message,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
    };
    res.status(500).json(response);
}
// Response middleware to standardize all responses
export function responseMiddleware(req, res, next) {
    // Store original json method
    const originalJson = res.json;
    // Override json method to add standard fields
    res.json = function (obj) {
        // If response already has success field, don't modify
        if (obj && typeof obj === 'object' && 'success' in obj) {
            return originalJson.call(this, obj);
        }
        // Add standard fields to response
        const standardizedResponse = {
            success: true,
            data: obj,
            timestamp: new Date().toISOString(),
            requestId: res.getHeader('X-Request-ID'),
        };
        return originalJson.call(this, standardizedResponse);
    };
    next();
}
export default {
    sendSuccess,
    sendError,
    sendValidationError,
    sendNotFound,
    sendUnauthorized,
    sendForbidden,
    sendPaginated,
    sendCreated,
    sendNoContent,
    sendRateLimit,
    sendServiceUnavailable,
    sendConflict,
    sendBadRequest,
    sendInternalError,
    responseMiddleware,
};
