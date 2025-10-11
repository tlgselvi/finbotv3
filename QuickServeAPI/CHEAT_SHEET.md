# 🎯 FinBot - Komut Cheat Sheet (Kısa Özet)

## ⚡ 3 TEMEL KOMUT

```bash
test:quick    # Hızlı test (2s) - Her commit
test1         # Deploy hazırlık (20s) - Deploy öncesi ⭐
git push      # Otomatik kontroller
```

---

## 📋 KULLANIM

| Durum                | Komut                     | Süre |
| -------------------- | ------------------------- | ---- |
| 💻 Kod yazdın        | `pnpm test:quick`         | 2s   |
| 📝 Commit yapacaksın | `pnpm test1`              | 20s  |
| 🚀 Push yapacaksın   | `git push`                | Auto |
| 🚀 Deploy edeceksin  | `pnpm test1` + `git push` | Auto |

---

## 🎨 DAHA DA KOLAY: MENÜ

```bash
.\run-tests.ps1       # Menü aç

1 → Günlük test
2 → Deploy hazırlık ⭐
```

---

## 🔧 NADİREN KULLANILACAKLAR

```bash
pnpm fix:all          # Kod düzelt (nadiren)
pnpm sec:secrets      # Secret kontrol (şüphelenirsen)
pnpm backup:conf      # Backup (major değişiklik öncesi)
```

---

## 🆘 SORUN GİDERME

```bash
# Test fail → Düzelt → Tekrar test
pnpm test:quick

# Push engellenmiş → Düzelt
pnpm test1
git push
```

---

## ✅ HANGİ KOMUT NE YAPAR?

### **`test:quick` (2s)**

- 84 critical test
- BİTTİ!

### **`test1` (20s)** ⭐

- 84 critical test ✅
- Coverage analizi ✅
- README güncelle ✅
- Kod düzelt (Prettier + ESLint) ✅
- Rapor oluştur ✅
- HER ŞEY!

### **`git push` (Otomatik)**

- test1 çalışır ✅
- Güvenlik kontrolleri ✅
- Hata varsa push iptal ✋
- OK ise push devam ✅

---

## 💡 HATIRLAMAN GEREKEN

```
test:quick → Hızlı
test1      → Deploy ⭐
git push   → Otomatik
```

**3 komut, hepsi bu!** 🎉
