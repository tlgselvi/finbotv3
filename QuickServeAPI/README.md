# 🚀 FinBot v3 - Financial Management Platform

**Versiyon:** 3.0  
**Durum:** ✅ Production Ready  
**Son Güncelleme:** 2025-10-12

Modern, güvenli ve ölçeklenebilir finansal yönetim platformu.

---

## ⚡ HIZLI BAŞLANGIÇ (3 Komut)

```bash
# 1. Bağımlılıkları yükle
pnpm install

# 2. Database oluştur
pnpm db:push

# 3. Başlat
pnpm dev
```

🎉 **Hazır!** → http://localhost:5173

---

## 📚 DOKÜMANTASYON

### 🚀 Başlangıç

- **[Komut Rehberi](./COMMANDS.md)** - Tüm komutlar ve kullanım kılavuzu
- **[Test Workflow](./TEST_WORKFLOW.md)** - Test sistemi nasıl çalışır

### 📖 Detaylı Dokümantasyon (docs/)

- **[API Dokümantasyonu](./docs/API_DOCUMENTATION.md)** - REST API referansı
- **[Test Dokümantasyonu](./docs/TESTING.md)** - Test yazma ve çalıştırma rehberi
- **[Deployment Rehberi](./docs/DEPLOYMENT.md)** - Production'a nasıl deploy edilir
- **[Sistem Mimarisi](./docs/ARCHITECTURE.md)** - Sistem yapısı ve güvenlik

---

## 🎯 TEMEL KOMUTLAR

### Günlük Kullanım

```bash
# Hızlı test (2 saniye)
pnpm test:quick

# Deploy hazırlık (20 saniye) - HER DEPLOY ÖNCESİ ZORUNLU
pnpm test1

# Development server
pnpm dev
```

### Test

```bash
pnpm test              # Tüm testler
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage ile
pnpm test:e2e          # E2E testler (Playwright)
```

### Database

```bash
pnpm db:generate       # Schema generate
pnpm db:push           # Schema push
pnpm db:seed           # Demo data yükle
pnpm db:studio         # Database GUI
```

📖 **Tüm komutlar için:** [`COMMANDS.md`](./COMMANDS.md)

---

## 💻 SİSTEM GEREKSİNİMLERİ

### Native (Önerilen)

- Node.js >= 20.19.0
- pnpm >= 9.0.0
- PostgreSQL >= 14 (veya SQLite development için)

### Docker

- Docker >= 24.0.0
- Docker Compose >= 2.20.0

---

## 🏗️ PROJE YAPISI

```
QuickServeAPI/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── vite.config.ts
│
├── server/              # Backend (Express + TypeScript)
│   ├── index.ts
│   ├── routes/          # API endpoints
│   ├── modules/         # Business logic
│   ├── middleware/      # Express middleware
│   └── services/        # External services
│
├── shared/              # Shared types & schema
├── tests/               # Test files (Vitest)
├── scripts/             # Automation scripts
├── docs/                # Detaylı dokümantasyon
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
│
├── COMMANDS.md          # Komut rehberi
├── TEST_WORKFLOW.md     # Test sistemi
└── README.md           # Bu dosya
```

---

## 🐳 DOCKER İLE ÇALIŞTIRMA

### Development (Hot Reload)

```bash
docker-compose -f docker-compose.dev.yml up
```

**Erişim:**

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- PgAdmin: http://localhost:5050

### Production

```bash
docker-compose up --build -d
```

**Erişim:**

- Uygulama: http://localhost:5000

---

## 🔐 DEMO GİRİŞ

```
Email:    demo@finbot.com
Password: demo123

veya

Email:    admin@finbot.com
Password: admin123
```

---

## 🧪 TEST SİSTEMİ

### Kritik Testler (Deploy Öncesi Zorunlu)

```bash
pnpm test:critical
```

**84/84 test** - DSCR, Consolidation, Advisor, Simulation, Dashboard

### Tam Test Suite

```bash
pnpm test1
```

**Otomatik yapar:**

- ✅ 84 critical test
- ✅ Coverage analizi (~75%)
- ✅ Performance kontrol
- ✅ README güncelleme
- ✅ Code fixes (Prettier + ESLint)
- ✅ Eksik test tespiti
- ✅ Test şablonu oluşturma
- ✅ Geçici dosya temizliği

📖 **Detaylar:** [`TESTING.md`](./docs/TESTING.md)

---

## 🚀 DEPLOYMENT

### Render + Neon (Önerilen)

