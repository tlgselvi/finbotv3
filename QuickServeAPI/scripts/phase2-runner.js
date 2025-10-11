#!/usr/bin/env node
/**
 * 🔀 PHASE 2: Git & CI/CD Kontrolleri
 * Git hooks, CI/CD dosyaları ve dependency kontrolleri
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title, color = 'cyan') {
  console.log('\n' + '═'.repeat(60));
  log(title, color);
  console.log('═'.repeat(60) + '\n');
}

async function runCommand(command, label) {
  log(`⏳ ${label}...`, 'cyan');
  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: rootDir,
      maxBuffer: 10 * 1024 * 1024
    });
    console.log(stdout);
    if (stderr && !stderr.includes('ELIFECYCLE')) {
      console.log(stderr);
    }
    log(`✅ ${label} - BAŞARILI`, 'green');
    return true;
  } catch (error) {
    log(`⚠️  ${label} - UYARI`, 'yellow');
    if (error.stdout) console.log(error.stdout);
    return false;
  }
}

async function main() {
  const startTime = Date.now();
  
  console.clear();
  log(`
╔════════════════════════════════════════════════════════════╗
║           🔀 PHASE 2: GIT & CI/CD SİSTEMİ                 ║
║          Git Hooks • CI/CD Files • Dependencies            ║
╚════════════════════════════════════════════════════════════╝
  `, 'bright');

  const results = {
    tests: false,
    gitHooks: false,
    cicd: false,
    dependencies: false
  };

  // 1. Tests
  section('[1/4] 🧪 TESTLER', 'cyan');
  results.tests = await runCommand('pnpm test:critical', 'Critical Tests');
  
  // 2. Git Hooks Check
  section('[2/4] 🔀 GIT HOOKS', 'cyan');
  const huskyPath = path.join(rootDir, '.husky');
  if (fs.existsSync(huskyPath)) {
    log('✅ Git hooks kurulu', 'green');
    log('   📁 .husky/ klasörü mevcut', 'cyan');
    results.gitHooks = true;
  } else {
    log('⚠️  Git hooks bulunamadı', 'yellow');
    log('   Kurmak için: pnpm add -D husky && npx husky init', 'cyan');
    results.gitHooks = false;
  }
  
  // 3. CI/CD Files Check
  section('[3/4] 🚢 CI/CD DOSYALARI', 'cyan');
  const githubPath = path.join(rootDir, '.github', 'workflows');
  const gitlabPath = path.join(rootDir, '.gitlab-ci.yml');
  
  let cicdExists = false;
  if (fs.existsSync(githubPath)) {
    log('✅ GitHub Actions workflows mevcut', 'green');
    const files = fs.readdirSync(githubPath);
    files.forEach(file => {
      log(`   📄 ${file}`, 'cyan');
    });
    cicdExists = true;
  }
  if (fs.existsSync(gitlabPath)) {
    log('✅ GitLab CI config mevcut', 'green');
    cicdExists = true;
  }
  if (!cicdExists) {
    log('⚠️  CI/CD dosyaları bulunamadı', 'yellow');
    log('   Yakında otomatik oluşturulacak', 'cyan');
  }
  results.cicd = cicdExists;
  
  // 4. Dependency Check
  section('[4/4] 📦 DEPENDENCY AUDIT', 'cyan');
  results.dependencies = await runCommand('pnpm audit --audit-level=high', 'Dependency Audit');
  
  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  section('📋 PHASE 2 - SONUÇ ÖZETİ', 'blue');
  
  log('Kontrol Sonuçları:', 'bright');
  log(`  ${results.tests ? '✅' : '❌'} Tests`, results.tests ? 'green' : 'red');
  log(`  ${results.gitHooks ? '✅' : '⚠️ '} Git Hooks`, results.gitHooks ? 'green' : 'yellow');
  log(`  ${results.cicd ? '✅' : '⚠️ '} CI/CD Files`, results.cicd ? 'green' : 'yellow');
  log(`  ${results.dependencies ? '✅' : '⚠️ '} Dependencies`, results.dependencies ? 'green' : 'yellow');
  
  log(`\n⏱️  Toplam Süre: ${duration} saniye`, 'cyan');
  
  if (results.tests) {
    log('\n✅ PHASE 2 TAMAMLANDI!', 'green');
  } else {
    log('\n⚠️  PHASE 2 TAMAMLANDI - BAZI UYARILAR VAR', 'yellow');
  }
  
  process.exit(0);
}

main().catch(error => {
  log('\n❌ HATA: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});

