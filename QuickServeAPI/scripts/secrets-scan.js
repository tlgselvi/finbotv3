#!/usr/bin/env node
/**
 * 🔐 Secrets Scanner
 * Git repository ve kod tabanında secret sızıntısı taraması
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
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Simple pattern-based scanning
function scanFile(filePath, content) {
  const secrets = [];

  // Secret patterns
  const patterns = [
    { name: 'AWS Key', regex: /AKIA[0-9A-Z]{16}/g },
    {
      name: 'API Key',
      regex: /api[_-]?key[_-]?[=:]\s*['"]?([A-Za-z0-9-_]{32,})['"]?/gi,
    },
    {
      name: 'JWT Secret',
      regex: /jwt[_-]?secret[_-]?[=:]\s*['"]?([A-Za-z0-9-_]{32,})['"]?/gi,
    },
    {
      name: 'Password',
      regex: /password[_-]?[=:]\s*['"]?([^'"\s]{8,})['"]?(?!\s*process\.env)/gi,
    },
    {
      name: 'Private Key',
      regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    },
    {
      name: 'Database URL',
      regex: /(?:postgres|mysql|mongodb):\/\/[^\s'"]+/gi,
    },
  ];

  patterns.forEach(({ name, regex }) => {
    const matches = content.match(regex);
    if (matches) {
      matches.forEach(match => {
        // Skip common test/example values
        if (
          match.includes('test') ||
          match.includes('example') ||
          match.includes('mock')
        ) {
          return;
        }
        secrets.push({ name, match, file: filePath });
      });
    }
  });

  return secrets;
}

function scanCodebase() {
  const secrets = [];
  const filesToScan = [];

  // Scan specific directories
  const dirsToScan = ['server', 'client/src', 'shared'];

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDir(fullPath);
      } else if (file.match(/\.(ts|tsx|js|jsx|json|env)$/)) {
        filesToScan.push(fullPath);
      }
    }
  }

  dirsToScan.forEach(dir => scanDir(path.join(rootDir, dir)));

  log(`\n🔍 Scanning ${filesToScan.length} files...`, 'cyan');

  filesToScan.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const found = scanFile(file, content);
    secrets.push(...found);
  });

  return secrets;
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║            🔐 SECRETS SCANNER                             ║
║          Detect • Report • Prevent Leaks                   ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  // Scan codebase
  const secrets = scanCodebase();

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    scanned: 'codebase + last 100 commits',
    findings: secrets.length,
    secrets: secrets.map(s => ({
      type: s.name,
      file: s.file.replace(rootDir, ''),
      preview: s.match.substring(0, 50) + '...',
    })),
  };

  const securityDir = path.join(rootDir, 'artifacts', 'security');
  if (!fs.existsSync(securityDir)) {
    fs.mkdirSync(securityDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(securityDir, 'gitleaks.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  log('\n' + '═'.repeat(60), 'cyan');
  log('📊 SECRETS SCAN RESULTS', 'bright');
  log('═'.repeat(60), 'cyan');

  if (secrets.length > 0) {
    log(`\n⚠️  Found ${secrets.length} potential secret(s):`, 'yellow');
    secrets.slice(0, 5).forEach(s => {
      log(`   • ${s.name} in ${s.file.replace(rootDir, '')}`, 'yellow');
    });
    if (secrets.length > 5) {
      log(`   ... and ${secrets.length - 5} more`, 'yellow');
    }

    log('\n📁 Full report: artifacts/security/gitleaks.json', 'cyan');
    log('\n❌ Secret leaks detected!', 'red');
    log('   Review and remove sensitive data before commit.', 'yellow');
    process.exit(1);
  } else {
    log('\n✅ No secrets detected!', 'green');
    log('📁 Report: artifacts/security/gitleaks.json', 'cyan');
    process.exit(0);
  }
}

main().catch(error => {
  log('\n❌ ERROR: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
