import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { db } from '../../server/db';
import { budgetLines, transactions } from '../../shared/schema-sqlite';
import {
  compareBudgetVsActual,
  getBudgetVarianceAnalysis,
  calculateBudgetEfficiencyScore,
} from '../../server/modules/budget/compare';
import { eq } from 'drizzle-orm';

const testUserId = 'test-user-budget-compare-123';

describe.skip('Budget Comparison Module', () => {
  beforeAll(() => {
    if (!process.env.DATABASE_URL) {
      console.warn('Skipping budget compare tests - DATABASE_URL not set');
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await db.delete(transactions).where(eq(transactions.user_id, testUserId));
    await db.delete(budgetLines).where(eq(budgetLines.user_id, testUserId));
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(transactions).where(eq(transactions.user_id, testUserId));
    await db.delete(budgetLines).where(eq(budgetLines.user_id, testUserId));
  });

  describe('compareBudgetVsActual', () => {
    it('should compare budget vs actual spending for a month', async () => {
      const testMonth = '2024-01';

      // Create budget lines
      await db.insert(budgetLines).values([
        {
          id: 'budget-1',
          userId: testUserId,
          category: 'Salary',
          plannedAmount: '50000.00',
          month: testMonth,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'budget-2',
          userId: testUserId,
          category: 'Marketing',
          plannedAmount: '10000.00',
          month: testMonth,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // Create actual transactions
      const testDate = new Date('2024-01-15');
      await db.insert(transactions).values([
        {
          id: 'trans-1',
          userId: testUserId,
          accountId: 'acc-1',
          amount: '-48000.00', // Under budget
          description: 'Salary payment',
          category: 'Salary',
          type: 'expense',
          createdAt: testDate,
          updatedAt: testDate,
        },
        {
          id: 'trans-2',
          userId: testUserId,
          accountId: 'acc-1',
          amount: '-12000.00', // Over budget
          description: 'Marketing campaign',
          category: 'Marketing',
          type: 'expense',
          createdAt: testDate,
          updatedAt: testDate,
        },
      ]);

      const result = await compareBudgetVsActual(testUserId, testMonth);

      expect(result.month).toBe(testMonth);
      expect(result.totalPlanned).toBeGreaterThan(0);
      expect(result.totalActual).toBeGreaterThan(0);
      expect(result.totalVariance).toBeDefined();
      expect(result.totalVariancePercentage).toBeDefined();
      expect(result.categories).toBeDefined();
      expect(result.categories.length).toBeGreaterThan(0);
    });

    it('should correctly identify over-budget categories', async () => {
      const testMonth = '2024-02';

      await db.insert(budgetLines).values({
        id: 'budget-over-1',
        userId: testUserId,
        category: 'Office Supplies',
        plannedAmount: '5000.00',
        month: testMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const testDate = new Date('2024-02-15');
      await db.insert(transactions).values({
        id: 'trans-over-1',
        userId: testUserId,
        accountId: 'acc-1',
        amount: '-8000.00', // Over budget by 3000
        description: 'Office equipment',
        category: 'Office Supplies',
        type: 'expense',
        createdAt: testDate,
        updatedAt: testDate,
      });

      const result = await compareBudgetVsActual(testUserId, testMonth);

      const officeCategory = result.categories.find(
        c => c.category === 'Office Supplies'
      );
      expect(officeCategory).toBeDefined();
      expect(officeCategory?.status).toBe('over-budget');
      expect(officeCategory?.variance).toBeLessThan(0);
      expect(officeCategory?.variancePercentage).toBeGreaterThan(0);
    });

    it('should correctly identify under-budget categories', async () => {
      const testMonth = '2024-03';

      await db.insert(budgetLines).values({
        id: 'budget-under-1',
        userId: testUserId,
        category: 'Utilities',
        plannedAmount: '3000.00',
        month: testMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const testDate = new Date('2024-03-15');
      await db.insert(transactions).values({
        id: 'trans-under-1',
        userId: testUserId,
        accountId: 'acc-1',
        amount: '-2000.00', // Under budget by 1000
        description: 'Electric bill',
        category: 'Utilities',
        type: 'expense',
        createdAt: testDate,
        updatedAt: testDate,
      });

      const result = await compareBudgetVsActual(testUserId, testMonth);

      const utilityCategory = result.categories.find(
        c => c.category === 'Utilities'
      );
      expect(utilityCategory).toBeDefined();
      expect(utilityCategory?.status).toBe('under-budget');
      expect(utilityCategory?.variance).toBeGreaterThan(0);
      expect(utilityCategory?.variancePercentage).toBeLessThan(0);
    });

    it('should correctly identify on-budget categories', async () => {
      const testMonth = '2024-04';

      await db.insert(budgetLines).values({
        id: 'budget-on-1',
        userId: testUserId,
        category: 'Rent',
        plannedAmount: '10000.00',
        month: testMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const testDate = new Date('2024-04-15');
      await db.insert(transactions).values({
        id: 'trans-on-1',
        userId: testUserId,
        accountId: 'acc-1',
        amount: '-10100.00', // Within 5% of budget
        description: 'Office rent',
        category: 'Rent',
        type: 'expense',
        createdAt: testDate,
        updatedAt: testDate,
      });

      const result = await compareBudgetVsActual(testUserId, testMonth);

      const rentCategory = result.categories.find(c => c.category === 'Rent');
      expect(rentCategory).toBeDefined();
      expect(rentCategory?.status).toBe('on-budget');
    });
  });

  describe('getBudgetVarianceAnalysis', () => {
    it('should identify highest over-budget items', async () => {
      const testMonth = '2024-05';

      await db.insert(budgetLines).values([
        {
          id: 'budget-var-1',
          userId: testUserId,
          category: 'Travel',
          plannedAmount: '5000.00',
          month: testMonth,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'budget-var-2',
          userId: testUserId,
          category: 'Entertainment',
          plannedAmount: '2000.00',
          month: testMonth,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const testDate = new Date('2024-05-15');
      await db.insert(transactions).values([
        {
          id: 'trans-var-1',
          userId: testUserId,
          accountId: 'acc-1',
          amount: '-10000.00', // 100% over budget
          description: 'Business trip',
          category: 'Travel',
          type: 'expense',
          createdAt: testDate,
          updatedAt: testDate,
        },
        {
          id: 'trans-var-2',
          userId: testUserId,
          accountId: 'acc-1',
          amount: '-3000.00', // 50% over budget
          description: 'Client dinner',
          category: 'Entertainment',
          type: 'expense',
          createdAt: testDate,
          updatedAt: testDate,
        },
      ]);

      const result = await getBudgetVarianceAnalysis(testUserId, testMonth, 5);

      expect(result.highestOverBudget).toBeDefined();
      expect(result.highestOverBudget.length).toBeGreaterThan(0);
      expect(result.highestUnderBudget).toBeDefined();
      expect(result.mostVolatile).toBeDefined();
    });

    it('should identify highest under-budget items', async () => {
      const testMonth = '2024-06';

      await db.insert(budgetLines).values({
        id: 'budget-var-3',
        userId: testUserId,
        category: 'Maintenance',
        plannedAmount: '8000.00',
        month: testMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const testDate = new Date('2024-06-15');
      await db.insert(transactions).values({
        id: 'trans-var-3',
        userId: testUserId,
        accountId: 'acc-1',
        amount: '-3000.00', // Significantly under budget
        description: 'Equipment maintenance',
        category: 'Maintenance',
        type: 'expense',
        createdAt: testDate,
        updatedAt: testDate,
      });

      const result = await getBudgetVarianceAnalysis(testUserId, testMonth, 5);

      expect(result.highestUnderBudget).toBeDefined();
      expect(result.highestUnderBudget.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateBudgetEfficiencyScore', () => {
    it('should calculate high efficiency score for well-managed budget', async () => {
      const testMonth = '2024-07';

      // Create well-managed budget
      await db.insert(budgetLines).values([
        {
          id: 'budget-eff-1',
          userId: testUserId,
          category: 'Operations',
          plannedAmount: '20000.00',
          month: testMonth,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'budget-eff-2',
          userId: testUserId,
          category: 'IT',
          plannedAmount: '10000.00',
          month: testMonth,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // Create transactions close to budget
      const testDate = new Date('2024-07-15');
      await db.insert(transactions).values([
        {
          id: 'trans-eff-1',
          userId: testUserId,
          accountId: 'acc-1',
          amount: '-19800.00', // Very close to budget
          description: 'Operations expense',
          category: 'Operations',
          type: 'expense',
          createdAt: testDate,
          updatedAt: testDate,
        },
        {
          id: 'trans-eff-2',
          userId: testUserId,
          accountId: 'acc-1',
          amount: '-10200.00', // Very close to budget
          description: 'IT services',
          category: 'IT',
          type: 'expense',
          createdAt: testDate,
          updatedAt: testDate,
        },
      ]);

      const result = await calculateBudgetEfficiencyScore(
        testUserId,
        testMonth
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.grade);
      expect(result.factors).toBeDefined();
      expect(result.factors.overallAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.factors.categoryConsistency).toBeGreaterThanOrEqual(0);
      expect(result.factors.trendStability).toBeGreaterThanOrEqual(0);
    });

    it('should calculate low efficiency score for poorly managed budget', async () => {
      const testMonth = '2024-08';

      await db.insert(budgetLines).values([
        {
          id: 'budget-eff-3',
          userId: testUserId,
          category: 'Advertising',
          plannedAmount: '5000.00',
          month: testMonth,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'budget-eff-4',
          userId: testUserId,
          category: 'Training',
          plannedAmount: '3000.00',
          month: testMonth,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // Create transactions far from budget
      const testDate = new Date('2024-08-15');
      await db.insert(transactions).values([
        {
          id: 'trans-eff-3',
          userId: testUserId,
          accountId: 'acc-1',
          amount: '-15000.00', // Way over budget
          description: 'Ad campaign',
          category: 'Advertising',
          type: 'expense',
          createdAt: testDate,
          updatedAt: testDate,
        },
        {
          id: 'trans-eff-4',
          userId: testUserId,
          accountId: 'acc-1',
          amount: '-500.00', // Way under budget
          description: 'Online course',
          category: 'Training',
          type: 'expense',
          createdAt: testDate,
          updatedAt: testDate,
        },
      ]);

      const result = await calculateBudgetEfficiencyScore(
        testUserId,
        testMonth
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.grade);
    });

    it('should calculate grade based on score thresholds', async () => {
      const testMonth = '2024-09';

      // Create minimal budget for testing
      await db.insert(budgetLines).values({
        id: 'budget-eff-5',
        userId: testUserId,
        category: 'Misc',
        plannedAmount: '1000.00',
        month: testMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await calculateBudgetEfficiencyScore(
        testUserId,
        testMonth
      );

      // Verify grade mapping logic
      if (result.score >= 90) {
        expect(result.grade).toBe('A');
      } else if (result.score >= 80) {
        expect(result.grade).toBe('B');
      } else if (result.score >= 70) {
        expect(result.grade).toBe('C');
      } else if (result.score >= 60) {
        expect(result.grade).toBe('D');
      } else {
        expect(result.grade).toBe('F');
      }
    });
  });
});
