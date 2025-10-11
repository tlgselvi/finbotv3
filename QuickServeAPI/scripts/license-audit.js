#!/usr/bin/env node
/**
 * ⚖️ License Audit
 * Dependency lisanslarını kontrol et ve riske açık olanları tespit et
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
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// License risk levels
const licenseRisk = {
  high: ['GPL-3.0', 'AGPL-3.0', 'SSPL', 'Commons Clause'],
  medium: ['GPL-2.0', 'LGPL-3.0', 'MPL-2.0'],
  low: ['Apache-2.0', 'MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause'],
  safe: ['CC0-1.0', 'Unlicense', 'Public Domain'],
};

function analyzeLicense(license) {
  if (!license) return { risk: 'unknown', level: 'medium' };

  for (const [level, licenses] of Object.entries(licenseRisk)) {
    if (licenses.some(l => license.includes(l))) {
      return { risk: level, license };
    }
  }

  return { risk: 'unknown', license };
}

function scanPackages() {
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const packages = [];

  // Read from node_modules
  for (const [name, version] of Object.entries(allDeps)) {
    try {
      const modulePkg = path.join(
        rootDir,
        'node_modules',
        name,
        'package.json'
      );
      if (fs.existsSync(modulePkg)) {
        const data = JSON.parse(fs.readFileSync(modulePkg, 'utf-8'));
        const analysis = analyzeLicense(data.license);

        packages.push({
          name,
          version: data.version,
          license: data.license || 'UNKNOWN',
          risk: analysis.risk,
        });
      }
    } catch {
      packages.push({
        name,
        version: version.replace(/^[\^~]/, ''),
        license: 'UNKNOWN',
        risk: 'unknown',
      });
    }
  }

  return packages;
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║              ⚖️ LICENSE AUDIT SYSTEM                      ║
║          Scan • Analyze • Risk Assessment                  ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  log('\n⚖️  Auditing licenses...', 'cyan');

  const packages = scanPackages();

  const riskGroups = {
    high: packages.filter(p => p.risk === 'high'),
    medium: packages.filter(p => p.risk === 'medium'),
    low: packages.filter(p => p.risk === 'low'),
    safe: packages.filter(p => p.risk === 'safe'),
    unknown: packages.filter(p => p.risk === 'unknown'),
  };

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalPackages: packages.length,
    riskSummary: {
      high: riskGroups.high.length,
      medium: riskGroups.medium.length,
      low: riskGroups.low.length,
      safe: riskGroups.safe.length,
      unknown: riskGroups.unknown.length,
    },
    packages,
    highRiskPackages: riskGroups.high,
  };

  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportsDir, 'license-audit.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  // Display results
  log('\n' + '═'.repeat(60), 'cyan');
  log('⚖️  LICENSE AUDIT RESULTS', 'bright');
  log('═'.repeat(60), 'cyan');

  log(`\n📦 Total Packages: ${packages.length}`, 'cyan');
  log(
    `   🔴 High Risk: ${riskGroups.high.length}`,
    riskGroups.high.length > 0 ? 'red' : 'green'
  );
  log(
    `   🟡 Medium Risk: ${riskGroups.medium.length}`,
    riskGroups.medium.length > 0 ? 'yellow' : 'green'
  );
  log(`   🟢 Low Risk: ${riskGroups.low.length}`, 'green');
  log(`   ✅ Safe: ${riskGroups.safe.length}`, 'green');
  log(
    `   ❓ Unknown: ${riskGroups.unknown.length}`,
    riskGroups.unknown.length > 0 ? 'yellow' : 'green'
  );

  if (riskGroups.high.length > 0) {
    log('\n🔴 HIGH RISK PACKAGES:', 'red');
    riskGroups.high.forEach(p => {
      log(`   • ${p.name}@${p.version} (${p.license})`, 'red');
    });
  }

  log('\n📁 Report: reports/license-audit.json', 'cyan');

  if (riskGroups.high.length > 0) {
    log('\n❌ High-risk licenses detected!', 'red');
    process.exit(1);
  } else {
    log('\n✅ No high-risk licenses!', 'green');
    process.exit(0);
  }
}

main().catch(error => {
  log('\n❌ ERROR: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
