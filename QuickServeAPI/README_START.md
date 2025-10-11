# ⚡ FinBot - Başlangıç (2 Dakika)

## 🎯 SADECE 2 KOMUT BİL

```bash
pnpm test:quick    # Hızlı (2s)
pnpm test1         # Her şey (20s) ⭐
```

---

## ✅ NE YAPARLAR?

### **`test:quick` - Hızlı Kontrol**
```
✅ 84 critical test
⏱️  2 saniye
```

### **`test1` - Tam Sistem** ⭐
```
✅ 84 critical test
✅ Coverage analizi
✅ README güncelle
✅ Kod düzelt (Prettier + ESLint)
✅ Eksik testleri tespit et (101 dosya)
✅ Yeni test şablonları oluştur (5 dosya)
✅ Geçici dosyaları temizle
✅ HTML rapor oluştur
✅ Fail-fast log

⏱️  20 saniye
```

### **`git push` - Otomatik**
```
Hooks otomatik çalışır:
✅ test1 (tekrar)
✅ Secret tarama
✅ Security scans

Hata varsa push iptal! ✋
```

---

## 📋 KULLANIM

```bash
# Günlük
pnpm test:quick       # Sık sık çalıştır

# Deploy öncesi
pnpm test1            # Mutlaka çalıştır! ⭐

# Push
git push              # Otomatik güvenlik
```

---

## 🎯 ÖZETİN ÖZETİ

```
test:quick → Kod yazdın mı?
test1      → Deploy edecek misin? ⭐
git push   → Otomatik!
```

**BU KADAR! 🎉**

