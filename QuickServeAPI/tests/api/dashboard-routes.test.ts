/**
 * Dashboard API Routes Tests
 * Test Plan: Section 5 - API Endpoints (High Priority)
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../shared/schema-sqlite';
import { eq } from 'drizzle-orm';
import {
  calculateRunway,
  calculateCashGap,
  getDashboardRunwayCashGap,
  getCashFlowForecast,
} from '../../server/modules/dashboard/runway-cashgap';
import {
  validateUserId,
  validateMonths,
  ValidationError,
} from '../../server/utils/validation';

// Test without actual HTTP server - test functions directly

// Create in-memory test database
const sqlite = new Database(':memory:');
const testDb = drizzle(sqlite, { schema });

const testUserId = 'test-user-api-123';

// Create tables
beforeAll(() => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      bank_name TEXT,
      account_number TEXT,
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'TRY',
      is_active INTEGER DEFAULT 1,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS ar_ap_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      invoice_number TEXT,
      customer_supplier TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      age_days INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      currency TEXT NOT NULL DEFAULT 'TRY',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
});

describe('Dashboard API Logic Tests', () => {
  beforeEach(async () => {
    // Setup test data
    await testDb.insert(schema.accounts).values({
      id: 'acc-api-1',
      user_id: testUserId,
      name: 'API Test Account',
      balance: 100000.0,
      type: 'bank',
      currency: 'TRY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Add some transactions
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      await testDb.insert(schema.transactions).values({
        id: `trans-api-${i}`,
        user_id: testUserId,
        account_id: 'acc-api-1',
        amount: -8000.0,
        type: 'expense',
        category: 'operating',
        date: date.toISOString(),
        created_at: date.toISOString(),
      });
    }

    // Add AR/AP items
    await testDb.insert(schema.arApItems).values([
      {
        id: 'ar-api-1',
        user_id: testUserId,
        type: 'receivable',
        customer_supplier: 'API Test Customer',
        amount: 20000.0,
        due_date: new Date().toISOString(),
        age_days: 10,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'ap-api-1',
        user_id: testUserId,
        type: 'payable',
        customer_supplier: 'API Test Supplier',
        amount: 15000.0,
        due_date: new Date().toISOString(),
        age_days: 5,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  });

  afterEach(async () => {
    // Clean up test data
    await testDb
      .delete(schema.transactions)
      .where(eq(schema.transactions.user_id, testUserId));
    await testDb
      .delete(schema.accounts)
      .where(eq(schema.accounts.user_id, testUserId));
    await testDb
      .delete(schema.arApItems)
      .where(eq(schema.arApItems.user_id, testUserId));
  });

  /**
   * Test 28: Runway Analysis API Logic
   */
  describe('Runway Analysis API', () => {
    it('should return valid runway data with validation', async () => {
      // Validate input (as API would)
      validateUserId(testUserId);
      validateMonths(12);

      // Call function (as API would)
      const result = await calculateRunway(testUserId, 12, testDb);

      // Verify API response structure
      expect(result).toBeDefined();
      expect(result).toHaveProperty('currentCash');
      expect(result).toHaveProperty('monthlyExpenses');
      expect(result).toHaveProperty('runwayMonths');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('monthlyBreakdown');
    });

    it('should validate months parameter', () => {
      expect(() => validateMonths(12)).not.toThrow();
      expect(() => validateMonths(100)).toThrow(ValidationError);
      expect(() => validateMonths(-5)).toThrow(ValidationError);
    });

    it('should reject SQL injection in user ID', () => {
      expect(() => validateUserId("'; DROP TABLE accounts; --")).toThrow(
        ValidationError
      );
    });
  });

  /**
   * Test 29: Cash Gap Analysis API Logic
   */
  describe('Cash Gap Analysis API', () => {
    it('should return valid cash gap data', async () => {
      validateUserId(testUserId);
      validateMonths(6);

      const result = await calculateCashGap(testUserId, 6, testDb);

      expect(result).toHaveProperty('totalAR');
      expect(result).toHaveProperty('totalAP');
      expect(result).toHaveProperty('cashGap');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('timeline');
      expect(result).toHaveProperty('recommendations');
    });

    it('should handle different months parameters', async () => {
      const result3 = await calculateCashGap(testUserId, 3, testDb);
      const result12 = await calculateCashGap(testUserId, 12, testDb);

      expect(result3.timeline.length).toBeLessThanOrEqual(
        result12.timeline.length
      );
    });
  });

  /**
   * Test 30: Combined Dashboard API Logic
   */
  describe('Combined Dashboard API', () => {
    it('should return complete dashboard data', async () => {
      validateUserId(testUserId);

      const result = await getDashboardRunwayCashGap(testUserId, testDb);

      expect(result).toHaveProperty('runway');
      expect(result).toHaveProperty('cashGap');
      expect(result).toHaveProperty('overallRisk');
      expect(result).toHaveProperty('summary');

      // Verify summary calculations
      expect(result.summary.totalCash).toBe(result.runway.currentCash);
      expect(result.summary.totalAR).toBe(result.cashGap.totalAR);
      expect(result.summary.totalAP).toBe(result.cashGap.totalAP);
    });

    it('should calculate overall risk correctly', async () => {
      const result = await getDashboardRunwayCashGap(testUserId, testDb);

      expect(['low', 'medium', 'high', 'critical']).toContain(
        result.overallRisk
      );
      expect(result.summary.runwayStatus).toBe(result.runway.status);
      expect(result.summary.cashGapStatus).toBe(result.cashGap.riskLevel);
    });
  });

  /**
   * Test 31: Cash Flow Forecast API Logic
   */
  describe('Cash Flow Forecast API', () => {
    it('should return forecast data', async () => {
      validateUserId(testUserId);
      validateMonths(6);

      const result = await getCashFlowForecast(testUserId, 6, testDb);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(6);

      result.forEach((month: any) => {
        expect(month).toHaveProperty('month');
        expect(month).toHaveProperty('openingCash');
        expect(month).toHaveProperty('projectedInflows');
        expect(month).toHaveProperty('projectedOutflows');
        expect(month).toHaveProperty('netCashFlow');
        expect(month).toHaveProperty('closingCash');
        expect(month).toHaveProperty('confidence');
      });
    });

    it('should have decreasing confidence over time', async () => {
      const result = await getCashFlowForecast(testUserId, 12, testDb);

      // First 3 months should be high confidence
      expect(result[0].confidence).toBe('high');
      expect(result[1].confidence).toBe('high');
      expect(result[2].confidence).toBe('high');

      // Months 4-6 should be medium
      expect(result[3].confidence).toBe('medium');
      expect(result[4].confidence).toBe('medium');
      expect(result[5].confidence).toBe('medium');

      // Months 7+ should be low
      expect(result[6].confidence).toBe('low');
    });
  });

  /**
   * Test 32-34: Input Validation for API
   */
  describe('API Input Validation', () => {
    it('should validate user ID format', () => {
      expect(() => validateUserId('valid-user-123')).not.toThrow();
      expect(() => validateUserId('')).toThrow(ValidationError);
      expect(() => validateUserId('user; DROP TABLE')).toThrow(ValidationError);
    });

    it('should validate months range', () => {
      expect(() => validateMonths(1)).not.toThrow();
      expect(() => validateMonths(60)).not.toThrow();
      expect(() => validateMonths(0)).toThrow(ValidationError);
      expect(() => validateMonths(61)).toThrow(ValidationError);
    });

    it('should return ValidationError with proper fields', () => {
      try {
        validateUserId('');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.code).toBeDefined();
        expect(error.message).toBeDefined();
      }
    });

    it('should prevent SQL injection in userId', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "user' OR '1'='1",
        "admin' --",
        'user; SELECT * FROM accounts',
      ];

      maliciousInputs.forEach(input => {
        expect(() => validateUserId(input)).toThrow(ValidationError);
      });
    });

    it('should validate months as integer', () => {
      expect(() => validateMonths(12.5)).toThrow(ValidationError);
      expect(() => validateMonths(NaN)).toThrow(ValidationError);
      expect(() => validateMonths(Infinity)).toThrow(ValidationError);
    });
  });

  /**
   * Test 35-37: Error Response Structure
   */
  describe('Error Response Handling', () => {
    it('should return proper error for invalid user ID', () => {
      expect(() => {
        validateUserId('user-with-select');
      }).toThrow(ValidationError);
    });

    it('should return proper error for invalid months', () => {
      expect(() => {
        validateMonths(-5);
      }).toThrow(ValidationError);
    });

    it('should handle empty user gracefully in functions', async () => {
      const result = await calculateRunway('empty-user-no-data', 12, testDb);

      expect(result).toBeDefined();
      expect(result.currentCash).toBe(0);
      expect(result.status).toBe('critical');
    });

    it('should handle ValidationError with code and field', () => {
      try {
        validateMonths(100);
      } catch (error: any) {
        expect(error.code).toBe('MONTHS_TOO_HIGH');
        expect(error.field).toBe('months');
      }
    });
  });
});
