# 🧪 FinBot v3 - Browser Test Rehberi

## 📋 İçindekiler
1. [Manuel UI Testi](#1-manuel-ui-testi)
2. [Console API Testi](#2-console-api-testi)
3. [DevTools Network Analizi](#3-devtools-network-analizi)
4. [E2E Test (Playwright)](#4-e2e-test-playwright)
5. [Test Checklist](#5-test-checklist)

---

## 1. Manuel UI Testi

### 🚀 Başlangıç
```bash
# Server'ı başlat (zaten çalışıyor)
pnpm dev

# Browser'da aç
http://localhost:5173
```

### ✅ Test Senaryoları

#### Scenario 1: Login & Authentication
```
1. ✓ Login sayfası açılıyor mu?
2. ✓ Email: admin@finbot.com
3. ✓ Password: admin123
4. ✓ Login butonu çalışıyor mu?
5. ✓ Dashboard'a yönlendirme yapılıyor mu?
6. ✓ Token localStorage'a kaydediliyor mu? (F12 > Application > Local Storage)
```

#### Scenario 2: Dashboard - Runway Analysis
```
1. ✓ Runway analizi kartı görünüyor mu?
2. ✓ Current Cash gösteriliyor mu?
3. ✓ Monthly Expenses hesaplanıyor mu?
4. ✓ Runway Months doğru mu?
5. ✓ Status badge (healthy/warning/critical) doğru mu?
6. ✓ Recommendations listesi var mı?
7. ✓ Monthly breakdown chart yükleniyor mu?
```

#### Scenario 3: Dashboard - Cash Gap Analysis
```
1. ✓ Cash Gap kartı görünüyor mu?
2. ✓ Total AR (Alacaklar) gösteriliyor mu?
3. ✓ Total AP (Borçlar) gösteriliyor mu?
4. ✓ Cash Gap hesaplanıyor mu?
5. ✓ Risk level gösteriliyor mu?
6. ✓ Timeline chart var mı?
```

#### Scenario 4: Accounts Management
```
1. ✓ Hesaplar listesi yükleniyor mu?
2. ✓ Yeni hesap ekleme çalışıyor mu?
3. ✓ Hesap düzenleme çalışıyor mu?
4. ✓ Bakiye güncelleniyor mu?
5. ✓ Para birimi seçimi çalışıyor mu?
```

#### Scenario 5: Transactions
```
1. ✓ İşlem listesi yükleniyor mu?
2. ✓ Yeni işlem ekleme çalışıyor mu?
3. ✓ Gelir/Gider kategorileri doğru mu?
4. ✓ Filtreleme çalışıyor mu?
5. ✓ Tarih seçimi çalışıyor mu?
```

#### Scenario 6: Error Handling
```
1. ✓ Invalid login credentials hatası gösteriliyor mu?
2. ✓ Network error mesajı doğru mu?
3. ✓ Validation errors frontend'de gösteriliyor mu?
4. ✓ 404 page var mı?
```

---

## 2. Console API Testi

### 🎯 Test Script Kullanımı

1. **Browser'da DevTools aç:** `F12` veya `Ctrl+Shift+I`
2. **Console sekmesine git**
3. **Test script'ini yükle:**

```javascript
// browser-test-script.js içeriğini Console'a yapıştır
// Veya:
```

**Script'i çalıştır:**

```javascript
// Tüm testleri çalıştır
runAllTests();

// Veya tek tek:
await testHealth();        // ✓ Server sağlıklı mı?
await testLogin();          // ✓ Login çalışıyor mu?
await testAccounts();       // ✓ Hesaplar geliyor mu?
await testRunway('user-id'); // ✓ Runway analizi çalışıyor mu?
```

### 📊 Beklenen Sonuçlar

```javascript
// Health Check
✅ Health: { status: 'ok', timestamp: '2025-10-11...' }

// Login
✅ Login: { token: 'eyJhbGc...', user: {...} }
✅ Token saved to localStorage

// Accounts
✅ Accounts: [{ id: '...', name: '...', balance: 100000, ... }]

// Runway
✅ Runway Analysis: {
  currentCash: 120000,
  monthlyExpenses: 10000,
  runwayMonths: 12,
  status: 'healthy',
  recommendations: [...]
}
```

---

## 3. DevTools Network Analizi

### 📡 Network Monitoring

**Adımlar:**
1. `F12` > **Network** sekmesi
2. **Preserve log** aktif et
3. **XHR/Fetch** filtresini seç
4. Uygulamayı kullan

### ✅ Kontrol Edilecekler

```
API Calls:
├─ ✓ POST /api/login          → 200 OK (~100-200ms)
├─ ✓ GET  /api/accounts        → 200 OK (~50-150ms)
├─ ✓ GET  /api/transactions    → 200 OK (~100-300ms)
├─ ✓ GET  /api/dashboard/runway → 200 OK (~200-500ms)
├─ ✓ GET  /api/dashboard/cash-gap → 200 OK (~200-500ms)
└─ ✓ WebSocket ws://localhost:5050 → 101 Switching Protocols

Response Times:
├─ Health Check: < 50ms
├─ Authentication: < 200ms
├─ Data Fetch: < 300ms
├─ Dashboard Analytics: < 500ms
└─ Large Datasets: < 1000ms

Status Codes:
├─ 200: Success ✓
├─ 201: Created ✓
├─ 400: Bad Request (validation)
├─ 401: Unauthorized (login required)
├─ 404: Not Found
└─ 500: Server Error (investigate!)
```

### 🔍 Header Kontrolü

```
Request Headers:
✓ Authorization: Bearer eyJhbGc...
✓ Content-Type: application/json
✓ Accept: application/json

Response Headers:
✓ Content-Type: application/json
✓ Cache-Control: no-cache
✓ X-RateLimit-Remaining: 999
```

---

## 4. E2E Test (Playwright)

### 📦 Kurulum

```bash
# Playwright'ı yükle
cd QuickServeAPI
pnpm add -D @playwright/test

# Playwright browsers'ları yükle
npx playwright install
```

### 🏃 Testleri Çalıştır

```bash
# Tüm E2E testleri çalıştır
npx playwright test

# Sadece dashboard testleri
npx playwright test dashboard-runway

# UI mode (interactive)
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Specific browser
npx playwright test --project=chromium
```

### 📊 Test Raporları

```bash
# HTML raporu göster
npx playwright show-report

# Sonuçlar:
# playwright-report/index.html
```

### 🎬 Test Video & Screenshots

```
test-results/
├─ dashboard-runway-spec-chromium/
│  ├─ video.webm          # Test video
│  ├─ screenshot.png      # Failure screenshot
│  └─ trace.zip           # Execution trace
```

---

## 5. Test Checklist

### ✅ Pre-Deployment Checklist

#### Functionality Tests
```
□ Login & Logout çalışıyor
□ Dashboard yükleniyor
□ Runway analysis doğru
□ Cash gap analysis doğru
□ Account CRUD operations
□ Transaction CRUD operations
□ Filtreleme çalışıyor
□ Sıralama çalışıyor
□ Pagination çalışıyor
□ Export functionality
□ WebSocket real-time updates
```

#### UI/UX Tests
```
□ Responsive design (mobile, tablet, desktop)
□ Loading states gösteriliyor
□ Error messages kullanıcı dostu
□ Form validation çalışıyor
□ Tooltips ve help texts var
□ Keyboard navigation çalışıyor
□ Color contrast yeterli (accessibility)
□ Icons ve images yükleniyor
```

#### Performance Tests
```
□ Initial load < 3 seconds
□ API calls < 500ms
□ No memory leaks
□ Smooth scrolling
□ No layout shifts
□ Images optimized
□ Bundle size reasonable
```

#### Security Tests
```
□ Authentication required
□ Authorization checks
□ XSS prevention
□ CSRF protection
□ Input validation
□ SQL injection prevention
□ Rate limiting active
□ HTTPS (production)
```

#### Browser Compatibility
```
□ Chrome (latest)
□ Firefox (latest)
□ Safari (latest)
□ Edge (latest)
□ Mobile Chrome
□ Mobile Safari
```

---

## 📈 Test Coverage Report

### Current Status (from TEST_PLAN.md)

```
✅ Unit Tests:        12/12  (100%) ✓
✅ Validation Tests:  47/47  (100%) ✓
✅ Error Handling:    17/17  (100%) ✓
✅ Edge Cases:        18/18  (100%) ✓
⏳ E2E Tests:         0/5    (0%)
⏳ Performance:       0/2    (0%)
⏳ Visual Regression: 0/3    (0%)

Total: 94/109 (86%)
Target: 100%
```

---

## 🐛 Hata Bulduğunuzda

### Bug Report Template

```markdown
## 🐛 Bug Report

**Tarih:** 2025-10-11
**Tester:** [İsminiz]
**Severity:** Critical / High / Medium / Low

### Açıklama
[Bulunan hatanın kısa açıklaması]

### Nasıl Tekrar Oluşturulur
1. ...
2. ...
3. ...

### Beklenen Davranış
[Ne olması gerekiyordu]

### Gerçek Davranış
[Ne oldu]

### Ekran Görüntüsü / Video
[Ekran görüntüsü veya video ekleyin]

### Ortam
- Browser: Chrome 120
- OS: Windows 11
- Screen: 1920x1080
- User: admin@finbot.com

### Console Errors
```
[Console'dan hata mesajları]
```

### Network Errors
```
[Network sekmesinden hata detayları]
```
```

---

## 🎯 Sonraki Adımlar

### Öncelik 1: Eksik Testleri Tamamla
```bash
# E2E testleri ekle
□ Dashboard flow test
□ Account creation flow
□ Transaction flow
□ Export flow
□ Error recovery flow

# Performance testleri ekle
□ Load testing (10k+ transactions)
□ Concurrent users (50+ users)

# Visual regression testleri
□ Screenshot comparison
□ Layout stability
□ Cross-browser rendering
```

### Öncelik 2: CI/CD Entegrasyonu
```yaml
# .github/workflows/test.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx playwright install
      - run: npx playwright test
      - uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📞 Yardım & Kaynaklar

### Dökümanlar
- [TEST_PLAN.md](./TEST_PLAN.md) - Detaylı test planı
- [TEST_GAP_ANALYSIS.md](./TEST_GAP_ANALYSIS.md) - Eksik testler analizi

### Test Scripts
- [browser-test-script.js](./browser-test-script.js) - Console test script
- [tests/e2e/dashboard-runway.spec.ts](./tests/e2e/dashboard-runway.spec.ts) - E2E tests

### External Links
- [Playwright Docs](https://playwright.dev/)
- [Vitest Docs](https://vitest.dev/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

**Son Güncelleme:** 2025-10-11  
**Version:** 1.0

