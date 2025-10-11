#!/usr/bin/env node
/**
 * 🔧 Auto-Fix Script
 * Otomatik kod düzeltmeleri: Prettier + ESLint + Audit
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
  red: '\x1b[31m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runStep(command, label) {
  const startTime = Date.now();
  log(`\n⏳ ${label}...`, 'cyan');

  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: rootDir,
      maxBuffer: 10 * 1024 * 1024,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('ELIFECYCLE')) console.log(stderr);

    log(`✅ ${label} - Tamamlandı (${duration}s)`, 'green');
    return { success: true, duration, output: stdout };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`❌ ${label} - Başarısız (${duration}s)`, 'red');
    if (error.stdout) console.log(error.stdout);
    return { success: false, duration, error: error.message };
  }
}

async function main() {
  const startTime = Date.now();

  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║              🔧 AUTO-FIX SYSTEM                           ║
║         Prettier • ESLint • Audit • Optimize              ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  const results = [];

  // 1. Prettier
  log('\n' + '═'.repeat(60), 'cyan');
  log('[1/3] PRETTIER - Code Formatting', 'bright');
  log('═'.repeat(60), 'cyan');
  const prettier = await runStep(
    'npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}" --ignore-path .gitignore',
    'Prettier Format'
  );
  results.push({ step: 'Prettier', ...prettier });

  // 2. ESLint
  log('\n' + '═'.repeat(60), 'cyan');
  log('[2/3] ESLINT - Code Quality', 'bright');
  log('═'.repeat(60), 'cyan');
  const eslint = await runStep(
    'npx eslint . --ext .ts,.tsx,.js,.jsx --fix --max-warnings 50',
    'ESLint Fix'
  );
  results.push({ step: 'ESLint', ...eslint });

  // 3. Audit Fix
  log('\n' + '═'.repeat(60), 'cyan');
  log('[3/3] AUDIT - Security Fixes', 'bright');
  log('═'.repeat(60), 'cyan');
  const audit = await runStep('pnpm audit fix', 'Audit Fix');
  results.push({ step: 'Audit', ...audit });

  // Generate Report
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const timestamp = new Date().toISOString();

  const reportContent = `
# AUTO-FIX REPORT
Generated: ${timestamp}
Duration: ${totalDuration}s

## Results:

${results
  .map(
    r => `
### ${r.step}
Status: ${r.success ? '✅ Success' : '❌ Failed'}
Duration: ${r.duration}s
${r.error ? `Error: ${r.error}` : ''}
`
  )
  .join('\n')}

## Summary:
- Total Steps: ${results.length}
- Successful: ${results.filter(r => r.success).length}
- Failed: ${results.filter(r => !r.success).length}
- Total Duration: ${totalDuration}s
`;

  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportsDir, 'fix-report.txt'),
    reportContent,
    'utf-8'
  );

  // Summary
  log('\n' + '═'.repeat(60), 'cyan');
  log('📊 AUTO-FIX SUMMARY', 'bright');
  log('═'.repeat(60), 'cyan');

  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    const color = r.success ? 'green' : 'red';
    log(`  ${icon} ${r.step} (${r.duration}s)`, color);
  });

  log(`\n⏱️  Total Duration: ${totalDuration}s`, 'cyan');
  log(`📁 Report: reports/fix-report.txt`, 'cyan');

  const allSuccess = results.every(r => r.success);

  if (allSuccess) {
    log('\n✅ All fixes applied successfully!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some fixes failed. Check the report.', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log('\n❌ FATAL ERROR: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
