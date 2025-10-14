export const ACCOUNT_TYPES = {
    CASH: 'cash',
    BANK: 'bank',
    CREDIT: 'credit',
    INVESTMENT: 'investment',
};
export const TRANSACTION_CATEGORIES = {
    INCOME: 'income',
    EXPENSE: 'expense',
};
export const BUDGET_PERIODS = {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
};
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    PERSONAL_USER: 'personal_user',
    COMPANY_USER: 'company_user',
};
export const KDV_RATES = [0, 1, 10, 20];
export const SGK_RATES = {
    EMPLOYER: 0.205,
    EMPLOYEE: 0.14,
    UNEMPLOYMENT_EMPLOYER: 0.02,
    UNEMPLOYMENT_EMPLOYEE: 0.01,
};
export const CURRENCIES = {
    TRY: 'TRY',
    USD: 'USD',
    EUR: 'EUR',
};
export const PERMISSIONS = {
    VIEW_PERSONAL_TRANSACTIONS: 'view_personal_transactions',
    VIEW_COMPANY_REPORTS: 'view_company_reports',
    VIEW_PERSONAL_REPORTS: 'view_personal_reports',
    MANAGE_ACCOUNTS: 'manage_accounts',
    MANAGE_TRANSACTIONS: 'manage_transactions',
    MANAGE_BUDGETS: 'manage_budgets',
    MANAGE_USERS: 'manage_users',
};
