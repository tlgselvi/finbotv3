export const ACCOUNT_TYPES = {
  CASH: 'cash',
  BANK: 'bank',
  CREDIT: 'credit',
  INVESTMENT: 'investment',
} as const;

export const TRANSACTION_CATEGORIES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export const BUDGET_PERIODS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const KDV_RATES = [0, 1, 10, 20] as const;

export const SGK_RATES = {
  EMPLOYER: 0.205,
  EMPLOYEE: 0.14,
  UNEMPLOYMENT_EMPLOYER: 0.02,
  UNEMPLOYMENT_EMPLOYEE: 0.01,
} as const;

export const CURRENCIES = {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR',
} as const;
