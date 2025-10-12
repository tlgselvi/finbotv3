import 'dotenv/config';
import express, { type Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
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
    ? path.join(__dirname, 'public') // In production, dist/index.js serves dist/public
    : path.join(__dirname, '../dist/public'); // In dev, server/index.ts serves dist/public
logger.info(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

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

// Serve React app (SPA fallback) - must be after API routes
app.get('*', (req, res) => {
  // In development, frontend is served by Vite on port 5173
  if (process.env.NODE_ENV === 'development') {
    return res
      .status(404)
      .json({ error: 'Use frontend dev server on port 5173' });
  }

  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack
    })
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
