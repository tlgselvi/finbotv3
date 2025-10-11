#!/usr/bin/env node
/**
 * 🏥 Health Check
 * Deploy sonrası endpoint sağlık taraması
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
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load environment variables
function loadEnvVars() {
  const envFiles = ['.env', '.env.production'];
  const vars = {};

  for (const file of envFiles) {
    const envPath = path.join(rootDir, file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^(URL_[^=]+)=(.+)$/);
        if (match) {
          vars[match[1]] = match[2].trim();
        }
      });
    }
  }

  return vars;
}

async function checkEndpoint(name, url) {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'FinBot-HealthCheck/1.0' },
    });

    const responseTime = Date.now() - startTime;
    const status = response.status;
    const ok = response.ok;

    return {
      name,
      url,
      status,
      ok,
      responseTime,
      success: ok,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      name,
      url,
      status: 0,
      ok: false,
      responseTime,
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║              🏥 HEALTH CHECK SYSTEM                       ║
║            Endpoint Monitoring & Validation                ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  // Load URLs from .env
  const envVars = loadEnvVars();
  const urls = Object.entries(envVars).filter(([key]) =>
    key.startsWith('URL_')
  );

  if (urls.length === 0) {
    log('\n⚠️  No URL_* variables found in .env files', 'yellow');
    log('   Add URLs like: URL_API=http://localhost:5000', 'cyan');
    process.exit(1);
  }

  log('\n🔍 Checking endpoints...', 'cyan');
  log(`   Found ${urls.length} endpoint(s)\n`, 'cyan');

  const results = [];

  for (const [name, url] of urls) {
    const result = await checkEndpoint(name, url);
    results.push(result);

    const icon = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(
      `  ${icon} ${name}: ${result.status} (${result.responseTime}ms)`,
      color
    );
    if (result.error) {
      log(`     Error: ${result.error}`, 'red');
    }
  }

  // Generate report
  const reportContent = `
HEALTH CHECK REPORT
Generated: ${new Date().toISOString()}

┌────────────────────────────────────────────────────────────┐
│ ENDPOINT                  STATUS   TIME      RESULT         │
├────────────────────────────────────────────────────────────┤
${results
  .map(r => {
    const name = r.name.padEnd(25);
    const status = String(r.status).padEnd(8);
    const time = `${r.responseTime}ms`.padEnd(9);
    const result = r.success ? '✅ OK' : '❌ FAIL';
    return `│ ${name} ${status} ${time} ${result.padEnd(15)}│`;
  })
  .join('\n')}
└────────────────────────────────────────────────────────────┘

Summary:
- Total Endpoints: ${results.length}
- Healthy: ${results.filter(r => r.success).length}
- Failed: ${results.filter(r => !r.success).length}
- Avg Response Time: ${(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length).toFixed(0)}ms
`;

  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportsDir, 'health-report.txt'),
    reportContent,
    'utf-8'
  );

  log('\n📁 Report saved: reports/health-report.txt', 'cyan');

  const hasFailed = results.some(r => !r.success);

  if (hasFailed) {
    log('\n❌ Some endpoints are unhealthy!', 'red');
    process.exit(1);
  } else {
    log('\n✅ All endpoints healthy!', 'green');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('\n❌ ERROR:', error.message);
  process.exit(1);
});
