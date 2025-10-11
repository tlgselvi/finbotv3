# 🎯 FinBot - Tüm Komutlar Listesi

**Son Güncelleme:** 11.10.2025
**Toplam Komut:** 50+

---

## ⭐ EN ÇOK KULLANILACAK (TOP 5)

```bash
pnpm test1            # Deploy hazırlık (20s) - EN ÖNEMLİ! ⭐
pnpm test:quick       # Hızlı test (2s)
pnpm test:deploy      # Deploy check (5s)
pnpm fix:all          # Otomatik düzeltmeler (15s)
pnpm sec:secrets      # Secret tarama (2s)
```

---

## 📊 PHASE SİSTEMİ (4 Komut)

| Komut        | Açıklama                 | Süre | Ne Zaman             |
| ------------ | ------------------------ | ---- | -------------------- |
| `pnpm test1` | Phase 1: Deploy Hazırlık | 20s  | Her deploy öncesi ⭐ |
| `pnpm test2` | Phase 2: Git & CI/CD     | 5s   | PR öncesi            |
| `pnpm test3` | Phase 3: Akıllı Sistem   | 15dk | Major release        |
| `pnpm test4` | Phase 4: Görsel & AI     | 20dk | Sprint sonu          |

### **Phase 1 Detay:**

```bash
pnpm test1
```

**Ne yapar:**

- ✅ Critical Tests (84 test)
- ✅ Coverage Analizi
- ✅ Performance Raporu
- ✅ README Güncelleme
- ✅ Auto-Fix (Prettier + ESLint + Audit)
- ✅ HTML Rapor
- ✅ Fail-Fast Check

---

## ⚡ HIZLI KOMUTLAR (3)

```bash
pnpm test:quick       # Sadece critical tests (2s)
pnpm test:deploy      # Tests + Lint + Types (5s)
pnpm test:full        # Her şey + Smart runner (25dk)
```

---

## 🧪 TEST KOMUTLARI (15)

### **Temel Test Komutları:**

```bash
pnpm test             # Tüm testler
pnpm test:watch       # Watch mode
pnpm test:suite       # Test suite
```

### **Kategorik Testler:**

```bash
pnpm test:critical    # Critical tests (84 test) - 2s
pnpm test:business    # Business scenarios (36 test)
pnpm test:security    # Security tests (19 test)
pnpm test:performance # Performance tests (11 test)
pnpm test:frontend    # Component tests (19 test)
pnpm test:unit        # Unit tests
```

### **Coverage:**

```bash
pnpm test:coverage           # Coverage raporu
pnpm test:coverage-analyze   # Coverage analizi
pnpm test:coverage-full      # Test + Analiz
pnpm coverage:analyze        # Sadece analiz
```

### **E2E Tests:**

```bash
pnpm test:e2e         # E2E testler
pnpm test:e2e:ui      # UI mode
pnpm test:e2e:debug   # Debug mode
pnpm test:e2e:report  # Rapor göster
```

### **Özel Test Komutları:**

```bash
pnpm test:flaky       # Flaky test detector (3× run)
pnpm test:auto        # Browser auto-test
pnpm test:smart       # Smart test runner
pnpm test:smart-auto  # Smart auto-test
pnpm test:update      # README güncelle (test çalıştır)
pnpm test:update-quick # README hızlı güncelle
```

---

## 🔒 GÜVENLİK KOMUTLARI (6)

```bash
pnpm sec:secrets      # Secret sızıntı tarama (2s)
pnpm sec:sast         # SAST - Static Analysis (5s)
pnpm sec:license      # Lisans audit (3s)
pnpm sbom:gen         # SBOM oluştur (3s)
pnpm db:dryrun        # Migration güvenlik (1s)
pnpm health:check     # Endpoint health monitoring (2s)
```

### **Detayları:**

#### **Secret Scan:**

```bash
pnpm sec:secrets
```

- Kod tabanında secret arar
- AWS keys, API keys, passwords, private keys
- Bulursa: EXIT 1 (push engellenir!)

