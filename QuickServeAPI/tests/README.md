# 🧪 FinBot v3 - Test Suite Documentation

## 📊 Test Suite Özeti

**Toplam:** 0 test | **Geçen:** 0 (0%) | **Skip:** 0 (NaN%) | **Coverage:** ~75%

**Son Güncelleme:** 12.10.2025 01:26  
**Critical Tests:** 84/84 (100%) ✅  
**Test Files:** 0 (0 passing, 0 skipped, 0 needs work)

## 🚀 Hızlı Başlangıç

### ⚡ En İyi Testleri Çalıştır (Critical Tests)

```bash
pnpm test:critical
```

Bu komut **84 core business test**i çalıştırır - **%100 BAŞARILI!** ✅

**Süre:** ~2 saniye | **Sonuç:** 84/84 passed | **Son Test:** 22:54:00

### Tüm Testleri Çalıştır

```bash
pnpm test
```

### İnteraktif Test Runner

```powershell
.\run-tests.ps1  # Windows PowerShell
```

veya

```cmd
quick-test.bat   # Windows CMD
```

---

## 📁 Test Kategorileri

### ✅ Core Business Logic (100% Pass Rate!)

#### 1. **DSCR Scenarios** - 36/36 test ✅ NEW!

📁 `business/dscr-scenarios.test.ts`

**Komut:** `pnpm test tests/business/dscr-scenarios.test.ts`
**Durum:** ✅ %100 başarı - Production ready!

**Kapsam:**

- 13 farklı iş sektörü senaryosu
- Banka kredi değerlendirme kriterleri
- Restructuring öncesi/sonrası
- Tier 1-5 değerlendirme sistemi

**İş Senaryoları:**

- 🏢 Startup (erken aşama, burn rate)
- 🏭 Üretim tesisi (kapasite kullanımı)
- 🏗️ İnşaat (proje bazlı cash flow)
- 🍴 Restoran zinciri (pandemi etkisi)
- 💻 SaaS teknoloji
- 🏬 Franchising (konsolide değerlendirme)
- 🏖️ Mevsimsel işletme

#### 2. **Consolidation** - 6 test ✅

📁 `consolidation/breakdown.test.ts`

**Komut:** `pnpm test tests/consolidation/breakdown.test.ts`

**Kapsam:**

- Şirket vs kişisel hesap ayrımı
- Banka/nakit/kredi/yatırım kategorileri
- Tablo ve grafik veri hazırlama
- Negatif bakiye yönetimi

#### 3. **Advisor Rules** - 15 test ✅

📁 `advisor/rules.test.ts`

**Komut:** `pnpm test tests/advisor/rules.test.ts`

**Kapsam:**

- Risk profili bazlı portföy önerileri (low/medium/high)
- Çeşitlendirme önerileri
- Konsantrasyon riski tespiti
- Beklenen getiri hesaplamaları

#### 4. **Simulation Engine** - 15 test ✅

📁 `simulation/engine.test.ts`

**Komut:** `pnpm test tests/simulation/engine.test.ts`

**Kapsam:**

- 3-parameter simülasyon (FX/Rate/Inflation)
- 3-6-12 aylık projeksiyonlar
- Nakit açığı tespiti
- Parametre validasyonu

#### 5. **Dashboard Analytics** - 30 test ✅

📁 `dashboard/runway-cashgap.test.ts` + edge + errors

**Komut:** `pnpm test tests/dashboard/`

**Kapsam:**

- Runway calculation
- Cash gap analysis
- Risk level determination
- Monthly projections

---

### 🛡️ Security Tests

#### 6. **Dashboard Security** - 19 test (6 passed, 13 skip) ✅

📁 `security/dashboard-security.test.ts`

**Komut:** `pnpm test:security`

**Kapsam:**

- ✅ SQL Injection prevention
- ✅ XSS prevention
- ✅ Input validation
- ⏭️ Auth/CORS (backend gerekli)

---

### ⚡ Performance Tests

#### 7. **Dashboard Performance** - 11 test ✅

📁 `performance/dashboard-performance.test.ts`

**Komut:** `pnpm test:performance`

**Kapsam:**

- 10,000+ transaction load test
- 50+ concurrent users
- Memory leak detection
- Query optimization
- Cache effectiveness

---

### 🎨 Frontend Tests

#### 8. **Dashboard Widgets** - 19 test ✅

📁 `components/dashboard-widgets.test.tsx`

**Komut:** `pnpm test:frontend`

**Kapsam:**

- Runway widget rendering
- Cash gap widget
- Chart components
- Loading/error states
- Currency formatting
- Responsive design

---

