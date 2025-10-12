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
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  is_active INTEGER DEFAULT 1,
  email_verified INTEGER DEFAULT 0,
  last_login TEXT,
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
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  balance REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  is_active INTEGER DEFAULT 1,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Recurring Transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  interval_type TEXT NOT NULL,
  interval_count INTEGER NOT NULL DEFAULT 1,
  start_date TEXT NOT NULL,
  end_date TEXT,
  last_processed TEXT,
  next_due TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  currency TEXT DEFAULT 'TRY',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Budget Lines table (matches budgets table in schema-sqlite.ts)
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  period TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  account_id TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AR/AP Items table
CREATE TABLE IF NOT EXISTS ar_ap_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  invoice_number TEXT,
  customer_supplier TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT NOT NULL,
  age_days INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  currency TEXT NOT NULL DEFAULT 'TRY',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bank Integrations table
CREATE TABLE IF NOT EXISTS bank_integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT,
  account_type TEXT,
  status TEXT DEFAULT 'pending',
  last_sync TEXT,
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TEXT,
  metadata TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bank Transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
  id TEXT PRIMARY KEY,
  bank_integration_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  external_id TEXT,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'TRY',
  description TEXT,
  transaction_date TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  metadata TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bank_integration_id) REFERENCES bank_integrations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Import Batches table
CREATE TABLE IF NOT EXISTS import_batches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bank_integration_id TEXT,
  filename TEXT NOT NULL,
  total_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing',
  error_log TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_integration_id) REFERENCES bank_integrations(id) ON DELETE SET NULL
);

-- Reconciliation Logs table
CREATE TABLE IF NOT EXISTS reconciliation_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bank_integration_id TEXT,
  bank_transaction_id TEXT,
  transaction_id TEXT,
  action TEXT NOT NULL,
  confidence TEXT,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_integration_id) REFERENCES bank_integrations(id) ON DELETE SET NULL,
  FOREIGN KEY (bank_transaction_id) REFERENCES bank_transactions(id) ON DELETE SET NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
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
    'ar_ap_items',
    'alerts',
    'budgets',
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
  const now = new Date().toISOString();

  // Add a test user
  sqlite
    .prepare(
      `
    INSERT INTO users (id, email, username, password_hash, role, is_active, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
    )
    .run(
      'test-user-id',
      'test@example.com',
      'testuser',
      'hashed-password',
      'user',
      1,
      1,
      now,
      now
    );

  // Add test user profile
  sqlite
    .prepare(
      `
    INSERT INTO user_profiles (user_id, role, permissions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `
    )
    .run('test-user-id', 'USER', JSON.stringify(['READ', 'WRITE']), now, now);
}

/**
 * Close database connection
 */
export function closeDatabase() {
  sqlite.close();
}
