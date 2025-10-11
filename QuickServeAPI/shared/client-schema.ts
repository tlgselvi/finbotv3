export type UserRoleType = 'admin' | 'user' | 'viewer' | 'auditor' | 'finance';

export interface Category {
  value: string;
  label: string;
  type: 'income' | 'expense';
}

export const incomeCategories: Category[] = [
  { value: 'salary', label: 'Maaş', type: 'income' },
  { value: 'freelance', label: 'Serbest Çalışma', type: 'income' },
  { value: 'investment', label: 'Yatırım', type: 'income' },
  { value: 'other_income', label: 'Diğer Gelir', type: 'income' },
];

export const expenseCategories: Category[] = [
  { value: 'rent', label: 'Kira', type: 'expense' },
  { value: 'food', label: 'Yiyecek', type: 'expense' },
  { value: 'transport', label: 'Ulaşım', type: 'expense' },
  { value: 'utilities', label: 'Faturalar', type: 'expense' },
  { value: 'entertainment', label: 'Eğlence', type: 'expense' },
  { value: 'health', label: 'Sağlık', type: 'expense' },
  { value: 'education', label: 'Eğitim', type: 'expense' },
  { value: 'shopping', label: 'Alışveriş', type: 'expense' },
  { value: 'other_expense', label: 'Diğer Gider', type: 'expense' },
];

export function getAllCategories(): Category[] {
  return [...incomeCategories, ...expenseCategories];
}

export function getCategoryByValue(value: string): Category | undefined {
  return getAllCategories().find(cat => cat.value === value);
}

