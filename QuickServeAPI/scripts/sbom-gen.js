#!/usr/bin/env node
/**
 * 📦 SBOM Generator
 * Software Bill of Materials (CycloneDX format)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function calculateHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║              📦 SBOM GENERATOR                            ║
║        Software Bill of Materials (CycloneDX)              ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  log('\n📦 Generating SBOM...', 'cyan');

  // Check if cyclonedx-npm is available
  try {
    await execPromise('npx @cyclonedx/cyclonedx-npm --version');
  } catch {
    log('\n⚠️  Installing @cyclonedx/cyclonedx-npm...', 'yellow');
    await execPromise('pnpm add -D @cyclonedx/cyclonedx-npm');
  }

  // Generate SBOM
  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const sbomPath = path.join(reportsDir, 'sbom.cdx.json');

  try {
    await execPromise(`npx @cyclonedx/cyclonedx-npm --output-file ${sbomPath}`);
    log('✅ SBOM generated successfully', 'green');
  } catch (error) {
    log('⚠️  CycloneDX failed, creating minimal SBOM...', 'yellow');

    // Minimal SBOM from package.json
    const pkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
    );

    const minimalSBOM = {
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        component: {
          type: 'application',
          name: pkg.name,
          version: pkg.version,
          description: pkg.description,
        },
      },
      components: Object.entries(pkg.dependencies || {}).map(
        ([name, version]) => ({
          type: 'library',
          name,
          version: version.replace(/^[\^~]/, ''),
        })
      ),
    };

    fs.writeFileSync(sbomPath, JSON.stringify(minimalSBOM, null, 2), 'utf-8');
    log('✅ Minimal SBOM created', 'green');
  }

  // Calculate hash and save provenance
  const hash = calculateHash(sbomPath);

  const provenance = {
    sbom: {
      path: 'reports/sbom.cdx.json',
      hash: hash,
      algorithm: 'sha256',
      generatedAt: new Date().toISOString(),
    },
  };

  const attestDir = path.join(rootDir, 'attest');
  if (!fs.existsSync(attestDir)) {
    fs.mkdirSync(attestDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(attestDir, 'provenance.json'),
    JSON.stringify(provenance, null, 2),
    'utf-8'
  );

  log(`\n✅ SBOM saved: ${sbomPath}`, 'green');
  log(`✅ Provenance: attest/provenance.json`, 'green');
  log(`   Hash: ${hash.substring(0, 16)}...`, 'cyan');

  process.exit(0);
}

main().catch(error => {
  log('\n❌ ERROR: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
