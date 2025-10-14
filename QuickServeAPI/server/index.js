// @ts-nocheck - Temporary fix for TypeScript errors
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import { logger } from './utils/logger';
import { validateEnvironment, logEnvironmentConfig, } from './utils/env-validation';
import { registerRoutes } from './routes';
import { initRedis } from './services/redis-cache.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Validate environment variables
const env = validateEnvironment();
logEnvironmentConfig(env);
const app = express();
// Performance optimizations
app.set('trust proxy', 1); // Trust proxy for better performance
app.disable('x-powered-by'); // Remove X-Powered-By header for security and performance
// Use Render's PORT environment variable if available, otherwise use env.API_PORT
const PORT = process.env.NODE_ENV === 'test' ? 0 : process.env.PORT || env.API_PORT;
const WS_PORT = process.env.NODE_ENV === 'test' ? 0 : process.env.WS_PORT || 5050;
// Middleware
app.use(cors());
// Performance middleware
app.use(compression({
    level: 6, // Compression level (1-9, 6 is good balance)
    threshold: 1024, // Only compress files larger than 1KB
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Cache headers for static assets
app.use('/assets', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    next();
});
// Serve static files - path differs based on whether we're in dev or production
let staticPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../dist/client')
    : path.join(process.cwd(), 'dist/client');
// Fallback paths for Render.com deployment
if (!fs.existsSync(staticPath)) {
    const altPaths = [
        path.join(process.cwd(), 'QuickServeAPI/dist/client'),
        path.join(__dirname, '../../dist/client'),
        path.join(process.cwd(), 'dist/client'),
    ];
    for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
            staticPath = altPath;
            logger.info(`Using alternative static path: ${staticPath}`);
            break;
        }
    }
}
logger.info(`Serving static files from: ${staticPath}`);
logger.info(`Static path exists: ${fs.existsSync(staticPath)}`);
// Debug: List all files in static directory
if (fs.existsSync(staticPath)) {
    try {
        const files = fs.readdirSync(staticPath);
        logger.info(`Static directory contents: ${files.join(', ')}`);
    }
    catch (e) {
        logger.error('Error reading static directory:', e);
    }
}
app.use(express.static(staticPath, {
    index: false, // Don't serve index.html for directory requests
    dotfiles: 'ignore', // Ignore dotfiles
    etag: true, // Enable ETag
    lastModified: true, // Enable Last-Modified
    setHeaders: (res, path) => {
        // Set proper content type for manifest.json
        if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        }
    }
}));
// Explicit static file routes needed by PWA
app.get(['/manifest.json', '/manifest.webmanifest'], (req, res) => {
    const manifestFile = req.path.endsWith('.webmanifest')
        ? 'manifest.webmanifest'
        : 'manifest.json';
    // Try multiple paths
    const paths = [
        path.join(staticPath, manifestFile),
        path.join(process.cwd(), 'QuickServeAPI/dist/client', manifestFile),
        path.join(__dirname, '../dist/client', manifestFile),
        path.join(__dirname, '../../dist/client', manifestFile),
    ];
    logger.info(`Manifest request: ${req.path}`);
    for (const manifestPath of paths) {
        logger.info(`Trying manifest path: ${manifestPath} exists=${fs.existsSync(manifestPath)}`);
        if (fs.existsSync(manifestPath)) {
            return res.type('application/manifest+json').sendFile(manifestPath);
        }
    }
    // If no manifest found, return a basic one
    logger.warn('No manifest found, returning basic manifest');
    const basicManifest = {
        name: "FinBot v3",
        short_name: "FinBot",
        description: "Personal Finance Management App",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon"
            }
        ]
    };
    res.type('application/manifest+json').json(basicManifest);
});
app.get('/favicon.ico', (_req, res) => {
    // Try multiple paths
    const paths = [
        path.join(staticPath, 'favicon.ico'),
        path.join(process.cwd(), 'QuickServeAPI/dist/client', 'favicon.ico'),
        path.join(__dirname, '../dist/client', 'favicon.ico'),
        path.join(__dirname, '../../dist/client', 'favicon.ico'),
    ];
    logger.info(`Favicon request`);
    for (const favPath of paths) {
        logger.info(`Trying favicon path: ${favPath} exists=${fs.existsSync(favPath)}`);
        if (fs.existsSync(favPath)) {
            return res.type('image/x-icon').sendFile(favPath);
        }
    }
    // If no favicon found, return a 204 No Content
    logger.warn('No favicon found, returning 204');
    res.status(204).end();
});
// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    next();
});
// Register all routes from routes.ts (includes login endpoint)
await registerRoutes(app);
// Serve React app (SPA fallback) - must be after API routes and static
app.get('*', (req, res) => {
    try {
        // Only handle browser navigations to HTML pages
        const acceptHeader = req.get('Accept') || '';
        const hasFileExtension = path.extname(req.path) !== '';
        const isApiRequest = req.path.startsWith('/api');
        if (isApiRequest || hasFileExtension || !acceptHeader.includes('text/html')) {
            return res.status(404).end();
        }
        logger.info(`Serving SPA for path: ${req.path}`);
        // In development, frontend is served by Vite on port 5173
        if (process.env.NODE_ENV === 'development') {
            return res
                .status(404)
                .json({ error: 'Use frontend dev server on port 5173' });
        }
        const indexPath = process.env.NODE_ENV === 'production'
            ? path.join(__dirname, '../dist/client', 'index.html')
            : path.join(process.cwd(), 'dist/client', 'index.html');
        logger.info(`Looking for index.html at: ${indexPath}`);
        logger.info(`__dirname: ${__dirname}`);
        logger.info(`File exists: ${fs.existsSync(indexPath)}`);
        if (!fs.existsSync(indexPath)) {
            logger.error(`Index file not found at: ${indexPath}`);
            return res.status(404).json({
                error: 'Frontend not built',
                path: indexPath,
                dirname: __dirname
            });
        }
        res.sendFile(indexPath);
    }
    catch (error) {
        logger.error('Error serving SPA:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error',
            path: req.path
        });
    }
});
// Error handling
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
            details: err.message,
            stack: err.stack,
        }),
    });
});
const httpServer = app.listen(PORT, async () => {
    // Initialize Redis cache
    await initRedis();
    logger.info(`🚀 FinBot V3 Server running on http://localhost:${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    logger.info(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
    logger.info(`💰 Accounts endpoint: http://localhost:${PORT}/api/accounts`);
    logger.info(`💳 Transactions endpoint: http://localhost:${PORT}/api/transactions`);
    logger.info(`🚨 Alerts endpoint: http://localhost:${PORT}/api/alerts`);
    logger.info(`🔌 WebSocket server running on ws://localhost:${WS_PORT}`);
    logger.info(`⚡ Redis cache initialized`);
});
// WebSocket Server
const wss = new WebSocketServer({ port: WS_PORT });
wss.on('connection', ws => {
    logger.info('WebSocket connected');
    ws.send(JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() }));
    ws.on('close', () => logger.info('WebSocket disconnected'));
    ws.on('error', error => logger.error('WebSocket error:', error));
});
// Global error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        error: 'Internal server error',
        message: isDevelopment ? error.message : 'Something went wrong',
        ...(isDevelopment && { stack: error.stack }),
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown',
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
