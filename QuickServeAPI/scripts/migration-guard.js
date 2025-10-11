#!/usr/bin/env node
/**
 * 🛡️ Migration Guard
 * DB migration güvenlik kontrolü - Destructive değişiklikleri tespit et
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

function analyzemigration(sqlContent, fileName) {
  const destructive = [];
  const warnings = [];

  // Destructive patterns
  const destructivePatterns = [
    { pattern: /DROP\s+TABLE/gi, type: 'DROP_TABLE', severity: 'critical' },
    { pattern: /DROP\s+COLUMN/gi, type: 'DROP_COLUMN', severity: 'critical' },
    {
      pattern: /ALTER\s+COLUMN[^;]*DROP/gi,
      type: 'DROP_DEFAULT',
      severity: 'high',
    },
    { pattern: /TRUNCATE/gi, type: 'TRUNCATE', severity: 'critical' },
    { pattern: /DELETE\s+FROM/gi, type: 'DELETE_DATA', severity: 'high' },
  ];

  // Warning patterns
  const warningPatterns = [
    {
      pattern: /ALTER\s+TABLE[^;]*ADD\s+COLUMN[^;]*NOT\s+NULL/gi,
      type: 'ADD_NOT_NULL',
      severity: 'medium',
    },
    {
      pattern: /CREATE\s+UNIQUE\s+INDEX/gi,
      type: 'UNIQUE_INDEX',
      severity: 'low',
    },
    {
      pattern: /ALTER\s+TABLE[^;]*ALTER\s+COLUMN[^;]*TYPE/gi,
      type: 'CHANGE_TYPE',
      severity: 'medium',
    },
  ];

  destructivePatterns.forEach(({ pattern, type, severity }) => {
    const matches = sqlContent.match(pattern);
    if (matches) {
      destructive.push({
        file: fileName,
        type,
        severity,
        count: matches.length,
        examples: matches.slice(0, 2),
      });
    }
  });

  warningPatterns.forEach(({ pattern, type, severity }) => {
    const matches = sqlContent.match(pattern);
    if (matches) {
      warnings.push({
        file: fileName,
        type,
        severity,
        count: matches.length,
      });
    }
  });

  return { destructive, warnings };
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║            🛡️ MIGRATION GUARD SYSTEM                      ║
║        Analyze • Detect • Prevent • Protect                ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  const migrationsDir = path.join(rootDir, 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    log('\n✅ No migrations directory found', 'green');
    process.exit(0);
  }

  log('\n🔍 Scanning migrations...', 'cyan');

  const sqlFiles = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  log(`   Found ${sqlFiles.length} migration file(s)\n`, 'cyan');

  const allDestructive = [];
  const allWarnings = [];

  for (const file of sqlFiles) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const analysis = analyzeMigration(content, file);

    if (analysis.destructive.length > 0) {
      allDestructive.push(...analysis.destructive);
      log(
        `  ⚠️  ${file}: ${analysis.destructive.length} destructive operation(s)`,
        'red'
      );
    } else if (analysis.warnings.length > 0) {
      allWarnings.push(...analysis.warnings);
      log(`  ⚠️  ${file}: ${analysis.warnings.length} warning(s)`, 'yellow');
    } else {
      log(`  ✅ ${file}: Safe`, 'green');
    }
  }

  // Generate report
  const timestamp = new Date().toISOString();
  const reportContent = `
MIGRATION GUARD REPORT
Generated: ${timestamp}

Total Migrations Scanned: ${sqlFiles.length}
Destructive Operations: ${allDestructive.length}
Warnings: ${allWarnings.length}

${
  allDestructive.length > 0
    ? `
DESTRUCTIVE OPERATIONS (CRITICAL):
${allDestructive
  .map(
    d => `
  File: ${d.file}
  Type: ${d.type}
  Severity: ${d.severity}
  Count: ${d.count}
  Examples: ${d.examples ? d.examples.join(', ') : 'N/A'}
`
  )
  .join('\n')}
`
    : ''
}

${
  allWarnings.length > 0
    ? `
WARNINGS:
${allWarnings
  .map(
    w => `
  File: ${w.file}
  Type: ${w.type}
  Severity: ${w.severity}
  Count: ${w.count}
`
  )
  .join('\n')}
`
    : ''
}

${allDestructive.length === 0 && allWarnings.length === 0 ? 'All migrations are safe! ✅' : ''}
`;

  const artifactsDir = path.join(rootDir, 'artifacts', 'migrations');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const reportFile = path.join(artifactsDir, `${timestamp.split('T')[0]}.log`);
  fs.writeFileSync(reportFile, reportContent, 'utf-8');

  log(`\n📁 Report: ${reportFile}`, 'cyan');

  if (allDestructive.length > 0) {
    log('\n❌ DESTRUCTIVE MIGRATIONS DETECTED!', 'red');
    log('   Review carefully before applying.', 'yellow');
    process.exit(1);
  } else if (allWarnings.length > 0) {
    log('\n⚠️  Warnings found, but migrations are safe to apply', 'yellow');
    process.exit(0);
  } else {
    log('\n✅ All migrations are safe!', 'green');
    process.exit(0);
  }
}

main().catch(error => {
  log('\n❌ ERROR: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
