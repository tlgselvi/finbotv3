-- =====================================================
-- FinBot V3 - Comprehensive PostgreSQL Setup Script
-- =====================================================
-- Bu script FinBot V3 için gerekli tüm PostgreSQL yapısını oluşturur
-- Tek seferde çalıştırılmalıdır - tekrar yükleme şansı olmayabilir
-- =====================================================

-- 1. EXTENSIONS
-- =====================================================
-- UUID extension'ı aktifleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
-- =====================================================
-- Kullanıcı bilgilerini saklayan ana tablo
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- 3. ACCOUNTS TABLE
-- =====================================================
-- Kullanıcı hesaplarını saklayan tablo
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_currency ON accounts(currency);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);

-- 4. TRANSACTIONS TABLE
-- =====================================================
-- İşlem kayıtlarını saklayan tablo
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);

-- 5. SYSTEM_ALERTS TABLE
-- =====================================================
-- Sistem uyarılarını saklayan tablo
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_read BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- System alerts tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_system_alerts_user_id ON system_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_account_id ON system_alerts(account_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_read ON system_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_system_alerts_active ON system_alerts(is_active);

-- 6. BUDGETS TABLE (Ek tablo)
-- =====================================================
-- Bütçe planlarını saklayan tablo
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    spent NUMERIC(15, 2) DEFAULT 0,
    period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Budgets tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);

-- 7. SCENARIOS TABLE (Ek tablo)
-- =====================================================
-- Finansal senaryoları saklayan tablo
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB,
    results JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scenarios tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_active ON scenarios(is_active);

-- 8. NOTIFICATION_RULES TABLE (Ek tablo)
-- =====================================================
-- Bildirim kurallarını saklayan tablo
CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification rules tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_notification_rules_user_id ON notification_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_rules_type ON notification_rules(type);
CREATE INDEX IF NOT EXISTS idx_notification_rules_active ON notification_rules(is_active);

-- 9. DEFAULT ADMIN USER
-- =====================================================
-- Varsayılan admin kullanıcısı oluştur (şifre: admin123)
INSERT INTO users (email, username, password_hash, role, is_active) 
VALUES (
    'admin@finbot.com', 
    'admin', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4NvQxJqQ7m',
    'admin', 
    true
) ON CONFLICT (email) DO NOTHING;

-- 10. DEMO USER
-- =====================================================
-- Demo kullanıcısı oluştur (şifre: demo123)
INSERT INTO users (email, username, password_hash, role, is_active) 
VALUES (
    'demo@finbot.com', 
    'demo', 
    '$2b$12$rQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4NvQxJqQ7m',
    'user', 
    true
) ON CONFLICT (email) DO NOTHING;

-- 11. DEMO ACCOUNTS
-- =====================================================
-- Demo hesapları oluştur
INSERT INTO accounts (user_id, name, type, balance, currency, is_active)
SELECT 
    u.id,
    'Ana Hesap',
    'checking',
    50000.00,
    'TRY',
    true
FROM users u WHERE u.email = 'admin@finbot.com'
ON CONFLICT DO NOTHING;

INSERT INTO accounts (user_id, name, type, balance, currency, is_active)
SELECT 
    u.id,
    'Tasarruf Hesabı',
    'savings',
    100000.00,
    'TRY',
    true
FROM users u WHERE u.email = 'admin@finbot.com'
ON CONFLICT DO NOTHING;

INSERT INTO accounts (user_id, name, type, balance, currency, is_active)
SELECT 
    u.id,
    'Yatırım Hesabı',
    'investment',
    25000.00,
    'USD',
    true
FROM users u WHERE u.email = 'admin@finbot.com'
ON CONFLICT DO NOTHING;

-- 12. DEMO TRANSACTIONS
-- =====================================================
-- Demo işlemler oluştur
INSERT INTO transactions (account_id, user_id, type, amount, description, category, date)
SELECT 
    a.id,
    a.user_id,
    'income',
    15000.00,
    'Maaş',
    'salary',
    NOW() - INTERVAL '1 day'
