import 'dotenv/config';
import express, { type Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import { db, dbInterface } from './db';
import { logger } from './utils/logger';
import {
  validateEnvironment,
  logEnvironmentConfig,
  type ValidatedEnv,
} from './utils/env-validation';
import { registerRoutes } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
const env = validateEnvironment();
logEnvironmentConfig(env);

const app = express();
// Use Render's PORT environment variable if available, otherwise use env.API_PORT
const PORT =
  process.env.NODE_ENV === 'test' ? 0 : process.env.PORT || env.API_PORT;
const WS_PORT =
  process.env.NODE_ENV === 'test' ? 0 : process.env.WS_PORT || 5050;

// Middleware
app.use(cors());
app.use(compression()); // Enable gzip compression
app.use(express.json());
// Serve static files - path differs based on whether we're in dev or production
const staticPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../dist/client') // In production, serve from dist/client
    : path.join(__dirname, '../dist/client'); // In dev, also serve from dist/client
logger.info(`Serving static files from: ${staticPath}`);
logger.info(`Static path exists: ${fs.existsSync(staticPath)}`);
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

    const indexPath = path.join(__dirname, '../dist/client', 'index.html');
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
  } catch (error) {
    logger.error('Error serving SPA:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      path: req.path
    });
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack,
    }),
  });
});

const httpServer = app.listen(PORT, () => {
  logger.info(`🚀 FinBot V3 Server running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  logger.info(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
  logger.info(`💰 Accounts endpoint: http://localhost:${PORT}/api/accounts`);
  logger.info(
    `💳 Transactions endpoint: http://localhost:${PORT}/api/transactions`
  );
  logger.info(`🚨 Alerts endpoint: http://localhost:${PORT}/api/alerts`);
  logger.info(`🔌 WebSocket server running on ws://localhost:${WS_PORT}`);
});

// WebSocket Server
const wss = new WebSocketServer({ port: WS_PORT });
wss.on('connection', ws => {
  logger.info('WebSocket connected');
  ws.send(
    JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() })
  );
  ws.on('close', () => logger.info('WebSocket disconnected'));
  ws.on('error', error => logger.error('WebSocket error:', error));
});
