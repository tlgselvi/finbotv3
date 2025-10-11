# QuickServeAPI - FinBot v3

FinBot v3'ün backend ve frontend uygulaması.

## 🚀 Hızlı Başlangıç

> 💡 **Docker ile çalıştırmak için**: [Docker Kılavuzu](./README-DOCKER.md) sayfasına bakın!

### Gereksinimler
- Node.js >= 20.19.0
- PostgreSQL >= 14
- pnpm >= 9.0.0

**VEYA**

- Docker >= 24.0.0
- Docker Compose >= 2.20.0

### Kurulum (Native)

1. **Bağımlılıkları yükle:**
   ```bash
   pnpm install
   ```

2. **Environment dosyasını yapılandır:**
   ```bash
   cp .env.example .env
   # .env dosyasını düzenle
   ```

3. **Veritabanını oluştur:**
   ```bash
   # PostgreSQL'de
   createdb finbot_v3
   ```

4. **Database migration:**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Demo data yükle:**
   ```bash
   pnpm db:seed
   ```

6. **Development server başlat:**
   ```bash
   pnpm dev
   ```

Frontend: http://localhost:5173
Backend API: http://localhost:5000

### Kurulum (Docker) 🐳

**Development (Hot Reload):**
```bash
docker-compose -f docker-compose.dev.yml up
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- PgAdmin: http://localhost:5050

**Production:**
```bash
docker-compose up --build -d
```
- Uygulama: http://localhost:5000

📖 Detaylı bilgi için: [README-DOCKER.md](./README-DOCKER.md)

### Demo Giriş
- **Email:** demo@finbot.com
- **Password:** demo123

## 📁 Proje Yapısı

```
QuickServeAPI/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   └── vite.config.ts
├── server/           # Express backend
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── config.ts
│   │   └── seed.ts
│   └── index.ts
├── shared/           # Shared types & utils
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
└── tests/           # Test files
```

## 🛠️ Komutlar

### Development
```bash
pnpm dev              # Tüm servisleri başlat
pnpm dev:client       # Sadece frontend
pnpm dev:server       # Sadece backend
```

### Build
```bash
pnpm build            # Production build
pnpm build:client     # Frontend build
pnpm build:server     # Backend build
```

### Database
```bash
pnpm db:generate      # Schema'dan migration oluştur
pnpm db:push          # Migration'ları uygula
pnpm db:studio        # Drizzle Studio başlat
pnpm db:seed          # Demo data yükle
```

### Test
```bash
pnpm test             # Tüm testleri çalıştır
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage raporu
```

### Code Quality
```bash
pnpm lint             # Lint kontrolü
pnpm format           # Code formatting
pnpm type-check       # TypeScript kontrolü
```

## 🔌 API Endpoints

### Accounts
- `GET /api/accounts` - Tüm hesapları listele
- `GET /api/accounts/:id` - Hesap detayı
- `POST /api/accounts` - Yeni hesap oluştur
- `PUT /api/accounts/:id` - Hesap güncelle
- `DELETE /api/accounts/:id` - Hesap sil

### Transactions
- `GET /api/transactions` - Tüm işlemleri listele
- `GET /api/transactions/:id` - İşlem detayı
- `POST /api/transactions` - Yeni işlem ekle
- `PUT /api/transactions/:id` - İşlem güncelle
- `DELETE /api/transactions/:id` - İşlem sil

### Budgets
- `GET /api/budgets` - Tüm bütçeleri listele
- `GET /api/budgets/:id` - Bütçe detayı
- `POST /api/budgets` - Yeni bütçe oluştur
- `PUT /api/budgets/:id` - Bütçe güncelle
- `DELETE /api/budgets/:id` - Bütçe sil

### Reports
- `GET /api/reports/income` - Gelir raporu
- `GET /api/reports/expense` - Gider raporu
- `GET /api/reports/profit-loss` - Kar/Zarar raporu
- `GET /api/reports/kdv` - KDV raporu
- `GET /api/reports/sgk` - SGK raporu
- `GET /api/reports/cashflow` - Nakit akış raporu

## 🎨 Özellikler

### Sprint 1 - Temel Finansal Yönetim
- ✅ Hesap yönetimi (Nakit, Banka, Kredi Kartı)
- ✅ İşlem kayıtları (Gelir/Gider)
- ✅ Bütçe takibi
- ✅ Temel raporlama
- ✅ KDV ve SGK hesaplamaları

### Sprint 2 - Gelişmiş Özellikler (Planlı)
- 🔄 Multi-currency desteği
- 🔄 Gelişmiş filtreleme ve arama
- 🔄 Export/Import (CSV, Excel)
- 🔄 Email bildirimleri
- 🔄 Dashboard widget'ları

### Sprint 3 - AI ve Otomasyon (Planlı)
- 🔄 AI destekli harcama analizi
- 🔄 Senaryo simülasyonları
- 🔄 Otomatik kategorizasyon
- 🔄 Tahminleme ve öneriler

## 📊 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite 6
- Tailwind CSS
- React Router v7

**Backend:**
- Node.js 20+
- Express.js
- PostgreSQL
- Drizzle ORM

**Development:**
- TypeScript 5
- Vitest (Testing)
- ESLint + Prettier
- pnpm (Package Manager)

## 🔒 Güvenlik

- Helmet.js (Security headers)
- CORS yapılandırması
- JWT authentication
- bcryptjs (Password hashing)
- Input validation (Zod)

## 📝 Lisans

MIT License

