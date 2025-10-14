export interface Account {
  id: string;
  type: 'cash' | 'bank' | 'credit' | 'investment' | 'company';
  bankName: string;
  accountName: string;
  name: string;
  balance: number;
  currency: string;
  accountNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subAccounts?: SubAccount[];
  [key: string]: any;
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
  [key: string]: any;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category?: string;
  virmanPairId?: string;
  date: string;
  accountName: string;
  currency?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}

export type UserRoleType = 'ADMIN' | 'FINANCE' | 'VIEWER' | 'AUDITOR' | 'PERSONAL_USER' | 'COMPANY_USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  createdAt?: string;
  updatedAt?: string;
}

export interface FixedExpense {
  id: string;
  title: string;
  description?: string;
  type: 'income' | 'expense';
  amount: number;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  isActive: boolean;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Credit {
  id: string;
  title: string;
  type: 'credit_card' | 'personal_loan' | 'business_loan' | 'mortgage' | 'line_of_credit';
  amount: number;
  minimumPayment: number;
  interestRate: number;
  dueDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankProduct {
  id: string;
  bankName: string;
  accountName: string;
  type: 'personal' | 'company';
  currency: string;
  hasCheckingAccount: boolean;
  hasCreditCard: boolean;
  hasLoan: boolean;
  hasOverdraft: boolean;
  checkingAccountRate: number;
  creditCardRate: number;
  loanRate: number;
  overdraftRate: number;
  checkingAccountLimit: number;
  creditCardLimit: number;
  loanLimit: number;
  overdraftLimit: number;
  checkingAccountMinBalance: number;
  creditCardMinPayment: number;
  loanMinPayment: number;
  overdraftMinBalance: number;
  checkingAccountFee: number;
  creditCardFee: number;
  loanFee: number;
  overdraftFee: number;
  checkingAccountInterestRate: number;
  creditCardInterestRate: number;
  loanInterestRate: number;
  overdraftInterestRate: number;
}
