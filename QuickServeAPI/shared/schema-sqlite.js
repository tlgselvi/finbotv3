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
    deleted_at: text('deleted_at'),
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
// Recurring Transactions table
export const recurringTransactions = sqliteTable('recurring_transactions', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    account_id: text('account_id').notNull(),
    name: text('name').notNull(),
    amount: real('amount').notNull(),
    type: text('type').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    frequency: text('frequency').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date'),
    last_processed: text('last_processed'),
    next_due: text('next_due').notNull(),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    currency: text('currency').default('TRY'),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
});
// Budget Lines table
export const budgetLines = sqliteTable('budget_lines', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    category: text('category').notNull(),
    budgeted_amount: real('budgeted_amount').notNull(),
    actual_amount: real('actual_amount').default(0),
    month: text('month').notNull(),
    currency: text('currency').default('TRY'),
    notes: text('notes'),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
});
// Bank Integrations table
export const bankIntegrations = sqliteTable('bank_integrations', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    bank_name: text('bank_name').notNull(),
    account_number: text('account_number'),
    account_type: text('account_type'),
    status: text('status').default('pending'),
    last_sync: text('last_sync'),
    api_key: text('api_key'),
    access_token: text('access_token'),
    refresh_token: text('refresh_token'),
    expires_at: text('expires_at'),
    metadata: text('metadata'), // JSON as text
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
});
// Bank Transactions table
export const bankTransactions = sqliteTable('bank_transactions', {
    id: text('id').primaryKey(),
    bank_integration_id: text('bank_integration_id').notNull(),
    user_id: text('user_id').notNull(),
    external_id: text('external_id'),
    amount: real('amount').notNull(),
    currency: text('currency').default('TRY'),
    description: text('description'),
    transaction_date: text('transaction_date').notNull(),
    status: text('status').default('completed'),
    metadata: text('metadata'), // JSON as text
    created_at: text('created_at').notNull(),
});
// Import Batches table
export const importBatches = sqliteTable('import_batches', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    bank_integration_id: text('bank_integration_id'),
    filename: text('filename').notNull(),
    total_records: integer('total_records').default(0),
    successful_records: integer('successful_records').default(0),
    failed_records: integer('failed_records').default(0),
    status: text('status').default('processing'),
    error_log: text('error_log'),
    metadata: text('metadata'), // JSON as text
    created_at: text('created_at').notNull(),
    completed_at: text('completed_at'),
});
// Reconciliation Logs table
export const reconciliationLogs = sqliteTable('reconciliation_logs', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    bank_integration_id: text('bank_integration_id'),
    bank_transaction_id: text('bank_transaction_id'),
    transaction_id: text('transaction_id'),
    action: text('action').notNull(),
    confidence: real('confidence'),
    details: text('details'),
    created_at: text('created_at').notNull(),
});
// Refresh Tokens table
export const refreshTokens = sqliteTable('refresh_tokens', {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    token: text('token').notNull().unique(),
    family_id: text('family_id').notNull(),
    expires_at: text('expires_at').notNull(),
    is_revoked: integer('is_revoked', { mode: 'boolean' }).default(false),
    created_at: text('created_at').notNull(),
});
// Revoked Tokens table
export const revokedTokens = sqliteTable('revoked_tokens', {
    id: text('id').primaryKey(),
    token: text('token').notNull().unique(),
    user_id: text('user_id').notNull(),
    reason: text('reason'),
    revoked_at: text('revoked_at').notNull(),
    expires_at: text('expires_at').notNull(),
});
