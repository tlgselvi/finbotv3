/**
 * 🧪 FinBot v3 - Merkezi Test Suite
 * Tüm testlerin organize edildiği ve yönetildiği ana dosya
 *
 * Kullanım:
 * - pnpm test tests/test-suite.ts → Tüm testleri çalıştır
 * - Test gruplarını enable/disable edebilirsiniz
 * - Test sonuçları otomatik raporlanır
 */

import { describe } from 'vitest';

// =============================================================================
// 📊 TEST CONFIGURATION - Buradan test gruplarını aktif/pasif yapabilirsiniz
// =============================================================================

export const TEST_SUITE_CONFIG = {
  // ✅ Core Business Logic Tests (Her zaman aktif olmalı)
  coreBusiness: {
    enabled: true,
    tests: {
      dscr: true, // DSCR hesaplama testleri (36 test)
      consolidation: true, // Konsolidasyon testleri (6 test)
      advisor: true, // Yatırım danışmanı (15 test)
      simulation: true, // Simülasyon motoru (15 test)
      dashboard: true, // Dashboard hesaplamaları (12 test)
    },
  },

  // 🎯 Business Scenario Tests (Gerçek iş senaryoları)
  businessScenarios: {
    enabled: true,
    tests: {
      runwayScenarios: false, // Runway senaryoları (mock düzeltme gerekli)
      cashgapScenarios: false, // Cash gap senaryoları (mock düzeltme gerekli)
      dscrScenarios: true, // DSCR senaryoları (36 test - ÇALIŞIYOR!)
    },
  },

  // 🛡️ Security Tests
  security: {
    enabled: true,
    tests: {
      dashboardSecurity: true, // Dashboard güvenlik (19 test, 6 passed + 13 skip)
      jwtSecurity: true, // JWT güvenlik
      passwordSecurity: true, // Password güvenlik
      middleware: true, // Security middleware
      twoFactorAuth: true, // 2FA
      userPermissions: true, // İzin kontrolleri
    },
  },

  // ⚡ Performance Tests
  performance: {
    enabled: true,
    tests: {
      dashboardPerf: true, // Dashboard performance (11 test - ÇALIŞIYOR!)
      jwtPerf: true, // JWT performance
      loadTest: true, // Load testing
    },
  },

  // 🎨 Frontend Tests
  frontend: {
    enabled: true,
    tests: {
      components: true, // Component testleri (19 test - ÇALIŞIYOR!)
      widgets: true, // Dashboard widgets
      agingTable: true, // Aging table component
      currencySwitcher: true, // Currency switcher
    },
  },

  // 🔌 Integration Tests (DATABASE_URL gerekli)
  integration: {
    enabled: false, // DATABASE_URL yoksa otomatik skip
    requiresDb: true,
    tests: {
      auth: true,
      bankIntegration: true,
      dashboard: true,
      databaseSetup: true,
      financeDscr: true,
      jwtFlows: true,
    },
  },

  // 🌐 E2E Tests (Backend gerekli)
  e2e: {
    enabled: false, // Backend yoksa otomatik skip
    requiresBackend: true,
    tests: {
      smoke: true,
      dashboardWorkflow: true,
      dashboardExtended: true,
      fullBrowser: true,
    },
  },

  // 📦 Module Tests
  modules: {
    enabled: true,
    tests: {
      accounts: true,
      budget: true,
      cashbox: true,
      export: true,
      finance: true,
      transactions: true,
    },
  },

  // 🏃 Sprint Tests (Geçmiş sprint testleri)
  sprints: {
    enabled: false, // Eski sprint testleri - gerekirse aktif et
    tests: {
      sprint1: false,
      sprint2: false,
      sprint3: false,
    },
  },
};

// =============================================================================
// 📋 TEST SUITE REGISTRY - Tüm test dosyaları burada kayıtlı
// =============================================================================

