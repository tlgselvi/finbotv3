# ⚡ HIZLI ÇÖZÜM REHBERİ

## 🚨 SORUN: Server'lar Çalışmıyor

### ✅ TEK KOMUTLA ÇÖZÜM:

```bash
cd C:\Projects\finbotv3
pnpm dev
```

Bu komut:

- ✅ Backend'i başlatır (Port 5000)
- ✅ Frontend'i başlatır (Port 5173)
- ✅ Her ikisini birlikte çalıştırır

---

## 🔍 KONTROL ADIMLARI

### 1. Server'ların Başladığını Doğrula

**Yeni bir terminal aç ve:**

```bash
# Backend kontrolü
curl http://localhost:5000/api/health

# Beklenen: {"status":"ok"}
```

```bash
# Frontend kontrolü (browser'da)
http://localhost:5173
```

---

### 2. Login Test Et

**Browser'da:**

1. http://localhost:5173 aç
2. Email: `admin@finbot.com`
3. Password: `admin123`
4. Login'e tıkla

**Başarılı ise:**

- ✅ Dashboard'a yönlendirileceksiniz
- ✅ URL değişecek (örn: /dashboard)

**Başarısız ise:**

- ❌ Hala /login sayfasındasınız
- ❌ Hata mesajı görünür

---

### 3. Otomatik Test Tekrar Çalıştır

```bash
cd QuickServeAPI
pnpm test:smart
```

**Beklenen Sonuç:**

```
✅ API Health Check
✅ Frontend Yükleme
✅ Login Form Kontrolü
✅ Login İşlemi
✅ Screenshot
✅ Responsive Design
✅ Performance

📈 BAŞARI ORANI: 100%
```

---

## 🐛 SORUN DEVAM EDİYORSA

### Login Başarısız mı?

**Kullanıcı credentials kontrol et:**

```bash
cd QuickServeAPI
sqlite3 dev.db "SELECT email, role FROM users WHERE email='admin@finbot.com';"
```

**Eğer kullanıcı yoksa, oluştur:**

```bash
# Server başlatıldığında otomatik oluşturulur
# Veya manuel:
cd QuickServeAPI
node -e "
const { db } = require('./server/db');
const bcrypt = require('bcryptjs');

const password = bcrypt.hashSync('admin123', 10);
// Insert user...
"
```

---

## 📊 DURUM KONTROLÜ

**Tüm servisler çalışıyor mu?**

```bash
# Windows
netstat -ano | findstr ":5000 :5173"

# Görmelisiniz:
# TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING
# TCP    0.0.0.0:5173           0.0.0.0:0              LISTENING
```

---

## 🎯 ÖZET

1. ✅ `pnpm dev` çalıştır
2. ✅ http://localhost:5173 aç
3. ✅ Login dene
4. ✅ `pnpm test:smart` çalıştır

**Hepsi bu kadar!** 🚀