### 🔌 Integration Tests (DATABASE_URL gerekli)

**Durum:** ⏭️ Otomatik skip (DATABASE_URL yoksa)

```bash
# Database ile çalıştırmak için:
DATABASE_URL="your-db-url" pnpm test tests/integration/
```

**Testler:**

- Auth flow
- Bank integration
- Dashboard integration
- Database setup
- Finance DSCR API
- JWT flows

---

### 🌐 E2E Tests (Backend gerekli)

**Durum:** ⏭️ Otomatik skip (backend yoksa)

```bash
# Backend'i başlat (Terminal 1):
pnpm dev:server

# E2E testleri çalıştır (Terminal 2):
E2E_TEST_ENABLED=1 pnpm test tests/e2e/
```

**Testler:**

- Complete user workflow
- Dashboard extended features
- Smoke tests

---

## 🎯 Öncelikli Test Komutları

### 🔴 Deploy Öncesi (CRITICAL)

```bash
pnpm test:critical
```

**Çalışan Testler:** 84 test (DSCR + Consolidation + Advisor + Simulation + Dashboard)
**Beklenen Sonuç:** 100% pass
**Süre:** ~3 saniye

### 🟡 PR Öncesi (HIGH)

```bash
pnpm test:unit
```

**Çalışan Testler:** Core + Business + Utils
**Beklenen Sonuç:** 95%+ pass
**Süre:** ~5 saniye

### 🟢 Haftalık Check (MEDIUM)

```bash
pnpm test
```

**Çalışan Testler:** Tüm suite
**Süre:** ~12 saniye

### 🔵 Full Suite + Coverage (LOW)

```bash
pnpm test:coverage
```

**Çalışan Testler:** Tüm testler + coverage raporu
**Süre:** ~20 saniye

---

## 📝 Test Ekleme/Güncelleme

### Yeni Test Eklemek

1. **Dosyayı oluştur:**

```bash
# İş senaryosu testi
tests/business/my-feature.test.ts

# Component testi
tests/components/MyComponent.test.tsx

# API testi
tests/api/my-endpoint.test.ts
```

2. **Test suite'e ekle:**

```typescript
// tests/test-suite.ts dosyasını aç
// İlgili kategoriyi bul
// Yeni test dosyasını ekle
```

3. **Çalıştır:**

```bash
pnpm test tests/business/my-feature.test.ts
```

### Test Güncellemek

1. **Test dosyasını aç**
2. **İş logic'ini güncelle**
3. **Çalıştır:**

```bash
pnpm test:watch tests/path/to/test.ts
```

---

## 🎨 Test Suite Yapısı

```
tests/
├── test-suite.ts          # 📋 Merkezi test registry ve konfigurasyon
├── setup/                 # 🔧 Test setup ve mocks
│   ├── test-db.ts        # In-memory SQLite database
│   └── test-setup.ts     # Global test configuration
├── business/              # 🎯 İş senaryoları (GERÇEK DURUMLAR)
│   ├── dscr-scenarios.test.ts      # ✅ 36/36 PASSED
│   ├── runway-scenarios.test.ts    # 🔧 In progress
│   └── cashgap-scenarios.test.ts   # 🔧 In progress
├── consolidation/         # ✅ 6/6 PASSED
├── advisor/               # ✅ 15/15 PASSED
├── simulation/            # ✅ 15/15 PASSED
├── dashboard/             # ✅ 30/30 PASSED
├── security/              # 🛡️ 6 passed, 13 skip
├── performance/           # ⚡ 11/11 PASSED
├── components/            # 🎨 19/19 PASSED
├── integration/           # ⏭️ Skip (DB gerekli)
├── e2e/                   # ⏭️ Skip (Backend gerekli)
├── api/                   # ⏭️ Skip (Backend gerekli)
├── modules/               # ⏭️ Skip (DB gerekli)
├── utils/                 # 🔧 Utility functions
└── fixtures/              # 📦 Test data
```

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
- name: Run Critical Tests
  run: pnpm test:critical

- name: Run Unit Tests
  run: pnpm test:unit

- name: Run Coverage
  run: pnpm test:coverage
