-- Database Index Optimizations for Performance
-- Execute these to improve query performance

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

-- Accounts table indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts (user_id);

CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);

CREATE INDEX IF NOT EXISTS idx_accounts_bank_name ON accounts (bank_name);

CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts (is_active);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions (account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);

CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);

CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions (amount);

CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring ON transactions (is_recurring);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions (user_id, date);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);

CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions (account_id, date);

-- Refresh tokens indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens (is_revoked);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts (user_id);

CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);

CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity);

CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts (is_read);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts (created_at);

-- Budget lines indexes
CREATE INDEX IF NOT EXISTS idx_budget_lines_user_id ON budget_lines (user_id);

CREATE INDEX IF NOT EXISTS idx_budget_lines_category ON budget_lines (category);

CREATE INDEX IF NOT EXISTS idx_budget_lines_period ON budget_lines (period);

-- Bank transactions indexes
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_id ON bank_transactions (account_id);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions (transaction_date);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_amount ON bank_transactions (amount);

-- Recurring transactions indexes
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_frequency ON recurring_transactions (frequency);

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_date ON recurring_transactions (next_date);

-- Performance monitoring
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users (last_login);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at);

CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts (created_at);