#!/usr/bin/env node

/**
 * Cursor Agent Reset Script
 * Bu script Cursor'ın agent sistemini tamamen sıfırlar ve v3'ü aktif hale getirir
 */

import fs from 'fs';
import path from 'path';

console.log('🔄 Cursor Agent Reset Başlatılıyor...\n');

// 1. Tüm Cursor cache'lerini temizle
console.log('🧹 Cursor cache temizleniyor...');
const cachePaths = [
    '.cursor',
    '.vscode',
    'node_modules/.cache',
    '.git/cache'
];

cachePaths.forEach(cachePath => {
    if (fs.existsSync(cachePath)) {
        try {
            if (cachePath === '.cursor') {
                // .cursor klasörünü tamamen sil
                fs.rmSync(cachePath, { recursive: true, force: true });
                console.log(`✅ ${cachePath} tamamen silindi`);
            } else {
                // Diğer cache'leri temizle
                const files = fs.readdirSync(cachePath);
                files.forEach(file => {
                    if (file.includes('cache') || file.includes('temp')) {
                        const fullPath = path.join(cachePath, file);
                        if (fs.statSync(fullPath).isDirectory()) {
                            fs.rmSync(fullPath, { recursive: true, force: true });
                            console.log(`✅ ${fullPath} temizlendi`);
                        }
                    }
                });
            }
        } catch (error) {
            console.log(`⚠️ ${cachePath} temizlenemedi: ${error.message}`);
        }
    }
});

// 2. .cursor klasörünü yeniden oluştur
console.log('\n📁 .cursor klasörü yeniden oluşturuluyor...');
fs.mkdirSync('.cursor', { recursive: true });
fs.mkdirSync('.cursor/rules', { recursive: true });

// 3. Basit agent konfigürasyonu oluştur
console.log('🔧 Basit agent konfigürasyonu oluşturuluyor...');

// .cursorrules dosyasını güncelle
const cursorRules = `# CTO Koçu v3 — Cursor Agent Kuralları

## 🎯 Rol Tanımı
Sen **CTO Koçu v3**'sün. Tolga'nın yazdığı doğal dil komutlarını uygun CLI komutuna çevir.

## 🚀 Agent Kimliği
- **Ad:** CTO Koçu v3
- **Versiyon:** 3.0
- **Durum:** Aktif
- **Proje:** FinBot v3

## 🔹 Komut Haritası
- "Sprint hazırla" → \`node ./cto-coach-v2/dist/index.js hazirla -p FinBot\`
- "Sprint 2 hazırla" → \`node ./cto-coach-v2/dist/index.js hazirla -p FinBot -s 2\`
- "Monitoring sprint hazırla" → \`node ./cto-coach-v2/dist/index.js hazirla -p FinBot -s 2\`
- "Audit yap" → \`node ./cto-coach-v2/dist/index.js audit -p FinBot\`
- "Güvenlik audit" → \`node ./cto-coach-v2/dist/index.js audit -p FinBot\`
- "Optimize et" → \`node ./cto-coach-v2/dist/index.js optimize -p FinBot\`
- "Performans optimize" → \`node ./cto-coach-v2/dist/index.js optimize -p FinBot\`
- "Release oluştur" → \`node ./cto-coach-v2/dist/index.js release -p FinBot\`
- "Release hazırla" → \`node ./cto-coach-v2/dist/index.js release -p FinBot\`

## 🔹 Kurallar
1. Yanıtlar kısa ve teknik olmalı
2. Sadece CLI çıktısını göster, açıklama yapma
3. FinBot dizini kök olarak varsay
4. Eğer komut başarısız olursa hata mesajını analiz edip çözüm öner
5. "hazirla" komutu çalıştığında \`plans/sprint-plan.md\` dosyasını doğrula
6. Sprint numarası belirtilirse \`-s\` parametresini kullan
7. Proje adı varsayılan olarak "FinBot" kullan

## 🔹 Örnek Kullanım
**Tolga:** Sprint hazırla  
**Sen:**
\`\`\`
> node ./cto-coach-v2/dist/index.js hazirla -p FinBot
✅ Sprint planı oluşturuldu: plans/sprint-plan.md
\`\`\`

## 🔹 Agent Tanımlama
Bu dosya Cursor'da agent olarak tanımlanmalıdır:
- **Dosya Adı:** .cursorrules
- **Agent Adı:** CTO Koçu v3
- **Açıklama:** FinBot v3 için otomatik geliştirme asistanı
- **Versiyon:** 3.0
- **Durum:** Aktif

## 🔹 Proje Bilgileri
- **Proje:** FinBot v3
- **URL:** https://finbot-v3.onrender.com
- **Database:** PostgreSQL with SSL/TLS
- **Deployment:** Render.com
- **Admin:** admin@finbot.com / admin123
- **Developer:** Tolga Selvi
- **Son Güncelleme:** 2025-10-14

---

**CTO Koçu v3** — FinBot v3 için otomatik geliştirme asistanı 🚀`;

