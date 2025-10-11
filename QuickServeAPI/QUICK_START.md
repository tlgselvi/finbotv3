# 🚀 Test Komutları - Hızlı Başlangıç

## ⚡ EN ÇOK KULLANILAN KOMUTLAR

### 1️⃣ Hızlı Test (2 dakika)

```bash
pnpm test:quick
```

Sadece critical testler - Her commit'te çalıştır ⚡

### 2️⃣ Deploy Hazırlık (4 dakika) ⭐

```bash
pnpm test1
```

**Deploy öncesi ZORUNLU!** Critical + Coverage + Performance

### 3️⃣ Deploy Kontrol (5 dakika)

```bash
pnpm test:deploy
```

Deploy öncesi son kontrol - Tests + Lint + Types

---

## 📊 PHASE SİSTEMİ

```bash
pnpm test1    # Phase 1: Temel Analiz (4 dk) ⭐
pnpm test2    # Phase 2: Git & CI/CD (5 dk)
pnpm test3    # Phase 3: Akıllı Sistem (15 dk)
pnpm test4    # Phase 4: Görsel & AI (20 dk)
```

---

## 🎯 NE ZAMAN HANGİ KOMUTU?

| Durum                   | Komut         | Süre  |
| ----------------------- | ------------- | ----- |
| 💻 **Kod yazdım**       | `test:quick`  | 2 dk  |
| 📝 **Commit yapacağım** | `test1`       | 4 dk  |
| 🔀 **PR açacağım**      | `test2`       | 5 dk  |
| 🚀 **Deploy edeceğim**  | `test:deploy` | 5 dk  |
| 📦 **Release**          | `test3`       | 15 dk |
| 📊 **Sprint sonu**      | `test4`       | 20 dk |

---

## ⚡ TAVSİYE EDİLEN WORKFLOW

### Günlük Geliştirme

```bash
# 1. Kod yaz
# 2. Hızlı test
pnpm test:quick

# 3. Sorun yoksa commit
git add .
git commit -m "feat: new feature"
```

### Deploy Öncesi

```bash
# 1. Temel kontrol
pnpm test1

# 2. Deploy kontrol
pnpm test:deploy

# 3. Her şey OK? Deploy!
```

### PR Öncesi

```bash
# 1. Full phase 1
pnpm test1

# 2. Git & CI kontrol
pnpm test2

# 3. PR aç
```

---

## 🎨 GÖRSEL REHBEtestR

```
test:quick (2')     → ⚡ Hızlı
    ↓
test1 (4')          → ⭐ Deploy
    ↓
test2 (5')          → 🔀 Git/CI
    ↓
test3 (15')         → 🤖 Akıllı
    ↓
test4 (20')         → 📊 Full
```

---

## 💡 PRO TİPLER

1. **Her commit öncesi:** `test:quick`
2. **Her deploy öncesi:** `test1` + `test:deploy`
3. **Her PR öncesi:** `test2`
4. **Haftada bir:** `test3`
5. **Sprint sonunda:** `test4`

---

## 🆘 HATA ALIRSAN

```bash
# Test başarısız?
pnpm test:quick       # Hangi test fail olmuş?

# Deploy engellenmiş?
pnpm test1            # Critical testler geçiyor mu?
pnpm test:deploy      # Deploy kontrolleri OK mi?

# Detaylı analiz lazım?
pnpm test3            # Akıllı analiz + öneriler
```

---

## 📚 DETAYLI DÖKÜMANTASYON

- `TEST_COMMANDS.md` - Tüm komutların detaylı açıklaması
- `TEST_IMPLEMENTATION_PLAN.md` - Phase planı ve roadmap
- `tests/README.md` - Test suite dökümantasyonu

---

**UNUTMA:** Deploy öncesi **MUTLAKA** `pnpm test1` çalıştır! ⭐
