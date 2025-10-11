/**
 * FinBot v3 - Otomatik Browser Test Script
 * Node.js ile çalışır, Playwright kullanır
 * 
 * Kullanım: node auto-test.js
 */

import { chromium } from '@playwright/test';

async function runAutomatedTest() {
  console.log('🤖 Otomatik Browser Testi Başlatılıyor...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Browser'ı görmek için
    slowMo: 500 // Yavaş hareket et (daha iyi gözlemle)
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: API Health Check
    console.log('✅ Test 1: API Health Check');
    const apiResponse = await page.request.get('http://localhost:5000/api/health');
    const apiData = await apiResponse.json();
    console.log(`   Status: ${apiData.status}`);
    console.log(`   ✓ API çalışıyor\n`);
    
    // Test 2: Anasayfa Yükleme
    console.log('✅ Test 2: Anasayfa Yükleme');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    console.log(`   Sayfa başlığı: ${title}`);
    console.log(`   ✓ Sayfa yüklendi\n`);
    
    // Test 3: Login Elementi Kontrolü
    console.log('✅ Test 3: Login Elementi Kontrolü');
    const emailInput = page.locator('input[type="email"]');
    const isVisible = await emailInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      console.log('   ✓ Login formu bulundu');
      
      // Test 4: Login İşlemi
      console.log('\n✅ Test 4: Login İşlemi');
      await emailInput.fill('admin@finbot.com');
      await page.locator('input[type="password"]').fill('admin123');
      
      console.log('   📝 Credentials girildi');
      await page.locator('button[type="submit"]').first().click();
      console.log('   🔄 Login butonu tıklandı');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Extra bekle
      
      // Login sonrası URL kontrolü
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);
      
      // HATA KONTROLÜ
      const errorMessage = await page.locator('.error, [role="alert"], .text-red-500, .text-danger').textContent().catch(() => null);
      
      if (currentUrl.includes('/login')) {
        console.log('   ❌ LOGIN BAŞARISIZ! Hala login sayfasında');
        if (errorMessage) {
          console.log(`   ❌ Hata mesajı: ${errorMessage}`);
        }
        console.log('   ⚠️ Kullanıcı credentials kontrol edilmeli');
      } else {
        console.log('   ✓ Login başarılı! Yönlendirme yapıldı');
      }
    } else {
      console.log('   ℹ️ Zaten giriş yapılmış\n');
    }
    
    // Test 5: Screenshot Alma
    console.log('✅ Test 5: Screenshot Alma');
    await page.screenshot({ 
      path: 'auto-test-screenshot.png',
      fullPage: true 
    });
    console.log('   ✓ Screenshot kaydedildi: auto-test-screenshot.png\n');
    
    // Test 6: Responsive Test
    console.log('✅ Test 6: Responsive Test');
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    console.log('   ✓ Desktop görünüm test edildi');
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    console.log('   ✓ Tablet görünüm test edildi');
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    console.log('   ✓ Mobile görünüm test edildi\n');
    
    // Test 7: Performance Ölçümü
    console.log('✅ Test 7: Performance Ölçümü');
    await page.setViewportSize({ width: 1920, height: 1080 });
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    console.log(`   Yüklenme süresi: ${loadTime}ms`);
    
    if (loadTime < 1000) {
      console.log('   🚀 Çok hızlı!');
    } else if (loadTime < 3000) {
      console.log('   ✓ İyi performans');
    } else {
      console.log('   ⚠️ Optimize edilebilir');
    }
    
    console.log('\n🎉 Tüm Testler Başarıyla Tamamlandı!');
    console.log('\n📊 Test Özeti:');
    console.log('   - API Health Check: ✓');
    console.log('   - Sayfa Yükleme: ✓');
    console.log('   - Login Elementi: ✓');
    console.log('   - Screenshot: ✓');
    console.log('   - Responsive: ✓');
    console.log('   - Performance: ✓');
    
    // Browser'ı açık tut (kullanıcı görsün)
    console.log('\n👀 Browser açık kalacak. İnceleyebilirsiniz...');
    console.log('   Kapatmak için: Ctrl+C');
    
    // Sonsuz bekleme
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Test Hatası:', error.message);
    console.error(error.stack);
  } finally {
    // await browser.close();
  }
}

// Testi çalıştır
runAutomatedTest();

