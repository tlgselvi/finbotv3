#!/usr/bin/env node

/**
 * CTO Koçu v3 Activation Script
 * Bu script Cursor'da CTO Koçu v3'ü aktif hale getirir
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 CTO Koçu v3 Aktivasyon Scripti Başlatılıyor...\n');

// 1. Agent konfigürasyon dosyalarını kontrol et
const configFiles = [
    'agent-config.md',
    'cto-koçu-v3-config.md',
    '.cursorrules',
    '.cursor/rules/CTO-Koçu-v3.yaml',
    '.cursor/agents.json'
];

console.log('📁 Konfigürasyon dosyalarını kontrol ediliyor...');
configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - Mevcut`);
    } else {
        console.log(`❌ ${file} - Bulunamadı`);
    }
});

// 2. CTO Koçu v3 CLI'yi kontrol et
const cliPath = './cto-coach-v2/dist/index.js';
console.log('\n🔧 CTO Koçu CLI kontrol ediliyor...');
if (fs.existsSync(cliPath)) {
    console.log(`✅ ${cliPath} - Mevcut`);
} else {
    console.log(`❌ ${cliPath} - Bulunamadı`);
    console.log('💡 Çözüm: npm run build komutunu çalıştır');
}

// 3. Plans klasörünü kontrol et
const plansDir = './plans';
console.log('\n📋 Plans klasörü kontrol ediliyor...');
if (fs.existsSync(plansDir)) {
    console.log(`✅ ${plansDir} - Mevcut`);
} else {
    console.log(`❌ ${plansDir} - Bulunamadı, oluşturuluyor...`);
    fs.mkdirSync(plansDir, { recursive: true });
    console.log(`✅ ${plansDir} - Oluşturuldu`);
}

// 4. Agent manifest dosyasını güncelle
console.log('\n🔄 Agent manifest güncelleniyor...');
const manifestPath = '.cursor/agents.json';
if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.active_agent = 'cto-koçu-v3';
    manifest.last_updated = new Date().toISOString();

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Agent manifest güncellendi');
} else {
    console.log('❌ Agent manifest bulunamadı');
}

// 5. Cursor workspace ayarlarını güncelle
console.log('\n⚙️ Cursor workspace ayarları güncelleniyor...');
const vscodeSettings = {
    "ctoAI.coreIntegration": true,
    "ctoAI.sharedContext": "./cto-koçu-v3-config.md",
    "ctoAI.projectId": "finbot-v3",
    "ctoAI.lastSync": new Date().toISOString(),
    "typescript.preferences.includePackageJsonAutoImports": "auto",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
};

const settingsPath = '.vscode/settings.json';
if (!fs.existsSync('.vscode')) {
    fs.mkdirSync('.vscode', { recursive: true });
}

fs.writeFileSync(settingsPath, JSON.stringify(vscodeSettings, null, 2));
console.log('✅ Cursor workspace ayarları güncellendi');

// 6. Özet
console.log('\n🎉 CTO Koçu v3 Aktivasyon Tamamlandı!');
console.log('\n📋 Yapılan İşlemler:');
console.log('✅ Konfigürasyon dosyaları kontrol edildi');
console.log('✅ CTO Koçu CLI kontrol edildi');
console.log('✅ Plans klasörü hazırlandı');
console.log('✅ Agent manifest güncellendi');
console.log('✅ Cursor workspace ayarları güncellendi');

console.log('\n🚀 Sonraki Adımlar:');
console.log('1. Cursor\'ı yeniden başlat');
console.log('2. Chat penceresinde "CTO koçu v3" görmelisin');
console.log('3. Komutları test et: "Sprint hazırla"');

console.log('\n💡 Test Komutları:');
console.log('- "Sprint hazırla"');
console.log('- "Audit yap"');
console.log('- "Optimize et"');
console.log('- "Release oluştur"');

console.log('\n🎯 CTO Koçu v3 Hazır! 🚀');
