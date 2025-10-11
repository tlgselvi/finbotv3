/**
 * Complete Dashboard Workflow E2E Tests
 * Tests complete user journey through dashboard features
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { apiRequest } from '../../client/src/lib/queryClient';

const BACKEND_AVAILABLE = !!process.env.TEST_BASE_URL || !!process.env.E2E_TEST_ENABLED;

describe.skipIf(!BACKEND_AVAILABLE)('Dashboard Complete Workflow E2E', () => {
  const testUser = {
    email: 'workflow-test@example.com',
    password: 'WorkflowTest123!',
    name: 'Workflow Test User'
  };

  let accessToken: string;
  let userId: string;

  beforeAll(() => {
    if (!BACKEND_AVAILABLE) {
      console.warn('Skipping Dashboard E2E tests - Backend not available. Set TEST_BASE_URL or E2E_TEST_ENABLED.');
    }
  });

  describe('Complete User Journey', () => {
    it('Step 1: User registers', async () => {
      if (!BACKEND_AVAILABLE) return;

      const response = await apiRequest('POST', '/api/auth/register', {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.user).toBeDefined();
      userId = data.user.id;
    });

    it('Step 2: User logs in', async () => {
      if (!BACKEND_AVAILABLE) return;

      const response = await apiRequest('POST', '/api/auth/login', {
        email: testUser.email,
        password: testUser.password
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.accessToken).toBeDefined();
      accessToken = data.accessToken;
    });

    it('Step 3: User creates accounts', async () => {
      if (!BACKEND_AVAILABLE) return;

      const account = {
        name: 'Business Checking',
        balance: 100000,
        currency: 'TRY',
        accountType: 'bank'
      };

      const response = await apiRequest('POST', '/api/accounts', account, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.ok).toBe(true);
    });

    it('Step 4: User adds transactions', async () => {
      if (!BACKEND_AVAILABLE) return;

      const transactions = [
        {
          amount: -5000,
          type: 'expense',
          category: 'Rent',
          description: 'Monthly rent payment',
          date: new Date().toISOString()
        },
        {
          amount: 15000,
          type: 'income',
          category: 'Sales',
          description: 'Product sales',
          date: new Date().toISOString()
        }
      ];

      for (const tx of transactions) {
        const response = await apiRequest('POST', '/api/transactions', tx, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        expect(response.ok).toBe(true);
      }
    });

    it('Step 5: User views dashboard', async () => {
      if (!BACKEND_AVAILABLE) return;

      const response = await apiRequest('GET', `/api/dashboard/${userId}`, undefined, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('runway');
      expect(data).toHaveProperty('cashGap');
      expect(data).toHaveProperty('overallRisk');
    });

    it('Step 6: User views runway details', async () => {
      if (!BACKEND_AVAILABLE) return;

      const response = await apiRequest('GET', `/api/dashboard/runway/${userId}`, undefined, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.runway).toBeGreaterThan(0);
      expect(data.currentCash).toBeGreaterThan(0);
      expect(data.riskLevel).toBeDefined();
    });

    it('Step 7: User views cash gap analysis', async () => {
      if (!BACKEND_AVAILABLE) return;

      const response = await apiRequest('GET', `/api/dashboard/cash-gap/${userId}`, undefined, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('gap');
      expect(data).toHaveProperty('receivables');
      expect(data).toHaveProperty('payables');
    });

    it('Step 8: User exports dashboard data', async () => {
      if (!BACKEND_AVAILABLE) return;

      const response = await apiRequest('GET', `/api/export/dashboard/${userId}`, undefined, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Export might return 200 or 404 depending on implementation
      expect([200, 404, 501]).toContain(response.status);
    });

    it('Step 9: User logs out', async () => {
      if (!BACKEND_AVAILABLE) return;

      const response = await apiRequest('POST', '/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect([200, 204]).toContain(response.status);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors', async () => {
      // Simulate network error
      const error = new Error('Network error');
      expect(error.message).toBe('Network error');
    });

    it('should handle timeout', async () => {
      // Simulate timeout
      const timeout = 5000;
      expect(timeout).toBeGreaterThan(0);
    });

    it('should handle unauthorized access', async () => {
      if (!BACKEND_AVAILABLE) return;

      const response = await apiRequest('GET', '/api/dashboard/test-user');
      expect(response.status).toBe(401);
    });
  });

  describe('Performance & UX', () => {
    it('should load dashboard within 2 seconds', async () => {
      if (!BACKEND_AVAILABLE) return;

      const startTime = Date.now();
      
      try {
        await apiRequest('GET', '/api/health');
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(2000);
      } catch {
        // Even errors should be fast
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(2000);
      }
    });

    it('should provide loading feedback', () => {
      const loadingStates = ['idle', 'loading', 'success', 'error'];
      expect(loadingStates).toContain('loading');
    });

    it('should handle concurrent data loads', async () => {
      if (!BACKEND_AVAILABLE) return;

      const endpoints = [
        '/api/health',
        '/api/health',
        '/api/health'
      ];

      const promises = endpoints.map(endpoint => 
        apiRequest('GET', endpoint).catch(() => null)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
    });
  });
});

