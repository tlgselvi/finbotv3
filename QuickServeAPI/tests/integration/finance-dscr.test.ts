import { describe, expect, test, beforeAll } from 'vitest';
import request from 'supertest';

const BACKEND_AVAILABLE =
  !!process.env.TEST_BASE_URL || !!process.env.E2E_TEST_ENABLED;

describe.skipIf(!BACKEND_AVAILABLE)('Finance DSCR API', () => {
  beforeAll(() => {
    if (!BACKEND_AVAILABLE) {
      console.warn('Skipping Finance DSCR API tests - Backend not available');
    }
  });

  test('GET /api/finance/dscr returns dscr value', async () => {
    const res = await request('http://localhost:5000')
      .get('/api/finance/dscr')
      .set('x-test-bypass', '1')
      .query({ operatingCF: 200, debtService: 100 });
    expect(res.status).toBe(200);
    expect(typeof res.body.dscr).toBe('number');
  });
});
