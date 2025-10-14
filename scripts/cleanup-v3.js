#!/usr/bin/env node

/**
 * CTO Koçu v3 - Temizlik Sistemi
 * Bu script geçici dosyaları, cache'leri ve gereksiz dosyaları temizler
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧹 CTO Koçu v3 - Temizlik Sistemi Başlatılıyor...\n');

// Komut satırı argümanlarını al
const args = process.argv.slice(2);
const cleanCache = args.includes('--cache');
const cleanLogs = args.includes('--logs');
const cleanAll = args.includes('--all');

// Temizlik istatistikleri
let cleanedFiles = 0;
let cleanedSize = 0;

// Dosya boyutunu hesapla
function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        return 0;
    }
}

// Dosya silme fonksiyonu
function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const size = getFileSize(filePath);
            fs.unlinkSync(filePath);
            cleanedFiles++;
            cleanedSize += size;
            console.log(`✅ Silindi: ${filePath} (${(size / 1024).toFixed(2)} KB)`);
            return true;
        }
    } catch (error) {
        console.log(`❌ Silinemedi: ${filePath} - ${error.message}`);
    }
    return false;
}

// Klasör silme fonksiyonu
function deleteDirectory(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            const stats = fs.statSync(dirPath);
            if (stats.isDirectory()) {
                fs.rmSync(dirPath, { recursive: true, force: true });
                console.log(`✅ Klasör silindi: ${dirPath}`);
                return true;
            }
        }
    } catch (error) {
        console.log(`❌ Klasör silinemedi: ${dirPath} - ${error.message}`);
    }
    return false;
}

// Cache temizleme
function cleanCacheFiles() {
    console.log('🗂️ Cache dosyaları temizleniyor...');

    const cachePaths = [
        'QuickServeAPI/node_modules/.cache',
        'QuickServeAPI/dist/.cache',
        'QuickServeAPI/.vite',
        'QuickServeAPI/.turbo',
        'node_modules/.cache',
        '.cache',
        'dist/.cache'
    ];

    cachePaths.forEach(cachePath => {
        if (fs.existsSync(cachePath)) {
            if (fs.statSync(cachePath).isDirectory()) {
                deleteDirectory(cachePath);
            } else {
                deleteFile(cachePath);
            }
        }
    });

    // NPM cache temizle
    try {
        console.log('📦 NPM cache temizleniyor...');
        execSync('npm cache clean --force', { stdio: 'inherit' });
        console.log('✅ NPM cache temizlendi');
    } catch (error) {
        console.log('⚠️ NPM cache temizlenemedi:', error.message);
    }
}

// Log dosyalarını temizle
function cleanLogFiles() {
    console.log('📝 Log dosyaları temizleniyor...');

    const logPaths = [
        'QuickServeAPI/server-output.log',
        'QuickServeAPI/logs/combined.log',
        'QuickServeAPI/logs/error.log',
        'QuickServeAPI/archive/old-logs',
        'QuickServeAPI/artifacts/errors',
        'logs',
        '*.log'
    ];

    logPaths.forEach(logPath => {
        if (fs.existsSync(logPath)) {
            if (fs.statSync(logPath).isDirectory()) {
                // Klasör içindeki tüm dosyaları sil
                const files = fs.readdirSync(logPath);
                files.forEach(file => {
                    const filePath = path.join(logPath, file);
                    deleteFile(filePath);
                });

                // Boş klasörü sil
                if (fs.readdirSync(logPath).length === 0) {
                    deleteDirectory(logPath);
                }
            } else {
                deleteFile(logPath);
            }
        }
    });
}

// Geçici dosyaları temizle
function cleanTempFiles() {
    console.log('🗑️ Geçici dosyalar temizleniyor...');

    const tempPatterns = [
        '*.tmp',
        '*.temp',
        '*.swp',
        '*.swo',
        '*~',
        '.DS_Store',
        'Thumbs.db',
        'desktop.ini'
    ];

    // Ana dizindeki geçici dosyalar
    tempPatterns.forEach(pattern => {
        try {
            const files = fs.readdirSync('.').filter(file =>
                file.match(new RegExp(pattern.replace('*', '.*')))
            );
            files.forEach(file => deleteFile(file));
        } catch (error) {
            // Pattern eşleşme hatası, devam et
        }
    });

    // QuickServeAPI dizinindeki geçici dosyalar
    if (fs.existsSync('QuickServeAPI')) {
        tempPatterns.forEach(pattern => {
            try {
                const files = fs.readdirSync('QuickServeAPI').filter(file =>
                    file.match(new RegExp(pattern.replace('*', '.*')))
                );
                files.forEach(file => deleteFile(path.join('QuickServeAPI', file)));
            } catch (error) {
                // Pattern eşleşme hatası, devam et
            }
        });
    }
}

// Build dosyalarını temizle
function cleanBuildFiles() {
    console.log('🔨 Build dosyaları temizleniyor...');

    const buildPaths = [
        'QuickServeAPI/dist',
        'dist',
        'build',
        'out',
        '.next',
        '.nuxt'
    ];

    buildPaths.forEach(buildPath => {
        if (fs.existsSync(buildPath)) {
            deleteDirectory(buildPath);
        }
    });
}

// Test dosyalarını temizle
function cleanTestFiles() {
    console.log('🧪 Test dosyaları temizleniyor...');

    const testPaths = [
        'coverage',
        '.nyc_output',
        'test-results',
        'playwright-report',
        'test-results.xml',
        'junit.xml'
    ];

    testPaths.forEach(testPath => {
        if (fs.existsSync(testPath)) {
            if (fs.statSync(testPath).isDirectory()) {
                deleteDirectory(testPath);
            } else {
                deleteFile(testPath);
            }
        }
    });
}

// Ana temizlik fonksiyonu
function main() {
    console.log('🔧 Temizlik modu:', cleanAll ? 'TÜM' : cleanCache ? 'CACHE' : cleanLogs ? 'LOG' : 'GENEL');
    console.log('=====================================\n');

    try {
        // Genel temizlik (varsayılan)
        if (!cleanCache && !cleanLogs && !cleanAll) {
            cleanTempFiles();
            cleanTestFiles();
        }

        // Cache temizleme
        if (cleanCache || cleanAll) {
            cleanCacheFiles();
        }

        // Log temizleme
        if (cleanLogs || cleanAll) {
            cleanLogFiles();
        }

        // Tüm temizlik
        if (cleanAll) {
            cleanBuildFiles();
            cleanTestFiles();
            cleanTempFiles();
        }

        // Sonuç raporu
        console.log('\n📊 Temizlik Raporu:');
        console.log('==================');
        console.log(`Silinen dosya sayısı: ${cleanedFiles}`);
        console.log(`Temizlenen boyut: ${(cleanedSize / 1024 / 1024).toFixed(2)} MB`);

        if (cleanedFiles > 0) {
            console.log('\n✅ Temizlik başarıyla tamamlandı!');
        } else {
            console.log('\nℹ️ Temizlenecek dosya bulunamadı');
        }

        console.log('\n💡 Kullanım:');
        console.log('- "Temizle" → Genel temizlik');
        console.log('- "Cache temizle" → Cache dosyalarını temizle');
        console.log('- "Log temizle" → Log dosyalarını temizle');
        console.log('- "Gereksiz dosyaları sil" → Tüm temizlik');

    } catch (error) {
        console.error('❌ Temizlik hatası:', error.message);
        process.exit(1);
    }
}

// Script'i çalıştır
main();