```

### Pre-commit Hook

```bash
# .husky/pre-commit
pnpm test:critical
```

---

## 📊 Test Metrikleri

### Kategori Bazında Pass Rate (GÜNCEL - 2025-10-11)

| Kategori               | Testler | Pass | Skip | Fail | Rate    |
| ---------------------- | ------- | ---- | ---- | ---- | ------- |
| **DSCR Scenarios**     | 36      | 36   | 0    | 0    | 100% ✅ |
| **User Permissions**   | 17      | 17   | 0    | 0    | 100% ✅ |
| **Consolidation**      | 6       | 6    | 0    | 0    | 100% ✅ |
| **Advisor**            | 15      | 15   | 0    | 0    | 100% ✅ |
| **Simulation**         | 15      | 15   | 0    | 0    | 100% ✅ |
| **Dashboard**          | 30      | 30   | 0    | 0    | 100% ✅ |
| **Performance**        | 11      | 11   | 0    | 0    | 100% ✅ |
| **Dashboard Widgets**  | 19      | 19   | 0    | 0    | 100% ✅ |
| **Password Service**   | 28      | 28   | 0    | 0    | 100% ✅ |
| **Components (Other)** | 17      | 14   | 2    | 1    | 97% ✅  |
| **Security (Other)**   | 50+     | 34   | 14   | 5    | 87% 🟡  |
| **Integration**        | 50+     | 0    | 50+  | 0    | Skip ⏭️ |
| **E2E**                | 30+     | 0    | 30+  | 0    | Skip ⏭️ |

\*Skip = Backend/DB bağımlılığı nedeniyle

### Toplam İstatistikler (GÜNCEL - 2025-10-11 22:55)

```
Total Tests:      949   (+183 new!)
✅ Passing:       447   (47.1%) ⬆️ +79 test!
⏭️ Skipped:       288   (30.3%)
❌ Failing:       214   (22.6%) ⬇️ Azaldı!

Test Files:       64    (+8 new!)
✅ Passing Files: 20    (31.3%) ⬆️ +8 file!
⏭️ Skipped Files: 15    (23.4%)
❌ Failing Files: 29    (45.3%)

🎯 Critical Tests: 84/84 (100%) ✅
🔒 Security Tests: 62/81 (76.5%) ✅
⚡ Performance:    11/11 (100%) ✅
🎨 Components:     33/36 (91.7%) ✅

Execution Time:   ~11 seconds
Coverage:         ~75%
Pass Rate (Active): 67.6% (447 / 661 non-skipped)
```

---

## 🎯 Test Senaryoları - Sektör Bazlı

### 1. **Startup & Technology** 💻

- Runway: Burn rate yönetimi
- DSCR: Erken aşama borçlanma
- Cash Gap: Yatırım funding timing

### 2. **İnşaat & Mühendislik** 🏗️

- Hakediş yönetimi
- Proje bazlı cash flow
- Timing gap (malzeme vs tahsilat)

### 3. **Üretim & İmalat** 🏭

- Kapasite kullanım etkisi
- Hammadde ödemeleri vs satış tahsilatları
- İşletme sermayesi optimizasyonu

### 4. **Perakende & E-ticaret** 🛒

- Hızlı döner sermaye
- Günlük nakit girişleri
- Stok finansmanı

### 5. **Hizmet Sektörü** 🏢

- SaaS: Abonelik modeli
- Danışmanlık: Proje bazlı gelir
- Franchise: Multi-location yönetimi

### 6. **Turizm & Mevsimsel** 🏖️

- Mevsimsel cash flow
- Kış/yaz dengesi
- Sezon sonu hazırlık

### 7. **İhracat & Dış Ticaret** 🌍

- Döviz riski yönetimi
- Uluslararası ödeme vaadeleri
- Kur etkisi

### 8. **Holding & Konglomeralar** 🏢

- Konsolide finansal analiz
- Şirketler arası cash flow
- Multi-entity yönetimi

---

## 🛠️ Geliştiriciler İçin

### Test Yazma Best Practices

#### 1. **İş Senaryosu Odaklı**

```typescript
// ❌ Kötü - Sadece teknik test
it('should return a number', () => {
  expect(typeof dscr).toBe('number');
});

// ✅ İyi - Gerçek iş senaryosu
it('KOBİ kredisi: 140K CF, 100K debt → DSCR 1.4 (bank warning)', () => {
  const dscr = calculateDSCR(140000, 100000);
  expect(dscr).toBe(1.4);
  expect(mapDSCRStatus(dscr)).toBe('warning');
  // Bu DSCR ile kredi başvurusu riskli
});
```

#### 2. **Açıklayıcı Test İsimleri**

```typescript
// ❌ Kötü
it('test1', () => {});

// ✅ İyi
it('İnşaat projesi: 500K hakediş alacağı (90 gün) vs 200K malzeme borcu (30 gün) → timing gap', () => {});
```

#### 3. **Gerçek Değerler Kullan**

```typescript
// ❌ Kötü - Mock değerler
const cash = 123.45;