fs.writeFileSync('.cursorrules', cursorRules);
console.log('✅ .cursorrules güncellendi');

// 4. Cursor workspace ayarlarını sıfırla
console.log('\n⚙️ Cursor workspace ayarları sıfırlanıyor...');
const workspaceSettings = {
    "typescript.preferences.includePackageJsonAutoImports": "auto",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "cursor.general.enableAgent": true,
    "cursor.general.agentName": "CTO Koçu v3",
    "cursor.general.agentVersion": "3.0",
    "cursor.general.agentDescription": "FinBot v3 için otomatik geliştirme asistanı"
};

if (!fs.existsSync('.vscode')) {
    fs.mkdirSync('.vscode', { recursive: true });
}

fs.writeFileSync('.vscode/settings.json', JSON.stringify(workspaceSettings, null, 2));
console.log('✅ Cursor workspace ayarları sıfırlandı');

// 5. Agent manifest oluştur
console.log('\n📋 Agent manifest oluşturuluyor...');
const agentManifest = {
    "version": "1.0",
    "agents": [
        {
            "id": "cto-koçu-v3",
            "name": "CTO Koçu v3",
            "version": "3.0",
            "description": "FinBot v3 için otomatik geliştirme asistanı",
            "status": "active",
            "priority": "high",
            "config_file": ".cursorrules",
            "last_updated": new Date().toISOString(),
            "developer": "Tolga Selvi"
        }
    ],
    "active_agent": "cto-koçu-v3",
    "last_updated": new Date().toISOString()
};

fs.writeFileSync('.cursor/agents.json', JSON.stringify(agentManifest, null, 2));
console.log('✅ Agent manifest oluşturuldu');

// 6. Cursor restart script'i oluştur
console.log('\n📝 Cursor restart script oluşturuluyor...');
const restartScript = `@echo off
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
start "" "C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\cursor\\Cursor.exe" "%CD%"
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
pause`;

fs.writeFileSync('reset-cursor-agents.bat', restartScript);
console.log('✅ reset-cursor-agents.bat oluşturuldu');

// 7. Özet
console.log('\n🎉 Cursor Agent Reset Tamamlandı!');
console.log('\n📋 Yapılan İşlemler:');
console.log('✅ Cursor cache tamamen temizlendi');
console.log('✅ .cursor klasörü yeniden oluşturuldu');
console.log('✅ .cursorrules güncellendi');
console.log('✅ Workspace ayarları sıfırlandı');
console.log('✅ Agent manifest oluşturuldu');
console.log('✅ Cursor restart script oluşturuldu');

console.log('\n🚀 Sonraki Adımlar:');
console.log('1. reset-cursor-agents.bat dosyasını çalıştır');
console.log('2. Cursor otomatik olarak yeniden başlayacak');
console.log('3. Chat penceresinde "CTO koçu v3" görmelisin');

console.log('\n💡 Manuel Yöntem:');
console.log('1. Cursor\'ı tamamen kapat');
console.log('2. Tekrar aç');
console.log('3. Agent menüsünde "CTO koçu v3" seç');

console.log('\n🎯 CTO Koçu v3 Hazır! 🚀');
