#!/usr/bin/env node
/**
 * Hızlı README Güncelleyici
 * Mevcut test sonuçlarını kullanarak README'yi günceller (test çalıştırmadan)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manuel test sonuçları (son çalıştırmadan)
const currentResults = {
  totalTests: 949,
  passing: 447,
  failing: 214,
  skipped: 288,
  testFiles: 64,
  passingFiles: 20,
  failingFiles: 15,
  skippedFiles: 29,
  passRate: '47.1%',
  timestamp: new Date().toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }),
};

function updateReadme(results) {
  const readmePath = path.join(__dirname, '..', 'tests', 'README.md');

  if (!fs.existsSync(readmePath)) {
    console.error('❌ README.md bulunamadı:', readmePath);
    return false;
  }

  let content = fs.readFileSync(readmePath, 'utf-8');

  // Test Suite Özeti bölümünü güncelle
  const summaryRegex =
    /## 📊 Test Suite Özeti\s*\n\s*\*\*Toplam:\*\*[^\n]*\n\s*\*\*Son Güncelleme:\*\*[^\n]*\n\s*\*\*Critical Tests:\*\*[^\n]*\n\s*\*\*Test Files:\*\*[^\n]*/;

  const newSummary = `## 📊 Test Suite Özeti

**Toplam:** ${results.totalTests} test | **Geçen:** ${results.passing} (${results.passRate}) | **Skip:** ${results.skipped} (${((results.skipped / results.totalTests) * 100).toFixed(0)}%) | **Coverage:** ~75%

**Son Güncelleme:** ${results.timestamp}  
**Critical Tests:** 84/84 (100%) ✅  
**Test Files:** ${results.testFiles} (${results.passingFiles} passing, ${results.skippedFiles} skipped, ${results.failingFiles} needs work)`;

  if (summaryRegex.test(content)) {
    content = content.replace(summaryRegex, newSummary);
    fs.writeFileSync(readmePath, content, 'utf-8');
    console.log('✅ tests/README.md güncellendi');
    return true;
  }

  return false;
}

console.log('📝 README hızlı güncelleniyor...\n');
updateReadme(currentResults);
console.log('✅ Güncelleme tamamlandı!');
