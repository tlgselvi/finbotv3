#!/usr/bin/env node

/**
 * CTO Koçu v3 Force Reload Script
 * Bu script Cursor'da agent'ı zorla yeniden yükler
 */

import fs from 'fs';
import path from 'path';

console.log('🔄 CTO Koçu v3 Force Reload Başlatılıyor...\n');

// 1. Cursor cache'ini temizle
console.log('🧹 Cursor cache temizleniyor...');
const cacheDirs = [
  '.cursor/cache',
  '.vscode/cache',
  'node_modules/.cache'
];

cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ ${dir} temizlendi`);
    } catch (error) {
      console.log(`⚠️ ${dir} temizlenemedi: ${error.message}`);
    }
  }
});

// 2. Agent konfigürasyonunu yeniden oluştur
console.log('\n🔧 Agent konfigürasyonu yeniden oluşturuluyor...');

// Ana agent config'i güncelle
const agentConfig = `# CTO Koçu v3 — Cursor Agent Konfigürasyonu

## 🎯 Amaç
Bu agent, Cursor sohbetinde yazılan komutları otomatik olarak
CTO Koçu v3 CLI'ye (\`cto-coach-v2/dist/index.js\`) yönlendirir.

## 🔹 Rol Tanımı
Sen bir **CTO asistanısın**.
Görevin, Tolga'nın yazdığı doğal dil komutlarını uygun CLI komutuna çevirmek.

## 🚀 Güncelleme (2025-10-14)
- **Version**: CTO Koçu v3
- **Production Status**: ✅ FinBot v3 live on Render.com
- **URL**: https://finbot-v3.onrender.com
- **Database**: PostgreSQL with SSL/TLS
- **Deployment**: Render.com infrastructure
- **Admin**: admin@finbot.com / admin123

