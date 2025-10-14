#!/usr/bin/env node

/**
 * CTO Koçu v3 - Otomatik Deploy Sistemi
 * Bu script tüm deploy adımlarını otomatik olarak yapar
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://finbot-v3.onrender.com';

console.log('🚀 CTO Koçu v3 - Otomatik Deploy Sistemi Başlatılıyor...\n');

// 1. Git durumunu kontrol et
function checkGitStatus() {
    console.log('1️⃣ Git durumu kontrol ediliyor...');
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim()) {
            console.log('📝 Değişiklikler bulundu:');
            console.log(status);
            return true;
        } else {
            console.log('✅ Git temiz durumda');
            return false;
        }
    } catch (error) {
        console.log('❌ Git durumu kontrol edilemedi:', error.message);
        return false;
    }
}

// 2. Değişiklikleri commit et
function commitChanges() {
    console.log('\n2️⃣ Değişiklikler commit ediliyor...');
    try {
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "CTO Koçu v3 - Otomatik deploy ve iyileştirmeler"', { stdio: 'inherit' });
        console.log('✅ Değişiklikler commit edildi');
        return true;
    } catch (error) {
        console.log('❌ Commit hatası:', error.message);
        return false;
    }
}

// 3. GitHub'a push et
function pushToGitHub() {
    console.log('\n3️⃣ GitHub\'a push ediliyor...');
    try {
        execSync('git push origin master', { stdio: 'inherit' });
        console.log('✅ GitHub\'a push edildi');
        return true;
    } catch (error) {
        console.log('❌ Push hatası:', error.message);
        return false;
    }
}

// 4. Build kontrolü
function checkBuild() {
    console.log('\n4️⃣ Build kontrolü yapılıyor...');
    try {
        // Frontend build
        console.log('📦 Frontend build ediliyor...');
        execSync('cd QuickServeAPI && npm run build:client', { stdio: 'inherit' });

        // Backend build
        console.log('📦 Backend build ediliyor...');
        execSync('cd QuickServeAPI && npm run build:server', { stdio: 'inherit' });

        console.log('✅ Build başarılı');
        return true;
    } catch (error) {
        console.log('❌ Build hatası:', error.message);
        return false;
    }
}

// 5. Render.com deploy durumunu kontrol et
async function checkRenderDeploy() {
    console.log('\n5️⃣ Render.com deploy durumu kontrol ediliyor...');
    try {
        const response = await fetch(`${BASE_URL}/api/health`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Render.com deploy başarılı:', data);
            return true;
        } else {
            console.log('⚠️ Render.com deploy henüz tamamlanmadı:', response.status);
            return false;
        }
    } catch (error) {
        console.log('⚠️ Render.com deploy kontrol edilemedi:', error.message);
        return false;
    }
}

// 6. Deploy sonrası test
async function testAfterDeploy() {
    console.log('\n6️⃣ Deploy sonrası test yapılıyor...');

    const tests = [
        { name: 'Health Endpoint', url: '/api/health' },
        { name: 'Manifest', url: '/manifest.json' },
        { name: 'Favicon', url: '/favicon.ico' }
    ];

    let successCount = 0;

    for (const test of tests) {
        try {
            const response = await fetch(`${BASE_URL}${test.url}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.ok) {
                console.log(`✅ ${test.name}: OK`);
                successCount++;
            } else {
                console.log(`❌ ${test.name}: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
        }
    }

    console.log(`\n📊 Test Sonuçları: ${successCount}/${tests.length} başarılı`);
    return successCount === tests.length;
}

// 7. CTO Koçu v3 komutlarını test et
function testCTOKoçuV3() {
    console.log('\n7️⃣ CTO Koçu v3 komutları test ediliyor...');
    try {
        // Sprint komutu test et
        console.log('🏃 Sprint komutu test ediliyor...');
        execSync('node ./cto-coach-v2/dist/index.js hazirla -p FinBot', { stdio: 'inherit' });
        console.log('✅ CTO Koçu v3 komutları çalışıyor');
        return true;
    } catch (error) {
        console.log('❌ CTO Koçu v3 komut hatası:', error.message);
        return false;
    }
}

// 8. Deploy raporu oluştur
function createDeployReport(results) {
    console.log('\n8️⃣ Deploy raporu oluşturuluyor...');

    const report = `# CTO Koçu v3 - Otomatik Deploy Raporu

**Tarih:** ${new Date().toLocaleString('tr-TR')}  
**Durum:** ${results.allSuccess ? '✅ BAŞARILI' : '⚠️ KISMEN BAŞARILI'}  

## 📋 Yapılan İşlemler

### ✅ Git İşlemleri
- **Git Status:** ${results.gitStatus ? 'Değişiklikler bulundu' : 'Temiz'}
- **Commit:** ${results.commit ? 'Başarılı' : 'Başarısız'}
- **Push:** ${results.push ? 'Başarılı' : 'Başarısız'}

### ✅ Build İşlemleri
- **Frontend Build:** ${results.build ? 'Başarılı' : 'Başarısız'}
- **Backend Build:** ${results.build ? 'Başarılı' : 'Başarısız'}

### ✅ Deploy İşlemleri
- **Render.com Deploy:** ${results.renderDeploy ? 'Başarılı' : 'Bekleniyor'}
- **Post-Deploy Test:** ${results.postDeployTest ? 'Başarılı' : 'Başarısız'}

### ✅ CTO Koçu v3 Test
- **Komut Testi:** ${results.ctoTest ? 'Başarılı' : 'Başarısız'}

## 🎯 Sonuç

${results.allSuccess ?
            '🎉 TÜM İŞLEMLER BAŞARILI! CTO Koçu v3 tamamen deploy edildi ve çalışıyor!' :
            '⚠️ Bazı işlemler başarısız. Logları kontrol edin.'
        }

## 📊 Başarı Oranı

- **Git İşlemleri:** ${results.gitStatus && results.commit && results.push ? '100%' : '0%'}
- **Build İşlemleri:** ${results.build ? '100%' : '0%'}
- **Deploy İşlemleri:** ${results.renderDeploy && results.postDeployTest ? '100%' : '0%'}
- **CTO Koçu v3:** ${results.ctoTest ? '100%' : '0%'}

---
**CTO Koçu v3** — Otomatik Deploy Sistemi 🚀`;

    fs.writeFileSync('DEPLOY_RAPORU_V3.md', report);
    console.log('✅ Deploy raporu oluşturuldu: DEPLOY_RAPORU_V3.md');
}

// Ana fonksiyon
async function main() {
    const results = {
        gitStatus: false,
        commit: false,
        push: false,
        build: false,
        renderDeploy: false,
        postDeployTest: false,
        ctoTest: false,
        allSuccess: false
    };

    try {
        // 1. Git durumu
        results.gitStatus = checkGitStatus();

        // 2. Değişiklikleri commit et
        if (results.gitStatus) {
            results.commit = commitChanges();
        }

        // 3. GitHub'a push et
        if (results.commit || !results.gitStatus) {
            results.push = pushToGitHub();
        }

        // 4. Build kontrolü
        results.build = checkBuild();

        // 5. Render.com deploy kontrolü (30 saniye bekle)
        console.log('\n⏳ Render.com deploy için 30 saniye bekleniyor...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        results.renderDeploy = await checkRenderDeploy();

        // 6. Deploy sonrası test
        results.postDeployTest = await testAfterDeploy();

        // 7. CTO Koçu v3 test
        results.ctoTest = testCTOKoçuV3();

        // 8. Sonuç hesapla
        results.allSuccess = results.push && results.build && results.renderDeploy && results.postDeployTest && results.ctoTest;

        // 9. Rapor oluştur
        createDeployReport(results);

        // 10. Sonuç
        console.log('\n🎯 OTOMATİK DEPLOY TAMAMLANDI!');
        console.log('================================');
        console.log(`Git İşlemleri: ${results.push ? '✅' : '❌'}`);
        console.log(`Build İşlemleri: ${results.build ? '✅' : '❌'}`);
        console.log(`Render.com Deploy: ${results.renderDeploy ? '✅' : '❌'}`);
        console.log(`Post-Deploy Test: ${results.postDeployTest ? '✅' : '❌'}`);
        console.log(`CTO Koçu v3 Test: ${results.ctoTest ? '✅' : '❌'}`);
        console.log(`\n🎉 Genel Durum: ${results.allSuccess ? 'BAŞARILI' : 'KISMEN BAŞARILI'}`);

        if (results.allSuccess) {
            console.log('\n🚀 CTO Koçu v3 tamamen deploy edildi ve çalışıyor!');
            console.log('🌐 URL: https://finbot-v3.onrender.com');
            console.log('🤖 CTO Koçu v3 komutları hazır!');
        } else {
            console.log('\n⚠️ Bazı işlemler başarısız. DEPLOY_RAPORU_V3.md dosyasını kontrol edin.');
        }

    } catch (error) {
        console.error('❌ Kritik hata:', error.message);
        process.exit(1);
    }
}

// Script'i çalıştır
main().catch(console.error);
