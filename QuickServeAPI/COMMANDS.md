# 🚀 FinBot v3 - Komut Rehberi

**Son Güncelleme:** 2025-10-12  
**Versiyon:** 3.0

---

## ⚡ 3 TEMEL KOMUT (99% Kullanım)

```bash
# 1️⃣ HIZLI TEST (2 saniye)
pnpm test:quick

# 2️⃣ DEPLOY HAZIRLIK (20 saniye) ⭐ EN ÖNEMLİ
pnpm test1

# 3️⃣ OTOMATIK (Git push yaparken)
git push    # Otomatik kontroller çalışır
```

**BU 3 KOMUTU BİL, YETERLİ!** ✅

---

## 📋 NE ZAMAN HANGİSİNİ?

| Durum                | Komut                     | Süre |
| -------------------- | ------------------------- | ---- |
| 💻 Kod yazdın        | `pnpm test:quick`         | 2s   |
| 📝 Commit yapacaksın | `pnpm test1`              | 20s  |
| 🚀 Push yapacaksın   | `git push`                | Auto |
| 🚀 Deploy edeceksin  | `pnpm test1` → `git push` | Auto |

---

## 🎯 KOMUT DETAYLARI

### 1️⃣ `pnpm test:quick` - Hızlı Kontrol

**Ne yapar:**

- ✅ 84 critical test çalıştırır
- ⏱️ 2 saniye

**Ne zaman:**

- Her kod değişikliğinden sonra
- Commit öncesi hızlı kontrol
- Development sırasında

**Örnek çıktı:**

```bash
✓ tests/business/dscr-scenarios.test.ts (36 tests)
✓ tests/consolidation/breakdown.test.ts (6 tests)
✓ tests/advisor/rules.test.ts (15 tests)
✓ tests/simulation/engine.test.ts (15 tests)
✓ tests/dashboard/runway-cashgap.test.ts (12 tests)

✅ 84/84 tests passed → Deploy OK!
```

---

### 2️⃣ `pnpm test1` - Deploy Hazırlık ⭐

**DEPLOY ÖNCESI ZORUNLU!**

**Ne yapar:**

- ✅ 84 critical test çalıştırır
- ✅ Coverage analizi yapar
- ✅ Performance kontrol eder
- ✅ README.md günceller
- ✅ package.json günceller
- ✅ Kodu düzeltir (Prettier + ESLint + Audit)
- ✅ HTML rapor oluşturur (`reports/summary.html`)
- ✅ Eksik testleri tespit eder
- ✅ Yeni test şablonları oluşturur (max 5)
- ✅ Geçici dosyaları temizler
- ✅ Fail-fast log tutar
- ✅ Özet rapor gösterir

**Süre:** ~20 saniye

**Ne zaman:**

- Her commit öncesi
- Deploy öncesi (ZORUNLU!)
- Pull Request öncesi
- Sprint sonu

**Örnek çıktı:**

```bash
[1/8] ✅ Critical Tests: 84/84 passed
[2/8] ✅ Coverage: 75% (target: 80%)
[3/8] ✅ Performance: All checks passed
[4/8] ✅ README updated
[5/8] ✅ Code fixed (Prettier + ESLint)
[6/8] ✅ Eksik testler tespit edildi: 71 dosya
[7/8] ✅ 5 test şablonu oluşturuldu
[8/8] ✅ Geçici dosyalar temizlendi

🎉 Deploy için hazır!
```

---

### 3️⃣ `git push` - Otomatik Kontroller

**Hiçbir şey yapma, otomatik çalışır!**

**Git hooks otomatik çalıştırır:**

- ✅ `test1` (testler + analiz)
- ✅ Secret tarama (`sec:secrets`)
- ✅ Security scan (`sec:sast`)
- ✅ License audit (`sec:license`)
- ✅ Migration guard (`db:dryrun`)

**Hata varsa push iptal edilir!** ✋

---

## 🎨 DAHA KOLAY: İNTERAKTİF MENÜ

Windows PowerShell için:

```bash
.\run-tests.ps1
```

**Menü seçenekleri:**

