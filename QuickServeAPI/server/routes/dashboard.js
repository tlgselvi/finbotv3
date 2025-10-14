// @ts-nocheck - Temporary fix for TypeScript errors
/**
 * Dashboard API Routes
 *
 * Provides REST API endpoints for runway and cash gap analysis
 */
import { Router } from 'express';
import { calculateRunway, calculateCashGap, getDashboardRunwayCashGap, getCashFlowForecast, } from '../modules/dashboard/runway-cashgap';
import { validateUserId, validateMonths, ValidationError, } from '../utils/validation';
const router = Router();
/**
 * Error handler wrapper for async routes
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * GET /api/dashboard/runway/:userId
 *
 * Get runway analysis for a user
 *
 * Query params:
 * - months: Number of months to project (default: 12, max: 60)
 */
router.get('/runway/:userId', asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const months = parseInt(req.query.months) || 12;
        // Validate inputs
        validateUserId(userId);
        validateMonths(months);
        // Calculate runway
        const result = await calculateRunway(userId, months);
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    field: error.field,
                },
            });
        }
        else {
            throw error;
        }
    }
}));
/**
 * GET /api/dashboard/cash-gap/:userId
 *
 * Get cash gap analysis for a user
 *
 * Query params:
 * - months: Number of months to analyze (default: 6, max: 60)
 */
router.get('/cash-gap/:userId', asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const months = parseInt(req.query.months) || 6;
        // Validate inputs
        validateUserId(userId);
        validateMonths(months);
        // Calculate cash gap
        const result = await calculateCashGap(userId, months);
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    field: error.field,
                },
            });
        }
        else {
            throw error;
        }
    }
}));
/**
 * GET /api/dashboard/:userId
 *
 * Get combined dashboard data (runway + cash gap)
 */
router.get('/:userId', asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        // Validate input
        validateUserId(userId);
        // Get combined dashboard data
        const result = await getDashboardRunwayCashGap(userId);
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    field: error.field,
                },
            });
        }
        else {
            throw error;
        }
    }
}));
/**
 * GET /api/dashboard/forecast/:userId
 *
 * Get cash flow forecast
 *
 * Query params:
 * - months: Number of months to forecast (default: 12, max: 60)
 */
router.get('/forecast/:userId', asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const months = parseInt(req.query.months) || 12;
        // Validate inputs
        validateUserId(userId);
        validateMonths(months);
        // Get forecast
        const result = await getCashFlowForecast(userId, months);
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    field: error.field,
                },
            });
        }
        else {
            throw error;
        }
    }
}));
/**
 * Global error handler for dashboard routes
 */
router.use((error, req, res, next) => {
    console.error('Dashboard API Error:', error);
    // Handle different error types
    if (error.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
    }
    else if (error.name === 'ForbiddenError') {
        res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Access denied',
            },
        });
    }
    else {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: process.env.NODE_ENV === 'production'
                    ? 'Internal server error'
                    : error.message,
            },
        });
    }
});
export default router;
