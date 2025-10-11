import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  email_verified: integer('email_verified', { mode: 'boolean' }).default(false),
  last_login: text('last_login'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// Accounts table
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'checking', 'savings', 'credit_card', 'cash'
  bank_name: text('bank_name'),
  account_number: text('account_number'),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull().default('TRY'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  account_id: text('account_id').notNull(),
  amount: real('amount').notNull(),
  type: text('type').notNull(), // 'income' or 'expense'
  category: text('category').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

// Budgets table
export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  amount: real('amount').notNull(),
  period: text('period').notNull(), // 'monthly', 'yearly'
  start_date: text('start_date').notNull(),
  end_date: text('end_date'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// Alerts table
export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  severity: text('severity').notNull().default('medium'),
  account_id: text('account_id'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  created_at: text('created_at').notNull(),
});

// AR/AP Items table - detailed receivables and payables
export const arApItems = sqliteTable('ar_ap_items', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  type: text('type').notNull(), // 'receivable' or 'payable'
  invoice_number: text('invoice_number'),
  customer_supplier: text('customer_supplier').notNull(),
  amount: real('amount').notNull(),
  due_date: text('due_date').notNull(),
  age_days: integer('age_days').default(0),
  status: text('status').notNull().default('pending'), // 'pending', 'paid', 'overdue'
  currency: text('currency').notNull().default('TRY'),
  notes: text('notes'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});