FROM accounts a 
JOIN users u ON a.user_id = u.id 
WHERE u.email = 'admin@finbot.com' AND a.name = 'Ana Hesap'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (account_id, user_id, type, amount, description, category, date)
SELECT 
    a.id,
    a.user_id,
    'expense',
    2500.00,
    'Market alışverişi',
    'groceries',
    NOW() - INTERVAL '2 days'
FROM accounts a 
JOIN users u ON a.user_id = u.id 
WHERE u.email = 'admin@finbot.com' AND a.name = 'Ana Hesap'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (account_id, user_id, type, amount, description, category, date)
SELECT 
    a.id,
    a.user_id,
    'expense',
    800.00,
    'Elektrik faturası',
    'utilities',
    NOW() - INTERVAL '3 days'
FROM accounts a 
JOIN users u ON a.user_id = u.id 
WHERE u.email = 'admin@finbot.com' AND a.name = 'Ana Hesap'
ON CONFLICT DO NOTHING;

-- 13. DEMO BUDGETS
-- =====================================================
-- Demo bütçeler oluştur
INSERT INTO budgets (user_id, name, category, amount, period, start_date, end_date, is_active)
SELECT 
    u.id,
    'Aylık Market Bütçesi',
    'groceries',
    3000.00,
    'monthly',
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day',
    true
FROM users u WHERE u.email = 'admin@finbot.com'
ON CONFLICT DO NOTHING;

INSERT INTO budgets (user_id, name, category, amount, period, start_date, end_date, is_active)
SELECT 
    u.id,
    'Aylık Fatura Bütçesi',
    'utilities',
    1500.00,
    'monthly',
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day',
    true
FROM users u WHERE u.email = 'admin@finbot.com'
ON CONFLICT DO NOTHING;

-- 14. DEMO SYSTEM ALERTS
-- =====================================================
-- Demo sistem uyarıları oluştur
INSERT INTO system_alerts (user_id, account_id, type, title, message, severity, is_read, is_active)
SELECT 
    u.id,
    a.id,
    'low_balance',
    'Düşük Bakiye Uyarısı',
    'Ana Hesap bakiyeniz 1000 TL altına düştü.',
    'medium',
    false,
    true
FROM users u 
JOIN accounts a ON a.user_id = u.id 
WHERE u.email = 'admin@finbot.com' AND a.name = 'Ana Hesap'
ON CONFLICT DO NOTHING;

-- 15. VERIFICATION QUERIES
-- =====================================================
-- Oluşturulan tabloları kontrol et
SELECT 'TABLES CREATED:' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Kullanıcıları kontrol et
SELECT 'USERS CREATED:' as status;
SELECT email, username, role, is_active, created_at 
FROM users 
ORDER BY created_at;

-- Hesapları kontrol et
SELECT 'ACCOUNTS CREATED:' as status;
SELECT a.name, a.type, a.balance, a.currency, u.email as user_email
FROM accounts a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at;

-- İşlemleri kontrol et
SELECT 'TRANSACTIONS CREATED:' as status;
SELECT t.type, t.amount, t.description, t.category, t.date, a.name as account_name
FROM transactions t
JOIN accounts a ON t.account_id = a.id
ORDER BY t.date DESC;

-- Bütçeleri kontrol et
SELECT 'BUDGETS CREATED:' as status;
SELECT b.name, b.category, b.amount, b.period, u.email as user_email
FROM budgets b
JOIN users u ON b.user_id = u.id
ORDER BY b.created_at;

-- Uyarıları kontrol et
SELECT 'ALERTS CREATED:' as status;
SELECT sa.type, sa.title, sa.severity, sa.is_read, u.email as user_email
FROM system_alerts sa
JOIN users u ON sa.user_id = u.id
ORDER BY sa.created_at;

-- 16. FINAL STATUS
-- =====================================================
SELECT 'SETUP COMPLETED SUCCESSFULLY!' as final_status;
SELECT 'FinBot V3 PostgreSQL database is ready for use.' as message;
SELECT 'Admin login: admin@finbot.com / admin123' as admin_info;
SELECT 'Demo login: demo@finbot.com / demo123' as demo_info;