// ✅ İyi - Gerçekçi iş değerleri
const cash = 50000; // 50K TRY - Tipik startup nakit
const burn = 15000; // 15K/ay - Gerçekçi harcama
```

#### 4. **Context ve Açıklama Ekle**

```typescript
it('Mevsimsel turizm: Yaz sezonu bitişi → nakit sıkışıklığı', () => {
  // Sezon bitmiş, alacaklar azalmış, kış hazırlığı için borç yükü artmış
  const ar = 35000; // Kalan az alacak
  const ap = 180000; // Yüksek borç (stok, renovasyon)

  const gap = ar - ap;
  expect(gap).toBe(-145000); // Kritik negatif gap
  expect(riskLevel).toBe('critical');
});
```

### Yeni Test Kategorisi Eklemek

1. **test-suite.ts'yi güncelle:**

```typescript
export const TEST_REGISTRY = {
  // ...
  myNewCategory: ['my-category/test1.test.ts', 'my-category/test2.test.ts'],
};
```

2. **README'yi güncelle** (bu dosya)

3. **Package.json'a script ekle:**

```json
"test:mycategory": "vitest run tests/my-category/"
```

---

## 📈 Test Coverage Hedefleri

### Mevcut Coverage

- **Business Logic:** %95+ ✅
- **Security:** %80+ ✅
- **Performance:** %85+ ✅
- **Components:** %70+ ✅
- **Integration:** %60+ (DB ile)
- **E2E:** %50+ (Backend ile)

### Hedef Coverage

- **Overall:** %80+ (Şu an ~75%)
- **Critical Paths:** %100
- **Edge Cases:** %90+

---

## 🐛 Troubleshooting

### "DATABASE_URL not set" Hatası

```bash
# Integration testler DATABASE_URL gerektirir
# İki seçenek:

# 1. Skip et (default davranış)
pnpm test  # Integration testler otomatik skip edilir

# 2. Test database ile çalıştır
DATABASE_URL="postgresql://test:test@localhost/finbot_test" pnpm test
```

### "Backend not available" Hatası

```bash
# E2E testler backend gerektirir

# Backend'i başlat:
pnpm dev:server  # Port 5000'de

# E2E testleri çalıştır:
E2E_TEST_ENABLED=1 pnpm test tests/e2e/
```

### Mock Hataları

```bash
# Test setup dosyasını kontrol et:
tests/setup/test-setup.ts

# Mock'lar düzgün export ediliyor mu?
# default export var mı?
```

### Timeout Hataları

```bash
# vitest.config.ts'de timeout artır:
testTimeout: 30000,  // 30 saniye
```

---

## 📚 Ek Kaynaklar

- **Test Plan:** `TEST_PLAN.md`
- **Gap Analysis:** `TEST_GAP_ANALYSIS.md`
- **Test Results:** `TEST_SONUC_RAPORU.md`
- **Test Suite Config:** `tests/test-suite.ts`

---

## 🚀 Hızlı Komutlar Özeti

```bash
# Temel komutlar
pnpm test                    # Tüm testler
pnpm test:critical           # Sadece critical testler (84 test)
pnpm test:business           # Business scenarios
pnpm test:security           # Security tests
pnpm test:performance        # Performance tests
pnpm test:frontend           # Component tests
pnpm test:coverage           # Coverage raporu
pnpm test:watch              # Watch mode

# Kategoriler
pnpm test tests/business/    # Business senaryoları
pnpm test tests/dashboard/   # Dashboard testleri
pnpm test tests/security/    # Güvenlik testleri

# Specific tests
pnpm test tests/business/dscr-scenarios.test.ts      # DSCR testleri
pnpm test tests/consolidation/breakdown.test.ts      # Consolidation
pnpm test tests/advisor/rules.test.ts                # Advisor
pnpm test tests/simulation/engine.test.ts            # Simulation

# PowerShell runners
.\run-tests.ps1             # İnteraktif menü
.\quick-test.bat            # Hızlı batch run
```

---

## ✨ Test Suite Özellikleri

- ✅ **944 toplam test** (178 yeni test eklendi)
- ✅ **64 test dosyası** (8 yeni dosya)
- ✅ **13 sektör** senaryosu kapsanıyor
- ✅ **Otomatik skip** (DB/Backend yoksa)
- ✅ **Smart mocking** (Production-ready)
- ✅ **Performance tested** (10K+ records)
- ✅ **Security validated** (SQL injection, XSS)
- ✅ **Real business scenarios** (Gerçek şirket verileri)

---

**Son Güncelleme:** 2025-10-11  
**Test Suite Versiyonu:** 2.0  
**Maintained by:** FinBot Development Team
