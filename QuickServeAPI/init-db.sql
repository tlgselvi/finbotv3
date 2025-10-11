-- FinBot v3 - Database Initialization Script
-- This script runs automatically when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone to Istanbul
SET timezone = 'Europe/Istanbul';

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Grant privileges
GRANT ALL ON SCHEMA public TO finbot_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO finbot_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO finbot_user;

-- Create custom types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'FINANCE', 'VIEWER', 'AUDITOR');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE account_type AS ENUM ('cash', 'bank', 'credit', 'investment', 'company');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
    END IF;
END $$;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'FinBot v3 database initialized successfully!';
    RAISE NOTICE 'Database: finbot_dev';
    RAISE NOTICE 'User: finbot_user';
    RAISE NOTICE 'Timezone: %', current_setting('timezone');
END $$;