#### **SAST Scan:**

```bash
pnpm sec:sast
```

- SQL injection
- eval() usage
- XSS risks
- Unsafe patterns

#### **License Audit:**

```bash
pnpm sec:license
```

- Tüm dependency lisanslarını kontrol eder
- High risk: GPL-3.0, AGPL-3.0
- Safe: MIT, Apache-2.0

#### **SBOM:**

```bash
pnpm sbom:gen
```

- Software Bill of Materials
- CycloneDX format
- Hash + Provenance

#### **Migration Guard:**

```bash
pnpm db:dryrun
```

- Destructive operations: DROP, TRUNCATE
- Risky changes: ALTER TYPE
- Rapor: artifacts/migrations/

#### **Health Check:**

```bash
pnpm health:check
```

- .env'den URL\_\* okur
- Her endpoint'e ping atar
- Response time ölçer

---

## 🔧 KALİTE & DÜZELTME (3)

```bash
pnpm fix:all          # Auto-fix: Prettier + ESLint + Audit (15s)
pnpm report:gen       # HTML rapor oluştur (1s)
pnpm backup:conf      # Config backup (1s)
```

### **Auto-Fix Detay:**

```bash
pnpm fix:all
```

**Yapılanlar:**

1. **Prettier** - Kod formatı (3-10s)
   - 200+ dosya
   - Consistent formatting
2. **ESLint** - Kod kalitesi (4-6s)
   - Auto-fix errors
   - Remove unused vars
3. **Audit** - Güvenlik (2-4s)
   - Security vulnerabilities
   - Package updates

**Rapor:** `reports/fix-report.txt`

---

## 💻 DEVELOPMENT KOMUTLARI (3)

```bash
pnpm dev              # Tüm servisler (frontend + backend)
pnpm dev:client       # Sadece frontend (Vite)
pnpm dev:server       # Sadece backend (Express)
```

---

## 🏗️ BUILD KOMUTLARI (4)

```bash
pnpm build            # Production build (tümü)
pnpm build:client     # Frontend build
pnpm build:server     # Backend build
pnpm start            # Production server başlat
```

---

## 🗄️ DATABASE KOMUTLARI (5)

```bash
pnpm db:generate      # Schema'dan migration oluştur
pnpm db:migrate       # Migration'ları uygula
pnpm db:push          # Schema'yı push et
pnpm db:studio        # Drizzle Studio aç
pnpm db:seed          # Demo data yükle
```

---

## 📝 CODE QUALITY (3)

```bash
pnpm lint             # ESLint kontrolü
pnpm format           # Prettier format
pnpm type-check       # TypeScript kontrolü
```

---

## 🎨 MENÜ SİSTEMİ (3 Runner)

### **PowerShell İnteraktif Menü:**

```bash
.\run-tests.ps1
```

**Menü Seçenekleri:**

```
1. 🎯 AKTIF TESTLER (133 test)
2. 📊 PHASE 1: Temel Analiz ⭐
3. 🔀 PHASE 2: Git & CI/CD
4. 🤖 PHASE 3: Akıllı Sistem
5. 🎯 BUSINESS (36 test)
6. 🛡️ SECURITY (19 test)
7. ⚡ PERFORMANCE (11 test)
8. 🎨 FRONTEND (19 test)
9. 📈 COVERAGE RAPORU
A. 🌐 TÜM TESTLER
0. ❌ ÇIKIŞ
```

### **Windows Batch:**

```bash
.\test.bat            # Tek tık - Akıllı test runner
```

### **PowerShell:**

```bash
.\test.ps1            # Tek tık - Akıllı test runner
```

---

## 📊 KATEGORİK KOMUTLAR

### **Test Kategorileri:**

```bash
pnpm test:business     # İş senaryoları (36)
pnpm test:security     # Güvenlik (19)
pnpm test:performance  # Performans (11)
pnpm test:frontend     # UI Components (19)
pnpm test:unit         # Unit testler
pnpm test:critical     # Critical testler (84) ⭐
```

