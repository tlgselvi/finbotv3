// @ts-nocheck - Temporary fix for TypeScript errors
import pino from 'pino';
import { config } from 'dotenv';
// Load environment variables
config();
// Log levels
export var LogLevel;
(function (LogLevel) {
    LogLevel["TRACE"] = "trace";
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (LogLevel = {}));
// Logger configuration
const loggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
                messageFormat: '{msg}',
            },
        }
        : undefined,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
        paths: [
            'password',
            'token',
            'secret',
            'authorization',
            'cookie',
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            '*.password',
            '*.token',
            '*.secret',
        ],
        censor: '[REDACTED]',
    },
};
// Create logger instance
export const logger = pino(loggerConfig);
// Enhanced logger class
export class Logger {
    baseLogger;
    constructor(context = {}) {
        this.baseLogger = logger.child(context);
    }
    // Create child logger with additional context
    child(context) {
        return new Logger({ ...this.baseLogger.bindings(), ...context });
    }
    // Log methods
    trace(message, context) {
        this.baseLogger.trace(context, message);
    }
    debug(message, context) {
        this.baseLogger.debug(context, message);
    }
    info(message, context) {
        this.baseLogger.info(context, message);
    }
    warn(message, context) {
        this.baseLogger.warn(context, message);
    }
    error(message, context) {
        this.baseLogger.error(context, message);
    }
    fatal(message, context) {
        this.baseLogger.fatal(context, message);
    }
    // Performance logging
    performance(operation, duration, context) {
        this.info(`Performance: ${operation}`, {
            ...context,
            operation,
            duration,
            type: 'performance',
        });
    }
    // Security logging
    security(event, context) {
        this.warn(`Security: ${event}`, {
            ...context,
            type: 'security',
            timestamp: new Date().toISOString(),
        });
    }
    // Business logic logging
    business(event, context) {
        this.info(`Business: ${event}`, {
            ...context,
            type: 'business',
            timestamp: new Date().toISOString(),
        });
    }
    // API request logging
    apiRequest(method, url, statusCode, duration, context) {
        this.info(`API Request: ${method} ${url}`, {
            ...context,
            method,
            url,
            statusCode,
            duration,
            type: 'api_request',
        });
    }
    // Database operation logging
    database(operation, table, duration, context) {
        this.debug(`Database: ${operation} on ${table}`, {
            ...context,
            operation,
            table,
            duration,
            type: 'database',
        });
    }
    // Email operation logging
    email(operation, recipient, status, context) {
        this.info(`Email: ${operation} to ${recipient}`, {
            ...context,
            operation,
            recipient: recipient.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
            status,
            type: 'email',
        });
    }
    // Error logging with stack trace
    errorWithStack(message, error, context) {
        this.error(message, {
            ...context,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        });
    }
}
// Default logger instance
export const defaultLogger = new Logger();
// Utility functions
export const createLogger = (context = {}) => {
    return new Logger(context);
};
// Request logger middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Add request ID to request object
    req.requestId = requestId;
    // Create request logger
    const requestLogger = createLogger({
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
    });
    // Log request start
    requestLogger.info('Request started');
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        requestLogger.apiRequest(req.method, req.url, res.statusCode, duration);
        originalEnd.call(this, chunk, encoding);
    };
    next();
};
// Error logger middleware
export const errorLogger = (error, req, res, next) => {
    const requestLogger = createLogger({
        requestId: req.requestId,
        method: req.method,
        url: req.url,
    });
    requestLogger.errorWithStack('Request error', error);
    next(error);
};
// Performance monitoring
export const performanceMonitor = (operation) => {
    return (target, propertyName, descriptor) => {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const start = Date.now();
            const logger = createLogger({ operation });
            try {
                const result = await method.apply(this, args);
                const duration = Date.now() - start;
                logger.performance(operation, duration);
                return result;
            }
            catch (error) {
                const duration = Date.now() - start;
                logger.errorWithStack(`Performance error in ${operation}`, error, { duration });
                throw error;
            }
        };
    };
};
// Export default logger for backward compatibility
export default logger;
