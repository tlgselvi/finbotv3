/**
 * Format currency amount with Turkish Lira symbol
 */
export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  const formatted = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(amount);
  return formatted;
}

/**
 * Format date to Turkish format
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR').format(new Date(date));
}

/**
 * Calculate KDV (VAT) amount
 */
export function calculateKDV(amount: number, rate: number): number {
  return Math.round((amount * rate / 100) * 100) / 100;
}

/**
 * Calculate SGK premium
 */
export function calculateSGK(salary: number): {
  employer: number;
  employee: number;
  total: number;
} {
  const employer = Math.round(salary * 0.225 * 100) / 100;
  const employee = Math.round(salary * 0.15 * 100) / 100;
  return {
    employer,
    employee,
    total: employer + employee,
  };
}

/**
 * Validate Turkish TC ID number
 */
export function validateTCID(tcId: string): boolean {
  if (!/^\d{11}$/.test(tcId)) return false;
  
  const digits = tcId.split('').map(Number);
  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  const check1 = (sum1 - sum2) % 10;
  const check2 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
  
  return check1 === digits[9] && check2 === digits[10];
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 10000) / 100;
}