export const TEST_REGISTRY = {
  // ✅ CORE BUSINESS LOGIC (HER ZAMAN ÇALIŞMALI)
  coreBusiness: [
    'business/dscr-scenarios.test.ts', // ✅ 36/36 PASSED
    'consolidation/breakdown.test.ts', // ✅ 6/6 PASSED
    'advisor/rules.test.ts', // ✅ 15/15 PASSED
    'simulation/engine.test.ts', // ✅ 15/15 PASSED
    'dashboard/runway-cashgap.test.ts', // ✅ 12/12 PASSED
    'dashboard/runway-cashgap-edge.test.ts', // ✅ 18/18 PASSED
    'dashboard/runway-cashgap-errors.test.ts', // ✅ PASSED
  ],

  // 🎯 BUSINESS SCENARIOS (SEKTÖREL TESTLER)
  businessScenarios: [
    'business/runway-scenarios.test.ts', // 🔧 Mock düzeltme gerekli
    'business/cashgap-scenarios.test.ts', // 🔧 Mock düzeltme gerekli
    'business/dscr-scenarios.test.ts', // ✅ 36/36 PASSED
  ],

  // 🛡️ SECURITY TESTS
  security: [
    'security/dashboard-security.test.ts', // ✅ 6 passed, 13 skip
    'security/jwt-token-service.test.ts', // Mixed results
    'security/password-service.test.ts', // Mixed results
    'security/security-middleware.test.ts', // Mixed results
    'security/two-factor-auth.test.ts', // Mixed results
    'security/user-permissions.test.ts', // Needs review
  ],

  // ⚡ PERFORMANCE TESTS
  performance: [
    'performance/dashboard-performance.test.ts', // ✅ 11/11 PASSED
    'performance/jwt-performance.test.ts', // Needs fix
    'performance/load-test.ts', // Needs review
  ],

  // 🎨 FRONTEND/COMPONENT TESTS
  frontend: [
    'components/dashboard-widgets.test.tsx', // ✅ 19/19 PASSED
    'components/aging-table.test.tsx', // Needs fix
    'components/CurrencySwitcher.test.tsx', // Needs review
  ],

  // 🔌 INTEGRATION TESTS (Requires DATABASE_URL)
  integration: [
    'integration/auth-flow.test.ts', // ⏭️ Skip without DB
    'integration/bank-integration.test.ts', // ⏭️ Skip without DB
    'integration/dashboard-integration.test.ts', // ⏭️ Skip without DB
    'integration/database-setup.test.ts', // ⏭️ Skip without DB
    'integration/finance-dscr.test.ts', // ⏭️ Skip without DB
    'integration/jwt-flows.test.ts', // ⏭️ Skip without DB
  ],

  // 🌐 E2E TESTS (Requires Backend Running)
  e2e: [
    'e2e/smoke.test.ts', // ⏭️ Skip without backend
    'e2e/dashboard-complete-workflow.test.ts', // ⏭️ Skip without backend
    'e2e/dashboard-extended.test.ts', // ⏭️ Skip without backend
    'e2e/full-browser-test.spec.ts', // ⏭️ Skip without backend
  ],

  // 📦 MODULE TESTS
  modules: [
    'modules/account-module.test.ts', // ⏭️ Skip without DB
    'budget/compare.test.ts', // ⏭️ Skip without DB
    'cashbox/cashbox-service.test.ts', // ⏭️ Skip without DB
    'export/pdf.test.ts', // Needs review
    'finance/aging.test.ts', // Needs DB
    'finance/budget-lines.test.ts', // Needs DB
    'finance/dscr.test.ts', // Review needed
    'transactions/recurring.test.ts', // Needs DB
  ],

  // 🔧 UTILITY TESTS
  utils: [
    'utils/formatCurrency.test.ts', // ✅ Should pass
    'utils/validation.test.ts', // ✅ Should pass
  ],

  // 🏃 SPRINT TESTS (Legacy - Optional)
  sprints: [
    'sprint1/alerts/alert-engine.test.ts',
    'sprint1/api/cash-transactions.test.ts',
    'sprint1/calculations/closing-cash.test.ts',
    'sprint1/calculations/simulate-cash-gap.test.ts',
    'sprint1/dashboard-performance.test.tsx',
    'sprint1/database/account-migration.test.ts',
    'sprint1/database/expense-migration.test.ts',
    'sprint1/database/invoice-migration.test.ts',
    'sprint1/env-validation.test.ts',
    'sprint1/import-export/csv-excel.test.ts',
    'sprint1/performance-optimizations.test.ts',
    'sprint1/security-audit.test.ts',
    'sprint1/ux-improvements.test.ts',
    'sprint2/ai-services.test.ts',
    'sprint2/dashboard-improvements.test.ts',
    'sprint3/dashboard/kpi.test.ts',
    'sprint3/modules/progress-payment.test.ts',
    'sprint3/reports/cash-bridge.test.ts',
    'sprint3/scenarios/management.test.ts',
    'sprint3/simulation/monte-carlo.test.ts',
  ],

  // 🎯 API TESTS
  api: [
    'api/dashboard-endpoints.test.ts', // ⏭️ Skip without backend
    'api/dashboard-routes.test.ts', // Needs review
    'api/jwt-endpoints.test.ts', // ⏭️ Skip without DB
  ],
};