### **Güvenlik Kategorileri:**

```bash
pnpm sec:secrets       # Secret tarama
pnpm sec:sast          # SAST
pnpm sec:license       # Lisans
```

### **Analiz Kategorileri:**

```bash
pnpm coverage:analyze  # Coverage
pnpm test:flaky        # Flaky tests
pnpm health:check      # Health
```

---

## 🚀 TÜM KOMUTLAR (Alfabetik)

```bash
# === B ===
pnpm backup:conf              # Config yedekle
pnpm build                    # Production build
pnpm build:client             # Frontend build
pnpm build:server             # Backend build

# === C ===
pnpm coverage:analyze         # Coverage analizi

# === D ===
pnpm db:dryrun                # Migration guard
pnpm db:generate              # Migration oluştur
pnpm db:migrate               # Migration uygula
pnpm db:push                  # Schema push
pnpm db:seed                  # Seed data
pnpm db:studio                # Drizzle Studio
pnpm dev                      # Development (all)
pnpm dev:client               # Frontend dev
pnpm dev:server               # Backend dev

# === F ===
pnpm fix:all                  # Auto-fix (Prettier + ESLint + Audit)
pnpm format                   # Prettier format

# === H ===
pnpm health:check             # Endpoint health monitoring

# === L ===
pnpm lint                     # ESLint

# === R ===
pnpm report:gen               # HTML rapor

# === S ===
pnpm sbom:gen                 # SBOM oluştur
pnpm sec:license              # License audit
pnpm sec:sast                 # SAST scan
pnpm sec:secrets              # Secret scan
pnpm start                    # Production start

# === T ===
pnpm test                     # Tüm testler
pnpm test1                    # Phase 1: Deploy Hazırlık ⭐
pnpm test2                    # Phase 2: Git & CI/CD
pnpm test3                    # Phase 3: Akıllı Sistem
pnpm test4                    # Phase 4: Görsel & AI
pnpm test:auto                # Auto browser test
pnpm test:business            # Business tests
pnpm test:coverage            # Coverage raporu
pnpm test:coverage-analyze    # Coverage analizi
pnpm test:coverage-full       # Test + analiz
pnpm test:critical            # Critical tests (84)
pnpm test:deploy              # Deploy check
pnpm test:e2e                 # E2E testler
pnpm test:e2e:debug           # E2E debug
pnpm test:e2e:report          # E2E rapor
pnpm test:e2e:ui              # E2E UI mode
pnpm test:flaky               # Flaky detector
pnpm test:frontend            # Frontend tests
pnpm test:full                # Full test suite
pnpm test:performance         # Performance tests
pnpm test:quick               # Hızlı test ⚡
pnpm test:security            # Security tests
pnpm test:smart               # Smart runner
pnpm test:smart-auto          # Smart auto-test
pnpm test:suite               # Test suite
pnpm test:unit                # Unit tests
pnpm test:update              # README güncelle (with tests)
pnpm test:update-quick        # README hızlı güncelle
pnpm test:watch               # Watch mode
pnpm type-check               # TypeScript check
```

---

## 🎯 KOMUT GRUPLARI

### **🚀 DEPLOY İŞLEMLERİ:**

```bash
pnpm test1            # Deploy hazırlık ⭐
pnpm test:deploy      # Deploy final check
pnpm backup:conf      # Config backup
pnpm health:check     # Health monitoring
```

### **🧪 TEST İŞLEMLERİ:**

```bash
pnpm test:quick       # Hızlı (2s) ⚡
pnpm test:critical    # Critical (84 test)
pnpm test             # Tüm testler
pnpm test:coverage    # Coverage
```

### **🔒 GÜVENLİK İŞLEMLERİ:**

```bash
pnpm sec:secrets      # Secret tarama
pnpm sec:sast         # SAST
pnpm sec:license      # Lisans
pnpm sbom:gen         # SBOM
pnpm db:dryrun        # Migration guard
```

### **🔧 KALİTE İŞLEMLERİ:**

