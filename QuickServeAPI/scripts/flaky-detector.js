#!/usr/bin/env node
/**
 * 🔍 Flaky Test Detector
 * Kararsız testleri tespit eder ve raporlar
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
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests(attempt = 1) {
  log(`\n🧪 Running tests (attempt ${attempt}/3)...`, 'cyan');

  try {
    const { stdout } = await execPromise('pnpm test --run', {
      cwd: rootDir,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { output: stdout, success: true };
  } catch (error) {
    return { output: error.stdout || '', success: false };
  }
}

function parseFailedTests(output) {
  const failed = [];
  const regex =
    /FAIL\s+(tests\/[^\s]+\.test\.(?:ts|tsx))[^\n]*\n[^\n]*\n\s+([^\n]+)/g;

  let match;
  while ((match = regex.exec(output)) !== null) {
    failed.push({
      file: match[1],
      reason: match[2].trim(),
    });
  }

  return failed;
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║              🔍 FLAKY TEST DETECTOR                       ║
║         Find • Retry • Report • Stabilize                  ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  const results = [];
  const flakyTests = [];

  // Run tests 3 times
  for (let i = 1; i <= 3; i++) {
    const result = await runTests(i);
    const failed = parseFailedTests(result.output);

    results.push({
      attempt: i,
      failed,
      success: result.success,
    });

    log(
      `   Attempt ${i}: ${failed.length} failed tests`,
      failed.length === 0 ? 'green' : 'yellow'
    );
  }

  // Detect flaky tests
  const allFailedTests = new Set();
  results.forEach(r => r.failed.forEach(f => allFailedTests.add(f.file)));

  for (const testFile of allFailedTests) {
    const failCount = results.filter(r =>
      r.failed.some(f => f.file === testFile)
    ).length;

    // If failed in some but not all attempts, it's flaky
    if (failCount > 0 && failCount < 3) {
      flakyTests.push({
        file: testFile,
        failRate: `${failCount}/3`,
        probability: ((failCount / 3) * 100).toFixed(0) + '%',
      });
    }
  }

  // Generate report
  const reportData = {
    timestamp: new Date().toISOString(),
    totalAttempts: 3,
    flakyTests,
    summary: {
      totalFlaky: flakyTests.length,
      consistentFails: allFailedTests.size - flakyTests.length,
    },
  };

  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportsDir, 'flaky-tests.json'),
    JSON.stringify(reportData, null, 2),
    'utf-8'
  );

  // Display results
  log('\n' + '═'.repeat(60), 'cyan');
  log('📊 FLAKY TEST REPORT', 'bright');
  log('═'.repeat(60), 'cyan');

  if (flakyTests.length > 0) {
    log(`\n⚠️  Found ${flakyTests.length} flaky test(s):`, 'yellow');
    flakyTests.forEach(t => {
      log(
        `   • ${t.file} (fails ${t.failRate}, ${t.probability} probability)`,
        'yellow'
      );
    });
  } else {
    log('\n✅ No flaky tests detected!', 'green');
  }

  const consistentFails = reportData.summary.consistentFails;
  if (consistentFails > 0) {
    log(`\n❌ ${consistentFails} test(s) consistently failing`, 'red');
    process.exit(1);
  }

  if (flakyTests.length > 0) {
    log('\n⚠️  Flaky tests found but continuing (exit 0)', 'yellow');
  }

  log('\n📁 Report: reports/flaky-tests.json', 'cyan');
  process.exit(0);
}

main().catch(error => {
  log('\n❌ ERROR: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
