# 🚀 FinBot v3 - Advanced Financial Management System

**Versiyon:** 3.0.0  
**Durum:** ✅ Production Ready  
**Son Güncelleme:** 2025-01-13

FinBot v3, Türkiye'ye özel geliştirilmiş kapsamlı bir finansal yönetim sistemidir. KDV, SGK, vergi hesaplamaları ve gelişmiş raporlama özellikleri ile işletmelerin finansal süreçlerini optimize eder.

## 🏗️ Proje Yapısı

```
finbotv3/
├── QuickServeAPI/          # Ana FinBot uygulaması
│   ├── client/             # React frontend
│   ├── server/             # Express.js backend
│   ├── shared/             # Paylaşılan tipler ve utilities
│   └── tests/              # Test dosyaları
├── cto-coach-v2/           # CTO Koçu v2 aracı
└── plans/                  # Sprint planları ve dokümantasyon
```

## ⚡ HIZLI BAŞLANGIÇ (3 Komut)

```bash
# 1. Bağımlılıkları yükle
pnpm install

# 2. PostgreSQL veritabanını kur
pnpm db:push

# 3. Başlat
pnpm dev
```

> **🆕 Yeni:** PostgreSQL migration tamamlandı! SQLite'dan PostgreSQL'e geçiş yapıldı. Production deployment hazır.

## 🔧 Gereksinimler
- Node.js >= 20.19.0
- pnpm >= 9.0.0
- PostgreSQL >= 13.0

### Kurulum

1. **Tüm bağımlılıkları yükle:**
   ```bash
   npm run install:all
   ```

2. **PostgreSQL veritabanını kur:**
   ```bash
   cd QuickServeAPI
   # PostgreSQL bağlantı bilgilerini .env dosyasına ekleyin
   npm run db:push
   ```

3. **Geliştirme sunucusunu başlat:**
   ```bash
   npm run dev
   ```

### CTO Koçu v2 Kullanımı

```bash
# Sprint hazırla
npm run cto:start -- hazirla -p FinBot

# Audit yap
npm run cto:start -- audit -p FinBot

# Optimize et
npm run cto:start -- optimize -p FinBot
```

## 📋 Mevcut Özellikler

### Sprint 1 - Temel Finansal Yönetim
- ✅ Hesap yönetimi
- ✅ İşlem kayıtları
- ✅ KDV hesaplamaları
- ✅ SGK prim hesaplamaları
- ✅ Temel raporlama

### Sprint 2 - Gelişmiş Özellikler
- ✅ Koleksiyon yönetimi
- ✅ Bildirim sistemi
- ✅ İçe/dışa aktarma
- ✅ Gelişmiş raporlama

### Sprint 3 - AI ve Otomasyon
- ✅ AI destekli analiz
- ✅ Senaryo analizi
- ✅ Simülasyon modelleri
- ✅ Gelişmiş dashboard

### Sprint 4 - Production Ready
- ✅ PostgreSQL migration tamamlandı
- ✅ Render deployment konfigürasyonu
- ✅ Production database setup
- ✅ Comprehensive SQL scripts
- ✅ Admin user setup ve authentication
- ✅ Database migration scripts

## 🧪 Test

### Test Durumu
- **Toplam Test Dosyası:** 138 test dosyası
- **Test Kategorileri:** 32 farklı test klasörü
- **Durum:** ✅ PostgreSQL migration tamamlandı, test sistemi aktif

### Test Komutları
```bash
# Tüm testleri çalıştır
npm run test

# Hızlı test (kritik testler)
npm run test:quick

# Belirli test kategorileri
npm run test:unit
npm run test:integration
npm run test:performance
npm run test:business
npm run test:security

# Test coverage
npm run test:coverage

# E2E testler
npm run test:e2e
```

### Test Kategorileri
- **Business Logic:** DSCR, cash gap, runway scenarios
- **API Endpoints:** Dashboard, JWT, authentication
- **Components:** React component tests
- **Database:** Schema, seed, migration tests
- **Integration:** Auth flow, bank integration
- **Security:** JWT, authentication flows
- **Performance:** Load testing, optimization
- **E2E:** Complete workflow tests

## 🏗️ Build

```bash
# Production build
npm run build

# Preview build
npm run preview
```

## 🚀 Production Deployment

### Render.com Deployment
```bash
# Production build
npm run build

# Render deployment (otomatik)
git push origin main
```

