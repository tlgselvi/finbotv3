import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const db = new Database('dev.db');

// Create demo user
const userId = randomUUID();
const passwordHash = bcrypt.hashSync('demo123', 10);
const now = new Date().toISOString();

try {
  // Insert demo user
  db.prepare(
    `
    INSERT INTO users (id, email, username, password_hash, role, is_active, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    userId,
    'demo@finbot.com',
    'demo',
    passwordHash,
    'admin',
    1,
    1,
    now,
    now
  );

  // Insert demo account
  const accountId = randomUUID();
  db.prepare(
    `
    INSERT INTO accounts (id, user_id, name, type, balance, currency, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(accountId, userId, 'Nakit Hesap', 'cash', 10000, 'TRY', 1, now, now);

  // Insert demo transaction
  const transactionId = randomUUID();
  db.prepare(
    `
    INSERT INTO transactions (id, user_id, account_id, amount, type, category, description, date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    transactionId,
    userId,
    accountId,
    5000,
    'income',
    'Maaş',
    'İlk maaş ödemesi',
    now,
    now
  );

  console.log('✅ Demo data oluşturuldu!');
  console.log('📧 Email: demo@finbot.com');
  console.log('🔑 Password: demo123');
} catch (error) {
  console.error('❌ Hata:', error.message);
}

db.close();
