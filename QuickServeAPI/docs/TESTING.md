# 🧪 FinBot v3 - Test Dokümantasyonu

**Son Güncelleme:** 2025-10-12  
**Test Suite Versiyon:** 2.0

---

## 📊 TEST DURUMU

### Güncel İstatistikler

```
Toplam Test:        1009
✅ Geçen:           471  (47%)
❌ Başarısız:       193  (19%)
⏭️ Skip:            312  (31%)
📝 TODO:            33   (3%)

Test Dosyası:       97
✅ Geçen:           22   (23%)
❌ Başarısız:       26   (27%)
⏭️ Skip:            49   (50%)

⏱️ Süre:            ~13 saniye
📈 Coverage:        ~75% (hedef: 80%)
```

---

## 🎯 KRİTİK TESTLER (%100 BAŞARI!)

### Core Business Logic - 84/84 ✅

**Komut:**

```bash
pnpm test:critical
```

**Durum:** ✅ TÜM TESTLER GEÇIYOR!  
**Süre:** ~2 saniye

**Testler:**

- ✅ DSCR Scenarios (36 test) - %100
- ✅ Consolidation (6 test) - %100
- ✅ Advisor Rules (15 test) - %100
- ✅ Simulation (15 test) - %100
- ✅ Dashboard Analytics (12 test) - %100

**Deployment Önerisi:** ✅ Deploy edilebilir!

---

## 🧪 TEST KATEGORİLERİ

### 1. Business Logic Tests

```bash
pnpm test:business
```

**Kapsam:**

- DSCR hesaplamaları
- Runway & Cash Gap analizi
- Budget karşılaştırmaları
- Risk değerlendirmeleri
- Konsolidasyon mantığı

**Durum:** ✅ %100 başarılı

---

### 2. Integration Tests

```bash
pnpm test
```

**Kapsam:**

- API endpoints
- Database operations
- Authentication flow
- JWT token management
- Bank integrations

**Durum:** 🔄 %47 başarılı (geliştiriliyor)

---

### 3. Security Tests

```bash
pnpm test:security
```

**Kapsam:**

- Authentication
- Authorization
- JWT security
- Password hashing
- 2FA verification
- Security middleware

**Durum:** 🔄 Geliştiriliyor

---

### 4. Performance Tests

```bash
pnpm test:performance
```

**Kapsam:**

- Large dataset handling
- Query optimization
- Concurrent users
- Memory usage
- Response times

**Durum:** ⏳ Planlanıyor

---

### 5. E2E Tests

```bash
pnpm test:e2e
```

**Kapsam:**

- Full user workflows
- Browser automation (Playwright)
- Login → Dashboard → Logout
- CRUD operations
- Data persistence

**Durum:** ✅ Browser otomatik test hazır (`pnpm test:auto`)

---

## 📈 TEST COVERAGE

### Hedefler

| Kategori           | Mevcut | Hedef | Durum |
| ------------------ | ------ | ----- | ----- |
| **Overall**        | 75%    | 80%   | 🔄    |
| **Business Logic** | 95%    | 90%   | ✅    |
| **API Routes**     | 60%    | 80%   | 🔄    |
| **Middleware**     | 70%    | 80%   | 🔄    |
| **Utils**          | 85%    | 90%   | ✅    |
| **Components**     | 45%    | 70%   | ❌    |

### Coverage Raporu

```bash
# Coverage ile test çalıştır
pnpm test:coverage

# HTML raporu görüntüle
open coverage/index.html
```

---

## 🔧 TEST YAZMA REHBERİ

