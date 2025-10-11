# ⚡ FinBot - Basit Kullanım (Sadece 3 Komut!)

## 🎯 SADECE BU 3 KOMUTU BİL:

```bash
# 1️⃣ HIZLI TEST (2 saniye)
pnpm test:quick

# 2️⃣ DEPLOY HAZIRLIK (20 saniye) ⭐
pnpm test1

# 3️⃣ HER ŞEY OTOMATIK
git push
```

**BU KADAR! BAŞKA BİR ŞEY YAPMA!** ✅

---

## 📋 NE ZAMAN HANGİSİNİ?

### **Kod yazdın? →** `test:quick`

```bash
pnpm test:quick
# 2 saniye, 84 test, hızlı kontrol
```

### **Commit yapacaksın? →** `test1`

```bash
pnpm test1
# 20 saniye, her şey dahil
git commit -m "feat: ..."
```

### **Push yapacaksın? →** Sadece push yap!

```bash
git push
# Otomatik her şeyi kontrol eder!
# Hata varsa push iptal eder
```

---

## 🎨 VEYA DAHA DA BASİT: MENÜ

```bash
.\run-tests.ps1
```

**Menüden sadece 2 seçenek kullan:**

- **1** → Aktif testler (günlük kullanım)
- **2** → Phase 1 (deploy öncesi) ⭐

**Diğerlerini unut!**

---

## 💡 GÜNLÜK WORKFLOW

### **Sabah:**

```bash
pnpm test:quick       # 2s - Sistem OK mu?
```

### **Kod yazarken:**

```bash
# Her 1 saatte bir
pnpm test:quick       # 2s
```

### **Gün sonu (commit):**

```bash
pnpm test1            # 20s - Son kontrol
git add .
git commit -m "feat: bugünkü çalışmalar"
```

### **Push:**

```bash
git push
# Otomatik her şey kontrol edilir!
# Sen hiçbir şey yapma!
```

---

## 🚀 DEPLOY WORKFLOW

```bash
# 1. Son kontrol
pnpm test1            # 20s

# 2. Deploy
git push origin main

# 3. BİTTİ!
# GitHub Actions otomatik çalışır
# Otomatik deploy olur
```

---

## ❌ UNUTMANA GEREK YOK

Şu komutları **bilmene gerek yok**:

- ~~test2, test3, test4~~ (otomatik çalışır)
- ~~sec:secrets, sec:sast~~ (git push'ta otomatik)
- ~~coverage:analyze~~ (test1'in içinde)
- ~~fix:all~~ (test1'in içinde)
- ~~report:gen~~ (test1'in içinde)
- ~~backup:conf~~ (gerekirse manuel)

**Sadece `test:quick` ve `test1` yeterli!**

---

## 🎯 ÖZET

```
╔═══════════════════════════════════════╗
║                                       ║
║   SADECE 3 KOMUT BİL:                 ║
║                                       ║
║   1. test:quick  → Hızlı (2s)        ║
║   2. test1       → Deploy (20s) ⭐   ║
║   3. git push    → Otomatik          ║
║                                       ║
║   BU KADAR! 🎉                       ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## 💾 KISA NOT

**Post-it'e yaz:**

```
pnpm test:quick  → Hızlı
pnpm test1       → Deploy ⭐
git push         → Otomatik
```

**Diğer her şey otomatik!** 🚀

---

## 🆘 SORUN OLURSA

```bash
# Test fail oldu mu?
pnpm test:quick       # Tekrar çalıştır

# Düzeltmek istiyorsan
pnpm test1            # Otomatik düzeltir

# Push engellendi mi?
pnpm test1            # Düzelt
git push              # Tekrar dene
```

---

## 📚 DAHA FAZLA BİLGİ İSTERSEN

```bash
# Diğer komutları görmek için
cat KOMUT_LISTESI.md

# İnteraktif menü
.\run-tests.ps1

# Ama %90 ihtimalle sadece test1 kullanacaksın! ⭐
```

---

**HATIRLAMAN GEREKEN TEK ŞEY:**

```bash
pnpm test1
```

**Bu kadar! 🎉**
