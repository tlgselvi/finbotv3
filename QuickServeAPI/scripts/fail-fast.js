#!/usr/bin/env node
/**
 * ⚡ Fail-Fast Handler
 * Hata olduğunda işlemi durdur ve kaydet
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Parse arguments
const args = process.argv.slice(2);
let step = 'unknown';
let status = 0;
let message = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--step' && args[i + 1]) {
    step = args[i + 1];
    i++;
  } else if (args[i] === '--status' && args[i + 1]) {
    status = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--message' && args[i + 1]) {
    message = args[i + 1];
    i++;
  }
}

const timestamp = new Date().toISOString();
const date = timestamp.split('T')[0];

// Log error if status != 0
if (status !== 0) {
  const errorsDir = path.join(rootDir, 'artifacts', 'errors');
  if (!fs.existsSync(errorsDir)) {
    fs.mkdirSync(errorsDir, { recursive: true });
  }

  const logFile = path.join(errorsDir, `${date}.log`);
  const logEntry = `[${timestamp}] ${step} FAILED: ${message}\n`;

  fs.appendFileSync(logFile, logEntry, 'utf-8');

  console.error(`\n❌ FAIL-FAST: ${step} failed`);
  console.error(`   Message: ${message}`);
  console.error(`   Logged to: ${logFile}`);

  process.exit(1);
} else {
  console.log(`\n✅ ${step} - SUCCESS`);
  process.exit(0);
}