**Production URL:** https://finbot-v3.onrender.com

### Database Configuration
- **PostgreSQL Database:** finbot-db
- **Connection:** Render managed PostgreSQL
- **Migration:** Otomatik migration scriptleri dahil
- **Admin User:** Otomatik oluşturulan admin kullanıcısı
- **Tables:** 9 ana tablo + migration history

## 📚 Dokümantasyon

### 🎯 Proje Dokümantasyonu
- **[Kapsamlı Proje Dokümantasyonu](./FINBOT_V3_FULL_DOCUMENTATION.md)** - Executive Summary, Business Model, Technical Architecture, Investor Pitch
- **[Test Planı](./TEST_PLAN.md)** - Kapsamlı test stratejisi (138 test dosyası, PostgreSQL migration sonrası güncelleniyor)
- **[CTO Koçu Config](./agent-config.md)** - CTO Koçu v2 konfigürasyonu

### 💻 Teknik Dokümantasyon
- **[QuickServeAPI README](./QuickServeAPI/README.md)** - Ana uygulama dokümantasyonu
- **[Test Suite README](./QuickServeAPI/tests/README.md)** - Test dokümantasyonu (138 test dosyası)
- **[API Referansı](./QuickServeAPI/docs/API_REFERENCE.md)** - Kapsamlı API dokümantasyonu
- **[Sistem Mimarisi](./QuickServeAPI/docs/ARCHITECTURE.md)** - Sistem tasarımı
- **[Deployment Rehberi](./QuickServeAPI/docs/DEPLOYMENT.md)** - Production deployment
- **[Dashboard Kılavuzu](./QuickServeAPI/docs/DASHBOARD_GUIDE.md)** - Dashboard kullanımı
- **[Export Formatları](./QuickServeAPI/docs/EXPORT_FORMATS.md)** - Export detayları
- **[Güvenlik API](./QuickServeAPI/docs/SECURITY_API.md)** - Güvenlik endpoint'leri

### 🗄️ Database Dokümantasyonu
- **[PostgreSQL Setup](./QuickServeAPI/comprehensive-postgresql-setup.sql)** - Kapsamlı PostgreSQL kurulum
- **[Table Creation](./QuickServeAPI/create-tables.sql)** - Tablo oluşturma scriptleri
- **[Simple Tables](./QuickServeAPI/simple-tables.sql)** - Basit tablo yapısı
- **[Migration Scripts](./QuickServeAPI/migrations/)** - Drizzle ORM migration dosyaları
- **[Database Init](./QuickServeAPI/init-db.sql)** - Veritabanı başlatma scripti

## 🔧 Geliştirme

### Kod Kalitesi
```bash
# Lint kontrolü
npm run lint

# Format düzeltme
npm run format

# Type kontrolü
npm run type-check
```

### Veritabanı (PostgreSQL)
```bash
# Migration oluştur
npm run db:generate

# Migration çalıştır
npm run db:migrate

# Veritabanı değişikliklerini push et
npm run db:push

# Veritabanı studio
npm run db:studio

# Seed data ekle
npm run db:seed
```

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 🔄 Son Değişiklikler (v3.0.0)

### ✅ Tamamlanan Özellikler
- **PostgreSQL Migration:** SQLite'dan PostgreSQL'e tam geçiş
- **Production Deployment:** Render.com üzerinde canlı deployment
- **Database Setup:** Otomatik tablo oluşturma ve admin kullanıcı
- **Migration System:** Drizzle ORM ile migration yönetimi
- **Test Suite:** 138 test dosyası ile kapsamlı test coverage
- **Docker Support:** Development ve production Docker konfigürasyonu

### 🚀 Yeni Özellikler
- **Admin Authentication:** Otomatik admin kullanıcı oluşturma
- **Database Scripts:** Kapsamlı PostgreSQL setup scriptleri
- **Migration History:** Drizzle migration tracking
- **Production Ready:** Render deployment konfigürasyonu

### 🔧 Teknik İyileştirmeler
- **Dependency Updates:** Tüm paketler güncel versiyonlara yükseltildi
- **TypeScript Support:** Gelişmiş tip güvenliği
- **Error Handling:** Daha iyi hata yönetimi
- **Performance:** Database query optimizasyonları

## 📞 İletişim

- **Proje Sahibi:** FinBot Team
- **Email:** info@finbot.com
- **Website:** https://finbot.com