```bash
pnpm fix:all          # Auto-fix
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm type-check       # TypeScript
```

### **📊 RAPORLAMA:**

```bash
pnpm report:gen       # HTML rapor
pnpm test:flaky       # Flaky tests
pnpm coverage:analyze # Coverage analizi
pnpm test:update      # README güncelle
```

---

## 📋 GÜNLÜK WORKFLOW

### **Sabah (09:00):**

```bash
pnpm test:quick       # Sistem OK mu? (2s)
```

### **Kod Yazarken:**

```bash
pnpm test:quick       # Her 30 dakikada (2s)
```

### **Commit Öncesi:**

```bash
pnpm test1            # Full check (20s)
git commit -m "feat: ..."
```

### **Push Öncesi:**

```bash
git push
# Otomatik: pre-push hooks çalışır
# - test1
# - sec:secrets
# - sec:sast (optional)
# - sec:license (optional)
```

### **Deploy Öncesi:**

```bash
pnpm test1            # Deploy hazırlık
pnpm test:deploy      # Final check
pnpm backup:conf      # Backup
# Deploy! 🚀
```

---

## 🎨 İNTERAKTİF MENÜ

### **PowerShell Menü:**

```powershell
.\run-tests.ps1
# Seçenek gir: 1-9, A, 0
```

**Önerilen seçenekler:**

- **1** → Tüm aktif testler (güncelleme ile)
- **2** → Phase 1 (deploy hazırlık) ⭐
- **5** → Sadece business tests
- **9** → Coverage raporu

---

## 💡 ÖZEL DURUMLAR

### **İlk Kez Coverage:**

```bash
pnpm test:coverage    # İlk coverage raporu oluştur
```

### **Security Full Scan:**

```bash
pnpm sec:secrets
pnpm sec:sast
pnpm sec:license
pnpm sbom:gen
```

### **Full Quality Check:**

```bash
pnpm fix:all
pnpm lint
pnpm type-check
pnpm test:coverage
```

### **Emergency Fix:**

```bash
pnpm test:quick       # Hızlı kontrol
pnpm fix:all          # Otomatik düzelt
pnpm test:quick       # Tekrar kontrol
```

---

## 📊 KOMUT KARŞILAŞTIRMASI

| Komut         | Testler  | Coverage | Auto-Fix | Security | Rapor | Süre |
| ------------- | -------- | -------- | -------- | -------- | ----- | ---- |
| `test:quick`  | ✅ (84)  | ❌       | ❌       | ❌       | ❌    | 2s   |
| `test1` ⭐    | ✅ (84)  | ✅       | ✅       | ❌       | ✅    | 20s  |
| `test:deploy` | ✅ (84)  | ❌       | ❌       | ❌       | ❌    | 5s   |
| `test2`       | ✅ (84)  | ❌       | ❌       | ✅       | ❌    | 5s   |
| `test:full`   | ✅ (949) | ✅       | ✅       | ✅       | ✅    | 25dk |

---

## 🎯 KULLANIM ÖNERİLERİ

### **Her Gün:**

```bash
pnpm test:quick       # En az 3-4 kez
```

### **Her Commit:**

```bash
pnpm test1            # Veya test:quick
```

### **Her Push:**

```bash
git push              # Hooks otomatik çalışır
```

### **Haftada 1:**

```bash
pnpm test2            # Git & CI/CD kontrol
pnpm test:full        # Full scan
```

### **Major Release:**

```bash
pnpm test3            # Akıllı analiz
pnpm test4            # Full rapor
```

---

## 🆘 SORUN GİDERME KOMUTLARI

### **Test Başarısız:**

```bash
pnpm test:quick       # Hangi test fail?
pnpm test:flaky       # Flaky mi?
pnpm fix:all          # Otomatik düzelt
```

### **Coverage Düşük:**

```bash
pnpm test:coverage    # Coverage raporu
pnpm coverage:analyze # Detaylı analiz
# Düşük dosyaları tespit et ve test yaz
```

### **Security Issue:**