## 🔹 Komut Haritası
| Sohbet Komutu | CLI Komutu |
|----------------|-------------|
| "Sprint hazırla" | \`node ./cto-coach-v2/dist/index.js hazirla -p FinBot\` |
| "Sprint 2 hazırla" | \`node ./cto-coach-v2/dist/index.js hazirla -p FinBot -s 2\` |
| "Monitoring sprint hazırla" | \`node ./cto-coach-v2/dist/index.js hazirla -p FinBot -s 2\` |
| "Audit yap" | \`node ./cto-coach-v2/dist/index.js audit -p FinBot\` |
| "Güvenlik audit" | \`node ./cto-coach-v2/dist/index.js audit -p FinBot\` |
| "Optimize et" | \`node ./cto-coach-v2/dist/index.js optimize -p FinBot\` |
| "Performans optimize" | \`node ./cto-coach-v2/dist/index.js optimize -p FinBot\` |
| "Release oluştur" | \`node ./cto-coach-v2/dist/index.js release -p FinBot\` |
| "Release hazırla" | \`node ./cto-coach-v2/dist/index.js release -p FinBot\` |

## 🔹 Kurallar
1. Yanıtlar kısa ve teknik olmalı.
2. Sadece CLI çıktısını göster, açıklama yapma.
3. FinBot dizini kök olarak varsay.
4. Eğer komut başarısız olursa hata mesajını analiz edip çözüm öner.
5. "hazirla" komutu çalıştığında \`plans/sprint-plan.md\` dosyasını doğrula.
6. Sprint numarası belirtilirse \`-s\` parametresini kullan.
7. Proje adı varsayılan olarak "FinBot" kullan.

## 🔹 Örnek Kullanım

**Tolga:** Sprint hazırla  
**Agent:**
\`\`\`
> node ./cto-coach-v2/dist/index.js hazirla -p FinBot
✅ Sprint planı oluşturuldu: plans/sprint-plan.md
\`\`\`

**Tolga:** Audit yap  
**Agent:**
\`\`\`
> node ./cto-coach-v2/dist/index.js audit -p FinBot
🔒 Güvenlik kontrol listesi hazırlandı!
📁 Rapor konumu: plans/security-audit.md
⚠️ Risk skoru: 6/10 (Orta Risk)
\`\`\`

**Tolga:** Optimize et  
**Agent:**
\`\`\`
> node ./cto-coach-v2/dist/index.js optimize -p FinBot
⚡ Performans metrikleri analiz edildi!
📁 Rapor konumu: plans/performance-optimization.md
📊 Performans skoru: 6/10
\`\`\`

## 🔹 Hata Durumları

### CLI Bulunamadı
\`\`\`
❌ CTO Koçu CLI bulunamadı: ./cto-coach-v2/dist/index.js
💡 Çözüm: npm run build komutunu çalıştır
\`\`\`

### Proje Dizini Bulunamadı
\`\`\`
❌ FinBot proje dizini bulunamadı
💡 Çözüm: Doğru dizinde olduğundan emin ol
\`\`\`

### Database Bağlantı Hatası
\`\`\`
❌ Database bağlantı hatası
💡 Çözüm: DATABASE_URL environment variable'ını kontrol et
\`\`\`

## 🔹 Gelişmiş Komutlar

### Sprint Yönetimi
- **"Sprint 1 hazırla"** → İlk sprint planı
- **"Sprint 2 hazırla"** → İkinci sprint planı  
- **"Monitoring sprint hazırla"** → Monitoring odaklı sprint
- **"Bug fix sprint hazırla"** → Bug fix odaklı sprint

### Audit ve Güvenlik
- **"Audit yap"** → Genel kod audit'i
- **"Güvenlik audit"** → Güvenlik odaklı audit
- **"Performance audit"** → Performans audit'i
- **"Code quality audit"** → Kod kalitesi audit'i

### Optimizasyon
- **"Optimize et"** → Genel optimizasyon
- **"Performans optimize"** → Performans optimizasyonu
- **"Database optimize"** → Database optimizasyonu
- **"Frontend optimize"** → Frontend optimizasyonu

### Release Yönetimi
- **"Release oluştur"** → Yeni release oluştur
- **"Release hazırla"** → Release hazırlığı
- **"Hotfix release"** → Acil düzeltme release'i
- **"Major release"** → Büyük sürüm release'i

## 🔹 Proje Durumu

### ✅ Tamamlanan
- **FinBot v3**: Render'da live
- **Database**: PostgreSQL entegrasyonu
- **API**: 80+ endpoint çalışıyor
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Drizzle ORM
- **Deployment**: Render.com infrastructure

### 🚀 Aktif Geliştirme
- **Monitoring**: Real-time metrics
- **Error Tracking**: Advanced error handling
- **User Analytics**: Usage patterns
- **Mobile App**: React Native development
- **Bank Integrations**: Turkish bank APIs

## 🔹 Teknik Detaylar

### Database Schema
- **users**: Kullanıcı yönetimi
- **accounts**: Hesap bilgileri
- **transactions**: İşlem geçmişi
- **system_alerts**: Sistem uyarıları

### API Endpoints
- **Authentication**: \`/api/auth/*\`
- **Accounts**: \`/api/accounts/*\`
- **Transactions**: \`/api/transactions/*\`
- **Analytics**: \`/api/analytics/*\`

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string
- **NODE_ENV**: production/development
- **API_PORT**: Server port (default: 3000)
- **JWT_SECRET**: Authentication secret

## 🔹 Troubleshooting

### Agent Çalışmıyor
1. Cursor'ı yeniden başlat
2. Agent'ı yeniden import et
3. \`agent-config.md\` dosyasının doğru konumda olduğunu kontrol et

### CLI Komutları Bulunamıyor
1. \`cto-coach-v2\` klasörünün var olduğunu kontrol et
2. \`npm run build\` komutunu çalıştır
3. \`dist/\` klasörünün oluştuğunu kontrol et

### Database Bağlantı Sorunu
1. \`DATABASE_URL\` environment variable'ını kontrol et
2. PostgreSQL servisinin çalıştığını kontrol et
3. SSL sertifikalarını kontrol et

## 🔹 İletişim

- **Developer**: Tolga Selvi
- **Project**: FinBot v3
- **Version**: CTO Koçu v3
- **Last Update**: 2025-10-14
- **Status**: ✅ Production Ready

---

**CTO Koçu v3** — FinBot v3 için otomatik geliştirme asistanı 🚀`;

