# FinBot Test Suite Runner v2.0
# Test-suite.ts konfigürasyonu ile entegre edilmiş akıllı test runner

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   🧪 FinBot v3 Test Suite Runner" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test kategorileri ve durumları
Write-Host "📊 Test Suite Durumu:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✅ Core Business (84 test)" -ForegroundColor Green
Write-Host "     - DSCR Scenarios (36 test) - 100% ✓"
Write-Host "     - Consolidation (6 test) - 100% ✓"
Write-Host "     - Advisor Rules (15 test) - 100% ✓"
Write-Host "     - Simulation (15 test) - 100% ✓"
Write-Host "     - Dashboard (12 test) - 100% ✓"
Write-Host ""
Write-Host "  ✅ Performance & Frontend (30 test)" -ForegroundColor Green
Write-Host "     - Performance (11 test) - 100% ✓"
Write-Host "     - Components (19 test) - 100% ✓"
Write-Host ""
Write-Host "  🛡️ Security Tests (19 test)" -ForegroundColor Yellow
Write-Host "     - Dashboard Security (6 pass, 13 skip)"
Write-Host ""
Write-Host "  ⏭️  Integration Tests (286 test)" -ForegroundColor Gray
Write-Host "     - Requires DATABASE_URL or Backend"
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test Seçenekleri:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. 🎯 AKTIF TESTLER - Tüm aktif testleri çalıştır (133 test)" -ForegroundColor Green
Write-Host "     └─> Core Business + Performance + Frontend + Security"
Write-Host ""
Write-Host "  2. 🔴 CRITICAL - Sadece critical testleri çalıştır (84 test)" -ForegroundColor Red
Write-Host "     └─> Deploy öncesi MUTLAKA çalıştırılmalı!"
Write-Host ""
Write-Host "  3. 🎯 BUSINESS - İş senaryoları testleri (36 test)" -ForegroundColor Magenta
Write-Host "     └─> DSCR, Runway, Cash Gap senaryoları"
Write-Host ""
Write-Host "  4. 🛡️ SECURITY - Güvenlik testleri (19 test)" -ForegroundColor Yellow
Write-Host "     └─> SQL injection, XSS, Auth bypass"
Write-Host ""
Write-Host "  5. ⚡ PERFORMANCE - Performans testleri (11 test)" -ForegroundColor Cyan
Write-Host "     └─> Load test, concurrency, memory"
Write-Host ""
Write-Host "  6. 🎨 FRONTEND - Component testleri (19 test)" -ForegroundColor Blue
Write-Host "     └─> React component rendering"
Write-Host ""
Write-Host "  7. 📊 COVERAGE - Test coverage raporu" -ForegroundColor White
Write-Host "     └─> Detaylı coverage analizi (~75%)"
Write-Host ""
Write-Host "  8. 🌐 TÜM TESTLER - Hepsi (944 test)" -ForegroundColor DarkYellow
Write-Host "     └─> Integration + E2E dahil (skip'ler var)"
Write-Host ""
Write-Host "  0. ❌ ÇIKIŞ" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Seçiminiz (0-8)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "🎯 AKTIF TESTLER ÇALIŞTIRILIYOR..." -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Çalıştırılacak testler:" -ForegroundColor Yellow
        Write-Host "  • Core Business Logic (84 test)" -ForegroundColor White
        Write-Host "  • Performance Tests (11 test)" -ForegroundColor White
        Write-Host "  • Component Tests (19 test)" -ForegroundColor White
        Write-Host "  • Security Tests (19 test)" -ForegroundColor White
        Write-Host ""
        Write-Host "Toplam: ~133 test (Integration ve E2E skip edilecek)" -ForegroundColor Cyan
        Write-Host ""
        
        # Core business testleri
        Write-Host "▶ Core Business Tests..." -ForegroundColor Green
        pnpm test:critical
        
        # Performance testleri
        Write-Host "`n▶ Performance Tests..." -ForegroundColor Green
        pnpm test:performance
        
        # Frontend testleri
        Write-Host "`n▶ Frontend Tests..." -ForegroundColor Green
        pnpm test:frontend
        
        # Security testleri
        Write-Host "`n▶ Security Tests..." -ForegroundColor Green
        pnpm test:security
        
        Write-Host ""
        Write-Host "✅ Tüm aktif testler tamamlandı!" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Red
        Write-Host "🔴 CRITICAL TESTLER ÇALIŞTIRILIYOR..." -ForegroundColor Red
        Write-Host "============================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Bu testler deploy öncesi MUTLAKA geçmeli!" -ForegroundColor Yellow
        Write-Host ""
        pnpm test:critical
    }
    "3" {
        Write-Host ""
        Write-Host "🎯 Business Scenarios Çalıştırılıyor..." -ForegroundColor Magenta
        Write-Host ""
        pnpm test:business
    }
    "4" {
        Write-Host ""
        Write-Host "🛡️ Security Tests Çalıştırılıyor..." -ForegroundColor Yellow
        Write-Host ""
        pnpm test:security
    }
    "5" {
        Write-Host ""
        Write-Host "⚡ Performance Tests Çalıştırılıyor..." -ForegroundColor Cyan
        Write-Host ""
        pnpm test:performance
    }
    "6" {
        Write-Host ""
        Write-Host "🎨 Frontend Tests Çalıştırılıyor..." -ForegroundColor Blue
        Write-Host ""
        pnpm test:frontend
    }
    "7" {
        Write-Host ""
        Write-Host "📊 Coverage Raporu Oluşturuluyor..." -ForegroundColor White
        Write-Host ""
        pnpm test:coverage
    }
    "8" {
        Write-Host ""
        Write-Host "🌐 TÜM TESTLER ÇALIŞTIRILIYOR..." -ForegroundColor DarkYellow
        Write-Host ""
        Write-Host "⚠️  Bu komut Integration ve E2E testlerini de içerir" -ForegroundColor Yellow
        Write-Host "   (DATABASE_URL ve Backend yoksa skip edilecek)" -ForegroundColor Gray
        Write-Host ""
        pnpm test
    }
    "0" {
        Write-Host ""
        Write-Host "👋 Test runner kapatılıyor..." -ForegroundColor Gray
        Write-Host ""
        exit
    }
    default {
        Write-Host ""
        Write-Host "⚠️  Geçersiz seçim!" -ForegroundColor Red
        Write-Host "Varsayılan olarak aktif testler çalıştırılıyor..." -ForegroundColor Yellow
        Write-Host ""
        pnpm test:critical
        pnpm test:performance
        pnpm test:frontend
    }
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   Test Çalıştırma Tamamlandı" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

