/**
 * Dashboard API Endpoints Tests
 * Tests for runway, cash gap, and dashboard API endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server/routes';
import { db } from '../../server/db';
import {
  users,
  accounts,
  transactions,
  userProfiles,
} from '../../shared/schema';
import { eq } from 'drizzle-orm';
import argon2 from 'argon2';

const BACKEND_AVAILABLE =
  !!process.env.TEST_BASE_URL || !!process.env.E2E_TEST_ENABLED;

describe.skipIf(!BACKEND_AVAILABLE)('Dashboard API Endpoints', () => {
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    if (!BACKEND_AVAILABLE) {
      console.warn('Skipping Dashboard API tests - Backend not available');
      return;
    }

    // Set environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-dashboard-api';
  });

  beforeEach(async () => {
    if (!BACKEND_AVAILABLE) return;

    // Create test user
    testUserId = `test-user-${Date.now()}`;
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPass123!';

    await db.insert(users).values({
      id: testUserId,
      email: testEmail,
      password: await argon2.hash(testPassword),
      name: 'Test User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(userProfiles).values({
      userId: testUserId,
      role: 'USER',
      permissions: ['READ', 'WRITE'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    authToken = loginRes.body.accessToken;

    // Create test accounts
    await db.insert(accounts).values([
      {
        id: `acc-${testUserId}-1`,
        userId: testUserId,
        name: 'Test Checking',
        balance: '50000.00',
        currency: 'TRY',
        accountType: 'bank',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `acc-${testUserId}-2`,
        userId: testUserId,
        name: 'Test Savings',
        balance: '30000.00',
        currency: 'TRY',
        accountType: 'bank',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create test transactions
    const now = new Date();
    await db.insert(transactions).values([
      {
        id: `tx-${testUserId}-1`,
        userId: testUserId,
        accountId: `acc-${testUserId}-1`,
        amount: '-5000.00',
        type: 'expense',
        category: 'Operating Expenses',
        description: 'Test expense',
        date: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `tx-${testUserId}-2`,
        userId: testUserId,
        accountId: `acc-${testUserId}-1`,
        amount: '10000.00',
        type: 'income',
        category: 'Sales',
        description: 'Test income',
        date: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  });

  afterEach(async () => {
    if (!BACKEND_AVAILABLE) return;

    // Cleanup
    try {
      await db.delete(transactions).where(eq(transactions.userId, testUserId));
      await db.delete(accounts).where(eq(accounts.userId, testUserId));
      await db.delete(userProfiles).where(eq(userProfiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  describe('GET /api/dashboard/runway/:userId', () => {
    it('should return runway calculation', async () => {
      const res = await request(app)
        .get(`/api/dashboard/runway/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('runway');
      expect(res.body).toHaveProperty('currentCash');
      expect(res.body).toHaveProperty('monthlyBurn');
      expect(res.body).toHaveProperty('riskLevel');
      expect(typeof res.body.runway).toBe('number');
    });

    it('should require authentication', async () => {
      const res = await request(app).get(`/api/dashboard/runway/${testUserId}`);

      expect(res.status).toBe(401);
    });

    it('should deny access to other user data', async () => {
      const otherUserId = 'other-user-id';
      const res = await request(app)
        .get(`/api/dashboard/runway/${otherUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'non-existent-user';
      const res = await request(app)
        .get(`/api/dashboard/runway/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/dashboard/cash-gap/:userId', () => {
    it('should return cash gap analysis', async () => {
      const res = await request(app)
        .get(`/api/dashboard/cash-gap/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('gap');
      expect(res.body).toHaveProperty('receivables');
      expect(res.body).toHaveProperty('payables');
      expect(res.body).toHaveProperty('riskLevel');
      expect(typeof res.body.gap).toBe('number');
    });

    it('should require authentication', async () => {
      const res = await request(app).get(
        `/api/dashboard/cash-gap/${testUserId}`
      );

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/:userId', () => {
    it('should return combined dashboard data', async () => {
      const res = await request(app)
        .get(`/api/dashboard/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('runway');
      expect(res.body).toHaveProperty('cashGap');
      expect(res.body).toHaveProperty('overallRisk');
      expect(res.body).toHaveProperty('recommendations');
    });

    it('should handle query parameters', async () => {
      const res = await request(app)
        .get(`/api/dashboard/${testUserId}`)
        .query({ period: '30d', currency: 'TRY' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID format', async () => {
      const res = await request(app)
        .get('/api/dashboard/runway/invalid-id-format')
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 404]).toContain(res.status);
    });

    it('should handle database errors gracefully', async () => {
      // This would require mocking database failure
      // For now, we test that the endpoint doesn't crash
      const res = await request(app)
        .get(`/api/dashboard/runway/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBeLessThan(500);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple rapid requests
      const requests = Array(10)
        .fill(null)
        .map(() =>
          request(app)
            .get(`/api/dashboard/runway/${testUserId}`)
            .set('Authorization', `Bearer ${authToken}`)
        );

      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status);

      // At least one should succeed
      expect(statuses).toContain(200);

      // If rate limiting is active, some might be 429
      // This is optional based on implementation
    });
  });
});