```
═══════════════════════════════════════
      FinBot Test Menüsü
═══════════════════════════════════════

1. Günlük Test (test:quick - 2s)
2. Deploy Hazırlık (test1 - 20s) ⭐
3. Tam Test Suite (tüm testler)
4. Coverage Raporu
5. Security Tarama
6. Çıkış

Seçim (1-6):
```

---

## 🔧 DİĞER YARDIMCI KOMUTLAR

### Test Komutları

```bash
# Test kategorileri
pnpm test                    # Tüm testler
pnpm test:watch              # Watch mode
pnpm test:coverage           # Coverage ile
pnpm test:business           # Sadece business logic
pnpm test:security           # Sadece security
pnpm test:frontend           # Sadece frontend

# Akıllı testler
pnpm test:smart              # Akıllı test runner
pnpm test:auto               # Browser otomatik test
pnpm test:e2e                # E2E testler
pnpm test:e2e:ui             # E2E UI mode

# Phase sistemi
pnpm test2                   # Git & CI/CD (nadiren)
pnpm test3                   # Akıllı sistem (nadiren)
pnpm test4                   # Görsel & AI (nadiren)
```

### Kod Kalitesi

```bash
pnpm fix:all                 # Auto-fix (Prettier + ESLint + Audit)
pnpm lint                    # ESLint kontrol
pnpm format                  # Prettier format
pnpm type-check              # TypeScript kontrol
```

### Güvenlik

```bash
pnpm sec:secrets             # Secret tarama
pnpm sec:sast                # Security scan
pnpm sec:license             # License audit
pnpm sbom:gen                # SBOM oluştur
```

### Veritabanı

```bash
pnpm db:generate             # Schema generate
pnpm db:migrate              # Migration çalıştır
pnpm db:push                 # Schema push
pnpm db:studio               # Drizzle Studio (GUI)
pnpm db:seed                 # Test data seed
pnpm db:dryrun               # Migration dry run
```

### Raporlama

```bash
pnpm report:gen              # Rapor oluştur
pnpm test:update             # README güncelle
pnpm backup:conf             # Config backup
pnpm health:check            # Sistem health check
```

---

## 🆘 SORUN GİDERME

### Test Fail Olursa

```bash
# 1. Hangi test fail oldu?
pnpm test:quick

# 2. Detaylı log
pnpm test:watch

# 3. Düzelt ve tekrar test
pnpm test:quick
```

### Coverage Düşükse

```bash
# Coverage raporunu görüntüle
pnpm test:coverage

# HTML raporu aç
open coverage/index.html
```

### Secret Tespit Edilirse

```bash
# Secret'ları gör
pnpm sec:secrets

# Düzelt:
# 1. Hardcoded secret'ı .env'e taşı
# 2. .gitignore'da .env var mı kontrol et
# 3. Git history'den temizle (gerekirse)
```

---

## 💡 İPUÇLARI

### 1. Test-Driven Development

```bash
# 1. Test yaz
# 2. Test fail olsun (RED)
pnpm test:watch

# 3. Kodu yaz
# 4. Test geçsin (GREEN)
pnpm test:watch

# 5. Refactor
pnpm test:watch
```

### 2. Pre-Commit Workflow

```bash
# Her commit öncesi:
pnpm test:quick    # 2s - Hızlı kontrol
pnpm test1         # 20s - Tam kontrol
git add .
git commit -m "feat: yeni özellik"
```

### 3. Deploy Workflow

```bash
# Deploy öncesi ZORUNLU:
pnpm test1         # Deploy hazırlık
git push           # Otomatik kontroller

# Render'da otomatik deploy başlar
# Hata varsa push iptal edilir
```

---

## 🎯 ÖZETİN ÖZETİ

**Günlük kullanım:**

```bash
pnpm test:quick    # 2s - Her kod değişikliği sonrası
```

**Deploy öncesi:**

```bash
pnpm test1         # 20s - Deploy öncesi ZORUNLU
```

**O kadar!** 🎉

---

## 📚 Daha Fazla Bilgi

- **Test Dokümantasyonu:** `TESTING.md`
- **Deployment Rehberi:** `DEPLOYMENT.md`
- **API Dokümantasyonu:** `API_DOCUMENTATION.md`
- **Test Workflow:** `TEST_WORKFLOW.md`
- **Sistem Mimarisi:** `ARCHITECTURE.md`