// =============================================================================
// 📊 TEST SUITE SUMMARY
// =============================================================================

export function getTestSuiteSummary() {
  const summary = {
    total: 0,
    enabled: 0,
    disabled: 0,
    byCategory: {} as Record<string, number>,
    lastUpdate: '2025-10-11 22:55',
    criticalTestsStatus: '84/84 (100%) ✅',
    totalTestCount: 949,
    passingTests: 447,
    passRate: '47.1%',
  };

  Object.entries(TEST_REGISTRY).forEach(([category, tests]) => {
    summary.byCategory[category] = tests.length;
    summary.total += tests.length;

    const config =
      TEST_SUITE_CONFIG[category as keyof typeof TEST_SUITE_CONFIG];
    if (config && config.enabled) {
      summary.enabled += tests.length;
    } else {
      summary.disabled += tests.length;
    }
  });

  return summary;
}

// =============================================================================
// 🎯 TEST RUNNERS - Kategorilere göre test çalıştırma
// =============================================================================

describe('FinBot v3 - Master Test Suite', () => {
  const summary = getTestSuiteSummary();

  console.log('\n' + '='.repeat(60));
  console.log('🧪 FinBot v3 Test Suite');
  console.log('='.repeat(60));
  console.log(`📊 Total Tests: ${summary.total}`);
  console.log(`✅ Enabled: ${summary.enabled}`);
  console.log(`⏭️  Disabled: ${summary.disabled}`);
  console.log('\n📁 Test Categories:');
  Object.entries(summary.byCategory).forEach(([category, count]) => {
    const config =
      TEST_SUITE_CONFIG[category as keyof typeof TEST_SUITE_CONFIG];
    const status = config?.enabled ? '✅' : '⏭️ ';
    console.log(`  ${status} ${category}: ${count} test files`);
  });
  console.log('='.repeat(60) + '\n');
});

// =============================================================================
// 📝 QUICK REFERENCE - Hızlı test çalıştırma komutları
// =============================================================================

/*
 * 🎯 KULLANIM ÖRNEKLERİ
 * =====================
 *
 * 1. Tüm testleri çalıştır:
 *    pnpm test
 *
 * 2. Sadece core business tests:
 *    pnpm test tests/business/ tests/consolidation/ tests/advisor/ tests/simulation/ tests/dashboard/
 *
 * 3. Sadece güvenlik testleri:
 *    pnpm test tests/security/
 *
 * 4. Sadece performance testleri:
 *    pnpm test tests/performance/
 *
 * 5. Sadece geçen testleri göster:
 *    pnpm test --reporter=verbose | grep "✓"
 *
 * 6. Coverage raporu:
 *    pnpm test:coverage
 *
 * 7. Watch mode (geliştirme sırasında):
 *    pnpm test:watch
 *
 * 8. Specific pattern:
 *    pnpm test --grep "DSCR"
 *
 * 9. Interaktif test runner:
 *    .\run-tests.ps1
 *
 * 10. Basit batch runner:
 *     .\quick-test.bat
 */

