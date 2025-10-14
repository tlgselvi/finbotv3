@echo off
echo 🔄 Cursor yeniden başlatılıyor...
taskkill /f /im "Cursor.exe" 2>nul
timeout /t 2 /nobreak >nul
start "" "C:\Users\%USERNAME%\AppData\Local\Programs\cursor\Cursor.exe" "%CD%"
echo ✅ Cursor yeniden başlatıldı!
echo 🎯 Chat penceresinde "CTO koçu v3" görmelisin!
pause