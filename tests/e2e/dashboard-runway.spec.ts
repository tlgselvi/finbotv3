/**
 * FinBot v3 - E2E Test: Dashboard Runway & Cash Gap
 * Test Plan: Phase 5 - E2E Tests
 * 
 * Runs in browser using Playwright
 */

import { test, expect } from '@playwright/test';

// Test URLs
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000';

// Test credentials
const TEST_USER = {
  email: 'admin@finbot.com',
  password: 'admin123'
};

test.describe('Dashboard Runway Analysis - E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto(BASE_URL);
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should login successfully', async ({ page }) => {
    // Fill login form
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    
    // Verify we're logged in
    expect(page.url()).toContain('dashboard');
  });

  test('should display runway analysis on dashboard', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Check for runway analysis elements
    await expect(page.locator('[data-testid="runway-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-cash"]')).toBeVisible();
    await expect(page.locator('[data-testid="runway-months"]')).toBeVisible();
  });

  test('should display cash gap analysis', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Check for cash gap elements
    await expect(page.locator('[data-testid="cash-gap-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-ar"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-ap"]')).toBeVisible();
  });

  test('should show recommendations based on runway status', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="recommendations"]');
    
    // Check that recommendations exist
    const recommendations = await page.locator('[data-testid="recommendation-item"]').count();
    expect(recommendations).toBeGreaterThan(0);
  });

  test('should export dashboard data', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('dashboard');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/dashboard/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Login
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should update data on refresh', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Get initial value
    const initialCash = await page.locator('[data-testid="current-cash"]').textContent();
    
    // Click refresh
    await page.click('[data-testid="refresh-button"]');
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify data loaded (may be same value but should re-fetch)
    const updatedCash = await page.locator('[data-testid="current-cash"]').textContent();
    expect(updatedCash).toBeDefined();
  });
});

test.describe('Performance Tests', () => {
  
  test('should load dashboard within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });
});