```bash
pnpm sec:secrets      # Secret var mı?
pnpm sec:sast         # Security issue var mı?
pnpm sec:license      # Risky license var mı?
```

### **Deploy Engelleniyor:**

```bash
pnpm test:deploy      # Neyi fail ediyor?
pnpm test1            # Critical geçiyor mu?
pnpm fix:all          # Düzelt
```

---

## 📚 DÖKÜMANTASYON KOMUTLARI

**Komut yok, ama şu dosyalara bak:**

```bash
cat QUICK_START.md                    # Hızlı başlangıç
cat TEST_COMMANDS.md                  # Komut detayları
cat FINBOT_CTO_AI_CORE_COMPLETE.md    # Tam sistem (2,161 satır!)
cat SISTEM_DETAY.md                   # Teknik detaylar
cat tests/README.md                   # Test suite docs
```

---

## 🎁 GİZLİ/ESKI KOMUTLAR

```bash
# Eski/legacy komutlar (hala çalışır):
node auto-test.js                     # Manuel browser test
node smart-auto-test.js               # Smart browser test
.\quick-test.bat                      # Windows batch runner
```

---

## ⚙️ GIT HOOKS (Otomatik)

### **Pre-Push (.husky/pre-push):**

```bash
# Git push yapınca otomatik çalışır:
pnpm test1           # Critical tests
pnpm coverage:analyze # Coverage
pnpm sec:secrets     # Secrets
pnpm sec:sast        # SAST
pnpm sec:license     # License
pnpm db:dryrun       # Migration

# Hata varsa push iptal!
```

### **Prepare (package.json):**

```bash
pnpm prepare          # Husky install (otomatik)
```

---

## 🚀 CI/CD (GitHub Actions - Otomatik)

**Trigger:** Git push to main/dev/master

**Çalışan Komutlar:**

```bash
pnpm install --frozen-lockfile
pnpm test1
pnpm sbom:gen
pnpm sec:secrets
pnpm sec:sast
pnpm sec:license
pnpm coverage:analyze
pnpm report:gen
# Artifacts upload
```

---

## 🎯 KOMUT SEÇİM AKIŞI

```
Hızlı mı lazım?
    ├─> YES → pnpm test:quick (2s)
    └─> NO ↓

Deploy mi yapacaksın?
    ├─> YES → pnpm test1 (20s) ⭐
    └─> NO ↓

PR mi açacaksın?
    ├─> YES → pnpm test2 (5s)
    └─> NO ↓

Security check mi lazım?
    ├─> YES → pnpm sec:secrets + sec:license
    └─> NO ↓

Full analysis mi lazım?
    ├─> YES → pnpm test:full (25dk)
    └─> NO → pnpm test (tüm testler)
```

---

## 📈 KOMUT İSTATİSTİKLERİ

**En Hızlı:**

```
pnpm db:dryrun       → 1s
```

**En Popüler:**

```
pnpm test1           → %80 kullanım ⭐
pnpm test:quick      → %70 kullanım
```

**En Uzun:**

```
pnpm test:full       → 25 dakika
pnpm test3           → 15 dakika
```

**En Kritik:**

```
pnpm test1           → Deploy için zorunlu! ⭐
pnpm sec:secrets     → Pre-push zorunlu!
```

---

## 🎊 ÖZET

```
TOPLAM KOMUT: 50+

EN ÖNEMLİ 3:
1. pnpm test1         → Deploy hazırlık ⭐⭐⭐
2. pnpm test:quick    → Hızlı test ⭐⭐
3. pnpm sec:secrets   → Secret tarama ⭐⭐

GÜNLÜK:
• test:quick (3-4 kez)
• test1 (1 kez)

HAFTALIK:
• test2 (1 kez)
• test:full (1 kez)

AYLIK:
• test3 (1 kez)
• test4 (1 kez)
```

---

**Favori komutunu seç ve kullan! 🚀**

**Önerimiz:** `pnpm test1` - Her deploy öncesi mutlaka! ⭐
