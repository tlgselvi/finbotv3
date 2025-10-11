# 🐳 FinBot v3 - Docker Kılavuzu

Bu kılavuz FinBot v3 uygulamasını Docker ile çalıştırmak için gerekli tüm bilgileri içerir.

## 📋 İçindekiler

- [Gereksinimler](#gereksinimler)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Development Ortamı](#development-ortamı)
- [Production Ortamı](#production-ortamı)
- [Komutlar](#komutlar)
- [Sorun Giderme](#sorun-giderme)

---

## 🔧 Gereksinimler

### Zorunlu:

- **Docker** >= 24.0.0
- **Docker Compose** >= 2.20.0
- En az **4GB RAM**
- En az **10GB disk alanı**

### Kurulum Kontrolü:

```bash
docker --version
docker-compose --version
```

---

## 🚀 Hızlı Başlangıç

### 1️⃣ Development Ortamı (Hot Reload)

```bash
# QuickServeAPI dizinine git
cd QuickServeAPI

# Development ortamını başlat
docker-compose -f docker-compose.dev.yml up

# Veya detached mode (arka planda)
docker-compose -f docker-compose.dev.yml up -d
```

**Erişim Adresleri:**

- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:5000
- 🗄️ PostgreSQL: localhost:5432
- 📊 PgAdmin: http://localhost:5050
- 🔴 Redis: localhost:6379

**PgAdmin Giriş:**

- Email: `admin@finbot.local`
- Şifre: `admin`

### 2️⃣ Production Ortamı

```bash
# Production build ve çalıştır
docker-compose up --build

# Detached mode
docker-compose up -d
```

**Erişim:**

- 🌐 Uygulama: http://localhost:5000

---

## 💻 Development Ortamı Detayları

### Özellikler:

✅ Hot-reload (kod değişikliklerinde otomatik yenileme)  
✅ Source code volume mount  
✅ Debug mode etkin  
✅ PgAdmin dahil  
✅ Verbose logging

### Klasör Yapısı:

```
QuickServeAPI/
├── Dockerfile.dev          # Development image
├── docker-compose.dev.yml  # Dev orchestration
├── server/                 # Backend (hot-reload)
├── client/                 # Frontend (Vite HMR)
└── logs/                   # Log dosyaları
```

### Development Komutları:

```bash
# Tüm servisleri başlat
docker-compose -f docker-compose.dev.yml up

# Sadece database başlat
docker-compose -f docker-compose.dev.yml up postgres redis

# Logları izle
docker-compose -f docker-compose.dev.yml logs -f app-dev

# Container içinde komut çalıştır
docker-compose -f docker-compose.dev.yml exec app-dev sh

# Node modules yeniden kur
docker-compose -f docker-compose.dev.yml exec app-dev pnpm install

# Database migration
docker-compose -f docker-compose.dev.yml exec app-dev pnpm db:migrate

# Seed data ekle
docker-compose -f docker-compose.dev.yml exec app-dev pnpm db:seed

# Durdur
docker-compose -f docker-compose.dev.yml down

# Durdur ve volume'leri sil (temiz başlangıç)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🏭 Production Ortamı Detayları

### Özellikler:

✅ Multi-stage optimized build  
✅ Minimal image size (~150MB)  
✅ Security best practices  
✅ Health checks  
✅ Automatic restarts

### Build Aşamaları:

1. **base**: Node.js + pnpm
2. **deps**: All dependencies
3. **builder**: TypeScript build
4. **prod-deps**: Production dependencies only
5. **runner**: Final minimal image

### Production Komutları:

```bash
# Build ve başlat
docker-compose up --build -d

# Logları kontrol et
docker-compose logs -f

# Servislerin durumunu kontrol et
docker-compose ps

# Restart
docker-compose restart app

# Durdur
docker-compose down

# Temiz başlangıç (volumes dahil)
docker-compose down -v
docker-compose up --build -d
```

---

## 📚 Komut Referansı

### Docker Compose Komutları

```bash
# Servisleri başlat
docker-compose up

# Arka planda başlat
docker-compose up -d

# Build ve başlat
docker-compose up --build

# Belirli servisi başlat
docker-compose up postgres

# Durdur
docker-compose down

# Durdur ve volume'leri sil
docker-compose down -v

# Logları göster
docker-compose logs

# Belirli servisin logları
docker-compose logs app

# Canlı log takibi
docker-compose logs -f

# Servis durumları
docker-compose ps

# Restart
docker-compose restart

# Container içinde komut
docker-compose exec app sh
docker-compose exec postgres psql -U finbot_user -d finbot_dev
```

### Docker Image Komutları

```bash
# Image'leri listele
docker images

# Image build
docker build -t finbot-v3 .

# Image'i sil
docker rmi finbot-v3

# Kullanılmayan image'leri temizle
docker image prune -a

# Cache'i temizle
docker builder prune
```

### Database İşlemleri

```bash
# PostgreSQL bağlan
docker-compose exec postgres psql -U finbot_user -d finbot_dev

# Database backup
docker-compose exec postgres pg_dump -U finbot_user finbot_dev > backup.sql

# Database restore
docker-compose exec -T postgres psql -U finbot_user -d finbot_dev < backup.sql

# Database logs
docker-compose logs postgres
```

---

## 🔍 Monitoring & Debug

### Container Durumlarını İzleme:

```bash
# Tüm container'lar
docker ps -a

# Resource kullanımı
docker stats

# Container detayları
docker inspect finbot-app

# Health check durumu
docker inspect --format='{{.State.Health.Status}}' finbot-app
```

### Log İzleme:

```bash
# Tüm loglar
docker-compose logs

# Son 100 satır
docker-compose logs --tail=100

# Canlı takip
docker-compose logs -f

# Belirli servis
docker-compose logs -f app

# Timestamp ile
docker-compose logs -t
```

### Debug Mode:

```bash
# Container içine gir
docker-compose exec app sh

# Node.js debug
docker-compose exec app node --inspect=0.0.0.0:9229 dist/server/index.js

# Environment variables
docker-compose exec app env

# Disk kullanımı
docker-compose exec app df -h

# Process'leri listele
docker-compose exec app ps aux
```

---

## 🛠️ Sorun Giderme

### Sık Karşılaşılan Sorunlar:

#### 1. Port zaten kullanımda

```bash
# Portu kullanan process'i bul
lsof -i :5000
# veya Windows'ta
netstat -ano | findstr :5000

# Docker port mapping değiştir
# docker-compose.yml içinde port'u değiştir
ports:
  - "5001:5000"  # 5001'e değiştirildi
```

#### 2. Database bağlantı hatası

```bash
# PostgreSQL health check
docker-compose exec postgres pg_isready -U finbot_user

# Connection test
docker-compose exec app node -e "const pg = require('postgres'); const sql = pg(process.env.DATABASE_URL); sql\`SELECT 1\`.then(console.log)"

# Restart database
docker-compose restart postgres
```

#### 3. Build hatası

```bash
# Cache'i temizle ve yeniden build
docker-compose build --no-cache

# Node modules sorunları için
docker-compose down -v
docker-compose up --build
```

#### 4. Volume permission sorunları

```bash
# Linux/Mac'te
sudo chown -R $USER:$USER .

# Container'da user kontrolü
docker-compose exec app whoami
```

#### 5. Out of memory hatası

```bash
# Docker'a daha fazla memory ver
# Docker Desktop -> Settings -> Resources -> Memory: 4GB+

# Container memory limiti artır
# docker-compose.yml içinde:
services:
  app:
    mem_limit: 2g
    memswap_limit: 2g
```

#### 6. Slow performance

```bash
# Volume yerine bind mount kullan (development)
# docker-compose.dev.yml zaten bind mount kullanıyor

# Image rebuild
docker-compose build --no-cache app

# Prune unused resources
docker system prune -a
```

---

## 🔐 Güvenlik

### Production için öneriler:

1. **Environment Variables:**

```bash
# .env dosyası oluştur (asla git'e commit etme!)
cp .env.example .env
# Güçlü şifreler kullan
```

2. **Secrets Management:**

```bash
# Docker secrets kullan
docker secret create jwt_secret ./jwt_secret.txt
```

3. **Network Isolation:**

```yaml
# docker-compose.yml içinde
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true # External erişim yok
```

4. **Non-root User:**

```dockerfile
# Dockerfile'da zaten yapıldı
USER nodejs  # UID 1001
```

---

## 📊 Performance Optimization

### Image Boyutunu Küçültme:

```dockerfile
# Multi-stage build (zaten yapıldı)
# Alpine base image kullan
# .dockerignore optimize et
```

### Build Speed:

```bash
# Build cache kullan
docker-compose build

# Parallel build
docker-compose build --parallel

# BuildKit etkinleştir (daha hızlı)
DOCKER_BUILDKIT=1 docker-compose build
```

### Runtime Performance:

```yaml
# docker-compose.yml içinde resource limits
services:
  app:
    cpus: '2'
    mem_limit: 2g
    mem_reservation: 1g
```

---

## 🌍 Production Deployment

### Render.com'a Deploy:

```bash
# render.yaml zaten mevcut
# Git push yeterli, Docker build Render'da olur

git add .
git commit -m "feat: Docker setup added"
git push origin main
```

### AWS ECS / Azure Container:

```bash
# Image'i registry'e push et
docker tag finbot-v3 your-registry/finbot-v3:latest
docker push your-registry/finbot-v3:latest

# ECS task definition kullan
```

---

## 📝 En İyi Pratikler

1. **Development için**: `docker-compose.dev.yml` kullan
2. **Production için**: `docker-compose.yml` kullan
3. **Volumes**: Data kaybını önlemek için named volumes kullan
4. **Health Checks**: Her serviste health check tanımla
5. **Logging**: Structured logging kullan
6. **Monitoring**: Prometheus/Grafana ekle (opsiyonel)
7. **Backup**: Database düzenli yedekle

---

## 🆘 Yardım

### Dökümantasyon:

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)

### Komut Yardımı:

```bash
docker --help
docker-compose --help
docker-compose up --help
```

### Logs & Debug:

```bash
docker-compose logs -f
docker-compose exec app sh
docker inspect finbot-app
```

---

## 📜 Lisans

FinBot v3 - © 2024

---

**🎉 Artık Docker ile FinBot v3 kullanmaya hazırsın!**

Sorularınız için: [GitHub Issues](https://github.com/your-repo/finbot-v3/issues)