fs.writeFileSync('agent-config.md', agentConfig);
console.log('✅ agent-config.md güncellendi');

// 3. Cursor workspace ayarlarını güncelle
console.log('\n⚙️ Cursor workspace ayarları güncelleniyor...');
const vscodeSettings = {
  "ctoAI.coreIntegration": true,
  "ctoAI.sharedContext": "./agent-config.md",
  "ctoAI.projectId": "finbot-v3",
  "ctoAI.lastSync": new Date().toISOString(),
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "cursor.general.enableAgent": true,
  "cursor.general.agentName": "CTO Koçu v3"
};

if (!fs.existsSync('.vscode')) {
  fs.mkdirSync('.vscode', { recursive: true });
}

fs.writeFileSync('.vscode/settings.json', JSON.stringify(vscodeSettings, null, 2));
console.log('✅ Cursor workspace ayarları güncellendi');

// 4. Agent manifest'i güncelle
console.log('\n🔄 Agent manifest güncelleniyor...');
const manifest = {
  "agents": [
    {
      "id": "cto-koçu-v3",
      "name": "CTO Koçu v3",
      "version": "3.0",
      "description": "FinBot v3 için otomatik geliştirme asistanı",
      "status": "active",
      "priority": "high",
      "config_file": "agent-config.md",
      "rules_file": ".cursor/rules/CTO-Koçu-v3.yaml",
      "commands": {
        "sprint": [
          "Sprint hazırla",
          "Sprint 2 hazırla",
          "Monitoring sprint hazırla"
        ],
        "audit": [
          "Audit yap",
          "Güvenlik audit"
        ],
        "optimize": [
          "Optimize et",
          "Performans optimize"
        ],
        "release": [
          "Release oluştur",
          "Release hazırla"
        ]
      },
      "project": {
        "name": "FinBot v3",
        "status": "Production Ready",
        "url": "https://finbot-v3.onrender.com",
        "database": "PostgreSQL with SSL/TLS",
        "deployment": "Render.com"
      },
      "last_updated": new Date().toISOString(),
      "developer": "Tolga Selvi"
    }
  ],
  "active_agent": "cto-koçu-v3",
  "version": "1.0",
  "last_updated": new Date().toISOString()
};

fs.writeFileSync('.cursor/agents.json', JSON.stringify(manifest, null, 2));
console.log('✅ Agent manifest güncellendi');

// 5. Cursor restart script'i oluştur
console.log('\n📝 Cursor restart script oluşturuluyor...');
const restartScript = `@echo off
echo 🔄 Cursor yeniden başlatılıyor...
taskkill /f /im "Cursor.exe" 2>nul
timeout /t 2 /nobreak >nul
start "" "C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\cursor\\Cursor.exe" "%CD%"
echo ✅ Cursor yeniden başlatıldı!
echo 🎯 Chat penceresinde "CTO koçu v3" görmelisin!
pause`;

fs.writeFileSync('restart-cursor.bat', restartScript);
console.log('✅ restart-cursor.bat oluşturuldu');

// 6. Özet
console.log('\n🎉 CTO Koçu v3 Force Reload Tamamlandı!');
console.log('\n📋 Yapılan İşlemler:');
console.log('✅ Cursor cache temizlendi');
console.log('✅ Agent konfigürasyonu yeniden oluşturuldu');
console.log('✅ Cursor workspace ayarları güncellendi');
console.log('✅ Agent manifest güncellendi');
console.log('✅ Cursor restart script oluşturuldu');

console.log('\n🚀 Sonraki Adımlar:');
console.log('1. Cursor\'ı tamamen kapat');
console.log('2. Tekrar aç');
console.log('3. Chat penceresinde "CTO koçu v3" görmelisin');

console.log('\n💡 Alternatif:');
console.log('restart-cursor.bat dosyasını çalıştır');

console.log('\n🎯 CTO Koçu v3 Hazır! 🚀');
