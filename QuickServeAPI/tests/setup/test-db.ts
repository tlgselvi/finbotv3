/**
 * Test Database Setup
 * In-memory SQLite database for testing
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../shared/schema-sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';

// Create in-memory database for tests
const sqlite = new Database(':memory:');

// Initialize schema
const initSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  role TEXT DEFAULT 'USER',
  permissions TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_used_at TEXT,
  is_revoked INTEGER DEFAULT 0,
  family_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Revoked Tokens table
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id TEXT,
  revoked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  bank_name TEXT,
  account_name TEXT NOT NULL,
  balance TEXT DEFAULT '0',
  currency TEXT DEFAULT 'TRY',
  iban TEXT,
  account_number TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  date TEXT NOT NULL,
  balance TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Recurring Transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  frequency TEXT NOT NULL,
  interval_count INTEGER DEFAULT 1,
  next_due_date TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Budget Lines table
CREATE TABLE IF NOT EXISTS budget_lines (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  amount TEXT NOT NULL,
  period TEXT DEFAULT 'monthly',
  start_date TEXT,
  end_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Aging table
CREATE TABLE IF NOT EXISTS aging (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  amount TEXT NOT NULL,
  due_date TEXT NOT NULL,
  days_overdue INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bank Integrations table
CREATE TABLE IF NOT EXISTS bank_integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  credentials TEXT,
  is_active INTEGER DEFAULT 1,
  sync_status TEXT DEFAULT 'idle',
  last_sync_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bank Transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
  id TEXT PRIMARY KEY,
  integration_id TEXT NOT NULL,
  external_id TEXT,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'TRY',
  description TEXT,
  date TEXT NOT NULL,
  balance TEXT,
  type TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (integration_id) REFERENCES bank_integrations(id) ON DELETE CASCADE
);

-- Import Batches table
CREATE TABLE IF NOT EXISTS import_batches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reconciliation Logs table
CREATE TABLE IF NOT EXISTS reconciliation_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  integration_id TEXT,
  status TEXT DEFAULT 'pending',
  matched_count INTEGER DEFAULT 0,
  unmatched_count INTEGER DEFAULT 0,
  discrepancy_amount TEXT DEFAULT '0',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (integration_id) REFERENCES bank_integrations(id) ON DELETE SET NULL
);
`;

// Execute schema
sqlite.exec(initSQL);

// Create Drizzle instance
export const testDb = drizzle(sqlite, { schema });

// Export raw sqlite instance for raw queries
export const testSql = sqlite;

/**
 * Reset database - clear all tables
 */
export function resetDatabase() {
  const tables = [
    'revoked_tokens',
    'refresh_tokens',
    'password_reset_tokens',
    'reconciliation_logs',
    'bank_transactions',
    'import_batches',
    'bank_integrations',
    'aging',
    'budget_lines',
    'recurring_transactions',
    'transactions',
    'accounts',
    'user_profiles',
    'users',
  ];

  for (const table of tables) {
    try {
      sqlite.prepare(`DELETE FROM ${table}`).run();
    } catch (error) {
      // Table might not exist, ignore
    }
  }
}

/**
 * Seed test data
 */
export function seedTestData() {
  // Add a test user
  sqlite
    .prepare(
      `
    INSERT INTO users (id, email, name, password, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `
    )
    .run(
      'test-user-id',
      'test@example.com',
      'Test User',
      'hashed-password',
      'USER',
      1
    );

  // Add test user profile
  sqlite
    .prepare(
      `
    INSERT INTO user_profiles (user_id, role, permissions)
    VALUES (?, ?, ?)
  `
    )
    .run('test-user-id', 'USER', JSON.stringify(['READ', 'WRITE']));
}

/**
 * Close database connection
 */
export function closeDatabase() {
  sqlite.close();
}
