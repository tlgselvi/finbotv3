// @ts-nocheck - Temporary fix for TypeScript errors
import { db } from '../db';
import { users } from '../../shared/schema-sqlite';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

/**
 * Seed database with initial data
 */
async function seed() {
  try {
    logger.info('🌱 Seeding database...');

    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length > 0) {
      logger.info('✅ Database already seeded, skipping...');
      process.exit(0);
    }

    const now = new Date().toISOString();

    // Create demo user
    const demoPasswordHash = await bcrypt.hash('demo123', 10);
    await db.insert(users).values({
      id: randomUUID(),
      email: 'demo@finbot.com',
      username: 'demo',
      password_hash: demoPasswordHash,
      role: 'user',
      is_active: true,
      email_verified: true,
      created_at: now,
      updated_at: now,
    });

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      id: randomUUID(),
      email: 'admin@finbot.com',
      username: 'admin',
      password_hash: adminPasswordHash,
      role: 'admin',
      is_active: true,
      email_verified: true,
      created_at: now,
      updated_at: now,
    });

    logger.info('✅ Database seeded successfully!');
    logger.info('📧 Demo User: demo@finbot.com / demo123');
    logger.info('📧 Admin User: admin@finbot.com / admin123');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();


