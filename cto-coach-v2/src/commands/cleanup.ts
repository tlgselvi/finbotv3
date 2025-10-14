import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function cleanupProject(options: any) {
    console.log(chalk.blue('🧹 CTO Koçu v3 - Temizlik Sistemi'));
    console.log(chalk.gray('================================\n'));

    const projectName = options.project || 'FinBot';
    const cleanCache = options.cache || false;
    const cleanLogs = options.logs || false;
    const cleanAll = options.all || false;

    // Temizlik istatistikleri
    let cleanedFiles = 0;
    let cleanedSize = 0;

    // Dosya boyutunu hesapla
    function getFileSize(filePath: string): number {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    // Dosya silme fonksiyonu
    function deleteFile(filePath: string): boolean {
        try {
            if (fs.existsSync(filePath)) {
                const size = getFileSize(filePath);
                fs.unlinkSync(filePath);
                cleanedFiles++;
                cleanedSize += size;
                console.log(chalk.green(`✅ Silindi: ${filePath} (${(size / 1024).toFixed(2)} KB)`));
                return true;
            }
        } catch (error) {
            console.log(chalk.red(`❌ Silinemedi: ${filePath} - ${error}`));
        }
        return false;
    }

    // Klasör silme fonksiyonu
    function deleteDirectory(dirPath: string): boolean {
        try {
            if (fs.existsSync(dirPath)) {
                const stats = fs.statSync(dirPath);
                if (stats.isDirectory()) {
                    fs.rmSync(dirPath, { recursive: true, force: true });
                    console.log(chalk.green(`✅ Klasör silindi: ${dirPath}`));
                    return true;
                }
            }
        } catch (error) {
            console.log(chalk.red(`❌ Klasör silinemedi: ${dirPath} - ${error}`));
        }
        return false;
    }

    // Cache temizleme
    function cleanCacheFiles() {
        console.log(chalk.yellow('🗂️ Cache dosyaları temizleniyor...'));

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
            console.log(chalk.yellow('📦 NPM cache temizleniyor...'));
            execSync('npm cache clean --force', { stdio: 'inherit' });
            console.log(chalk.green('✅ NPM cache temizlendi'));
        } catch (error) {
            console.log(chalk.yellow('⚠️ NPM cache temizlenemedi'));
        }
    }

    // Log dosyalarını temizle
    function cleanLogFiles() {
        console.log(chalk.yellow('📝 Log dosyaları temizleniyor...'));

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
        console.log(chalk.yellow('🗑️ Geçici dosyalar temizleniyor...'));

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
        console.log(chalk.yellow('🔨 Build dosyaları temizleniyor...'));

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
        console.log(chalk.yellow('🧪 Test dosyaları temizleniyor...'));

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
    try {
        console.log(chalk.blue(`🔧 Temizlik modu: ${cleanAll ? 'TÜM' : cleanCache ? 'CACHE' : cleanLogs ? 'LOG' : 'GENEL'}`));
        console.log(chalk.gray('=====================================\n'));

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
        console.log(chalk.blue('\n📊 Temizlik Raporu:'));
        console.log(chalk.gray('=================='));
        console.log(chalk.green(`Silinen dosya sayısı: ${cleanedFiles}`));
        console.log(chalk.green(`Temizlenen boyut: ${(cleanedSize / 1024 / 1024).toFixed(2)} MB`));

        if (cleanedFiles > 0) {
            console.log(chalk.green('\n✅ Temizlik başarıyla tamamlandı!'));
        } else {
            console.log(chalk.yellow('\nℹ️ Temizlenecek dosya bulunamadı'));
        }

        console.log(chalk.blue('\n💡 Kullanım:'));
        console.log(chalk.gray('- "Temizle" → Genel temizlik'));
        console.log(chalk.gray('- "Cache temizle" → Cache dosyalarını temizle'));
        console.log(chalk.gray('- "Log temizle" → Log dosyalarını temizle'));
        console.log(chalk.gray('- "Gereksiz dosyaları sil" → Tüm temizlik'));

    } catch (error) {
        console.error(chalk.red('❌ Temizlik hatası:'), error);
        process.exit(1);
    }
}
