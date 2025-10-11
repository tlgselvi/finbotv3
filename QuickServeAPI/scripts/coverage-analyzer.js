#!/usr/bin/env node
/**
 * 📊 Test Coverage Analyzer
 * Analyzes test coverage, tracks trends, and provides recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  threshold: {
    overall: 75,
    perFile: 70,
    statements: 75,
    branches: 70,
    functions: 75,
    lines: 75,
  },
  trendFile: path.join(rootDir, 'scripts', 'coverage-trends.json'),
  coverageFile: path.join(rootDir, 'coverage', 'coverage-summary.json'),
  maxTrendHistory: 30, // Keep last 30 runs
};

// Colors for console output
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

// Run coverage
async function runCoverage() {
  log('\n🧪 Running tests with coverage...', 'cyan');

  try {
    await execPromise('pnpm test --coverage --run', {
      cwd: rootDir,
      maxBuffer: 10 * 1024 * 1024,
    });
    return true;
  } catch (error) {
    log('⚠️  Some tests failed, but analyzing coverage anyway...', 'yellow');
    return false;
  }
}

// Parse coverage data
function parseCoverageData() {
  if (!fs.existsSync(CONFIG.coverageFile)) {
    log('❌ Coverage file not found. Run with --run-coverage', 'red');
    return null;
  }

  const data = JSON.parse(fs.readFileSync(CONFIG.coverageFile, 'utf-8'));
  return data;
}

// Analyze coverage
function analyzeCoverage(coverageData) {
  const total = coverageData.total;

  const analysis = {
    overall: {
      statements: total.statements.pct,
      branches: total.branches.pct,
      functions: total.functions.pct,
      lines: total.lines.pct,
      avg: (
        (total.statements.pct +
          total.branches.pct +
          total.functions.pct +
          total.lines.pct) /
        4
      ).toFixed(2),
    },
    files: [],
    lowCoverage: [],
    highCoverage: [],
    status: 'good',
  };

  // Analyze each file
  Object.entries(coverageData).forEach(([file, data]) => {
    if (file === 'total') return;

    const fileAnalysis = {
      path: file,
      statements: data.statements.pct,
      branches: data.branches.pct,
      functions: data.functions.pct,
      lines: data.lines.pct,
      avg: (
        (data.statements.pct +
          data.branches.pct +
          data.functions.pct +
          data.lines.pct) /
        4
      ).toFixed(2),
    };

    analysis.files.push(fileAnalysis);

    if (fileAnalysis.avg < CONFIG.threshold.perFile) {
      analysis.lowCoverage.push(fileAnalysis);
    } else if (fileAnalysis.avg >= 90) {
      analysis.highCoverage.push(fileAnalysis);
    }
  });

  // Sort by coverage
  analysis.lowCoverage.sort((a, b) => a.avg - b.avg);
  analysis.highCoverage.sort((a, b) => b.avg - a.avg);

  // Determine overall status
  if (analysis.overall.avg < CONFIG.threshold.overall - 10) {
    analysis.status = 'critical';
  } else if (analysis.overall.avg < CONFIG.threshold.overall) {
    analysis.status = 'warning';
  } else if (analysis.overall.avg >= 90) {
    analysis.status = 'excellent';
  }

  return analysis;
}

// Load trend history
function loadTrendHistory() {
  if (!fs.existsSync(CONFIG.trendFile)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(CONFIG.trendFile, 'utf-8'));
}

// Save trend history
function saveTrendHistory(history) {
  fs.writeFileSync(CONFIG.trendFile, JSON.stringify(history, null, 2), 'utf-8');
}

// Calculate trend
function calculateTrend(analysis) {
  const history = loadTrendHistory();

  // Add current data
  const dataPoint = {
    timestamp: new Date().toISOString(),
    coverage: parseFloat(analysis.overall.avg),
    statements: analysis.overall.statements,
    branches: analysis.overall.branches,
    functions: analysis.overall.functions,
    lines: analysis.overall.lines,
  };

  history.push(dataPoint);

  // Keep only last N runs
  if (history.length > CONFIG.maxTrendHistory) {
    history.shift();
  }

  saveTrendHistory(history);

  // Calculate trend
  if (history.length >= 2) {
    const prev = history[history.length - 2];
    const curr = history[history.length - 1];
    const diff = (curr.coverage - prev.coverage).toFixed(2);

    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      change: Math.abs(diff),
      previous: prev.coverage,
      current: curr.coverage,
    };
  }

  return null;
}

// Generate recommendations
function generateRecommendations(analysis) {
  const recommendations = [];

  // Overall coverage
  if (analysis.overall.avg < CONFIG.threshold.overall) {
    recommendations.push({
      type: 'critical',
      message: `Overall coverage (${analysis.overall.avg}%) is below threshold (${CONFIG.threshold.overall}%)`,
      action: 'Add tests to increase coverage',
    });
  }

  // Low branch coverage
  if (analysis.overall.branches < CONFIG.threshold.branches) {
    recommendations.push({
      type: 'warning',
      message: `Branch coverage (${analysis.overall.branches}%) is low`,
      action: 'Add tests for conditional logic and edge cases',
    });
  }

  // Low function coverage
  if (analysis.overall.functions < CONFIG.threshold.functions) {
    recommendations.push({
      type: 'warning',
      message: `Function coverage (${analysis.overall.functions}%) is low`,
      action: 'Ensure all functions are tested at least once',
    });
  }

  // Files with low coverage
  if (analysis.lowCoverage.length > 0) {
    recommendations.push({
      type: 'action',
      message: `${analysis.lowCoverage.length} files have low coverage (<${CONFIG.threshold.perFile}%)`,
      action: `Focus on: ${analysis.lowCoverage
        .slice(0, 3)
        .map(f => path.basename(f.path))
        .join(', ')}`,
    });
  }

  return recommendations;
}

// Generate badge
function generateBadge(coverage) {
  let color = 'red';
  if (coverage >= 90) color = 'brightgreen';
  else if (coverage >= 80) color = 'green';
  else if (coverage >= 70) color = 'yellow';
  else if (coverage >= 60) color = 'orange';

  return {
    schemaVersion: 1,
    label: 'coverage',
    message: `${coverage}%`,
    color: color,
  };
}

// Display results
function displayResults(analysis, trend, recommendations) {
  console.log('\n' + '═'.repeat(60));
  log('📊 TEST COVERAGE ANALYSIS', 'bright');
  console.log('═'.repeat(60) + '\n');

  // Overall Coverage
  const statusIcon = {
    excellent: '🌟',
    good: '✅',
    warning: '⚠️',
    critical: '🔴',
  }[analysis.status];

  log(
    `${statusIcon} Overall Coverage: ${analysis.overall.avg}%`,
    analysis.status === 'critical'
      ? 'red'
      : analysis.status === 'warning'
        ? 'yellow'
        : 'green'
  );

  console.log(`
   Statements:  ${analysis.overall.statements}%
   Branches:    ${analysis.overall.branches}%
   Functions:   ${analysis.overall.functions}%
   Lines:       ${analysis.overall.lines}%
  `);

  // Threshold
  const meetsThreshold = analysis.overall.avg >= CONFIG.threshold.overall;
  log(
    `   Threshold:   ${CONFIG.threshold.overall}% ${meetsThreshold ? '✅' : '❌'}`,
    meetsThreshold ? 'green' : 'red'
  );

  // Trend
  if (trend) {
    const arrow =
      trend.direction === 'up'
        ? '📈'
        : trend.direction === 'down'
          ? '📉'
          : '➡️';
    log(
      `\n   Trend:       ${arrow} ${trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}${trend.change}% (from ${trend.previous}%)`,
      trend.direction === 'up'
        ? 'green'
        : trend.direction === 'down'
          ? 'red'
          : 'yellow'
    );
  }

  // Low Coverage Files
  if (analysis.lowCoverage.length > 0) {
    log('\n⚠️  LOW COVERAGE FILES:', 'yellow');
    analysis.lowCoverage.slice(0, 10).forEach(file => {
      const shortPath = file.path.replace(rootDir, '').substring(1);
      log(`   • ${shortPath}: ${file.avg}%`, 'yellow');
    });

    if (analysis.lowCoverage.length > 10) {
      log(`   ... and ${analysis.lowCoverage.length - 10} more`, 'yellow');
    }
  }

  // High Coverage Files
  if (analysis.highCoverage.length > 0) {
    log('\n🌟 EXCELLENT COVERAGE FILES (>90%):', 'green');
    analysis.highCoverage.slice(0, 5).forEach(file => {
      const shortPath = file.path.replace(rootDir, '').substring(1);
      log(`   • ${shortPath}: ${file.avg}%`, 'green');
    });
  }

  // Recommendations
  if (recommendations.length > 0) {
    log('\n💡 RECOMMENDATIONS:', 'cyan');
    recommendations.forEach(rec => {
      const icon =
        rec.type === 'critical' ? '🔴' : rec.type === 'warning' ? '⚠️' : '📝';
      log(`   ${icon} ${rec.message}`, 'cyan');
      log(`      → ${rec.action}`, 'cyan');
    });
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const shouldRunCoverage = args.includes('--run-coverage');

  console.clear();
  log(
    `
╔════════════════════════════════════════════════════════════╗
║          📊 TEST COVERAGE ANALYZER v1.0                   ║
║              Analyze • Track • Improve                     ║
╚════════════════════════════════════════════════════════════╝
  `,
    'bright'
  );

  // Run coverage if requested
  if (shouldRunCoverage) {
    await runCoverage();
  }

  // Parse coverage data
  const coverageData = parseCoverageData();
  if (!coverageData) {
    log('\nUsage: node coverage-analyzer.js [--run-coverage]', 'yellow');
    process.exit(1);
  }

  // Analyze
  const analysis = analyzeCoverage(coverageData);

  // Calculate trend
  const trend = calculateTrend(analysis);

  // Generate recommendations
  const recommendations = generateRecommendations(analysis);

  // Display results
  displayResults(analysis, trend, recommendations);

  // Generate badge
  const badge = generateBadge(parseFloat(analysis.overall.avg));
  const badgePath = path.join(rootDir, 'coverage-badge.json');
  fs.writeFileSync(badgePath, JSON.stringify(badge, null, 2), 'utf-8');

  // Save analysis
  const analysisPath = path.join(rootDir, 'coverage-analysis.json');
  fs.writeFileSync(
    analysisPath,
    JSON.stringify(
      {
        analysis,
        trend,
        recommendations,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf-8'
  );

  log('✅ Coverage analysis saved:', 'green');
  log(`   • ${analysisPath}`, 'cyan');
  log(`   • ${badgePath}`, 'cyan');

  // Exit code based on threshold
  if (analysis.overall.avg < CONFIG.threshold.overall) {
    log('\n❌ Coverage below threshold!', 'red');
    process.exit(1);
  } else {
    log('\n✅ Coverage meets threshold!', 'green');
    process.exit(0);
  }
}

main().catch(error => {
  log('\n❌ Error: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