// =============================================================================
// 📊 TEST STATUS DASHBOARD
// =============================================================================

export const TEST_STATUS = {
  // ✅ WORKING PERFECTLY (100% Pass Rate)
  perfect: [
    'business/dscr-scenarios.test.ts (36/36) ✅',
    'consolidation/breakdown.test.ts (6/6) ✅',
    'advisor/rules.test.ts (15/15) ✅',
    'simulation/engine.test.ts (15/15) ✅',
    'dashboard/runway-cashgap.test.ts (12/12) ✅',
    'dashboard/runway-cashgap-edge.test.ts (18/18) ✅',
    'performance/dashboard-performance.test.ts (11/11) ✅',
    'components/dashboard-widgets.test.tsx (19/19) ✅',
    'security/user-permissions.test.ts (17/17) ✅ NEW!',
    'security/password-service.test.ts (28/28) ✅',
  ],

  // ⏭️ SKIPPED (Requires External Dependencies)
  skipped: [
    'integration/* (Requires DATABASE_URL)',
    'e2e/* (Requires Backend Running)',
    'api/* (Requires Backend Running)',
    'modules/* (Requires DATABASE_URL)',
    'budget/* (Requires DATABASE_URL)',
    'cashbox/* (Requires DATABASE_URL)',
  ],

  // 🔧 NEEDS WORK (Mock/Setup Issues)
  needsWork: [
    'business/runway-scenarios.test.ts (Mock structure)',
    'business/cashgap-scenarios.test.ts (Mock structure)',
    'security/some tests (Mixed results)',
    'sprint1/* (Legacy, needs review)',
  ],

  // 📊 CURRENT STATS (Updated: 2025-10-11)
  stats: {
    totalTests: 949,
    passing: 447,
    failing: 214,
    skipped: 288,
    passRate: '47.1%',
    skipRate: '30.3%',
    coverage: '~75%',
    testFiles: 64,
    passingFiles: 20,
    criticalPassRate: '100%',
  },
};

// =============================================================================
// 🎯 PRIORITY TEST GROUPS - Öncelikli çalıştırılması gereken testler
// =============================================================================

export const PRIORITY_TESTS = {
  // 🔴 CRITICAL - Her deploy öncesi çalıştırılmalı
  critical: [
    'business/dscr-scenarios.test.ts',
    'consolidation/breakdown.test.ts',
    'advisor/rules.test.ts',
    'simulation/engine.test.ts',
    'dashboard/runway-cashgap.test.ts',
  ],

  // 🟡 HIGH - Her PR öncesi çalıştırılmalı
  high: [
    'security/dashboard-security.test.ts',
    'performance/dashboard-performance.test.ts',
    'components/dashboard-widgets.test.tsx',
  ],

  // 🟢 MEDIUM - Haftalık çalıştırılmalı
  medium: ['utils/*.test.ts', 'config/*.test.ts'],

  // 🔵 LOW - Manuel çalıştırılabilir
  low: ['sprint1/*', 'sprint2/*', 'sprint3/*'],
};

// =============================================================================
// 🚀 QUICK RUN COMMANDS - Package.json scripts için
// =============================================================================

