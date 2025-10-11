#!/usr/bin/env node
/**
 * 💾 Config Backup
 * Konfig dosyalarını yedekle ve eskilerini temizle
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  let count = 0;
  const files = fs.readdirSync(src);

  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }

  return count;
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║              💾 CONFIG BACKUP SYSTEM                      ║
║          Backup • Archive • Cleanup • Restore              ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  // Create timestamp directory
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');

  const backupDir = path.join(rootDir, 'backups', timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  log('\n💾 Backing up configuration files...', 'cyan');
  log(`   Target: backups/${timestamp}/\n`, 'cyan');

  let totalFiles = 0;

  // Backup files
  const filesToBackup = [
    'package.json',
    'pnpm-lock.yaml',
    'tsconfig.json',
    'vitest.config.ts',
    'eslint.config.js',
    '.env.example',
  ];

  for (const file of filesToBackup) {
    const copied = copyFile(
      path.join(rootDir, file),
      path.join(backupDir, file)
    );
    if (copied) {
      log(`  ✅ ${file}`, 'green');
      totalFiles++;
    }
  }

  // Backup .env files (if exist)
  const envFiles = fs
    .readdirSync(rootDir)
    .filter(f => f.startsWith('.env') && f !== '.env.example');

  for (const file of envFiles) {
    copyFile(path.join(rootDir, file), path.join(backupDir, file));
    log(`  ✅ ${file}`, 'green');
    totalFiles++;
  }

  // Backup config directory
  const configDir = path.join(rootDir, 'config');
  if (fs.existsSync(configDir)) {
    const configBackupDir = path.join(backupDir, 'config');
    const count = copyDir(configDir, configBackupDir);
    log(`  ✅ config/ (${count} files)`, 'green');
    totalFiles += count;
  }

  log(`\n✅ Backed up ${totalFiles} files`, 'green');

  // Cleanup old backups (>7 days)
  log('\n🧹 Cleaning old backups (>7 days)...', 'cyan');

  const backupsRoot = path.join(rootDir, 'backups');
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  let deletedCount = 0;

  if (fs.existsSync(backupsRoot)) {
    const backups = fs.readdirSync(backupsRoot);

    for (const backup of backups) {
      const backupPath = path.join(backupsRoot, backup);
      const stat = fs.statSync(backupPath);

      if (stat.isDirectory() && stat.mtimeMs < sevenDaysAgo) {
        fs.rmSync(backupPath, { recursive: true, force: true });
        log(`  🗑️  Deleted: ${backup}`, 'yellow');
        deletedCount++;
      }
    }
  }

  if (deletedCount > 0) {
    log(`\n✅ Deleted ${deletedCount} old backup(s)`, 'green');
  } else {
    log('\n✅ No old backups to delete', 'green');
  }

  log(`\n📁 Backup location: backups/${timestamp}/`, 'cyan');
  log('⏱️  Backup completed!', 'green');

  process.exit(0);
}

main().catch(error => {
  log('\n❌ ERROR: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
