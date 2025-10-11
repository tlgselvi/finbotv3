#!/usr/bin/env node
/**
 * 🔒 SAST Scanner (Semgrep)
 * Static Application Security Testing - OWASP Top 10
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

// Create basic semgrep config
function createSemgrepConfig() {
  const configPath = path.join(rootDir, '.semgrep.yaml');

  if (fs.existsSync(configPath)) {
    return configPath;
  }

  const config = `rules:
  - id: sql-injection
    patterns:
      - pattern: db.query($X + $Y)
      - pattern: execute($X + $Y)
    message: Possible SQL injection
    severity: ERROR
    languages: [javascript, typescript]
    
  - id: hardcoded-secret
    patterns:
      - pattern: |
          const $VAR = "..."
      - metavariable-regex:
          metavariable: $VAR
          regex: (password|secret|key|token)
    message: Hardcoded secret detected
    severity: WARNING
    languages: [javascript, typescript]
    
  - id: eval-usage
    pattern: eval($X)
    message: Dangerous eval() usage
    severity: ERROR
    languages: [javascript, typescript]
    
  - id: unsafe-redirect
    patterns:
      - pattern: res.redirect($INPUT)
    message: Unvalidated redirect
    severity: WARNING
    languages: [javascript, typescript]
`;

  fs.writeFileSync(configPath, config, 'utf-8');
  return configPath;
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║              🔒 SAST SCANNER (SEMGREP)                    ║
║              OWASP Top 10 Security Analysis                ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  // Create config
  const configPath = createSemgrepConfig();
  log('\n📝 Semgrep config ready', 'cyan');

  // Check if semgrep is available
  let useSemgrep = false;
  try {
    await execPromise('semgrep --version');
    useSemgrep = true;
  } catch {
    log('⚠️  Semgrep not installed, using basic pattern scan', 'yellow');
  }

  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  if (useSemgrep) {
    log('\n🔍 Running Semgrep scan...', 'cyan');

    try {
      const { stdout } = await execPromise(
        `semgrep --config ${configPath} --json --output ${path.join(reportsDir, 'semgrep.sarif')} server/ client/src/ shared/`,
        { cwd: rootDir }
      );

      log('✅ Semgrep scan completed', 'green');

      // Parse results
      const resultsPath = path.join(reportsDir, 'semgrep.sarif');
      if (fs.existsSync(resultsPath)) {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
        const highSeverity = (results.results || []).filter(
          r => r.extra?.severity === 'ERROR'
        );

        if (highSeverity.length > 0) {
          log(
            `\n❌ Found ${highSeverity.length} high-severity issue(s)`,
            'red'
          );
          process.exit(1);
        } else {
          log('\n✅ No high-severity issues', 'green');
          process.exit(0);
        }
      }
    } catch (error) {
      log('⚠️  Semgrep scan failed', 'yellow');
    }
  }

  // Fallback: Basic scan
  log('\n🔍 Running basic security scan...', 'cyan');

  const findings = [];
  const dangerousPatterns = [
    { pattern: /eval\(/g, name: 'eval() usage', severity: 'high' },
    {
      pattern: /innerHTML\s*=/g,
      name: 'innerHTML assignment',
      severity: 'medium',
    },
    {
      pattern: /dangerouslySetInnerHTML/g,
      name: 'dangerouslySetInnerHTML',
      severity: 'medium',
    },
  ];

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDir(fullPath);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        const content = fs.readFileSync(fullPath, 'utf-8');

        dangerousPatterns.forEach(({ pattern, name, severity }) => {
          const matches = content.match(pattern);
          if (matches) {
            findings.push({
              file: fullPath.replace(rootDir, ''),
              issue: name,
              severity,
              count: matches.length,
            });
          }
        });
      }
    }
  }

  scanDir(path.join(rootDir, 'server'));
  scanDir(path.join(rootDir, 'client', 'src'));

  const report = {
    timestamp: new Date().toISOString(),
    scanner: 'basic-pattern',
    findings,
  };

  fs.writeFileSync(
    path.join(reportsDir, 'semgrep.sarif'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  const highSeverity = findings.filter(f => f.severity === 'high');

  if (highSeverity.length > 0) {
    log(`\n⚠️  Found ${highSeverity.length} high-severity issue(s)`, 'yellow');
    highSeverity.forEach(f => {
      log(`   • ${f.issue} in ${f.file}`, 'yellow');
    });
    log('\n📁 Report: reports/semgrep.sarif', 'cyan');
    process.exit(1);
  } else {
    log('\n✅ No high-severity issues detected', 'green');
    log('📁 Report: reports/semgrep.sarif', 'cyan');
    process.exit(0);
  }
}

main().catch(error => {
  log('\n❌ ERROR: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
