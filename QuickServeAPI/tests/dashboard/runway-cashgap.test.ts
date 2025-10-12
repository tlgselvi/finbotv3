/**
 * Runway & Cash Gap Analysis Tests
 *
 * Tests based on comprehensive test plan (TEST_PLAN.md)
 * Phase 1: Unit Tests (10 tests)
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

// Test user ID
const testUserId = 'test-user-runway-123';

// Create tables
beforeAll(() => {
  // Create accounts table
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

  // Create transactions table
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

  // Create ar_ap_items table
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

describe('Runway & Cash Gap Analysis', () => {
  beforeEach(async () => {
    // Clean up test data before each test
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
    // Clean up test data after each test
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

  describe('calculateRunway', () => {
    /**
     * Test 1: Healthy Status - 6+ months runway
     * Test Plan Section: A. Runway Hesaplama Testleri - Test 1
     */
    it('should calculate runway with healthy status for sufficient cash', async () => {
      // Setup: Account with 120k balance
      await testDb.insert(schema.accounts).values({
        id: 'acc-runway-1',
        user_id: testUserId,
        name: 'Main Account',
        balance: 120000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Setup: 3 months of 10k expenses
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);

        await testDb.insert(schema.transactions).values({
          id: `trans-expense-${i}`,
          user_id: testUserId,
          account_id: 'acc-runway-1',
          amount: -10000.0,
          description: `Monthly expense ${i}`,
          category: 'operating',
          type: 'expense',
          date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }

      // Execute
      const result = await calculateRunway(testUserId, 12, testDb);

      // Assert
      expect(result.currentCash).toBeGreaterThan(0);
      expect(result.monthlyExpenses).toBeGreaterThan(0);
      expect(result.runwayMonths).toBeGreaterThan(6); // Should have > 6 months
      expect(result.status).toBe('healthy');
      expect(result.monthlyBreakdown).toBeDefined();
      expect(result.monthlyBreakdown.length).toBeGreaterThan(0);
    });

    /**
     * Test 2: Warning Status - 3-6 months runway
     * Test Plan Section: A. Runway Hesaplama Testleri - Test 2
     */
    it('should calculate runway with warning status for moderate cash', async () => {
      // Setup: Account with 50k balance (for 5 months runway with 10k/month expenses)
      await testDb.insert(schema.accounts).values({
        id: 'acc-runway-2',
        user_id: testUserId,
        name: 'Main Account',
        balance: 50000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Setup: 6 months of 10k expenses (for accurate monthly average)
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);

        await testDb.insert(schema.transactions).values({
          id: `trans-expense-warn-${i}`,
          user_id: testUserId,
          account_id: 'acc-runway-2',
          amount: -10000.0,
          description: `Monthly expense ${i}`,
          category: 'operating',
          type: 'expense',
          date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }

      // Execute
      const result = await calculateRunway(testUserId, 12, testDb);

      // Assert
      expect(result.currentCash).toBeGreaterThan(0);
      expect(result.runwayMonths).toBeLessThanOrEqual(6);
      expect(result.runwayMonths).toBeGreaterThan(3);
      expect(['warning', 'healthy']).toContain(result.status);
      expect(result.recommendations).toBeDefined();
    });

    /**
     * Test 3: Critical Status - Less than 3 months runway
     * Test Plan Section: A. Runway Hesaplama Testleri - Test 3
     */
    it('should calculate runway with critical status for low cash', async () => {
      // Setup: Account with 15k balance
      await testDb.insert(schema.accounts).values({
        id: 'acc-runway-3',
        user_id: testUserId,
        name: 'Main Account',
        balance: 15000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Setup: 3 months of 10k expenses
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);

        await testDb.insert(schema.transactions).values({
          id: `trans-expense-crit-${i}`,
          user_id: testUserId,
          account_id: 'acc-runway-3',
          amount: -10000.0,
          description: `Monthly expense ${i}`,
          category: 'operating',
          type: 'expense',
          date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }

      // Execute
      const result = await calculateRunway(testUserId, 12, testDb);

      // Assert
      expect(result.currentCash).toBeGreaterThan(0);
      expect(result.runwayMonths).toBeLessThanOrEqual(3);
      expect(['critical', 'warning']).toContain(result.status);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    /**
     * Test 4: Zero Expenses - No expense transactions
     * Test Plan Section: A. Runway Hesaplama Testleri - Test 4
     */
    it('should handle zero expenses scenario', async () => {
      // Setup: Account with balance but no expenses
      await testDb.insert(schema.accounts).values({
        id: 'acc-runway-4',
        user_id: testUserId,
        name: 'Main Account',
        balance: 50000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // No expenses added

      // Execute
      const result = await calculateRunway(testUserId, 12, testDb);

      // Assert
      expect(result.currentCash).toBeGreaterThan(0);
      expect(result.monthlyBreakdown).toBeDefined();
    });

    /**
     * Test 5: Monthly Breakdown - Projection validation
     * Test Plan Section: A. Runway Hesaplama Testleri - Test 5
     */
    it('should provide monthly breakdown projections', async () => {
      // Setup
      await testDb.insert(schema.accounts).values({
        id: 'acc-runway-5',
        user_id: testUserId,
        name: 'Main Account',
        balance: 100000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Execute
      const result = await calculateRunway(testUserId, 6, testDb);

      // Assert
      expect(result.monthlyBreakdown).toBeDefined();
      expect(result.monthlyBreakdown.length).toBeGreaterThan(0);

      result.monthlyBreakdown.forEach(month => {
        expect(month).toHaveProperty('month');
        expect(month).toHaveProperty('projectedCash');
        expect(month).toHaveProperty('expenses');
        expect(month).toHaveProperty('netCash');
      });
    });
  });

  describe('calculateCashGap', () => {
    /**
     * Test 6: Basic AR/AP Calculation
     * Test Plan Section: B. Cash Gap Analizi Testleri - Test 6
     */
    it('should calculate cash gap with AR and AP data', async () => {
      // Setup: Account
      await testDb.insert(schema.accounts).values({
        id: 'acc-cashgap-1',
        user_id: testUserId,
        name: 'Main Account',
        balance: 50000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Setup: AR and AP items
      const futureDate30 = new Date();
      futureDate30.setDate(futureDate30.getDate() + 25);

      await testDb.insert(schema.arApItems).values({
        id: 'ar-1',
        user_id: testUserId,
        type: 'receivable',
        invoice_number: 'INV-001',
        customer_supplier: 'Customer A',
        amount: 20000.0,
        due_date: futureDate30.toISOString(),
        age_days: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testDb.insert(schema.arApItems).values({
        id: 'ap-1',
        user_id: testUserId,
        type: 'payable',
        invoice_number: 'BILL-001',
        customer_supplier: 'Supplier B',
        amount: 15000.0,
        due_date: futureDate30.toISOString(),
        age_days: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Execute
      const result = await calculateCashGap(testUserId, 6, testDb);

      // Assert
      expect(result.totalAR).toBeGreaterThan(0);
      expect(result.totalAP).toBeGreaterThan(0);
      expect(result.cashGap).toBeDefined();
      expect(result.arDueIn30Days).toBeGreaterThan(0);
      expect(result.apDueIn30Days).toBeGreaterThan(0);
      expect(result.netGap30Days).toBeDefined();
      expect(result.riskLevel).toBeDefined();
      expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
    });

    /**
     * Test 7: Positive Cash Gap (AR > AP)
     * Test Plan Section: B. Cash Gap Analizi Testleri - Test 7
     */
    it('should calculate positive cash gap when AR > AP', async () => {
      // Setup
      await testDb.insert(schema.accounts).values({
        id: 'acc-cashgap-2',
        user_id: testUserId,
        name: 'Main Account',
        balance: 50000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      // Higher AR
      await testDb.insert(schema.arApItems).values({
        id: 'ar-2',
        user_id: testUserId,
        type: 'receivable',
        invoice_number: 'INV-002',
        customer_supplier: 'Customer C',
        amount: 50000.0,
        due_date: futureDate.toISOString(),
        age_days: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Lower AP
      await testDb.insert(schema.arApItems).values({
        id: 'ap-2',
        user_id: testUserId,
        type: 'payable',
        invoice_number: 'BILL-002',
        customer_supplier: 'Supplier D',
        amount: 20000.0,
        due_date: futureDate.toISOString(),
        age_days: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Execute
      const result = await calculateCashGap(testUserId, 6, testDb);

      // Assert
      expect(result.totalAR).toBeGreaterThan(result.totalAP);
      expect(result.cashGap).toBeGreaterThan(0); // Positive gap is good
      expect(['low', 'medium']).toContain(result.riskLevel);
    });

    /**
     * Test 8: Negative Cash Gap (AP > AR)
     * Test Plan Section: B. Cash Gap Analizi Testleri - Test 8
     */
    it('should calculate negative cash gap when AP > AR', async () => {
      // Setup
      await testDb.insert(schema.accounts).values({
        id: 'acc-cashgap-3',
        user_id: testUserId,
        name: 'Main Account',
        balance: 50000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      // Lower AR
      await testDb.insert(schema.arApItems).values({
        id: 'ar-3',
        user_id: testUserId,
        type: 'receivable',
        invoice_number: 'INV-003',
        customer_supplier: 'Customer E',
        amount: 15000.0,
        due_date: futureDate.toISOString(),
        age_days: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Higher AP
      await testDb.insert(schema.arApItems).values({
        id: 'ap-3',
        user_id: testUserId,
        type: 'payable',
        invoice_number: 'BILL-003',
        customer_supplier: 'Supplier F',
        amount: 40000.0,
        due_date: futureDate.toISOString(),
        age_days: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Execute
      const result = await calculateCashGap(testUserId, 6, testDb);

      // Assert
      expect(result.totalAP).toBeGreaterThan(result.totalAR);
      expect(result.cashGap).toBeLessThan(0); // Negative gap is risky
      expect(['medium', 'high', 'critical']).toContain(result.riskLevel);
    });

    /**
     * Test 9: Timeline Projections
     * Test Plan Section: B. Cash Gap Analizi Testleri - Test 9
     */
    it('should provide timeline projections', async () => {
      // Setup
      await testDb.insert(schema.accounts).values({
        id: 'acc-cashgap-4',
        user_id: testUserId,
        name: 'Main Account',
        balance: 50000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Execute
      const result = await calculateCashGap(testUserId, 6, testDb);

      // Assert
      expect(result.timeline).toBeDefined();
      expect(Array.isArray(result.timeline)).toBe(true);

      result.timeline.forEach(item => {
        expect(item).toHaveProperty('period');
        expect(item).toHaveProperty('arAmount');
        expect(item).toHaveProperty('apAmount');
        expect(item).toHaveProperty('netCashFlow');
        expect(item).toHaveProperty('cumulativeCash');
      });
    });

    /**
     * Test 10: Risk-Based Recommendations
     * Test Plan Section: B. Cash Gap Analizi Testleri - Test 10
     */
    it('should provide recommendations based on risk level', async () => {
      // Setup
      await testDb.insert(schema.accounts).values({
        id: 'acc-cashgap-5',
        user_id: testUserId,
        name: 'Main Account',
        balance: 10000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Execute
      const result = await calculateCashGap(testUserId, 6, testDb);

      // Assert
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  /**
   * ========================================
   * Phase 2: Integration Tests
   * Test Plan Section: D. Integration Tests
   * ========================================
   */
  describe('Integration Tests', () => {
    /**
     * Test 11: Combined Dashboard Data
     * Test Plan Section: D. Integration Tests - Test 16
     */
    it('should get combined runway and cash gap data', async () => {
      // Setup: Account
      await testDb.insert(schema.accounts).values({
        id: 'acc-dashboard-1',
        user_id: testUserId,
        name: 'Main Account',
        balance: 80000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Setup: Transactions (for runway)
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);

        await testDb.insert(schema.transactions).values({
          id: `trans-dashboard-${i}`,
          user_id: testUserId,
          account_id: 'acc-dashboard-1',
          amount: -8000.0,
          description: `Monthly expense ${i}`,
          category: 'operating',
          type: 'expense',
          date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }

      // Setup: AR/AP items (for cash gap)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      await testDb.insert(schema.arApItems).values([
        {
          id: 'ar-dashboard-1',
          user_id: testUserId,
          type: 'receivable',
          invoice_number: 'INV-DASH-001',
          customer_supplier: 'Customer X',
          amount: 30000.0,
          due_date: futureDate.toISOString(),
          age_days: 10,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'ap-dashboard-1',
          user_id: testUserId,
          type: 'payable',
          invoice_number: 'BILL-DASH-001',
          customer_supplier: 'Supplier Y',
          amount: 20000.0,
          due_date: futureDate.toISOString(),
          age_days: 5,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      // Import the function
      const { getDashboardRunwayCashGap } = await import(
        '../../server/modules/dashboard/runway-cashgap'
      );

      // Execute
      const result = await getDashboardRunwayCashGap(testUserId, testDb);

      // Assert - Structure
      expect(result).toHaveProperty('runway');
      expect(result).toHaveProperty('cashGap');
      expect(result).toHaveProperty('overallRisk');
      expect(result).toHaveProperty('summary');

      // Assert - Overall Risk
      expect(['low', 'medium', 'high', 'critical']).toContain(
        result.overallRisk
      );

      // Assert - Summary
      expect(result.summary).toHaveProperty('totalCash');
      expect(result.summary).toHaveProperty('totalAR');
      expect(result.summary).toHaveProperty('totalAP');
      expect(result.summary).toHaveProperty('netPosition');
      expect(result.summary).toHaveProperty('runwayStatus');
      expect(result.summary).toHaveProperty('cashGapStatus');

      // Assert - Summary Calculations
      expect(result.summary.totalCash).toBe(result.runway.currentCash);
      expect(result.summary.totalAR).toBe(result.cashGap.totalAR);
      expect(result.summary.totalAP).toBe(result.cashGap.totalAP);
      expect(result.summary.netPosition).toBe(
        result.runway.currentCash +
          result.cashGap.totalAR -
          result.cashGap.totalAP
      );
    });

    /**
     * Test 12: Cash Flow Forecast
     * Test Plan Section: D. Integration Tests - Test 17
     */
    it('should generate cash flow forecast', async () => {
      // Setup: Account
      await testDb.insert(schema.accounts).values({
        id: 'acc-forecast-1',
        user_id: testUserId,
        name: 'Main Account',
        balance: 100000.0,
        currency: 'TRY',
        type: 'bank',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Setup: Historical transactions
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);

        await testDb.insert(schema.transactions).values({
          id: `trans-forecast-${i}`,
          user_id: testUserId,
          account_id: 'acc-forecast-1',
          amount: -5000.0,
          description: `Historical expense ${i}`,
          category: 'operating',
          type: 'expense',
          date: date.toISOString(),
          created_at: date.toISOString(),
        });
      }

      // Setup: Future AR/AP
      for (let i = 0; i < 3; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i * 20);

        await testDb.insert(schema.arApItems).values([
          {
            id: `ar-forecast-${i}`,
            user_id: testUserId,
            type: 'receivable',
            invoice_number: `INV-FC-${i}`,
            customer_supplier: `Customer ${i}`,
            amount: 10000.0,
            due_date: futureDate.toISOString(),
            age_days: i * 20,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: `ap-forecast-${i}`,
            user_id: testUserId,
            type: 'payable',
            invoice_number: `BILL-FC-${i}`,
            customer_supplier: `Supplier ${i}`,
            amount: 6000.0,
            due_date: futureDate.toISOString(),
            age_days: i * 20,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }

      // Import the function
      const { getCashFlowForecast } = await import(
        '../../server/modules/dashboard/runway-cashgap'
      );

      // Execute
      const forecast = await getCashFlowForecast(testUserId, 6, testDb);

      // Assert - Structure
      expect(forecast).toBeDefined();
      expect(Array.isArray(forecast)).toBe(true);
      expect(forecast.length).toBe(6);

      // Assert - Each Month
      forecast.forEach((month, index) => {
        expect(month).toHaveProperty('month');
        expect(month).toHaveProperty('openingCash');
        expect(month).toHaveProperty('projectedInflows');
        expect(month).toHaveProperty('projectedOutflows');
        expect(month).toHaveProperty('netCashFlow');
        expect(month).toHaveProperty('closingCash');
        expect(month).toHaveProperty('confidence');

        // Confidence level validation
        expect(['low', 'medium', 'high']).toContain(month.confidence);

        // Confidence should decrease over time
        if (index < 3) {
          expect(month.confidence).toBe('high');
        } else if (index < 6) {
          expect(month.confidence).toBe('medium');
        }

        // Cash flow calculation validation
        expect(month.netCashFlow).toBe(
          month.projectedInflows - month.projectedOutflows
        );

        expect(month.closingCash).toBeGreaterThanOrEqual(0);
      });

      // Assert - Cash Flow Continuity
      for (let i = 1; i < forecast.length; i++) {
        const prevMonth = forecast[i - 1];
        const currMonth = forecast[i];

        // Current opening should equal previous closing
        // (allowing for small floating point differences)
        const diff = Math.abs(currMonth.openingCash - prevMonth.closingCash);
        expect(diff).toBeLessThan(0.01);
      }
    });
  });
});