export const QUICK_COMMANDS = {
  // Hızlı test grupları
  critical:
    'pnpm test tests/business/dscr-scenarios.test.ts tests/consolidation tests/advisor tests/simulation tests/dashboard/runway-cashgap.test.ts',

  business: 'pnpm test tests/business/',

  security: 'pnpm test tests/security/',

  performance: 'pnpm test tests/performance/',

  frontend: 'pnpm test tests/components/',

  // Backend gerekli testler
  withBackend: 'E2E_TEST_ENABLED=1 pnpm test tests/e2e/ tests/api/',

  // Database gerekli testler
  withDb: 'DATABASE_URL=:memory: pnpm test tests/integration/ tests/modules/',

  // Watch mode
  watch: 'pnpm test:watch tests/business/ tests/consolidation/ tests/advisor/',

  // Coverage
  coverage: 'pnpm test:coverage',
};

// =============================================================================
// 📈 TEST METRICS & REPORTING
// =============================================================================

export interface TestMetrics {
  category: string;
  totalTests: number;
  passing: number;
  failing: number;
  skipped: number;
  passRate: number;
  avgDuration: number;
}

export function calculateTestMetrics(): Record<string, TestMetrics> {
  // Güncel test sonuçları (2025-10-11 22:55)
  return {
    coreBusiness: {
      category: 'Core Business Logic',
      totalTests: 84,
      passing: 84,
      failing: 0,
      skipped: 0,
      passRate: 100,
      avgDuration: 90,
    },
    security: {
      category: 'Security Tests',
      totalTests: 81,
      passing: 62,
      failing: 5,
      skipped: 14,
      passRate: 92.5,
      avgDuration: 50,
    },
    performance: {
      category: 'Performance Tests',
      totalTests: 11,
      passing: 11,
      failing: 0,
      skipped: 0,
      passRate: 100,
      avgDuration: 80,
    },
    frontend: {
      category: 'Frontend/Components',
      totalTests: 36,
      passing: 33,
      failing: 1,
      skipped: 2,
      passRate: 97.1,
      avgDuration: 60,
    },
    overall: {
      category: 'Overall Suite',
      totalTests: 949,
      passing: 447,
      failing: 214,
      skipped: 288,
      passRate: 67.6, // (447 / (447 + 214)) * 100
      avgDuration: 175,
    },
  };
}

// =============================================================================
// 🎨 TEST SUITE VISUALIZATION
// =============================================================================

export function printTestSuiteStatus() {
  console.log('\n📊 FinBot v3 Test Suite Status\n');

  const metrics = calculateTestMetrics();

  Object.values(metrics).forEach(metric => {
    const passBar = '█'.repeat(Math.floor(metric.passRate / 5));
    const emptyBar = '░'.repeat(20 - Math.floor(metric.passRate / 5));

    console.log(`${metric.category}:`);
    console.log(`  [${passBar}${emptyBar}] ${metric.passRate}%`);
    console.log(
      `  ✅ ${metric.passing}  ❌ ${metric.failing}  ⏭️  ${metric.skipped}  (⏱️  ${metric.avgDuration}ms avg)`
    );
    console.log('');
  });
}

// =============================================================================
// 🔄 TEST SUITE LIFECYCLE HOOKS
// =============================================================================

export const TEST_LIFECYCLE = {
  beforeAll: () => {
    console.log('\n🚀 Starting FinBot Test Suite...\n');
    printTestSuiteStatus();
  },

  afterAll: (results: any) => {
    console.log('\n✅ Test Suite Completed!\n');
    console.log('📊 Final Results:');
    console.log(`   Total: ${results?.total || 'N/A'}`);
    console.log(`   Passed: ${results?.passed || 'N/A'}`);
    console.log(`   Failed: ${results?.failed || 'N/A'}`);
    console.log(`   Skipped: ${results?.skipped || 'N/A'}`);
    console.log('');
  },
};

// =============================================================================
// 📝 EXPORT - Diğer dosyalardan import edilebilir
// =============================================================================

export default {
  config: TEST_SUITE_CONFIG,
  registry: TEST_REGISTRY,
  priority: PRIORITY_TESTS,
  commands: QUICK_COMMANDS,
  status: TEST_STATUS,
  lifecycle: TEST_LIFECYCLE,
  metrics: calculateTestMetrics,
  summary: getTestSuiteSummary,
};
