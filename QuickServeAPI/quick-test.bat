@echo off
REM FinBot Quick Test Runner v2.1 (Windows)
REM Tum aktif testleri otomatik calistirir ve README'yi gunceller

echo.
echo ============================================
echo    FinBot v3 Quick Test Runner
echo ============================================
echo.
echo Aktif testler calismaya basliyor...
echo   - Core Business (84 test)
echo   - Performance (11 test)
echo   - Components (19 test)
echo   - Security (19 test)
echo.
echo Toplam: ~133 test
echo.

cd /d %~dp0

echo [1/4] Core Business Tests...
call pnpm test:critical

echo.
echo [2/4] Performance Tests...
call pnpm test:performance

echo.
echo [3/4] Frontend Tests...
call pnpm test:frontend

echo.
echo [4/4] Security Tests...
call pnpm test:security

echo.
echo ============================================
echo    Tum Aktif Testler Tamamlandi!
echo ============================================
echo.
echo README guncelleniyor...
call node scripts/quick-update-readme.js

echo.
echo Ayrintili rapor icin: pnpm test:coverage
echo.
pause
