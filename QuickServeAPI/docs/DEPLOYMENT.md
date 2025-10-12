# 🚀 FinBot v3 - Deployment Rehberi

**Son Güncelleme:** 2025-10-12  
**Deploy Status:** ✅ PRODUCTION READY

---

## ⚡ HIZLI DEPLOYMENT (5 Dakika)

### Render + Neon (Önerilen)

```bash
# 1. Repository hazırla
git push origin main

# 2. Neon Postgres oluştur
# https://neon.tech → New Project
# DATABASE_URL'i kopyala

# 3. Render'a deploy
# https://render.com → New Web Service
# GitHub repo'yu bağla
# Environment variables ekle

# 4. Otomatik build başlar
# Build Command: npm ci && npm run build && npx drizzle-kit push
# Start Command: node dist/server/index.js

# 5. Deploy tamamlandı! 🎉
```

---

## 📋 DEPLOYMENT ÖNCESİ KONTROL LİSTESİ

### ✅ Zorunlu Kontroller

```bash
# 1. Kritik testler
pnpm test:critical
# ✅ 84/84 tests must pass

# 2. Deploy hazırlık
pnpm test1
# ✅ All checks must pass

# 3. Security scans
pnpm sec:secrets
pnpm sec:sast
# ✅ 0 vulnerabilities

# 4. Build test
pnpm build
# ✅ Build must succeed

# 5. Type check
pnpm type-check
# ✅ No TypeScript errors
```

---

## 🌐 DEPLOYMENT SEÇENEKLERİ

### 1. Render (Önerilen) ⭐

**Avantajlar:**

- ✅ Ücretsiz tier
- ✅ Otomatik SSL
- ✅ Git push = auto deploy
- ✅ Zero-downtime deploys
- ✅ Database backup

**Dezavantajlar:**

- ⚠️ Cold start (~30s)
- ⚠️ Sleep after 15 min inactivity (free tier)

**Setup:**

1. **Neon Postgres Oluştur**

   ```
   https://neon.tech
   → New Project
   → Copy DATABASE_URL
   ```

2. **Render Web Service**

   ```
   https://render.com
   → New Web Service
   → Connect GitHub repo
   → Root Directory: QuickServeAPI
   ```

3. **Environment Variables**

   ```env
   NODE_ENV=production
   NODE_VERSION=20
   JWT_SECRET=your-super-secret-256-bit-key-here
   DATABASE_URL=postgresql://user:pass@host/db
   CORS_ORIGIN=https://your-app.onrender.com
   PORT=5000
   ```

4. **Build & Deploy**

   ```
   Build Command: npm ci && npm run build && npx drizzle-kit push
   Start Command: node dist/server/index.js
   ```

5. **Auto Deploy**
   - Her `git push origin main` → otomatik deploy
   - ~3-5 dakika build süresi

---

### 2. Docker (Local/Production)

**Development:**

```bash
# Hot reload ile
docker-compose -f docker-compose.dev.yml up

# Erişim:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# Database: localhost:5432
```

**Production:**

```bash
# Production build
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '5000:5000'
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: finbot
      POSTGRES_USER: finbot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---

### 3. Vercel (Frontend Only)

```bash
# Frontend'i Vercel'e deploy
cd client
vercel deploy --prod

# Backend ayrı host'ta (Render/Railway)
```

---

### 4. Railway

```bash
# Railway CLI
railway login
railway init
railway up

# Otomatik:
# - Database provision
# - Environment variables
# - Build & Deploy
```

---

## 🔐 ENVIRONMENT VARIABLES

### Production .env Şablonu

```env
# === REQUIRED (ZORUNLU) ===

# Node Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (min 256-bit)
JWT_SECRET=your-super-secret-256-bit-random-string-here-change-this

# CORS Origin
CORS_ORIGIN=https://your-production-domain.com

# === OPTIONAL (OPSİYONEL) ===

# Server Port (default: 5000)
PORT=5000

# JWT Expiration
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Session Secret
SESSION_SECRET=another-random-secret-string

# OpenAI (AI features için)
OPENAI_API_KEY=sk-...

# Email (notifications için)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sentry (error tracking)
SENTRY_DSN=https://...
```

---

## 🔧 BUILD PROCESS

### Build Adımları

```bash
# 1. Dependencies
npm ci

# 2. TypeScript compile
npm run build
# → dist/server/
# → dist/client/

# 3. Database migration
npx drizzle-kit push

# 4. Start production
node dist/server/index.js
```

---

### Build Requirements

**Sistem:**

- Node.js >= 20.19.0
- RAM >= 512MB
- Disk >= 1GB

**Dependencies:**

- Production dependencies only
- No dev dependencies

**Environment:**

- All required env vars set
- Database accessible
- Port available

---

## 📊 DEPLOYMENT MONITORING

### Health Check Endpoint

```bash
# Backend health
curl https://your-app.com/api/health

# Response:
{
  "status": "ok",
  "timestamp": "2025-10-12T10:30:00Z",
  "version": "3.0.0",
  "database": "connected"
}
```

---

### Logs

**Render:**

```bash
# Dashboard → Logs sekmesi
# Real-time logs
# Search & filter
```

**Docker:**

```bash
# Container logs
docker-compose logs -f app

