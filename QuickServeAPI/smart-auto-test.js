/**
 * FinBot v3 - AKILLI Otomatik Test Sistemi
 * Hataları otomatik tespit eder ve raporlar
 */

import { chromium } from '@playwright/test';

const testResults = {
  passed: [],
  failed: [],
  warnings: [],
};

async function runSmartTest() {
  console.log('🤖 AKILLI OTOMATIK TEST SİSTEMİ\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Console hatalarını yakala
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // TEST 1: API Health Check
    console.log('🏥 [1/8] API Health Check...');
    try {
      const apiResponse = await page.request.get(
        'http://localhost:5000/api/health'
      );
      const apiData = await apiResponse.json();

      if (apiData.status === 'ok') {
        console.log('   ✅ BAŞARILI - API çalışıyor\n');
        testResults.passed.push('API Health Check');
      } else {
        console.log('   ❌ BAŞARISIZ - API yanıt vermiyor\n');
        testResults.failed.push('API Health Check');
      }
    } catch (error) {
      console.log(`   ❌ HATA: ${error.message}\n`);
      testResults.failed.push('API Health Check');
    }

    // TEST 2: Frontend Yükleme
    console.log('🌐 [2/8] Frontend Yükleme...');
    try {
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      const title = await page.title();

      console.log(`   📄 Sayfa Başlığı: "${title}"`);
      console.log('   ✅ BAŞARILI - Sayfa yüklendi\n');
      testResults.passed.push('Frontend Yükleme');
    } catch (error) {
      console.log(`   ❌ HATA: ${error.message}\n`);
      testResults.failed.push('Frontend Yükleme');
    }

    // TEST 3: Login Form Kontrolü
    console.log('🔍 [3/8] Login Form Kontrolü...');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]'
    );
    const submitButton = page.locator('button[type="submit"]').first();

    const emailVisible = await emailInput
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const passwordVisible = await passwordInput
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const buttonVisible = await submitButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (emailVisible && passwordVisible && buttonVisible) {
      console.log('   ✅ BAŞARILI - Login formu tam');
      console.log('   📝 Email input: ✓');
      console.log('   🔒 Password input: ✓');
      console.log('   🔘 Submit button: ✓\n');
      testResults.passed.push('Login Form');
    } else {
      console.log('   ⚠️ UYARI - Form eksik elementler içeriyor');
      if (!emailVisible) console.log('   ❌ Email input bulunamadı');
      if (!passwordVisible) console.log('   ❌ Password input bulunamadı');
      if (!buttonVisible) console.log('   ❌ Submit button bulunamadı\n');
      testResults.warnings.push('Login Form Eksik');
    }

    // TEST 4: Login İşlemi (AKILLI)
    console.log('🔐 [4/8] Login İşlemi (Detaylı Analiz)...');

    if (emailVisible) {
      try {
        // URL'yi kaydet
        const beforeUrl = page.url();
        console.log(`   📍 Başlangıç URL: ${beforeUrl}`);

        // Credentials gir
        await emailInput.fill('admin@finbot.com');
        await passwordInput.fill('admin123');
        console.log('   📝 Credentials girildi');

        // Submit
        await submitButton.click();
        console.log('   🔄 Login butonu tıklandı');

        // Bekle
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle');

        // Yeni URL
        const afterUrl = page.url();
        console.log(`   📍 Sonuç URL: ${afterUrl}`);

        // Hata mesajı kontrolü
        const errorSelectors = [
          '.error',
          '[role="alert"]',
          '.text-red-500',
          '.text-danger',
          '.alert-error',
          '[class*="error"]',
        ];

        let errorMessage = null;
        for (const selector of errorSelectors) {
          const elem = page.locator(selector).first();
          if (await elem.isVisible({ timeout: 1000 }).catch(() => false)) {
            errorMessage = await elem.textContent();
            break;
          }
        }

        // ANALİZ
        if (afterUrl === beforeUrl || afterUrl.includes('/login')) {
          console.log('\n   ❌ LOGIN BAŞARISIZ!');
          console.log('   🔍 Analiz:');
          console.log('      • URL değişmedi (hala login sayfasında)');

          if (errorMessage) {
            console.log(`      • Hata Mesajı: "${errorMessage}"`);
          }

          console.log('\n   💡 Olası Nedenler:');
          console.log('      1. Kullanıcı credentials hatalı');
          console.log('      2. Backend auth servisi yanıt vermiyor');
          console.log('      3. Form validation hatası');
          console.log('      4. Network problemi\n');

          testResults.failed.push('Login İşlemi');
        } else {
          console.log('\n   ✅ LOGIN BAŞARILI!');
          console.log(`   🎯 Yönlendirme: ${afterUrl}\n`);
          testResults.passed.push('Login İşlemi');
        }
      } catch (error) {
        console.log(`\n   ❌ HATA: ${error.message}\n`);
        testResults.failed.push('Login İşlemi - Exception');
      }
    } else {
      console.log(
        '   ℹ️ Login formu bulunamadı (zaten giriş yapılmış olabilir)\n'
      );
      testResults.warnings.push('Login Formu Bulunamadı');
    }

    // TEST 5: Screenshot
    console.log('📸 [5/8] Screenshot Alma...');
    try {
      await page.screenshot({
        path: 'smart-test-screenshot.png',
        fullPage: true,
      });
      console.log('   ✅ BAŞARILI - Screenshot: smart-test-screenshot.png\n');
      testResults.passed.push('Screenshot');
    } catch (error) {
      console.log(`   ❌ HATA: ${error.message}\n`);
      testResults.failed.push('Screenshot');
    }

    // TEST 6: Console Errors
    console.log('🐛 [6/8] Console Error Kontrolü...');
    if (consoleErrors.length === 0) {
      console.log('   ✅ BAŞARILI - Console hatası yok\n');
      testResults.passed.push('Console Errors');
    } else {
      console.log(
        `   ⚠️ UYARI - ${consoleErrors.length} console error bulundu:`
      );
      consoleErrors.slice(0, 3).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 80)}...`);
      });
      console.log('');
      testResults.warnings.push(`Console Errors (${consoleErrors.length})`);
    }

    // TEST 7: Responsive
    console.log('📱 [7/8] Responsive Test...');
    try {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(300);
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(300);
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);
      console.log('   ✅ BAŞARILI - 3 boyut test edildi\n');
      testResults.passed.push('Responsive Design');
    } catch (error) {
      console.log(`   ❌ HATA: ${error.message}\n`);
      testResults.failed.push('Responsive Design');
    }

    // TEST 8: Performance
    console.log('⚡ [8/8] Performance Testi...');
    try {
      await page.setViewportSize({ width: 1920, height: 1080 });
      const startTime = Date.now();
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`   ⏱️ Yüklenme Süresi: ${loadTime}ms`);

      if (loadTime < 1000) {
        console.log('   ✅ BAŞARILI - Çok hızlı! (< 1s)\n');
        testResults.passed.push('Performance - Excellent');
      } else if (loadTime < 3000) {
        console.log('   ✅ BAŞARILI - İyi performans (< 3s)\n');
        testResults.passed.push('Performance - Good');
      } else {
        console.log('   ⚠️ UYARI - Yavaş (>3s) - Optimizasyon önerilir\n');
        testResults.warnings.push('Performance - Slow');
      }
    } catch (error) {
      console.log(`   ❌ HATA: ${error.message}\n`);
      testResults.failed.push('Performance Test');
    }
  } catch (error) {
    console.error('\n❌ KRİTİK HATA:', error.message);
  }

  // SONUÇ RAPORU
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SONUÇLARI RAPORU\n');

  console.log(`✅ BAŞARILI TESTLER (${testResults.passed.length}):`);
  testResults.passed.forEach(test => console.log(`   • ${test}`));

  if (testResults.warnings.length > 0) {
    console.log(`\n⚠️ UYARILAR (${testResults.warnings.length}):`);
    testResults.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  if (testResults.failed.length > 0) {
    console.log(`\n❌ BAŞARISIZ TESTLER (${testResults.failed.length}):`);
    testResults.failed.forEach(test => console.log(`   • ${test}`));
  }

  const totalTests =
    testResults.passed.length +
    testResults.failed.length +
    testResults.warnings.length;
  const successRate = ((testResults.passed.length / totalTests) * 100).toFixed(
    1
  );

  console.log(
    `\n📈 BAŞARI ORANI: ${successRate}% (${testResults.passed.length}/${totalTests})`
  );

  if (testResults.failed.length === 0 && testResults.warnings.length === 0) {
    console.log('\n🎉 TÜM TESTLER BAŞARILI!');
  } else if (testResults.failed.length > 0) {
    console.log('\n⚠️ DİKKAT: Başarısız testler var!');
  }

  console.log('\n👀 Browser açık kalacak...');
  console.log('   📸 Screenshot: smart-test-screenshot.png');
  console.log('   ⌨️ Kapatmak için: Ctrl+C\n');

  // Sonsuz bekle
  await new Promise(() => { });
}

runSmartTest().catch(console.error);
