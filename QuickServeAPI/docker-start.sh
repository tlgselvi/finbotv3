#!/bin/bash
# FinBot v3 - Docker Quick Start Script
# Usage: ./docker-start.sh [dev|prod]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║      FinBot v3 - Docker Starter       ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker bulunamadı. Lütfen Docker'ı kurun.${NC}"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose bulunamadı.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker kurulu ($(docker --version))${NC}"
echo -e "${GREEN}✅ Docker Compose kurulu ($(docker-compose --version))${NC}"
echo ""

# Parse arguments
MODE=${1:-dev}

if [ "$MODE" == "dev" ]; then
    echo -e "${BLUE}🚀 Development ortamı başlatılıyor...${NC}"
    echo ""
    echo -e "${YELLOW}Servisler:${NC}"
    echo "  - Frontend (Vite HMR): http://localhost:5173"
    echo "  - Backend API: http://localhost:5000"
    echo "  - PgAdmin: http://localhost:5050"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo ""
    echo -e "${YELLOW}PgAdmin Giriş:${NC}"
    echo "  - Email: admin@finbot.local"
    echo "  - Password: admin"
    echo ""
    
    docker-compose -f docker-compose.dev.yml up
    
elif [ "$MODE" == "prod" ]; then
    echo -e "${BLUE}🏭 Production ortamı başlatılıyor...${NC}"
    echo ""
    echo -e "${YELLOW}Servis:${NC}"
    echo "  - Uygulama: http://localhost:5000"
    echo ""
    
    docker-compose up --build -d
    
    echo ""
    echo -e "${GREEN}✅ Production ortamı başlatıldı!${NC}"
    echo ""
    echo -e "${YELLOW}Logları görmek için:${NC}"
    echo "  docker-compose logs -f"
    echo ""
    echo -e "${YELLOW}Durdurmak için:${NC}"
    echo "  docker-compose down"
    
elif [ "$MODE" == "stop" ]; then
    echo -e "${BLUE}🛑 Docker servisleri durduruluyor...${NC}"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}✅ Servisler durduruldu.${NC}"
    
elif [ "$MODE" == "clean" ]; then
    echo -e "${YELLOW}⚠️  Tüm volume'ler silinecek! (Ctrl+C ile iptal edin)${NC}"
    sleep 3
    echo -e "${BLUE}🧹 Temizlik yapılıyor...${NC}"
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    echo -e "${GREEN}✅ Temizlik tamamlandı.${NC}"
    
else
    echo -e "${RED}❌ Geçersiz parametre: $MODE${NC}"
    echo ""
    echo -e "${YELLOW}Kullanım:${NC}"
    echo "  ./docker-start.sh dev    - Development ortamı (hot-reload)"
    echo "  ./docker-start.sh prod   - Production ortamı"
    echo "  ./docker-start.sh stop   - Servisleri durdur"
    echo "  ./docker-start.sh clean  - Temizlik (volumes dahil)"
    exit 1
fi

