@echo off
REM FinBot v3 - Docker Quick Start Script (Windows)
REM Usage: docker-start.bat [dev|prod]

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════╗
echo ║      FinBot v3 - Docker Starter       ║
echo ╚═══════════════════════════════════════╝
echo.

REM Check Docker installation
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker bulunamadi. Lutfen Docker'i kurun.
    echo         https://docs.docker.com/get-docker/
    exit /b 1
)

where docker-compose >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker Compose bulunamadi.
    exit /b 1
)

echo [OK] Docker kurulu
echo [OK] Docker Compose kurulu
echo.

REM Parse arguments
set MODE=%1
if "%MODE%"=="" set MODE=dev

if "%MODE%"=="dev" (
    echo [INFO] Development ortami baslatiliyor...
    echo.
    echo Servisler:
    echo   - Frontend Vite HMR: http://localhost:5173
    echo   - Backend API: http://localhost:5000
    echo   - PgAdmin: http://localhost:5050
    echo   - PostgreSQL: localhost:5432
    echo   - Redis: localhost:6379
    echo.
    echo PgAdmin Giris:
    echo   - Email: admin@finbot.local
    echo   - Password: admin
    echo.
    
    docker-compose -f docker-compose.dev.yml up
    
) else if "%MODE%"=="prod" (
    echo [INFO] Production ortami baslatiliyor...
    echo.
    echo Servis:
    echo   - Uygulama: http://localhost:5000
    echo.
    
    docker-compose up --build -d
    
    echo.
    echo [OK] Production ortami baslatildi!
    echo.
    echo Loglari gormek icin:
    echo   docker-compose logs -f
    echo.
    echo Durdurmak icin:
    echo   docker-compose down
    
) else if "%MODE%"=="stop" (
    echo [INFO] Docker servisleri durduruluyor...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo [OK] Servisler durduruldu.
    
) else if "%MODE%"=="clean" (
    echo [WARNING] Tum volume'ler silinecek! Ctrl+C ile iptal edin...
    timeout /t 3 /nobreak >nul
    echo [INFO] Temizlik yapiliyor...
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    echo [OK] Temizlik tamamlandi.
    
) else (
    echo [ERROR] Gecersiz parametre: %MODE%
    echo.
    echo Kullanim:
    echo   docker-start.bat dev    - Development ortami hot-reload
    echo   docker-start.bat prod   - Production ortami
    echo   docker-start.bat stop   - Servisleri durdur
    echo   docker-start.bat clean  - Temizlik volumes dahil
    exit /b 1
)

endlocal

