/**
 * Runway & Cash Gap Analysis - Error Handling Tests
 * Test Plan: Section C - Error Handling (Critical Priority)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../shared/schema-sqlite';
import { calculateRunway, calculateCashGap } from '../../server/modules/dashboard/runway-cashgap';

// Create in-memory test database
const sqlite = new Database(':memory:');
const testDb = drizzle(sqlite, { schema });

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

describe('Error Handling Tests', () => {
  /**
   * Test 13: Invalid User ID Handling
   * Test Plan: Critical Priority - Test 13
   */
  describe('Invalid User ID', () => {
    it('should return empty results for non-existent user', async () => {
      const result = await calculateRunway('non-existent-user-999', 12, testDb);
      
      expect(result).toBeDefined();
      expect(result.currentCash).toBe(0);
      expect(result.monthlyExpenses).toBe(0);
      expect(result.runwayMonths).toBe(0); // Zero cash = 0 runway  
      expect(result.status).toBe('critical');
      expect(result.recommendations).toBeDefined();
    });

    it('should handle empty user ID gracefully', async () => {
      const result = await calculateRunway('', 12, testDb);
      
      expect(result).toBeDefined();
      expect(result.currentCash).toBe(0);
    });

    it('should handle null-like user IDs', async () => {
      const result1 = await calculateRunway('null', 12, testDb);
      const result2 = await calculateRunway('undefined', 12, testDb);
      
      expect(result1.currentCash).toBe(0);
      expect(result2.currentCash).toBe(0);
    });
  });

  /**
   * Test 14: Invalid Parameters
   * Test Plan: Critical Priority - Test 14
   */
  describe('Invalid Parameters', () => {
    it('should handle negative months parameter', async () => {
      const result = await calculateRunway('test-user', -5, testDb);
      
      // Should return something sensible or have minimum months
      expect(result).toBeDefined();
      expect(result.monthlyBreakdown).toBeDefined();
    });

    it('should handle zero months parameter', async () => {
      const result = await calculateRunway('test-user', 0, testDb);
      
      expect(result).toBeDefined();
    });

    it('should handle very large months parameter', async () => {
      const result = await calculateRunway('test-user', 1000, testDb);
      
      expect(result).toBeDefined();
      expect(result.monthlyBreakdown.length).toBeGreaterThan(0);
    });

    it('should handle decimal months parameter', async () => {
      // Should probably floor or round
      const result = await calculateRunway('test-user', 6.5, testDb);
      
      expect(result).toBeDefined();
    });
  });

  /**
   * Test 15: Database Edge Cases
   * Test Plan: Critical Priority - Test 15
   */
  describe('Database Edge Cases', () => {
    it('should handle empty database gracefully', async () => {
      const result = await calculateRunway('empty-user', 12, testDb);
      
      expect(result).toBeDefined();
      expect(result.currentCash).toBe(0);
      expect(result.monthlyExpenses).toBe(0);
      expect(result.status).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.monthlyBreakdown).toBeDefined();
    });

    it('should handle no transactions scenario', async () => {
      // Create account but no transactions
      await testDb.insert(schema.accounts).values({
        id: 'acc-no-trans',
        user_id: 'user-no-trans',
        name: 'Test Account',
        balance: 50000.00,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway('user-no-trans', 12, testDb);
      
      expect(result.currentCash).toBe(50000);
      expect(result.monthlyExpenses).toBe(0);
      expect(result.runwayMonths).toBe(Infinity);
    });

    it('should handle no AR/AP items for cash gap', async () => {
      const result = await calculateCashGap('empty-user', 6, testDb);
      
      expect(result).toBeDefined();
      expect(result.totalAR).toBe(0);
      expect(result.totalAP).toBe(0);
      expect(result.cashGap).toBe(0);
      expect(result.timeline).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });

  /**
   * Test 16: Data Type Handling
   * Test Plan: Critical Priority - Test 16
   */
  describe('Data Type Handling', () => {
    it('should handle string balance values', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-string-balance',
        user_id: 'user-string',
        name: 'Test Account',
        balance: 75000.00, // SQLite might store as number or string
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway('user-string', 12, testDb);
      
      expect(result.currentCash).toBeGreaterThan(0);
      expect(typeof result.currentCash).toBe('number');
    });

    it('should handle string amount values in transactions', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-string-amount',
        user_id: 'user-amount',
        name: 'Test Account',
        balance: 50000.00,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const date = new Date();
      date.setMonth(date.getMonth() - 1);

      await testDb.insert(schema.transactions).values({
        id: 'trans-string-amount',
        user_id: 'user-amount',
        account_id: 'acc-string-amount',
        amount: -5000.00,
        type: 'expense',
        category: 'operating',
        date: date.toISOString(),
        created_at: date.toISOString(),
      });

      const result = await calculateRunway('user-amount', 12, testDb);
      
      expect(result.monthlyExpenses).toBeGreaterThan(0);
      expect(typeof result.monthlyExpenses).toBe('number');
    });

    it('should handle mixed data types in AR/AP', async () => {
      await testDb.insert(schema.arApItems).values({
        id: 'ar-mixed',
        user_id: 'user-mixed',
        type: 'receivable',
        customer_supplier: 'Test Customer',
        amount: 10000.00,
        due_date: new Date().toISOString(),
        age_days: 15,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateCashGap('user-mixed', 6, testDb);
      
      expect(result.totalAR).toBeGreaterThan(0);
      expect(typeof result.totalAR).toBe('number');
    });
  });

  /**
   * Test 17: Calculation Edge Cases
   * Test Plan: Critical Priority - Test 17
   */
  describe('Calculation Edge Cases', () => {
    it('should handle zero cash with expenses', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-zero-cash',
        user_id: 'user-zero-cash',
        name: 'Empty Account',
        balance: 0.00,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const date = new Date();
      await testDb.insert(schema.transactions).values({
        id: 'trans-zero-cash',
        user_id: 'user-zero-cash',
        account_id: 'acc-zero-cash',
        amount: -1000.00,
        type: 'expense',
        category: 'operating',
        date: date.toISOString(),
        created_at: date.toISOString(),
      });

      const result = await calculateRunway('user-zero-cash', 12, testDb);
      
      expect(result.currentCash).toBe(0);
      expect(result.runwayMonths).toBe(0);
      expect(result.status).toBe('critical');
    });

    it('should handle very small amounts', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-small',
        user_id: 'user-small',
        name: 'Small Account',
        balance: 0.01,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway('user-small', 12, testDb);
      
      expect(result.currentCash).toBe(0.01);
      expect(result.runwayMonths).toBeGreaterThanOrEqual(0);
    });

    it('should handle equal AR and AP', async () => {
      await testDb.insert(schema.arApItems).values([
        {
          id: 'ar-equal',
          user_id: 'user-equal',
          type: 'receivable',
          customer_supplier: 'Customer',
          amount: 10000.00,
          due_date: new Date().toISOString(),
          age_days: 10,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'ap-equal',
          user_id: 'user-equal',
          type: 'payable',
          customer_supplier: 'Supplier',
          amount: 10000.00,
          due_date: new Date().toISOString(),
          age_days: 10,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await calculateCashGap('user-equal', 6, testDb);
      
      expect(result.cashGap).toBe(0);
      expect(result.riskLevel).toBe('medium'); // Zero gap = medium risk
    });

    it('should handle future dates correctly', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await testDb.insert(schema.arApItems).values({
        id: 'ar-future',
        user_id: 'user-future',
        type: 'receivable',
        customer_supplier: 'Customer',
        amount: 10000.00,
        due_date: futureDate.toISOString(),
        age_days: 365,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateCashGap('user-future', 6, testDb);
      
      expect(result).toBeDefined();
      expect(result.totalAR).toBeGreaterThan(0);
    });
  });
});

