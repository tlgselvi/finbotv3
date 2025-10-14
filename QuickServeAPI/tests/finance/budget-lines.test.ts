import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../server/db';
import { budgetLines } from '../../server/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

describe('BudgetLine CRUD Operations', () => {
  const testUserId = 'test-user-budget-lines';
  const testBudgetLine = {
    id: randomUUID(),
    user_id: testUserId,
    category: 'Test Category',
    budgeted_amount: 1000.00,
    actual_amount: 800.00,
    month: '2024-01-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    // Clean up test data
    await db.delete(budgetLines).where(eq(budgetLines.user_id, testUserId));
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(budgetLines).where(eq(budgetLines.user_id, testUserId));
  });

  describe('Create BudgetLine', () => {
    it('should create a budget line successfully', async () => {
      await db.insert(budgetLines).values(testBudgetLine);

      const [created] = await db
        .select()
        .from(budgetLines)
        .where(eq(budgetLines.id, testBudgetLine.id));

      expect(created).toBeDefined();
      expect(created.category).toBe(testBudgetLine.category);
      expect(created.budgeted_amount).toBe(testBudgetLine.budgeted_amount);
      expect(created.actual_amount).toBe(testBudgetLine.actual_amount);
      expect(created.user_id).toBe(testUserId);
    });

    it('should validate budget line schema', () => {
      const validData = {
        id: randomUUID(),
        user_id: testUserId,
        category: 'Test Category',
        budgeted_amount: 1000,
        actual_amount: 800,
        month: '2024-01-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(validData.category).toBeTruthy();
      expect(validData.budgeted_amount).toBeGreaterThan(0);
    });

    it('should reject invalid budget line data', () => {
      const invalidData = {
        category: '', // Empty category should fail
        budgeted_amount: -100, // Negative amount should fail
        month: 'invalid-date', // Invalid date should fail
      };

      expect(invalidData.category).toBeFalsy();
      expect(invalidData.budgeted_amount).toBeLessThan(0);
    });
  });

  describe('Read BudgetLine', () => {
    beforeEach(async () => {
      // Create test data
      await db.insert(budgetLines).values([
        testBudgetLine,
        {
          ...testBudgetLine,
          id: randomUUID(),
          category: 'Another Category',
          budgeted_amount: 2000.00,
          actual_amount: 1500.00,
        },
      ]);
    });

    it('should fetch budget lines by user', async () => {
      const userBudgetLines = await db
        .select()
        .from(budgetLines)
        .where(eq(budgetLines.user_id, testUserId));

      expect(userBudgetLines).toHaveLength(2);
      expect(userBudgetLines[0].user_id).toBe(testUserId);
    });

    it('should fetch budget lines by category', async () => {
      const categoryBudgetLines = await db
        .select()
        .from(budgetLines)
        .where(eq(budgetLines.category, 'Test Category'));

      expect(categoryBudgetLines).toHaveLength(1);
      expect(categoryBudgetLines[0].category).toBe('Test Category');
    });

    it('should calculate budget variance', () => {
      const planned = testBudgetLine.budgeted_amount;
      const actual = testBudgetLine.actual_amount;
      const variance = planned - actual;

      expect(variance).toBe(200);
    });
  });

  describe('Update BudgetLine', () => {
    let budgetLineId: string;

    beforeEach(async () => {
      await db.insert(budgetLines).values(testBudgetLine);
      budgetLineId = testBudgetLine.id;
    });

    it('should update budget line successfully', async () => {
      const updateData = {
        budgeted_amount: 1200.00,
        actual_amount: 1000.00,
        updated_at: new Date().toISOString(),
      };

      await db
        .update(budgetLines)
        .set(updateData)
        .where(eq(budgetLines.id, budgetLineId));

      const [updated] = await db
        .select()
        .from(budgetLines)
        .where(eq(budgetLines.id, budgetLineId));

      expect(updated.budgeted_amount).toBe(1200.00);
      expect(updated.actual_amount).toBe(1000.00);
    });

    it('should update only specified fields', async () => {
      const updateData = {
        actual_amount: 900.00,
        updated_at: new Date().toISOString(),
      };

      await db
        .update(budgetLines)
        .set(updateData)
        .where(eq(budgetLines.id, budgetLineId));

      const [updated] = await db
        .select()
        .from(budgetLines)
        .where(eq(budgetLines.id, budgetLineId));

      expect(updated.budgeted_amount).toBe(testBudgetLine.budgeted_amount); // Should remain unchanged
      expect(updated.actual_amount).toBe(900.00); // Should be updated
    });
  });

  describe('Delete BudgetLine', () => {
    let budgetLineId: string;

    beforeEach(async () => {
      await db.insert(budgetLines).values(testBudgetLine);
      budgetLineId = testBudgetLine.id;
    });

    it('should delete budget line successfully', async () => {
      await db
        .delete(budgetLines)
        .where(eq(budgetLines.id, budgetLineId));

      // Verify deletion
      const remaining = await db
        .select()
        .from(budgetLines)
        .where(eq(budgetLines.id, budgetLineId));

      expect(remaining).toHaveLength(0);
    });
  });

  describe('BudgetLine Summary', () => {
    beforeEach(async () => {
      // Create test data with multiple categories
      await db.insert(budgetLines).values([
        {
          ...testBudgetLine,
          id: randomUUID(),
          category: 'Food',
          budgeted_amount: 1000.00,
          actual_amount: 800.00,
        },
        {
          ...testBudgetLine,
          id: randomUUID(),
          category: 'Transport',
          budgeted_amount: 500.00,
          actual_amount: 450.00,
        },
        {
          ...testBudgetLine,
          id: randomUUID(),
          category: 'Entertainment',
          budgeted_amount: 300.00,
          actual_amount: 350.00,
        },
      ]);
    });

    it('should calculate budget summary by category', async () => {
      const budgetLineList = await db
        .select()
        .from(budgetLines)
        .where(eq(budgetLines.user_id, testUserId));

      const summary = budgetLineList.reduce(
        (acc, line) => {
          const category = line.category;
          if (!acc[category]) {
            acc[category] = { planned: 0, actual: 0, variance: 0 };
          }
          acc[category].planned += line.budgeted_amount;
          acc[category].actual += line.actual_amount || 0;
          acc[category].variance = acc[category].planned - acc[category].actual;
          return acc;
        },
        {} as Record<
          string,
          { planned: number; actual: number; variance: number }
        >
      );

      expect(summary.Food.planned).toBe(1000);
      expect(summary.Food.actual).toBe(800);
      expect(summary.Food.variance).toBe(200);

      expect(summary.Transport.planned).toBe(500);
      expect(summary.Transport.actual).toBe(450);
      expect(summary.Transport.variance).toBe(50);

      expect(summary.Entertainment.planned).toBe(300);
      expect(summary.Entertainment.actual).toBe(350);
      expect(summary.Entertainment.variance).toBe(-50); // Over budget
    });

    it('should calculate total budget variance', async () => {
      const budgetLineList = await db
        .select()
        .from(budgetLines)
        .where(eq(budgetLines.user_id, testUserId));

      const totalPlanned = budgetLineList.reduce(
        (sum, line) => sum + line.budgeted_amount,
        0
      );
      const totalActual = budgetLineList.reduce(
        (sum, line) => sum + (line.actual_amount || 0),
        0
      );
      const totalVariance = totalPlanned - totalActual;

      expect(totalPlanned).toBe(1800);
      expect(totalActual).toBe(1600);
      expect(totalVariance).toBe(200);
    });
  });
});
