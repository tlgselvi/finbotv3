/**
 * Test Fixtures for Runway & Cash Gap Analysis
 * 
 * Provides factory functions and scenario builders for creating test data
 */

export const createTestAccount = (overrides: Partial<any> = {}) => ({
  id: `acc-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  user_id: 'test-user-123',
  name: 'Test Account',
  balance: 50000.00,
  currency: 'TRY',
  type: 'bank',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createTestTransaction = (overrides: Partial<any> = {}) => ({
  id: `trans-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  user_id: 'test-user-123',
  account_id: 'acc-test-1',
  amount: -1000.00,
  type: 'expense',
  category: 'operating',
  description: 'Test expense',
  date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createTestARItem = (overrides: Partial<any> = {}) => ({
  id: `ar-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  user_id: 'test-user-123',
  type: 'receivable',
  invoice_number: `INV-TEST-${Date.now()}`,
  customer_supplier: 'Test Customer',
  amount: 10000.00,
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  age_days: 0,
  status: 'pending',
  currency: 'TRY',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createTestAPItem = (overrides: Partial<any> = {}) => ({
  ...createTestARItem(),
  id: `ap-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'payable',
  invoice_number: `BILL-TEST-${Date.now()}`,
  customer_supplier: 'Test Supplier',
  ...overrides,
});

/**
 * Scenario Builders - Create complete test scenarios
 */

export interface ScenarioBuilder {
  createHealthyScenario: (db: any, userId: string) => Promise<void>;
  createWarningScenario: (db: any, userId: string) => Promise<void>;
  createCriticalScenario: (db: any, userId: string) => Promise<void>;
  createPositiveCashGapScenario: (db: any, userId: string) => Promise<void>;
  createNegativeCashGapScenario: (db: any, userId: string) => Promise<void>;
}

export const createHealthyScenario = async (db: any, userId: string, accountId: string) => {
  await db.insert(db.schema.accounts).values(
    createTestAccount({ 
      id: accountId,
      user_id: userId, 
      balance: 120000 
    })
  );
  
  // Add 3 months of consistent expenses (~10k per month)
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    await db.insert(db.schema.transactions).values(
      createTestTransaction({
        id: `trans-healthy-${userId}-${i}`,
        user_id: userId,
        account_id: accountId,
        amount: -10000,
        date: date.toISOString(),
        created_at: date.toISOString(),
      })
    );
  }
};

export const createWarningScenario = async (db: any, userId: string, accountId: string) => {
  await db.insert(db.schema.accounts).values(
    createTestAccount({ 
      id: accountId,
      user_id: userId, 
      balance: 40000 
    })
  );
  
  // Add 3 months of expenses (~10k per month)
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    await db.insert(db.schema.transactions).values(
      createTestTransaction({
        id: `trans-warning-${userId}-${i}`,
        user_id: userId,
        account_id: accountId,
        amount: -10000,
        date: date.toISOString(),
        created_at: date.toISOString(),
      })
    );
  }
};

export const createCriticalScenario = async (db: any, userId: string, accountId: string) => {
  await db.insert(db.schema.accounts).values(
    createTestAccount({ 
      id: accountId,
      user_id: userId, 
      balance: 15000 
    })
  );
  
  // Add high expenses
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    await db.insert(db.schema.transactions).values(
      createTestTransaction({
        id: `trans-critical-${userId}-${i}`,
        user_id: userId,
        account_id: accountId,
        amount: -10000,
        date: date.toISOString(),
        created_at: date.toISOString(),
      })
    );
  }
};

export const createPositiveCashGapScenario = async (db: any, userId: string, accountId: string) => {
  await db.insert(db.schema.accounts).values(
    createTestAccount({ 
      id: accountId,
      user_id: userId, 
      balance: 50000 
    })
  );
  
  // AR > AP (Positive gap)
  await db.insert(db.schema.arApItems).values([
    createTestARItem({ 
      id: `ar-pos-${userId}-1`,
      user_id: userId, 
      amount: 50000,
      age_days: 15
    }),
    createTestAPItem({ 
      id: `ap-pos-${userId}-1`,
      user_id: userId, 
      amount: 20000,
      age_days: 10
    }),
  ]);
};

export const createNegativeCashGapScenario = async (db: any, userId: string, accountId: string) => {
  await db.insert(db.schema.accounts).values(
    createTestAccount({ 
      id: accountId,
      user_id: userId, 
      balance: 50000 
    })
  );
  
  // AP > AR (Negative gap - risky)
  await db.insert(db.schema.arApItems).values([
    createTestARItem({ 
      id: `ar-neg-${userId}-1`,
      user_id: userId, 
      amount: 15000,
      age_days: 20
    }),
    createTestAPItem({ 
      id: `ap-neg-${userId}-1`,
      user_id: userId, 
      amount: 40000,
      age_days: 15
    }),
  ]);
};

/**
 * Cleanup helper
 */
export const cleanupTestData = async (db: any, userId: string) => {
  await db.delete(db.schema.transactions).where(db.eq(db.schema.transactions.user_id, userId));
  await db.delete(db.schema.accounts).where(db.eq(db.schema.accounts.user_id, userId));
  await db.delete(db.schema.arApItems).where(db.eq(db.schema.arApItems.user_id, userId));
};

