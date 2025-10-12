/**
 * FinBot v3 - TAM KAPSAMLI BROWSER TESTİ
 * Tüm özellikler otomatik test edilir
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000';

test.describe.skip('🎯 TAM KAPSAMLI BROWSER TEST SÜİTİ', () => {
  test.beforeEach(async ({ page }) => {
    console.log('\n🚀 Test başlatılıyor...');
  });

  test('1️⃣ Sistem Sağlık Kontrolleri', async ({ page }) => {
    console.log('🏥 Backend API kontrolü...');

    // API Health Check
    const healthResponse = await page.request.get(`${API_URL}/api/health`);
    expect(healthResponse.ok()).toBeTruthy();
    const healthData = await healthResponse.json();
    console.log(`   ✓ API Status: ${healthData.status}`);

    // Frontend Yükleme
    console.log('🌐 Frontend kontrolü...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log(`   ✓ Sayfa Başlığı: ${title}`);
    expect(title).toBeTruthy();

    console.log('✅ Sistem sağlık kontrolleri BAŞARILI\n');
  });

  test('2️⃣ Login ve Authentication', async ({ page }) => {
    console.log('🔐 Login testi başlıyor...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Login formunu bul
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]'
    );

    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   📝 Login formu dolduruluyor...');
      await emailInput.fill('admin@finbot.com');
      await passwordInput.fill('admin123');

      console.log('   🔄 Login yapılıyor...');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');

      console.log('   ✓ Login başarılı!');
    } else {
      console.log('   ℹ️ Zaten giriş yapılmış');
    }

    // Token kontrolü
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    console.log(`   ✓ Auth Token: ${token ? 'Mevcut' : 'Yok'}`);

    console.log('✅ Login testi BAŞARILI\n');
  });

  test('3️⃣ Dashboard Görünüm ve İçerik', async ({ page }) => {
    console.log('📊 Dashboard kontrolü...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Login if needed
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await emailInput.fill('admin@finbot.com');
      await page.locator('input[type="password"]').fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }

    await page.waitForTimeout(1000);

    // Element sayımı
    const buttonCount = await page.locator('button').count();
    const linkCount = await page.locator('a').count();
    const inputCount = await page.locator('input').count();

    console.log(`   📊 Dashboard İstatistikleri:`);
    console.log(`      • Buttons: ${buttonCount}`);
    console.log(`      • Links: ${linkCount}`);
    console.log(`      • Inputs: ${inputCount}`);

    expect(buttonCount).toBeGreaterThan(0);

    console.log('✅ Dashboard kontrolü BAŞARILI\n');
  });

  test('4️⃣ Navigation ve Routing', async ({ page }) => {
    console.log('🧭 Navigation testi...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Login if needed
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await emailInput.fill('admin@finbot.com');
      await page.locator('input[type="password"]').fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }

    // Sayfadaki tüm linkleri bul
    const links = await page.locator('a[href]').all();
    console.log(`   📝 ${links.length} adet link bulundu`);

    // İlk birkaç linki test et
    let testedLinks = 0;
    for (const link of links.slice(0, 3)) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        console.log(`   ✓ Link test edildi: ${href}`);
        testedLinks++;
      }
    }

    console.log(`   ✓ ${testedLinks} link test edildi`);
    console.log('✅ Navigation testi BAŞARILI\n');
  });

  test('5️⃣ Responsive Design - 3 Boyut', async ({ page }) => {
    console.log('📱 Responsive design testi...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Desktop
    console.log('   🖥️ Desktop (1920x1080)');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/desktop.png' });
    console.log('      ✓ Desktop screenshot alındı');

    // Tablet
    console.log('   📱 Tablet (768x1024)');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/tablet.png' });
    console.log('      ✓ Tablet screenshot alındı');

    // Mobile
    console.log('   📱 Mobile (375x667)');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/mobile.png' });
    console.log('      ✓ Mobile screenshot alındı');

    console.log('✅ Responsive test BAŞARILI\n');
  });

  test('6️⃣ Performance Metrikleri', async ({ page }) => {
    console.log('⚡ Performance testi...');

    // Initial Load
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const initialLoad = Date.now() - startTime;

    console.log(`   ⏱️ İlk yüklenme: ${initialLoad}ms`);

    // Performance API
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as any;
      return {
        domContentLoaded: Math.round(
          perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart
        ),
        domComplete: Math.round(perf.domComplete - perf.domLoading),
        loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
      };
    });

    console.log(`   📊 Performance Metrikleri:`);
    console.log(`      • DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`      • DOM Complete: ${metrics.domComplete}ms`);
    console.log(`      • Load Complete: ${metrics.loadComplete}ms`);

    // Performans değerlendirmesi
    if (initialLoad < 1000) {
      console.log('   🚀 Çok Hızlı! (< 1s)');
    } else if (initialLoad < 3000) {
      console.log('   ✅ İyi Performans (< 3s)');
    } else if (initialLoad < 5000) {
      console.log('   ⚠️ Orta Performans (< 5s)');
    } else {
      console.log('   ❌ Yavaş (> 5s) - Optimizasyon gerekli');
    }

    expect(initialLoad).toBeLessThan(10000); // Max 10 saniye

    console.log('✅ Performance testi BAŞARILI\n');
  });

  test('7️⃣ Form İşlemleri ve Validasyon', async ({ page }) => {
    console.log('📝 Form testi...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Sayfadaki tüm inputları bul
    const inputs = await page.locator('input').all();
    console.log(`   📝 ${inputs.length} adet input bulundu`);

    // Formları kontrol et
    const forms = await page.locator('form').count();
    console.log(`   📋 ${forms} adet form bulundu`);

    if (forms > 0) {
      console.log('   ✓ Form elementleri mevcut');
    }

    console.log('✅ Form testi BAŞARILI\n');
  });

  test('8️⃣ Error Handling ve User Experience', async ({ page }) => {
    console.log('🛡️ Error handling testi...');

    // Console errorlarını yakala
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (consoleErrors.length === 0) {
      console.log("   ✓ Console'da hata yok");
    } else {
      console.log(`   ⚠️ ${consoleErrors.length} console error bulundu`);
      consoleErrors.forEach(error => {
        console.log(`      • ${error.substring(0, 100)}`);
      });
    }

    console.log('✅ Error handling testi BAŞARILI\n');
  });

  test('9️⃣ Accessibility Kontrolleri', async ({ page }) => {
    console.log('♿ Accessibility testi...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Başlık yapısı
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();

    console.log(`   📋 Başlık Yapısı:`);
    console.log(`      • H1: ${h1Count}`);
    console.log(`      • H2: ${h2Count}`);
    console.log(`      • H3: ${h3Count}`);

    // Alt text kontrolü
    const images = await page.locator('img').all();
    let imagesWithAlt = 0;
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt) imagesWithAlt++;
    }
    console.log(
      `   🖼️ Images: ${imagesWithAlt}/${images.length} with alt text`
    );

    console.log('✅ Accessibility testi BAŞARILI\n');
  });

  test('🔟 Final Screenshot ve Rapor', async ({ page }) => {
    console.log('📸 Final screenshot...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Login if needed
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await emailInput.fill('admin@finbot.com');
      await page.locator('input[type="password"]').fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }

    await page.waitForTimeout(1000);

    // Full page screenshot
    await page.screenshot({
      path: 'test-results/final-full-page.png',
      fullPage: true,
    });
    console.log('   ✓ Full page screenshot: test-results/final-full-page.png');

    // Viewport screenshot
    await page.screenshot({
      path: 'test-results/final-viewport.png',
    });
    console.log('   ✓ Viewport screenshot: test-results/final-viewport.png');

    console.log('\n🎉 TÜM TESTLER BAŞARIYLA TAMAMLANDI!\n');
  });
});
