# FinBot Test Runner
# Bu script testleri çalıştırır ve sonuçları gösterir

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   FinBot Test Suite Runner" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test kategorileri
$testGroups = @{
    "Consolidation Tests" = "tests/consolidation/breakdown.test.ts"
    "Advisor Tests" = "tests/advisor/rules.test.ts"
    "Simulation Tests" = "tests/simulation/engine.test.ts"
    "Dashboard Tests" = "tests/dashboard/runway-cashgap.test.ts"
}

Write-Host "Seçenekler:" -ForegroundColor Yellow
Write-Host "1. Tüm testleri çalıştır"
Write-Host "2. Sadece düzeltilen testleri çalıştır"
Write-Host "3. Tek tek test gruplarını çalıştır"
Write-Host ""

$choice = Read-Host "Seçiminiz (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`nTüm testler çalıştırılıyor..." -ForegroundColor Green
        pnpm test
    }
    "2" {
        Write-Host "`nDüzeltilen testler çalıştırılıyor..." -ForegroundColor Green
        foreach ($testName in $testGroups.Keys) {
            Write-Host "`n>>> $testName" -ForegroundColor Cyan
            pnpm test $testGroups[$testName]
            Write-Host ""
        }
    }
    "3" {
        Write-Host ""
        $i = 1
        foreach ($testName in $testGroups.Keys) {
            Write-Host "$i. $testName" -ForegroundColor Yellow
            $i++
        }
        Write-Host ""
        $testChoice = Read-Host "Hangi test grubunu çalıştırmak istersiniz? (1-$($testGroups.Count))"
        
        $selectedTest = @($testGroups.Keys)[$testChoice - 1]
        if ($selectedTest) {
            Write-Host "`n$selectedTest çalıştırılıyor..." -ForegroundColor Green
            pnpm test $testGroups[$selectedTest]
        } else {
            Write-Host "Geçersiz seçim!" -ForegroundColor Red
        }
    }
    default {
        Write-Host "Geçersiz seçim! Tüm testler çalıştırılıyor..." -ForegroundColor Yellow
        pnpm test
    }
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   Test Çalıştırma Tamamlandı" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