### Test Dosyası Şablonu

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Her test öncesi temizlik
    vi.clearAllMocks();
  });

  it('should do something correctly', () => {
    // Arrange (Hazırlık)
    const input = { value: 100 };

    // Act (İşlem)
    const result = functionToTest(input);

    // Assert (Doğrulama)
    expect(result).toBe(expected);
  });

  it('should handle edge cases', () => {
    // Edge case testi
  });

  it('should throw error for invalid input', () => {
    // Error testi
    expect(() => functionToTest(null)).toThrow();
  });
});
```

---

### Test Kategorileri

#### 1. Unit Tests (Birim Testler)

**Ne test edilir:**

- Tek bir fonksiyon
- İzole edilmiş mantık
- Pure functions
- Utility functions

**Örnek:**

```typescript
it('should calculate DSCR correctly', () => {
  const netIncome = 10000;
  const debtService = 8000;

  const dscr = calculateDSCR(netIncome, debtService);

  expect(dscr).toBe(1.25);
});
```

---

#### 2. Integration Tests (Entegrasyon Testler)

**Ne test edilir:**

- API endpoints
- Database operations
- Multiple components together

**Örnek:**

```typescript
it('should create account and return ID', async () => {
  const account = {
    name: 'Test Account',
    balance: 1000,
    currency: 'TRY',
  };

  const result = await createAccount(userId, account);

  expect(result.id).toBeDefined();
  expect(result.balance).toBe(1000);
});
```

---

#### 3. E2E Tests (Uçtan Uca Testler)

**Ne test edilir:**

- Full user workflows
- Browser interactions
- Real API calls

**Örnek:**

```typescript
test('should login and view dashboard', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await page.fill('[name="email"]', 'admin@finbot.com');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

## 🚀 TEST WORKFLOW

### Geliştirme Sırasında

```bash
# 1. Watch mode'da çalış
pnpm test:watch

# 2. Kod yaz

# 3. Test otomatik çalışır

# 4. Hızlı feedback al
```

---

### Commit Öncesi

```bash
# 1. Hızlı kontrol
pnpm test:quick      # 2s

# 2. Tam kontrol
pnpm test1           # 20s

# 3. Commit yap
git commit -m "feat: new feature"
```

---

### Deploy Öncesi

```bash
# 1. Kritik testler
pnpm test:critical   # 2s

# 2. Deploy hazırlık
pnpm test1           # 20s

# 3. Security scans
pnpm sec:secrets     # 2s

# 4. Push (otomatik kontroller)
git push
```

---

## 📊 TEST RAPORLAMA

### Otomatik Raporlar

**test1 komutu otomatik oluşturur:**

- ✅ `README.md` güncellenir
- ✅ `package.json` description güncellenir
- ✅ `reports/summary.html` oluşturulur
- ✅ Console'da özet gösterilir

---

### Manuel Raporlar

```bash
# Test raporu oluştur
pnpm report:gen

# Coverage raporu
pnpm test:coverage

# Performance raporu
pnpm test:performance
```

---

## 🐛 SORUN GİDERME

### Test Fail Olursa

**1. Hatayı anla:**

```bash
# Watch mode'da detaylı log
pnpm test:watch
```

**2. İlgili testi çalıştır:**

```bash
# Tek dosya
pnpm test tests/business/dscr-scenarios.test.ts

# Kategori
pnpm test:business
```

**3. Debug mode:**

```bash
# Node inspector ile
pnpm test:debug
```

---

### Mock Sorunları

**Yaygın hatalar:**

```typescript
// ❌ YANLIŞ: Mock temizlenmiyor
it('test 1', () => {
  vi.fn().mockReturnValue(true);
});

// ✅ DOĞRU: beforeEach'te temizle
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

### Database Sorunları

**Test database:**

```typescript
// tests/setup/test-db.ts kullanılır
// In-memory SQLite
// Her test öncesi reset edilir

beforeEach(() => {
  resetDatabase();
  seedTestData();
});
```

---

## 📚 TEST BEST PRACTICES

### 1. Test Isimlendirme

```typescript
// ✅ DOĞRU: Açıklayıcı
it('should calculate DSCR as 1.25 when net income is 10k and debt is 8k', () => {
  // ...
});

// ❌ YANLIŞ: Belirsiz
it('should work', () => {
  // ...
});
```

---

### 2. AAA Pattern

```typescript
it('should ...', () => {
  // Arrange (Hazırlık)
  const input = setupTestData();

  // Act (İşlem)
  const result = functionUnderTest(input);

  // Assert (Doğrulama)
  expect(result).toBe(expected);
});
```

---

### 3. Test Isolation

```typescript
// ✅ DOĞRU: Her test bağımsız
beforeEach(() => {
  vi.clearAllMocks();
  resetDatabase();
});

// ❌ YANLIŞ: Testler birbirine bağımlı
let sharedState; // Paylaşılan state!
```

---

### 4. Edge Cases

```typescript
describe('Calculator', () => {
  // Normal durum
  it('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  // Edge cases
  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(add(-2, 3)).toBe(1);
  });

  it('should handle decimal numbers', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3);
  });
});
```

---

## 🎯 YOL HARİTASI

### Kısa Vadeli (1-2 Hafta)

- [ ] Coverage %75 → %80
- [ ] Security tests tamamla
- [ ] API endpoint tests genişlet
- [ ] Frontend component tests

### Orta Vadeli (1 Ay)

- [ ] Performance tests
- [ ] Load testing
- [ ] Visual regression tests
- [ ] Accessibility tests

### Uzun Vadeli (2-3 Ay)

- [ ] Mutation testing
- [ ] Property-based testing
- [ ] Contract testing
- [ ] Chaos engineering

---

## 📖 KAYNAKLAR

### Dahili Dokümantasyon

- **Komutlar:** `COMMANDS.md`
- **Test Workflow:** `TEST_WORKFLOW.md`
- **Browser Test:** `AUTO_TEST_README.md`

### Harici Kaynaklar

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## 💡 İPUÇLARI

### Hızlı Test Döngüsü

```bash
# Watch mode + UI
pnpm test:watch
# veya
pnpm test:ui
```

### Test Coverage Artırma

```bash
# 1. Düşük coverage'lı dosyaları bul
pnpm test:coverage

# 2. HTML raporu aç
open coverage/index.html

# 3. Kırmızı (low coverage) dosyalara test yaz

# 4. Tekrar kontrol
pnpm test:coverage
```

### Mock Kullanımı

```typescript
// External API mock
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: mockData })),
  },
}));

// Database mock
vi.mock('../db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockResolvedValue([mockRecord]),
    }),
  },
}));
```

---

**Test yazmaya devam! 🚀**
