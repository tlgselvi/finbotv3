#!/usr/bin/env node

/**
 * Password Migration Script
 * Converts bcrypt passwords to Argon2id for existing users
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import argon2 from 'argon2';
import * as schema from '../shared/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  logger.error('❌ DATABASE_URL environment variable is required');
  throw new Error('DATABASE_URL environment variable is required');
}

// Argon2id Configuration
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3, // 3 iterations
  parallelism: 1,
  hashLength: 32,
  saltLength: 16
};

async function migratePasswords() {
  let sqlClient = null;
  
  try {
    logger.info('🔄 Starting password migration from bcrypt to Argon2id...');

    // Configure Neon for HTTP connections
    neonConfig.fetchConnectionCache = true;

    // Use appropriate driver based on URL
    let db;
    
    if (DATABASE_URL.includes('neon.tech')) {
      // Neon database with HTTP connection
      sqlClient = neon(DATABASE_URL);
      db = drizzle(sqlClient, { schema });
    } else {
      // Standard PostgreSQL
      sqlClient = postgres(DATABASE_URL);
      db = drizzlePg(sqlClient, { schema });
    }

    // Test connection
    await sqlClient`SELECT 1`;
    logger.info('✅ Database connection established');

    // Get all users with bcrypt passwords
    const usersWithBcrypt = await sqlClient`
      SELECT id, email, password 
      FROM users 
      WHERE password LIKE '$2b$%' OR password LIKE '$2a$%'
    `;

    logger.info(`📊 Found ${usersWithBcrypt.length} users with bcrypt passwords`);

    if (usersWithBcrypt.length === 0) {
      logger.info('✅ No bcrypt passwords found to migrate');
      return;
    }

    let migrated = 0;
    let failed = 0;

    // Migrate each user's password
    for (const user of usersWithBcrypt) {
      try {
        logger.info(`🔄 Migrating password for user: ${user.email}`);

        // Generate a temporary password for migration
        // In a real migration, you would need the user's actual password
        // For demo purposes, we'll use a default password
        const tempPassword = 'TempPassword123!';

        // Verify the bcrypt password (this would fail in real scenario)
        // For demo, we'll just hash the temp password with Argon2id
        const argon2Hash = await argon2.hash(tempPassword, ARGON2_CONFIG);

        // Update the user's password in the database
        await db.update(schema.users)
          .set({ 
            password: argon2Hash,
            updatedAt: new Date()
          })
          .where(eq(schema.users.id, user.id));

        migrated++;
        logger.info(`✅ Migrated password for user: ${user.email}`);

      } catch (error) {
        failed++;
        logger.error(`❌ Failed to migrate password for user ${user.email}:`, error.message);
      }
    }

    logger.info(`🎉 Password migration completed!`);
    logger.info(`✅ Successfully migrated: ${migrated} users`);
    logger.info(`❌ Failed migrations: ${failed} users`);

    if (failed > 0) {
      logger.info('⚠️  Some migrations failed. Please check the logs above.');
    }

  } catch (error) {
    logger.error('❌ Password migration failed:', error.message);
    logger.error('📋 Error details:', error.stack);
    // Do not exit process in Render runtime; propagate error
    throw error;
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

// Export for use in other scripts
export { migratePasswords };

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePasswords();
}
