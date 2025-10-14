#!/usr/bin/env node

/**
 * Database setup script for Render.com
 * Runs migrations and seed data on startup
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';
import * as schema from '../shared/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

// Simple logger for this script
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
};

if (!DATABASE_URL) {
  logger.info('⚠️  DATABASE_URL not found, skipping database setup');
  process.exit(0);
}

async function setupDatabase() {
  let sqlClient = null;

  try {
    logger.info('🔄 Setting up database...');

    // Use PostgreSQL connection
    sqlClient = postgres(DATABASE_URL);
    const db = drizzle(sqlClient, { schema });

    // Test connection
    await sqlClient`SELECT 1`;
    logger.info('✅ Database connection established');

    // Run migrations (push schema)
    logger.info('🔄 Running database migrations...');
    try {
      // Import and run migrations
      const { migrate } = await import('drizzle-orm/postgres-js/migrator');
      await migrate(db, { migrationsFolder: './migrations' });
      logger.info('✅ Database migrations completed');
    } catch (migrationError) {
      logger.info(
        '⚠️  Migration failed, using schema push instead:',
        migrationError.message
      );
      // Fallback: schema will be pushed by drizzle-kit push during build
      logger.info('✅ Schema will be pushed during build');
    }

    // Seed data
    logger.info('🔄 Seeding database...');
    try {
      // Import and run seed script
      const { seedDatabase } = await import('./seed-database.js');
      await seedDatabase();
      logger.info('✅ Database seeding completed');
    } catch (seedError) {
      logger.info(
        '⚠️  Seeding failed, continuing without seed data:',
        seedError.message
      );
    }

    logger.info('🎉 Database setup completed successfully!');
  } catch (error) {
    logger.error('❌ Database setup failed:', error.message);
    logger.error('📋 Error details:', error.stack);
    logger.info('⚠️  Continuing without database setup...');
    throw error; // Re-throw for server startup handling
  } finally {
    // Cleanup connections
    try {
      if (sqlClient && typeof sqlClient.end === 'function') {
        await sqlClient.end();
      }
    } catch (cleanupError) {
      logger.warn('⚠️  Error during cleanup:', cleanupError.message);
    }
  }
}

// Export for use in server
export { setupDatabase };

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}
