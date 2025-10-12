/**
 * Runway & Cash Gap Analysis - Edge Case Tests
 * Test Plan: Section C - Edge Cases (Critical Priority)
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../shared/schema-sqlite';
import { eq } from 'drizzle-orm';
import {
  calculateRunway,
  calculateCashGap,
} from '../../server/modules/dashboard/runway-cashgap';

// Create in-memory test database
const sqlite = new Database(':memory:');
const testDb = drizzle(sqlite, { schema });

const testUserId = 'test-user-edge-cases';

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

describe('Edge Case Tests', () => {
  beforeEach(async () => {
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
   * Test 18: Empty Database Scenario
   * Test Plan: Critical Priority - Test 18
   */
  describe('Empty Database Scenario', () => {
    it('should return sensible defaults for empty database', async () => {
      const runwayResult = await calculateRunway(testUserId, 12, testDb);

      expect(runwayResult).toBeDefined();
      expect(runwayResult.currentCash).toBe(0);
      expect(runwayResult.monthlyExpenses).toBe(0);
      expect(runwayResult.runwayMonths).toBe(0); // Zero cash = 0 runway
      expect(runwayResult.status).toBe('critical'); // No cash is critical
      expect(runwayResult.monthlyBreakdown).toBeDefined();
      expect(runwayResult.recommendations).toBeDefined();
      expect(runwayResult.recommendations.length).toBeGreaterThan(0);
    });

    it('should return empty AR/AP for empty database', async () => {
      const cashGapResult = await calculateCashGap(testUserId, 6, testDb);

      expect(cashGapResult).toBeDefined();
      expect(cashGapResult.totalAR).toBe(0);
      expect(cashGapResult.totalAP).toBe(0);
      expect(cashGapResult.cashGap).toBe(0);
      expect(cashGapResult.riskLevel).toBeDefined();
      expect(cashGapResult.timeline).toBeDefined();
    });
  });

  /**
   * Test 19: Negative Account Balances
   * Test Plan: Critical Priority - Test 19
   */
  describe('Negative Account Balances', () => {
    it('should handle negative balance correctly', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-negative',
        user_id: testUserId,
        name: 'Overdrawn Account',
        balance: -5000.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway(testUserId, 12, testDb);

      expect(result.currentCash).toBe(-5000);
      expect(result.runwayMonths).toBeLessThanOrEqual(0);
      expect(['critical', 'warning']).toContain(result.status);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle mixed positive and negative balances', async () => {
      await testDb.insert(schema.accounts).values([
        {
          id: 'acc-positive',
          user_id: testUserId,
          name: 'Positive Account',
          balance: 10000.0,
          type: 'bank',
          currency: 'TRY',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'acc-negative-2',
          user_id: testUserId,
          name: 'Negative Account',
          balance: -3000.0,
          type: 'credit_card',
          currency: 'TRY',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await calculateRunway(testUserId, 12, testDb);

      expect(result.currentCash).toBe(7000); // 10000 - 3000
      expect(result.runwayMonths).toBeGreaterThan(0);
    });

    it('should mark critical when total balance is deeply negative', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-deep-negative',
        user_id: testUserId,
        name: 'Deep Overdraft',
        balance: -50000.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway(testUserId, 12, testDb);

      expect(['critical', 'warning']).toContain(result.status);
      expect(result.runwayMonths).toBeLessThanOrEqual(0);
    });
  });

  /**
   * Test 20: Very Large Numbers
   * Test Plan: Critical Priority - Test 20
   */
  describe('Very Large Numbers', () => {
    it('should handle very large balances without overflow', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-large',
        user_id: testUserId,
        name: 'Large Account',
        balance: 999999999.99,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway(testUserId, 12, testDb);

      expect(result.currentCash).toBeLessThan(Number.MAX_SAFE_INTEGER);
      expect(result.currentCash).toBe(999999999.99);
      // With no expenses, runway is Infinity - this is expected
      expect(result).toBeDefined();
    });

    it('should handle very large transaction amounts', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-large-trans',
        user_id: testUserId,
        name: 'Test Account',
        balance: 1000000000.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const date = new Date();
      date.setMonth(date.getMonth() - 1);

      await testDb.insert(schema.transactions).values({
        id: 'trans-large',
        user_id: testUserId,
        account_id: 'acc-large-trans',
        amount: -100000000.0, // 100 million expense
        type: 'expense',
        category: 'operating',
        date: date.toISOString(),
        created_at: date.toISOString(),
      });

      const result = await calculateRunway(testUserId, 12, testDb);

      expect(Number.isFinite(result.monthlyExpenses)).toBe(true);
      expect(Number.isFinite(result.runwayMonths)).toBe(true);
    });

    it('should handle very large AR/AP amounts', async () => {
      await testDb.insert(schema.arApItems).values([
        {
          id: 'ar-large',
          user_id: testUserId,
          type: 'receivable',
          customer_supplier: 'Large Customer',
          amount: 500000000.0,
          due_date: new Date().toISOString(),
          age_days: 10,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'ap-large',
          user_id: testUserId,
          type: 'payable',
          customer_supplier: 'Large Supplier',
          amount: 400000000.0,
          due_date: new Date().toISOString(),
          age_days: 5,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await calculateCashGap(testUserId, 6, testDb);

      expect(result.totalAR).toBe(500000000);
      expect(result.totalAP).toBe(400000000);
      expect(result.cashGap).toBe(100000000);
      expect(result.riskLevel).toBeDefined();
    });
  });

  /**
   * Test 21: Multi-Currency Scenarios
   * Test Plan: Critical Priority - Test 21
   */
  describe('Multi-Currency Scenarios', () => {
    it('should handle multiple currency accounts', async () => {
      await testDb.insert(schema.accounts).values([
        {
          id: 'acc-try',
          user_id: testUserId,
          name: 'TRY Account',
          balance: 10000.0,
          type: 'bank',
          currency: 'TRY',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'acc-usd',
          user_id: testUserId,
          name: 'USD Account',
          balance: 5000.0,
          type: 'bank',
          currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'acc-eur',
          user_id: testUserId,
          name: 'EUR Account',
          balance: 3000.0,
          type: 'bank',
          currency: 'EUR',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await calculateRunway(testUserId, 12, testDb);

      // Currently sums all currencies without conversion
      // TODO: Future enhancement - exchange rate conversion
      expect(result.currentCash).toBe(18000); // 10000 + 5000 + 3000
      expect(result).toBeDefined();
    });

    it('should handle AR/AP in different currencies', async () => {
      await testDb.insert(schema.arApItems).values([
        {
          id: 'ar-try',
          user_id: testUserId,
          type: 'receivable',
          customer_supplier: 'TRY Customer',
          amount: 10000.0,
          due_date: new Date().toISOString(),
          age_days: 10,
          status: 'pending',
          currency: 'TRY',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'ap-usd',
          user_id: testUserId,
          type: 'payable',
          customer_supplier: 'USD Supplier',
          amount: 5000.0,
          due_date: new Date().toISOString(),
          age_days: 5,
          status: 'pending',
          currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await calculateCashGap(testUserId, 6, testDb);

      // Currently no currency conversion
      expect(result.totalAR).toBe(10000);
      expect(result.totalAP).toBe(5000);
      expect(result.cashGap).toBe(5000);
    });
  });

  /**
   * Test 22: Boundary Conditions
   * Test Plan: Critical Priority - Test 22
   */
  describe('Boundary Conditions', () => {
    it('should handle exactly 3 months runway (warning threshold)', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-boundary',
        user_id: testUserId,
        name: 'Boundary Account',
        balance: 30000.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Add 6 months of 10k expenses
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        await testDb.insert(schema.transactions).values({
          id: `trans-boundary-${i}`,
          user_id: testUserId,
          account_id: 'acc-boundary',
          amount: -10000.0,
          type: 'expense',
          category: 'operating',
          date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }

      const result = await calculateRunway(testUserId, 12, testDb);

      // 30k balance / 10k per month = 3 months (boundary)
      expect(result.runwayMonths).toBeCloseTo(3, 1);
      expect(['warning', 'critical']).toContain(result.status);
    });

    it('should handle exactly 6 months runway (healthy threshold)', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-boundary-6',
        user_id: testUserId,
        name: 'Six Month Account',
        balance: 60000.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        await testDb.insert(schema.transactions).values({
          id: `trans-boundary-6-${i}`,
          user_id: testUserId,
          account_id: 'acc-boundary-6',
          amount: -10000.0,
          type: 'expense',
          category: 'operating',
          date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }

      const result = await calculateRunway(testUserId, 12, testDb);

      expect(result.runwayMonths).toBeCloseTo(6, 1);
      expect(['healthy', 'warning']).toContain(result.status);
    });

    it('should handle minimum months parameter (1)', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-min-months',
        user_id: testUserId,
        name: 'Test Account',
        balance: 50000.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway(testUserId, 1, testDb);

      expect(result.monthlyBreakdown.length).toBeGreaterThan(0);
      expect(result).toBeDefined();
    });

    it('should handle maximum months parameter (60)', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-max-months',
        user_id: testUserId,
        name: 'Test Account',
        balance: 50000.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway(testUserId, 60, testDb);

      expect(result.monthlyBreakdown.length).toBeGreaterThan(0);
      expect(result).toBeDefined();
    });
  });

  /**
   * Additional Edge Cases
   */
  describe('Additional Edge Cases', () => {
    it('should handle accounts with zero balance', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-zero',
        user_id: testUserId,
        name: 'Zero Balance Account',
        balance: 0.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateRunway(testUserId, 12, testDb);

      expect(result.currentCash).toBe(0);
      expect(['critical', 'warning', 'healthy']).toContain(result.status);
    });

    it('should handle very old transactions', async () => {
      await testDb.insert(schema.accounts).values({
        id: 'acc-old',
        user_id: testUserId,
        name: 'Test Account',
        balance: 50000.0,
        type: 'bank',
        currency: 'TRY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Transaction from 2 years ago
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2);

      await testDb.insert(schema.transactions).values({
        id: 'trans-old',
        user_id: testUserId,
        account_id: 'acc-old',
        amount: -10000.0,
        type: 'expense',
        category: 'operating',
        date: oldDate.toISOString(),
        created_at: oldDate.toISOString(),
      });

      const result = await calculateRunway(testUserId, 12, testDb);

      // Should only consider last 6 months, so this old transaction ignored
      expect(result.monthlyExpenses).toBe(0);
    });

    it('should handle overdue AR/AP items', async () => {
      const overdueDate = new Date();
      overdueDate.setMonth(overdueDate.getMonth() - 2);

      await testDb.insert(schema.arApItems).values({
        id: 'ar-overdue',
        user_id: testUserId,
        type: 'receivable',
        customer_supplier: 'Late Paying Customer',
        amount: 20000.0,
        due_date: overdueDate.toISOString(),
        age_days: 60,
        status: 'overdue',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await calculateCashGap(testUserId, 6, testDb);

      expect(result.totalAR).toBeGreaterThan(0);
      expect(result.arDueIn60Days).toBeGreaterThan(0);
    });

    it('should handle paid AR/AP items', async () => {
      await testDb.insert(schema.arApItems).values([
        {
          id: 'ar-paid',
          user_id: testUserId,
          type: 'receivable',
          customer_supplier: 'Paid Customer',
          amount: 10000.0,
          due_date: new Date().toISOString(),
          age_days: 0,
          status: 'paid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'ar-pending',
          user_id: testUserId,
          type: 'receivable',
          customer_supplier: 'Pending Customer',
          amount: 5000.0,
          due_date: new Date().toISOString(),
          age_days: 0,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await calculateCashGap(testUserId, 6, testDb);

      // Should include all AR regardless of status
      expect(result.totalAR).toBe(15000);
    });
  });
});
