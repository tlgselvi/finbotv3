# 🚀 FinBot v3 - Advanced Financial Management System

**Versiyon:** 3.0  
**Durum:** ✅ Production Ready  
**Son Güncelleme:** 2025-10-12

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

# 2. Database oluştur
pnpm db:push

# 3. Başlat
pnpm dev
```

## 🔧 Gereksinimler
- Node.js >= 18.0.0
- npm >= 8.0.0

### Kurulum

1. **Tüm bağımlılıkları yükle:**
   ```bash
   npm run install:all
   ```

2. **Veritabanını kur:**
   ```bash
   cd QuickServeAPI
   npm run db:setup
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

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm run test

# Belirli test kategorileri
npm run test:unit
npm run test:integration
npm run test:performance
```

## 🏗️ Build

```bash
# Production build
npm run build

# Preview build
npm run preview
```

## 📚 Dokümantasyon

### 🎯 Proje Dokümantasyonu
- **[Kapsamlı Proje Dokümantasyonu](./FINBOT_V3_FULL_DOCUMENTATION.md)** - Executive Summary, Business Model, Technical Architecture, Investor Pitch
- **[Test Planı](./TEST_PLAN.md)** - Kapsamlı test stratejisi (97/97 tests passing)
- **[CTO Koçu Config](./agent-config.md)** - CTO Koçu v2 konfigürasyonu

### 💻 Teknik Dokümantasyon
- **[QuickServeAPI README](./QuickServeAPI/README.md)** - Ana uygulama dokümantasyonu
- **[Test Suite README](./QuickServeAPI/tests/README.md)** - Test dokümantasyonu
- **[API Referansı](./QuickServeAPI/docs/API_REFERENCE.md)** - Kapsamlı API dokümantasyonu
- **[Sistem Mimarisi](./QuickServeAPI/docs/ARCHITECTURE.md)** - Sistem tasarımı
- **[Deployment Rehberi](./QuickServeAPI/docs/DEPLOYMENT.md)** - Production deployment
- **[Dashboard Kılavuzu](./QuickServeAPI/docs/DASHBOARD_GUIDE.md)** - Dashboard kullanımı
- **[Export Formatları](./QuickServeAPI/docs/EXPORT_FORMATS.md)** - Export detayları
- **[Güvenlik API](./QuickServeAPI/docs/SECURITY_API.md)** - Güvenlik endpoint'leri

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

### Veritabanı
```bash
# Migration oluştur
npm run db:generate

# Migration çalıştır
npm run db:migrate

# Veritabanı studio
npm run db:studio
```

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- **Proje Sahibi:** FinBot Team
- **Email:** info@finbot.com
- **Website:** https://finbot.com
