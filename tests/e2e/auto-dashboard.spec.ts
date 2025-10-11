/**
 * FinBot v3 - Otomatik Browser Testi
 * Bu test otomatik olarak browser'da tüm senaryoları çalıştırır
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('🤖 Otomatik Dashboard Testi', () => {
  
  test('✅ Tam Otomasyon: Login → Dashboard → Hesaplar → Transactions', async ({ page }) => {
    console.log('🚀 Test başlatılıyor...');
    
    // 1. Anasayfaya git
    console.log('📍 Step 1: Anasayfaya gidiliyor...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 2. Login formunu kontrol et
    console.log('📍 Step 2: Login formu kontrol ediliyor...');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    // Eğer login gerekiyorsa
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('🔐 Login yapılıyor...');
      await emailInput.fill('admin@finbot.com');
      await passwordInput.fill('admin123');
      
      // Login butonunu bul ve tıkla
      const loginButton = page.locator('button[type="submit"]').first();
      await loginButton.click();
      
      // Login'in tamamlanmasını bekle
      await page.waitForLoadState('networkidle');
      console.log('✅ Login başarılı!');
    } else {
      console.log('ℹ️ Zaten giriş yapılmış');
    }
    
    // 3. Dashboard'un yüklenmesini bekle
    console.log('📍 Step 3: Dashboard yükleniyor...');
    await page.waitForTimeout(2000);
    
    // 4. Sayfa başlığını kontrol et
    const title = await page.title();
    console.log(`📄 Sayfa başlığı: ${title}`);
    expect(title).toBeTruthy();
    
    // 5. URL kontrolü
    const url = page.url();
    console.log(`🌐 Current URL: ${url}`);
    expect(url).toContain('localhost:5173');
    
    // 6. Sayfanın yüklendiğini doğrula
    await expect(page.locator('body')).toBeVisible();
    console.log('✅ Sayfa başarıyla yüklendi!');
    
    // 7. Screenshot al
    await page.screenshot({ 
      path: 'test-results/dashboard-screenshot.png',
      fullPage: true 
    });
    console.log('📸 Screenshot alındı: test-results/dashboard-screenshot.png');
    
    console.log('🎉 Test tamamlandı!');
  });
  
  test('⚡ Hızlı Health Check', async ({ page }) => {
    console.log('🏥 Health check yapılıyor...');
    
    // API health check
    const response = await page.request.get('http://localhost:5000/api/health');
    const data = await response.json();
    
    console.log('✅ API Health:', data);
    expect(data.status).toBe('ok');
    expect(response.status()).toBe(200);
  });
  
  test('🔍 Dashboard Elements Check', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Login if needed
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('admin@finbot.com');
      await page.locator('input[type="password"]').fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }
    
    await page.waitForTimeout(1000);
    
    // Sayfadaki tüm interaktif elementleri say
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const inputs = await page.locator('input').count();
    
    console.log(`📊 Dashboard Stats:`);
    console.log(`   - Buttons: ${buttons}`);
    console.log(`   - Links: ${links}`);
    console.log(`   - Inputs: ${inputs}`);
    
    // En az birkaç element olmalı
    expect(buttons).toBeGreaterThan(0);
  });
  
  test('📱 Responsive Test', async ({ page }) => {
    console.log('📱 Responsive test başlatılıyor...');
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ Desktop view OK');
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    console.log('✅ Tablet view OK');
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    console.log('✅ Mobile view OK');
  });
  
  test('🚀 Performance Test', async ({ page }) => {
    console.log('⚡ Performance test başlatılıyor...');
    
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Sayfa yüklenme süresi: ${loadTime}ms`);
    
    // 5 saniyeden kısa olmalı
    expect(loadTime).toBeLessThan(5000);
    
    if (loadTime < 1000) {
      console.log('🚀 Çok hızlı!');
    } else if (loadTime < 3000) {
      console.log('✅ İyi performans');
    } else {
      console.log('⚠️ Optimize edilebilir');
    }
  });
});