```bash
# 1. Push to GitHub
git push origin main

# 2. Neon Postgres oluştur
https://neon.tech → New Project

# 3. Render Web Service
https://render.com → New Web Service

# 4. Environment variables ekle
# 5. Otomatik deploy başlar
```

📖 **Detaylı rehber:** [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

---

## 🔒 GÜVENLİK

### Otomatik Kontroller

**Her `git push` sonrası otomatik çalışır:**

- ✅ Secret tarama
- ✅ Security scan (SAST)
- ✅ Dependency audit
- ✅ License audit
- ✅ Migration guard

### Manuel Kontroller

```bash
pnpm sec:secrets        # Secret tarama
pnpm sec:sast           # Security scan
pnpm sec:license        # License audit
```

📖 **Güvenlik mimarisi:** [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

---

## 📊 PROJE DURUMU

### Test Coverage

```
Toplam Test:    1009
✅ Geçen:        471 (47%)
⏭️ Skip:         312 (31%)
❌ Başarısız:    193 (19%)
📝 TODO:         33 (3%)

Coverage:       ~75% (hedef: 80%)
```

### Kritik Testler

```
✅ DSCR Scenarios:      36/36 (%100)
✅ Consolidation:       6/6   (%100)
✅ Advisor Rules:       15/15 (%100)
✅ Simulation:          15/15 (%100)
✅ Dashboard Analytics: 12/12 (%100)

🎉 Deploy için hazır!
```

---

## 🛠️ TECHNOLOGY STACK

### Frontend

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Radix UI
- **State:** TanStack Query (React Query)
- **Routing:** Wouter
- **Charts:** Recharts

### Backend

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL / SQLite
- **ORM:** Drizzle ORM
- **Validation:** Zod + express-validator
- **Auth:** JWT + Argon2

### DevOps

- **Testing:** Vitest + Playwright
- **Linting:** ESLint + Prettier
- **CI/CD:** GitHub Actions + Git Hooks
- **Deployment:** Render + Neon
- **Monitoring:** Pino Logger
- **Security:** Helmet + Rate Limiting

---

## 🤝 CONTRIBUTING

### Development Workflow

```bash
# 1. Yeni branch oluştur
git checkout -b feature/new-feature

# 2. Kod yaz
# ...

# 3. Test yaz
# ...

# 4. Testleri çalıştır
pnpm test:quick

# 5. Pre-commit kontroller
pnpm test1

# 6. Commit yap
git add .
git commit -m "feat: new feature"

# 7. Push (otomatik kontroller)
git push origin feature/new-feature

# 8. Pull Request aç
```

### Kod Standartları

- ✅ TypeScript strict mode
- ✅ ESLint rules
- ✅ Prettier formatting
- ✅ Test coverage > 75%
- ✅ Meaningful commit messages
- ✅ No console.log in production

---

## 📝 ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# JWT
JWT_SECRET=your-256-bit-secret-here

# Server
NODE_ENV=development
PORT=5000

# CORS
CORS_ORIGIN=http://localhost:5173

# Optional: AI Features
OPENAI_API_KEY=sk-...
```

📖 **Tüm env variables:** [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

---

## 🐛 SORUN GİDERME

### Test Fail Olursa

```bash
# Watch mode'da detaylı log
pnpm test:watch

# Sadece hata veren testi çalıştır
pnpm test tests/specific/test.ts
```

### Build Başarısız Olursa

```bash
# Type check
pnpm type-check

# Clean build
rm -rf dist node_modules
pnpm install
pnpm build
```

### Database Bağlantı Hatası

```bash
# Database'in çalıştığını kontrol et
psql $DATABASE_URL -c "SELECT 1"

# Migration'ları tekrar çalıştır
pnpm db:push
```

---

## 📞 DESTEK

### Dokümantasyon

- **Komutlar:** [`COMMANDS.md`](./COMMANDS.md)
- **Test:** [`TESTING.md`](./docs/TESTING.md)
- **Deploy:** [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- **API:** [`API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md)
- **Mimari:** [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

### İletişim

- GitHub Issues
- Pull Requests
- Discussions

---

## 📜 LİSANS

MIT License - Detaylar için LICENSE dosyasına bakın.

---

## 🎉 SON SÖZ

**FinBot v3** ile finansal yönetimi kolaylaştırın!

```bash
# Başlat
pnpm dev

# Test et
pnpm test1

# Deploy et
git push
```

**Kolay gelsin!** 🚀
