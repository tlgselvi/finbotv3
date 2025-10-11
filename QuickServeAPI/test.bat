@echo off
REM Akilli Test Runner - Tek Tiklama
REM Test + README Guncelleme + Eksik Test Tespiti + Test Sablonlari + Temizlik

echo.
echo ============================================
echo   AKILLI TEST RUNNER - FinBot v3
echo   Tek Komutla: Her Sey Otomatik!
echo ============================================
echo.

cd /d %~dp0
call pnpm test:smart

echo.
echo ============================================
echo   Tamamlandi!
echo ============================================
echo.
pause

