# 🎯 Test Komutları - Basit & Mantıklı Yapı

## 📋 PHASE SİSTEMİ

### `pnpm test1` - PHASE 1: Deploy Hazırlık ⭐
**Deploy öncesi ZORUNLU!**
```bash
pnpm test1
```

**Ne yapar:**
- ✅ Critical Tests (84 test)
- ✅ Coverage Analizi
- ✅ Performance Raporu
- ✅ README Güncelleme

**Süre:** ~3-4 dakika
**Ne zaman:** Her deploy öncesi

---

### `pnpm test2` - PHASE 2: Git & CI/CD 🔀
**Git ve CI/CD kontrolleri**
```bash
pnpm test2
```

**Ne yapar:**
- ✅ Critical Tests
- ✅ Git Hooks Kontrol
- ✅ CI/CD Files Kontrol
- ✅ Dependency Audit

**Süre:** ~4-5 dakika
**Ne zaman:** PR öncesi, haftalık

---

### `pnpm test3` - PHASE 3: Akıllı Sistem 🤖
**Gelişmiş analiz ve otomasyonlar**
```bash
pnpm test3
```

**Ne yapar:**
- ✅ Full Test Suite
- ✅ Auto-Fix Suggestions
- ✅ Smart Test Selection
- ✅ Test Data Management

**Süre:** ~10-15 dakika
**Ne zaman:** Major release öncesi

---

### `pnpm test4` - PHASE 4: Görsel & AI 📊
**Dashboard ve AI destekli analizler**
```bash
pnpm test4
```

**Ne yapar:**
- ✅ Visual Dashboard
- ✅ AI Test Generator
- ✅ Trend Analysis
- ✅ Notifications

**Süre:** ~15-20 dakika
**Ne zaman:** Sprint sonu, release planlaması

---

## 🚀 HIZLI KOMUTLAR

### `pnpm test:quick` - Hızlı Test
```bash
pnpm test:quick
```
Sadece critical testler - 2 dakika ⚡

---

### `pnpm test:full` - Tam Test
```bash
pnpm test:full
```
Her şey dahil - 15 dakika 🌐

---

### `pnpm test:deploy` - Deploy Check
```bash
pnpm test:deploy
```
Deploy öncesi tüm kontroller - 5 dakika 🚀

---

## 📊 ÖZEL KOMUTLAR

### Coverage
```bash
pnpm test:coverage        # Coverage çalıştır
pnpm test:coverage-only   # Sadece rapor göster
```

### Kategorik
```bash
pnpm test:business        # İş senaryoları
pnpm test:security        # Güvenlik
pnpm test:performance     # Performans
pnpm test:frontend        # UI testleri
```

### Analiz
```bash
pnpm test:analyze         # Detaylı analiz
pnpm test:fix             # Otomatik düzeltmeler
pnpm test:smart           # Akıllı test seçimi
```

---

## 🎯 KULLANIM SENARYOLARI

### Senaryo 1: Günlük Geliştirme
```bash
# Kod yazdın, test et
pnpm test:quick

# Feature tamamlandı
pnpm test1

# PR açmadan önce
pnpm test2
```

### Senaryo 2: Deploy Hazırlık
```bash
# 1. Temel kontrol
pnpm test1

# 2. Full kontrol
pnpm test:deploy

# 3. Deploy!
```

### Senaryo 3: Sprint Sonu
```bash
# 1. Full test
pnpm test:full

# 2. Akıllı analiz
pnpm test3

# 3. Dashboard + AI
pnpm test4
```

---

## 🔄 KOMUT HİYERARŞİSİ

```
test:quick (2 dk)        → Hızlı kontrol
    ↓
test1 (4 dk)             → Deploy hazır
    ↓
test2 (5 dk)             → Git/CI hazır
    ↓
test3 (15 dk)            → Akıllı analiz
    ↓
test4 (20 dk)            → Tam rapor
    ↓
test:full (25 dk)        → Her şey
```

---

## 💡 AKILLI SEÇİM

**Günlük:** `test:quick`
**Commit:** `test1`
**PR:** `test2`
**Release:** `test3`
**Sprint:** `test4`
**Acil:** `test:quick`

---

## 🎨 RENK KODLARI

- 🟢 **test:quick** - Hızlı (2 dk)
- 🔵 **test1** - Temel (4 dk)
- 🟣 **test2** - Git/CI (5 dk)
- 🟡 **test3** - Akıllı (15 dk)
- 🔴 **test4** - Full (20 dk)

---

## 📝 NOTLAR

1. `test1` her zaman çalıştır (deploy öncesi)
2. `test2` haftalık çalıştır (güvenlik)
3. `test3` major release'de (kalite)
4. `test4` sprint sonunda (analiz)
5. `test:quick` her commit'te (hız)

**Mantık:** Küçükten büyüğe, hızdan detaya! 🎯

