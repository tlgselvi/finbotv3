// @ts-nocheck - Temporary fix for TypeScript errors
import { pgTable, text, timestamp, numeric, boolean, integer, uuid, varchar, jsonb, } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// Users table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    password: text('password'),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 50 }).notNull().default('user'),
    isActive: boolean('is_active').default(true),
    emailVerified: boolean('email_verified').default(false),
    resetToken: varchar('reset_token', { length: 255 }),
    resetTokenExpiry: timestamp('reset_token_expiry'),
    resetTokenExpires: timestamp('reset_token_expires'),
    lockedUntil: timestamp('locked_until'),
    failedLoginAttempts: integer('failed_login_attempts').default(0),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Teams table
export const teams = pgTable('teams', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    ownerId: uuid('owner_id')
        .references(() => users.id)
        .notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Team Members table
export const teamMembers = pgTable('team_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id')
        .references(() => teams.id)
        .notNull(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    role: varchar('role', { length: 50 }).notNull().default('member'),
    teamRole: varchar('team_role', { length: 50 }),
    isActive: boolean('is_active').default(true),
    joinedAt: timestamp('joined_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Invites table (stub - to be fully implemented)
export const invites = pgTable('invites', {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id')
        .references(() => teams.id)
        .notNull(),
    invitedEmail: varchar('invited_email', { length: 255 }).notNull(),
    inviteToken: varchar('invite_token', { length: 255 }).notNull().unique(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    invitedBy: uuid('invited_by')
        .references(() => users.id)
        .notNull(),
    invitedUserId: uuid('invited_user_id').references(() => users.id),
    acceptedAt: timestamp('accepted_at'),
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
});
// Accounts table
export const accounts = pgTable('accounts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'checking', 'savings', 'credit_card', 'loan', 'investment'
    bankName: varchar('bank_name', { length: 255 }),
    accountNumber: varchar('account_number', { length: 100 }),
    balance: numeric('balance', { precision: 15, scale: 2 })
        .notNull()
        .default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('TRY'),
    isActive: boolean('is_active').default(true),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Transactions table
export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id')
        .references(() => accounts.id)
        .notNull(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'income', 'expense', 'transfer'
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 100 }),
    subcategory: varchar('subcategory', { length: 100 }),
    date: timestamp('date').notNull(),
    isRecurring: boolean('is_recurring').default(false),
    recurringFrequency: varchar('recurring_frequency', { length: 20 }),
    tags: text('tags'), // JSON string
    investmentId: uuid('investment_id'), // References investments table
    virmanPairId: varchar('virman_pair_id', { length: 255 }),
    category: varchar('category', { length: 100 }),
    isActive: boolean('is_active').default(true),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Investments table
export const investments = pgTable('investments', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'stock', 'crypto', 'bond', 'fund', 'real_estate'
    symbol: varchar('symbol', { length: 20 }),
    quantity: numeric('quantity', { precision: 15, scale: 8 }).notNull(),
    purchasePrice: numeric('purchase_price', {
        precision: 15,
        scale: 2,
    }).notNull(),
    currentPrice: numeric('current_price', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 3 }).notNull().default('TRY'),
    category: varchar('category', { length: 100 }),
    riskLevel: varchar('risk_level', { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high'
    purchaseDate: timestamp('purchase_date'),
    lastUpdated: timestamp('last_updated').defaultNow(),
    accountId: uuid('account_id').references(() => accounts.id),
    metadata: jsonb('metadata'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Fixed Expenses table
export const fixedExpenses = pgTable('fixed_expenses', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    accountId: uuid('account_id')
        .references(() => accounts.id)
        .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    frequency: varchar('frequency', { length: 20 }).notNull(), // 'monthly', 'weekly', 'yearly'
    recurrence: varchar('recurrence', { length: 50 }),
    category: varchar('category', { length: 100 }),
    description: text('description'),
    type: varchar('type', { length: 20 }), // 'income' or 'expense'
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    lastProcessed: timestamp('last_processed'),
    isActive: boolean('is_active').default(true),
    nextDueDate: timestamp('next_due_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Credits table
export const credits = pgTable('credits', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    accountId: uuid('account_id')
        .references(() => accounts.id)
        .notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'credit_card', 'personal_loan', 'mortgage'
    name: varchar('name', { length: 255 }).notNull(),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
    remainingAmount: numeric('remaining_amount', {
        precision: 15,
        scale: 2,
    }).notNull(),
    interestRate: numeric('interest_rate', { precision: 5, scale: 2 }).notNull(),
    monthlyPayment: numeric('monthly_payment', {
        precision: 15,
        scale: 2,
    }).notNull(),
    dueDate: integer('due_date'), // Day of month (1-31)
    status: varchar('status', { length: 20 }).default('active'), // 'active', 'paid_off', 'closed'
    title: varchar('title', { length: 255 }),
    isActive: boolean('is_active').default(true),
    lastPaymentDate: timestamp('last_payment_date'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Tenants table
export const tenants = pgTable('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    ownerId: uuid('owner_id')
        .references(() => users.id)
        .notNull(),
    logo: text('logo'),
    domain: varchar('domain', { length: 255 }),
    theme: varchar('theme', { length: 50 }).default('default'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Budgets table
export const budgets = pgTable('budgets', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Forecasts table
export const forecasts = pgTable('forecasts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'cash_flow', 'budget', 'investment'
    scenario: varchar('scenario', { length: 100 }),
    name: varchar('name', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    parameters: text('parameters'), // JSON string
    results: text('results'), // JSON string
    accuracy: numeric('accuracy', { precision: 5, scale: 2 }),
    forecastDate: timestamp('forecast_date'),
    targetDate: timestamp('target_date'),
    predictedValue: numeric('predicted_value', { precision: 15, scale: 2 }),
    confidenceInterval: numeric('confidence_interval', { precision: 5, scale: 2 }),
    lowerBound: numeric('lower_bound', { precision: 15, scale: 2 }),
    upperBound: numeric('upper_bound', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    category: varchar('category', { length: 100 }),
    accountId: uuid('account_id').references(() => accounts.id),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Tenants table
export const tenants = pgTable('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    ownerId: uuid('owner_id')
        .references(() => users.id)
        .notNull(),
    logo: text('logo'),
    domain: varchar('domain', { length: 255 }),
    theme: varchar('theme', { length: 50 }).default('default'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// System Alerts table
export const systemAlerts = pgTable('system_alerts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    accountId: uuid('account_id').references(() => accounts.id),
    type: varchar('type', { length: 50 }).notNull(), // 'low_balance', 'payment_due', 'budget_exceeded'
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    severity: varchar('severity', { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
    isRead: boolean('is_read').default(false),
    isDismissed: boolean('is_dismissed').default(false),
    isActive: boolean('is_active').default(true),
    metadata: text('metadata'), // JSON string
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// AI Settings table
export const aiSettings = pgTable('ai_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    persona: varchar('persona', { length: 50 })
        .notNull()
        .default('financial_advisor'),
    preferences: text('preferences'), // JSON string
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Recurring Transactions table
export const recurringTransactions = pgTable('recurring_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    accountId: uuid('account_id')
        .references(() => accounts.id)
        .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    description: text('description'),
    frequency: varchar('frequency', { length: 20 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
    lastProcessed: timestamp('last_processed'),
    nextDue: timestamp('next_due').notNull(),
    isActive: boolean('is_active').default(true),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Budget Lines table
export const budgetLines = pgTable('budget_lines', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    budgetedAmount: numeric('budgeted_amount', {
        precision: 15,
        scale: 2,
    }).notNull(),
    actualAmount: numeric('actual_amount', { precision: 15, scale: 2 }).default('0'),
    month: varchar('month', { length: 7 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Aging Reports table
export const agingReports = pgTable('aging_reports', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    reportDate: timestamp('report_date').notNull(),
    totalReceivables: numeric('total_receivables', {
        precision: 15,
        scale: 2,
    }).default('0'),
    currentAmount: numeric('current_amount', { precision: 15, scale: 2 }).default('0'),
    current: numeric('current', { precision: 15, scale: 2 }).default('0'),
    days30: numeric('days_30', { precision: 15, scale: 2 }).default('0'),
    days60: numeric('days_60', { precision: 15, scale: 2 }).default('0'),
    days90: numeric('days_90', { precision: 15, scale: 2 }).default('0'),
    days90Plus: numeric('days_90_plus', { precision: 15, scale: 2 }).default('0'),
    agingDays: integer('aging_days'),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// AR/AP Items table - detailed receivables and payables
export const arApItems = pgTable('ar_ap_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'receivable' or 'payable'
    invoiceNumber: varchar('invoice_number', { length: 100 }),
    customerSupplier: varchar('customer_supplier', { length: 255 }).notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    dueDate: timestamp('due_date').notNull(),
    ageDays: integer('age_days').default(0),
    status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'paid', 'overdue'
    currency: varchar('currency', { length: 3 }).default('TRY'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Bank Integrations table
export const bankIntegrations = pgTable('bank_integrations', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    bankName: varchar('bank_name', { length: 255 }).notNull(),
    accountNumber: varchar('account_number', { length: 100 }),
    accountType: varchar('account_type', { length: 50 }),
    status: varchar('status', { length: 50 }).default('pending'),
    lastSync: timestamp('last_sync'),
    apiKey: text('api_key'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at'),
    metadata: jsonb('metadata'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Cashboxes table
export const cashboxes = pgTable('cashboxes', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    balance: numeric('balance', { precision: 15, scale: 2 }).default('0'),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Cashbox Transactions table
export const cashboxTransactions = pgTable('cashbox_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    cashboxId: uuid('cashbox_id')
        .references(() => cashboxes.id)
        .notNull(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'deposit', 'withdrawal', 'transfer'
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }),
    toFromCashboxId: uuid('to_from_cashbox_id').references(() => cashboxes.id),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
});
// Cashbox Audit Logs table
export const cashboxAuditLogs = pgTable('cashbox_audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    cashboxId: uuid('cashbox_id')
        .references(() => cashboxes.id)
        .notNull(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    details: text('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});
// User Profiles table
export const userProfiles = pgTable('user_profiles', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull()
        .unique(),
    fullName: varchar('full_name', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    avatar: text('avatar'),
    timezone: varchar('timezone', { length: 50 }).default('Europe/Istanbul'),
    language: varchar('language', { length: 10 }).default('tr'),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    preferences: jsonb('preferences'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// User Activity Logs table
export const userActivityLogs = pgTable('user_activity_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    category: varchar('category', { length: 50 }),
    resource: varchar('resource', { length: 100 }),
    resourceId: uuid('resource_id'),
    details: text('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    timestamp: timestamp('timestamp').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
});
// Email Verification Codes table
export const emailVerificationCodes = pgTable('email_verification_codes', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    code: varchar('code', { length: 10 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    isUsed: boolean('is_used').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});
// User Two Factor Auth table
export const userTwoFactorAuth = pgTable('user_two_factor_auth', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull()
        .unique(),
    secret: text('secret').notNull(),
    isEnabled: boolean('is_enabled').default(false),
    backupCodes: text('backup_codes'), // JSON array
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Password Reset Tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    isUsed: boolean('is_used').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});
// Refresh Tokens table
export const refreshTokens = pgTable('refresh_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
// Revoked Tokens table
export const revokedTokens = pgTable('revoked_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    token: text('token').notNull().unique(),
    revokedAt: timestamp('revoked_at').defaultNow(),
    reason: varchar('reason', { length: 255 }),
});
// Progress Payments table
export const progressPayments = pgTable('progress_payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    accountId: uuid('account_id')
        .references(() => accounts.id)
        .notNull(),
    projectName: varchar('project_name', { length: 255 }).notNull(),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
    paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).default('0'),
    remainingAmount: numeric('remaining_amount', {
        precision: 15,
        scale: 2,
    }).notNull(),
    dueDate: timestamp('due_date'),
    status: varchar('status', { length: 50 }).default('active'),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Team Invitations table
export const teamInvitations = pgTable('team_invitations', {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id')
        .references(() => teams.id)
        .notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    token: varchar('token', { length: 100 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    isAccepted: boolean('is_accepted').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});
// Audit Logs table
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: uuid('resource_id'),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});
// Tags table
export const tags = pgTable('tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    color: varchar('color', { length: 7 }),
    createdAt: timestamp('created_at').defaultNow(),
});
// Categories table
export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'income' or 'expense'
    icon: varchar('icon', { length: 50 }),
    color: varchar('color', { length: 7 }),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});
// Bank Transactions table (for integrations)
export const bankTransactions = pgTable('bank_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    bankIntegrationId: uuid('bank_integration_id')
        .references(() => bankIntegrations.id)
        .notNull(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    externalId: varchar('external_id', { length: 255 }),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('TRY'),
    description: text('description'),
    transactionDate: timestamp('transaction_date').notNull(),
    status: varchar('status', { length: 50 }).default('completed'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
});
// Import Batches table
export const importBatches = pgTable('import_batches', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    bankIntegrationId: uuid('bank_integration_id').references(() => bankIntegrations.id),
    filename: varchar('filename', { length: 255 }).notNull(),
    totalRecords: integer('total_records').default(0),
    successfulRecords: integer('successful_records').default(0),
    failedRecords: integer('failed_records').default(0),
    status: varchar('status', { length: 50 }).default('processing'), // 'processing', 'completed', 'failed'
    errorLog: text('error_log'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at'),
});
// Reconciliation Logs table
export const reconciliationLogs = pgTable('reconciliation_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    bankIntegrationId: uuid('bank_integration_id').references(() => bankIntegrations.id),
    bankTransactionId: uuid('bank_transaction_id').references(() => bankTransactions.id),
    transactionId: uuid('transaction_id').references(() => transactions.id),
    action: varchar('action', { length: 50 }).notNull(), // 'matched', 'unmatched', 'manual_match'
    confidence: numeric('confidence', { precision: 5, scale: 2 }),
    details: text('details'),
    createdAt: timestamp('created_at').defaultNow(),
});
// Relations
export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    transactions: many(transactions),
    investments: many(investments),
    fixedExpenses: many(fixedExpenses),
    credits: many(credits),
    forecasts: many(forecasts),
    systemAlerts: many(systemAlerts),
    aiSettings: many(aiSettings),
    ownedTeams: many(teams),
    teamMemberships: many(teamMembers),
}));
export const accountsRelations = relations(accounts, ({ one, many }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
    transactions: many(transactions),
    fixedExpenses: many(fixedExpenses),
    credits: many(credits),
}));
export const transactionsRelations = relations(transactions, ({ one }) => ({
    account: one(accounts, {
        fields: [transactions.accountId],
        references: [accounts.id],
    }),
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
    investment: one(investments, {
        fields: [transactions.investmentId],
        references: [investments.id],
    }),
}));
export const investmentsRelations = relations(investments, ({ one, many }) => ({
    user: one(users, {
        fields: [investments.userId],
        references: [users.id],
    }),
    transactions: many(transactions),
}));
export const teamsRelations = relations(teams, ({ one, many }) => ({
    owner: one(users, {
        fields: [teams.ownerId],
        references: [users.id],
    }),
    members: many(teamMembers),
}));
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
    team: one(teams, {
        fields: [teamMembers.teamId],
        references: [teams.id],
    }),
    user: one(users, {
        fields: [teamMembers.userId],
        references: [users.id],
    }),
}));
// Simulation Runs table
export const simulationRuns = pgTable('simulation_runs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    parameters: jsonb('parameters')
        .$type()
        .notNull(),
    results: jsonb('results')
        .$type()
        .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const simulationRunsRelations = relations(simulationRuns, ({ one }) => ({
    user: one(users, {
        fields: [simulationRuns.userId],
        references: [users.id],
    }),
}));
// Schema exports for validation
export const insertBudgetLineSchema = budgetLines;
export const insertRecurringTransactionSchema = recurringTransactions;
export const insertAgingReportSchema = agingReports;
export const insertCashboxSchema = cashboxes;
export const insertCashboxTransactionSchema = cashboxTransactions;
export const updateCashboxSchema = cashboxes;
export const transferCashboxSchema = cashboxTransactions;
export const insertTenantSchema = teams; // Tenant is similar to teams for now
export const insertBankIntegrationSchema = bankIntegrations;
export const updateBankIntegrationSchema = bankIntegrations;
export const insertUserTwoFactorAuthSchema = userTwoFactorAuth;
export const insertPasswordResetTokenSchema = passwordResetTokens;
