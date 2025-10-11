#!/usr/bin/env node
/**
 * 🚀 Deploy Check - Deploy Öncesi Hızlı Kontrol
 * Critical + Coverage + Quick Checks
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runCommand(command) {
  try {
    const { stdout } = await execPromise(command, {
      maxBuffer: 10 * 1024 * 1024,
    });
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║              🚀 DEPLOY HAZIRLIK KONTROLÜ                  ║
║                  Hızlı • Güvenilir • Etkili                ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  const checks = [];

  // 1. Critical Tests
  log('\n[1/3] 🧪 Critical Tests...', 'cyan');
  const tests = await runCommand('pnpm test:critical');
  checks.push({
    name: 'Critical Tests',
    success: tests.success,
    required: true,
  });

  if (tests.success) {
    log('✅ Tüm critical testler geçti!', 'green');
  } else {
    log('❌ Critical testler başarısız!', 'red');
  }

  // 2. Lint Check
  log('\n[2/3] 📝 Lint Check...', 'cyan');
  const lint = await runCommand('pnpm lint');
  checks.push({ name: 'Lint', success: lint.success, required: false });

  if (lint.success) {
    log('✅ Kod style temiz!', 'green');
  } else {
    log('⚠️  Lint uyarıları var', 'yellow');
  }

  // 3. Type Check
  log('\n[3/3] 🔍 Type Check...', 'cyan');
  const types = await runCommand('pnpm type-check');
  checks.push({ name: 'Type Check', success: types.success, required: false });

  if (types.success) {
    log('✅ Type definitions tamam!', 'green');
  } else {
    log('⚠️  Type hataları var', 'yellow');
  }

  // Summary
  log('\n' + '═'.repeat(60), 'cyan');
  log('📊 DEPLOY HAZIRLIK RAPORU', 'bright');
  log('═'.repeat(60), 'cyan');

  checks.forEach(check => {
    const icon = check.success ? '✅' : check.required ? '❌' : '⚠️ ';
    const color = check.success ? 'green' : check.required ? 'red' : 'yellow';
    const req = check.required ? '(ZORUNLU)' : '(Opsiyonel)';
    log(`\n  ${icon} ${check.name} ${req}`, color);
  });

  const requiredFailed = checks.filter(c => c.required && !c.success).length;
  const optionalFailed = checks.filter(c => !c.required && !c.success).length;

  log('\n' + '═'.repeat(60), 'cyan');

  if (requiredFailed === 0) {
    if (optionalFailed === 0) {
      log('\n🎉 MÜK EMMEL! DEPLOY İÇİN TAMAMEN HAZIR!', 'green');
      log('   Tüm kontroller başarılı ✅', 'green');
    } else {
      log('\n✅ DEPLOY EDİLEBİLİR!', 'green');
      log(`   ${optionalFailed} opsiyonel uyarı var (sorun değil)`, 'yellow');
    }
    process.exit(0);
  } else {
    log('\n❌ DEPLOY YAPMA!', 'red');
    log(`   ${requiredFailed} zorunlu kontrol başarısız!`, 'red');
    log('   Önce sorunları düzelt.', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log('\n❌ HATA: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
