# Akıllı Test Runner - PowerShell
# Test + Analiz + Güncelleme + Temizlik

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AKILLI TEST RUNNER - FinBot v3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

pnpm test:smart

Write-Host ""
Write-Host "Devam etmek için bir tuşa basın..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

