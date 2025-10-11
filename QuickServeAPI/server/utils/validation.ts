/**
 * Input Validation Utilities
 * 
 * Provides validation functions for runway & cash gap analysis
 * Prevents SQL injection, XSS, and invalid inputs
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string = 'VALIDATION_ERROR',
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates user ID
 * 
 * @param userId - User ID to validate
 * @throws {ValidationError} If user ID is invalid
 */
export function validateUserId(userId: string): void {
  // Check if exists
  if (!userId) {
    throw new ValidationError('User ID is required', 'MISSING_USER_ID', 'userId');
  }

  // Check type
  if (typeof userId !== 'string') {
    throw new ValidationError('User ID must be a string', 'INVALID_TYPE', 'userId');
  }

  // Check length
  if (userId.length === 0) {
    throw new ValidationError('User ID cannot be empty', 'EMPTY_USER_ID', 'userId');
  }

  if (userId.length > 100) {
    throw new ValidationError('User ID is too long (max 100 characters)', 'USER_ID_TOO_LONG', 'userId');
  }

  // Prevent SQL injection
  const sqlInjectionPattern = /[;<>'"\\]/;
  if (sqlInjectionPattern.test(userId)) {
    throw new ValidationError(
      'User ID contains invalid characters',
      'INVALID_CHARACTERS',
      'userId'
    );
  }

  // Additional safety: check for common SQL keywords
  const lowerUserId = userId.toLowerCase();
  const sqlKeywords = ['select', 'drop', 'delete', 'insert', 'update', 'union', '--', '/*'];
  for (const keyword of sqlKeywords) {
    if (lowerUserId.includes(keyword)) {
      throw new ValidationError(
        'User ID contains prohibited keywords',
        'PROHIBITED_CONTENT',
        'userId'
      );
    }
  }
}

/**
 * Validates months parameter
 * 
 * @param months - Number of months to validate
 * @throws {ValidationError} If months is invalid
 */
export function validateMonths(months: number): void {
  // Check if exists
  if (months === null || months === undefined) {
    throw new ValidationError('Months parameter is required', 'MISSING_MONTHS', 'months');
  }

  // Check type
  if (typeof months !== 'number') {
    throw new ValidationError('Months must be a number', 'INVALID_TYPE', 'months');
  }

  // Check if NaN
  if (isNaN(months)) {
    throw new ValidationError('Months cannot be NaN', 'INVALID_NUMBER', 'months');
  }

  // Check if finite
  if (!isFinite(months)) {
    throw new ValidationError('Months must be finite', 'INVALID_NUMBER', 'months');
  }

  // Check range
  if (months < 1) {
    throw new ValidationError('Months must be at least 1', 'MONTHS_TOO_LOW', 'months');
  }

  if (months > 60) {
    throw new ValidationError(
      'Months cannot exceed 60 (5 years)',
      'MONTHS_TOO_HIGH',
      'months'
    );
  }

  // Check if integer
  if (!Number.isInteger(months)) {
    throw new ValidationError('Months must be an integer', 'NOT_INTEGER', 'months');
  }
}

/**
 * Validates amount/balance values
 * 
 * @param amount - Amount to validate
 * @param fieldName - Name of the field for error messages
 * @throws {ValidationError} If amount is invalid
 */
export function validateAmount(amount: number | string, fieldName: string = 'amount'): number {
  let numericAmount: number;

  // Convert string to number if needed
  if (typeof amount === 'string') {
    numericAmount = parseFloat(amount);
  } else if (typeof amount === 'number') {
    numericAmount = amount;
  } else {
    throw new ValidationError(
      `${fieldName} must be a number or numeric string`,
      'INVALID_TYPE',
      fieldName
    );
  }

  // Check if valid number
  if (isNaN(numericAmount)) {
    throw new ValidationError(`${fieldName} is not a valid number`, 'INVALID_NUMBER', fieldName);
  }

  if (!isFinite(numericAmount)) {
    throw new ValidationError(`${fieldName} must be finite`, 'INVALID_NUMBER', fieldName);
  }

  // Check precision (max 2 decimal places for currency)
  const decimalPlaces = (numericAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    throw new ValidationError(
      `${fieldName} cannot have more than 2 decimal places`,
      'INVALID_PRECISION',
      fieldName
    );
  }

  // Check reasonable bounds (prevent overflow)
  const MAX_SAFE_AMOUNT = 999999999999.99; // ~1 trillion
  if (Math.abs(numericAmount) > MAX_SAFE_AMOUNT) {
    throw new ValidationError(
      `${fieldName} exceeds maximum allowed value`,
      'AMOUNT_TOO_LARGE',
      fieldName
    );
  }

  return numericAmount;
}

/**
 * Sanitizes string input to prevent XSS
 * 
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Validates date string
 * 
 * @param dateStr - Date string to validate (ISO 8601)
 * @throws {ValidationError} If date is invalid
 */
export function validateDateString(dateStr: string, fieldName: string = 'date'): Date {
  if (!dateStr) {
    throw new ValidationError(`${fieldName} is required`, 'MISSING_DATE', fieldName);
  }

  if (typeof dateStr !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, 'INVALID_TYPE', fieldName);
  }

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} is not a valid date`, 'INVALID_DATE', fieldName);
  }

  // Check reasonable bounds (not in distant past or future)
  const MIN_DATE = new Date('1900-01-01');
  const MAX_DATE = new Date('2100-12-31');

  if (date < MIN_DATE || date > MAX_DATE) {
    throw new ValidationError(
      `${fieldName} is out of reasonable range (1900-2100)`,
      'DATE_OUT_OF_RANGE',
      fieldName
    );
  }

  return date;
}

/**
 * Validates currency code
 * 
 * @param currency - Currency code (ISO 4217)
 * @throws {ValidationError} If currency is invalid
 */
export function validateCurrency(currency: string): void {
  if (!currency) {
    throw new ValidationError('Currency is required', 'MISSING_CURRENCY', 'currency');
  }

  if (typeof currency !== 'string') {
    throw new ValidationError('Currency must be a string', 'INVALID_TYPE', 'currency');
  }

  // Common currencies (extend as needed)
  const validCurrencies = ['TRY', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];

  if (!validCurrencies.includes(currency.toUpperCase())) {
    throw new ValidationError(
      `Currency '${currency}' is not supported`,
      'UNSUPPORTED_CURRENCY',
      'currency'
    );
  }
}

/**
 * Validates pagination parameters
 * 
 * @param page - Page number (1-based)
 * @param limit - Items per page
 */
export function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  const defaultPage = 1;
  const defaultLimit = 20;
  const maxLimit = 100;

  let validPage = defaultPage;
  let validLimit = defaultLimit;

  if (page !== undefined) {
    if (typeof page !== 'number' || isNaN(page) || page < 1) {
      throw new ValidationError('Page must be a positive integer', 'INVALID_PAGE', 'page');
    }
    validPage = Math.floor(page);
  }

  if (limit !== undefined) {
    if (typeof limit !== 'number' || isNaN(limit) || limit < 1) {
      throw new ValidationError('Limit must be a positive integer', 'INVALID_LIMIT', 'limit');
    }
    if (limit > maxLimit) {
      throw new ValidationError(
        `Limit cannot exceed ${maxLimit}`,
        'LIMIT_TOO_HIGH',
        'limit'
      );
    }
    validLimit = Math.floor(limit);
  }

  return { page: validPage, limit: validLimit };
}

