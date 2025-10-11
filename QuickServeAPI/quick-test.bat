@echo off
REM FinBot Quick Test Runner (Windows)

echo =====================================
echo    FinBot Quick Test Runner
echo =====================================
echo.

echo Testler calismaya basliyor...
echo.

cd /d %~dp0
call pnpm test

echo.
echo =====================================
echo    Test Tamamlandi
echo =====================================
echo.
pause

