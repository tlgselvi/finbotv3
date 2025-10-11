export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'investment' | 'company';
  balance: number;
  currency: string;
  accountNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subAccounts?: SubAccount[];
  bankName?: string;
  accountName?: string;
  [key: string]: any; // Allow additional properties
}

export interface SubAccount {
  id: string;
  parentAccountId: string;
  name: string;
  balance: number;
  currency?: string;
  type?: string;
  limit?: number;
  used?: number;
  cutOffDate?: string;
  paymentDueDate?: string;
  minimumPayment?: number;
  interestRate?: number;
  principalRemaining?: number;
  monthlyPayment?: number;
  dueDate?: string;
  maturityDate?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow additional properties
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'budget_exceeded' | 'low_balance' | 'recurring_payment' | 'monthly_summary';
  message: string;
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
  createdAt: string;
  read?: boolean;
  isDismissed?: boolean;
  dismissedAt?: string;
  isActive?: boolean;
  accountId?: string;
  transactionId?: string;
  metadata?: string | Record<string, any>;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: 'income' | 'expense';
  accountId: string;
  accountName?: string;
  amount: number;
  currency: string;
  type?: 'income' | 'expense' | 'transfer';
  status?: 'pending' | 'completed' | 'cancelled';
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  spent: number;
  total: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  createdAt?: string;
  updatedAt?: string;
}

export interface Report {
  period: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  details?: any;
}

