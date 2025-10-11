/**
 * Input Validation Tests
 * Test Plan: Section 3 - Input Validation
 */

import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  validateUserId,
  validateMonths,
  validateAmount,
  sanitizeInput,
  validateDateString,
  validateCurrency,
  validatePagination,
} from '../../server/utils/validation';

describe('Input Validation Utilities', () => {
  describe('validateUserId', () => {
    it('should accept valid user ID', () => {
      expect(() => validateUserId('user-123')).not.toThrow();
      expect(() => validateUserId('test-user-abc')).not.toThrow();
      expect(() => validateUserId('12345')).not.toThrow();
    });

    it('should reject empty user ID', () => {
      expect(() => validateUserId('')).toThrow(ValidationError);
      expect(() => validateUserId('')).toThrow('User ID is required');
    });

    it('should reject null/undefined user ID', () => {
      expect(() => validateUserId(null as any)).toThrow(ValidationError);
      expect(() => validateUserId(undefined as any)).toThrow(ValidationError);
    });

    it('should reject user ID with SQL injection attempts', () => {
      expect(() => validateUserId("'; DROP TABLE users; --")).toThrow(
        ValidationError
      );
      expect(() => validateUserId("user' OR '1'='1")).toThrow(ValidationError);
      expect(() => validateUserId('user-123; SELECT * FROM accounts')).toThrow(
        ValidationError
      );
      expect(() => validateUserId("admin' --")).toThrow(ValidationError);
    });

    it('should reject user ID with prohibited keywords', () => {
      expect(() => validateUserId('user-select-123')).toThrow(ValidationError);
      expect(() => validateUserId('delete-user')).toThrow(ValidationError);
      expect(() => validateUserId('user-drop-table')).toThrow(ValidationError);
    });

    it('should reject user ID that is too long', () => {
      const longId = 'a'.repeat(101);
      expect(() => validateUserId(longId)).toThrow(ValidationError);
      expect(() => validateUserId(longId)).toThrow('too long');
    });

    it('should reject non-string user ID', () => {
      expect(() => validateUserId(123 as any)).toThrow(ValidationError);
      expect(() => validateUserId({} as any)).toThrow(ValidationError);
      expect(() => validateUserId([] as any)).toThrow(ValidationError);
    });
  });

  describe('validateMonths', () => {
    it('should accept valid months', () => {
      expect(() => validateMonths(1)).not.toThrow();
      expect(() => validateMonths(12)).not.toThrow();
      expect(() => validateMonths(60)).not.toThrow();
    });

    it('should reject months less than 1', () => {
      expect(() => validateMonths(0)).toThrow(ValidationError);
      expect(() => validateMonths(-1)).toThrow(ValidationError);
      expect(() => validateMonths(-100)).toThrow(ValidationError);
    });

    it('should reject months greater than 60', () => {
      expect(() => validateMonths(61)).toThrow(ValidationError);
      expect(() => validateMonths(100)).toThrow(ValidationError);
      expect(() => validateMonths(1000)).toThrow(ValidationError);
    });

    it('should reject non-integer months', () => {
      expect(() => validateMonths(12.5)).toThrow(ValidationError);
      expect(() => validateMonths(3.14)).toThrow(ValidationError);
    });

    it('should reject NaN', () => {
      expect(() => validateMonths(NaN)).toThrow(ValidationError);
    });

    it('should reject Infinity', () => {
      expect(() => validateMonths(Infinity)).toThrow(ValidationError);
      expect(() => validateMonths(-Infinity)).toThrow(ValidationError);
    });

    it('should reject null/undefined', () => {
      expect(() => validateMonths(null as any)).toThrow(ValidationError);
      expect(() => validateMonths(undefined as any)).toThrow(ValidationError);
    });

    it('should reject non-number types', () => {
      expect(() => validateMonths('12' as any)).toThrow(ValidationError);
      expect(() => validateMonths({} as any)).toThrow(ValidationError);
    });
  });

  describe('validateAmount', () => {
    it('should accept valid amounts', () => {
      expect(validateAmount(100.5)).toBe(100.5);
      expect(validateAmount('100.50')).toBe(100.5);
      expect(validateAmount(0)).toBe(0);
      expect(validateAmount(-100.5)).toBe(-100.5);
    });

    it('should accept negative amounts', () => {
      expect(validateAmount(-50.0)).toBe(-50.0);
      expect(validateAmount('-75.25')).toBe(-75.25);
    });

    it('should reject invalid numbers', () => {
      expect(() => validateAmount('abc')).toThrow(ValidationError);
      expect(() => validateAmount('not-a-number')).toThrow(ValidationError);
    });

    it('should reject NaN', () => {
      expect(() => validateAmount(NaN)).toThrow(ValidationError);
    });

    it('should reject Infinity', () => {
      expect(() => validateAmount(Infinity)).toThrow(ValidationError);
      expect(() => validateAmount(-Infinity)).toThrow(ValidationError);
    });

    it('should reject amounts with too many decimal places', () => {
      expect(() => validateAmount(100.123)).toThrow(ValidationError);
      expect(() => validateAmount('50.999')).toThrow(ValidationError);
    });

    it('should reject amounts that are too large', () => {
      expect(() => validateAmount(9999999999999)).toThrow(ValidationError);
    });

    it('should use custom field name in error', () => {
      try {
        validateAmount('invalid', 'balance');
      } catch (error: any) {
        expect(error.message).toContain('balance');
      }
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags and escape special chars', () => {
      const result = sanitizeInput('<script>alert("XSS")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('alert');

      expect(sanitizeInput('<b>Bold</b> text')).toBe('Bold text');
      expect(sanitizeInput('<div>Content</div>')).toBe('Content');
    });

    it('should escape special characters', () => {
      expect(sanitizeInput('Test & Test')).toContain('&amp;');
      expect(sanitizeInput('Quote "test"')).toContain('&quot;');
      expect(sanitizeInput("Quote 'test'")).toContain('&#x27;');
      expect(sanitizeInput('Less <than')).toContain('&lt;');
      expect(sanitizeInput('Greater >than')).toContain('&gt;');
    });

    it('should handle complex XSS attempts', () => {
      const xssPayload = '<img src=x onerror="alert(1)">';
      const sanitized = sanitizeInput(xssPayload);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('"');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeInput(123 as any)).toBe('123');
      expect(sanitizeInput(null as any)).toBe('null');
      expect(sanitizeInput(undefined as any)).toBe('undefined');
    });

    it('should preserve normal text', () => {
      expect(sanitizeInput('Normal text')).toBe('Normal text');
      expect(sanitizeInput('Customer ABC')).toBe('Customer ABC');
    });
  });

  describe('validateDateString', () => {
    it('should accept valid ISO dates', () => {
      const date = validateDateString('2024-10-11T10:00:00.000Z');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
    });

    it('should accept various date formats', () => {
      expect(() => validateDateString('2024-10-11')).not.toThrow();
      expect(() => validateDateString('2024-10-11T10:00:00Z')).not.toThrow();
    });

    it('should reject invalid date strings', () => {
      expect(() => validateDateString('invalid-date')).toThrow(ValidationError);
      expect(() => validateDateString('2024-13-45')).toThrow(ValidationError);
      expect(() => validateDateString('abc')).toThrow(ValidationError);
    });

    it('should reject empty date string', () => {
      expect(() => validateDateString('')).toThrow(ValidationError);
    });

    it('should reject dates out of reasonable range', () => {
      expect(() => validateDateString('1800-01-01')).toThrow(ValidationError);
      expect(() => validateDateString('2200-01-01')).toThrow(ValidationError);
    });

    it('should reject non-string dates', () => {
      expect(() => validateDateString(123 as any)).toThrow(ValidationError);
    });
  });

  describe('validateCurrency', () => {
    it('should accept valid currencies', () => {
      expect(() => validateCurrency('TRY')).not.toThrow();
      expect(() => validateCurrency('USD')).not.toThrow();
      expect(() => validateCurrency('EUR')).not.toThrow();
      expect(() => validateCurrency('GBP')).not.toThrow();
    });

    it('should be case insensitive', () => {
      expect(() => validateCurrency('try')).not.toThrow();
      expect(() => validateCurrency('usd')).not.toThrow();
      expect(() => validateCurrency('Eur')).not.toThrow();
    });

    it('should reject invalid currencies', () => {
      expect(() => validateCurrency('XXX')).toThrow(ValidationError);
      expect(() => validateCurrency('ABC')).toThrow(ValidationError);
      expect(() => validateCurrency('INVALID')).toThrow(ValidationError);
    });

    it('should reject empty currency', () => {
      expect(() => validateCurrency('')).toThrow(ValidationError);
    });

    it('should reject non-string currency', () => {
      expect(() => validateCurrency(123 as any)).toThrow(ValidationError);
    });
  });

  describe('validatePagination', () => {
    it('should return defaults when no parameters provided', () => {
      const result = validatePagination();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should accept valid pagination', () => {
      const result = validatePagination(2, 50);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('should reject page less than 1', () => {
      expect(() => validatePagination(0, 20)).toThrow(ValidationError);
      expect(() => validatePagination(-1, 20)).toThrow(ValidationError);
    });

    it('should reject limit greater than max', () => {
      expect(() => validatePagination(1, 101)).toThrow(ValidationError);
      expect(() => validatePagination(1, 1000)).toThrow(ValidationError);
    });

    it('should floor decimal values', () => {
      const result = validatePagination(2.7, 15.9);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
    });

    it('should reject NaN values', () => {
      expect(() => validatePagination(NaN, 20)).toThrow(ValidationError);
      expect(() => validatePagination(1, NaN)).toThrow(ValidationError);
    });
  });

  describe('ValidationError class', () => {
    it('should create error with code and field', () => {
      const error = new ValidationError('Test error', 'TEST_CODE', 'testField');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.field).toBe('testField');
    });

    it('should have default code if not provided', () => {
      const error = new ValidationError('Test error');
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });
});