# Specific service
docker-compose logs -f postgres
```

---

### Metrics

**Önemli metrikler:**

- Response time (< 200ms)
- Error rate (< 1%)
- CPU usage (< 80%)
- Memory usage (< 512MB)
- Database connections (< 20)

---

## 🔄 CI/CD PIPELINE

### GitHub Actions (Otomatik)

**Her `git push` sonrası:**

1. ✅ Lint & Format
2. ✅ Type Check
3. ✅ Tests (84 critical)
4. ✅ Security Scans
5. ✅ Build
6. ✅ Deploy (if main branch)

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install
        run: npm ci

      - name: Test
        run: npm run test:critical

      - name: Security
        run: npm run sec:secrets

      - name: Build
        run: npm run build

      - name: Deploy
        run: npm run deploy
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
```

---

## 🐛 SORUN GİDERME

### Build Fails

**Hata: TypeScript errors**

```bash
# Local'de kontrol
pnpm type-check

# Düzelt ve tekrar build
pnpm build
```

**Hata: Missing dependencies**

```bash
# Dependencies'i temizle
rm -rf node_modules package-lock.json

# Yeniden yükle
npm ci
```

---

### Database Connection Fails

**Kontrol:**

```bash
# 1. DATABASE_URL doğru mu?
echo $DATABASE_URL

# 2. Database erişilebilir mi?
psql $DATABASE_URL -c "SELECT 1"

# 3. Migrations çalıştı mı?
npx drizzle-kit push
```

---

### Port Already in Use

**Çözüm:**

```bash
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Veya farklı port kullan
PORT=5001 npm start
```

---

### Cold Start (Render Free Tier)

**Sorun:** İlk istek ~30s sürüyor

**Çözümler:**

1. ⭐ Paid tier ($7/mo)
2. 🔄 Keep-alive ping (her 10dk)
3. ⏰ Warm-up script

**Keep-alive:**

```bash
# Cron job (her 10 dakika)
*/10 * * * * curl https://your-app.onrender.com/api/health
```

---

## 🔐 SECURITY CHECKLIST

### Pre-Deploy

- [ ] No secrets in code
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Helmet headers configured
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Secure session management
- [ ] Password hashing (Argon2)
- [ ] JWT token validation
- [ ] Input validation
- [ ] Error handling (no stack traces)

---

### Post-Deploy

- [ ] SSL/TLS enabled
- [ ] Security headers verified
- [ ] API endpoints tested
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Logs working
- [ ] Health checks passing
- [ ] Performance acceptable

---

## 📈 PERFORMANCE OPTIMIZATION

### Backend

```javascript
// Compression middleware
import compression from 'compression';
app.use(compression());

// Response caching
import cache from 'apicache';
app.use(cache.middleware('5 minutes'));

// Database connection pooling
const pool = {
  max: 20,
  min: 5,
  idle: 10000,
};
```

---

### Frontend

```bash
# Vite build optimization
vite build --mode production

# Gzip compression
# Lazy loading
# Code splitting
# Asset optimization
```

---

## 📚 BACKUP & RECOVERY

### Database Backup

**Neon (Otomatik):**

- Daily backups (7 days retention)
- Point-in-time recovery

**Manuel Backup:**

```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Import
psql $DATABASE_URL < backup_20251012.sql
```

---

### Environment Backup

```bash
# Backup .env
pnpm backup:conf

# Dosya: backups/config-20251012.tar.gz
```

---

## 🎯 DEPLOYMENT WORKFLOW

### Standard Workflow

```bash
# 1. Development
pnpm dev

# 2. Test (local)
pnpm test:quick

# 3. Pre-commit
pnpm test1

# 4. Commit
git add .
git commit -m "feat: new feature"

# 5. Push (triggers CI/CD)
git push origin main

# 6. Auto Deploy
# Render otomatik build & deploy yapar

# 7. Verify
curl https://your-app.com/api/health

# 8. Monitor
# Render dashboard → Logs & Metrics
```

---

## 📞 DEPLOYMENT SUPPORT

### Sorun Olursa:

1. **Logs kontrol et**
   - Render Dashboard → Logs
   - `docker-compose logs -f`

2. **Health check çalıştır**
   - `/api/health` endpoint'i test et

3. **Rollback (gerekirse)**

   ```bash
   # Render'da: Previous Deploy → Rollback
   # Git'te: git revert HEAD
   ```

4. **Community support**
   - GitHub Issues
   - Discord

---

## 🎉 İLK DEPLOYMENT

### Tebrikler! 🎊

Deployment başarılı olduysa:

1. ✅ Frontend erişilebilir
2. ✅ Backend API çalışıyor
3. ✅ Database bağlantılı
4. ✅ SSL/HTTPS aktif
5. ✅ Auto deploy çalışıyor

**Artık production'dasın!** 🚀

---

## 📖 DAHA FAZLA BİLGİ

- **Komutlar:** `COMMANDS.md`
- **Test Dokümantasyonu:** `TESTING.md`
- **API Dokümantasyonu:** `API_DOCUMENTATION.md`
- **Sistem Mimarisi:** `ARCHITECTURE.md`
