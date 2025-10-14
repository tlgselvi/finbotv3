@echo off
echo 🔄 Cursor Agent Reset Tamamlandı!
echo.
echo 🎯 Yapılan İşlemler:
echo ✅ Cursor cache temizlendi
echo ✅ Agent konfigürasyonu sıfırlandı
echo ✅ .cursorrules güncellendi
echo ✅ Workspace ayarları sıfırlandı
echo ✅ Agent manifest oluşturuldu
echo.
echo 🚀 Cursor yeniden başlatılıyor...
taskkill /f /im "Cursor.exe" 2>nul
timeout /t 3 /nobreak >nul
start "" "C:\Users\%USERNAME%\AppData\Local\Programs\cursor\Cursor.exe" "%CD%"
echo.
echo ✅ Cursor yeniden başlatıldı!
echo 🎯 Chat penceresinde "CTO koçu v3" görmelisin!
echo.
echo 💡 Test Komutları:
echo - "Sprint hazırla"
echo - "Audit yap"
echo - "Optimize et"
echo - "Release oluştur"
echo.
pause