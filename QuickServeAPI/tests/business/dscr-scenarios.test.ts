/**
 * DSCR (Debt Service Coverage Ratio) - Real Business Scenarios
 * Borç servisi karşılama oranı testleri - Gerçek iş durumları
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDSCR,
  mapDSCRStatus,
} from '../../server/src/modules/finance/dscr';

describe('DSCR - Gerçek İş Senaryoları', () => {
  describe('Senaryo 1: Sağlıklı İşletme (DSCR > 1.5)', () => {
    it('300K operasyonel CF, 150K borç servisi → DSCR: 2.0 (OK)', () => {
      const operatingCF = 300000; // Aylık 25K × 12 ay
      const debtService = 150000; // Kredi taksitleri + faiz

      const dscr = calculateDSCR(operatingCF, debtService);
      const status = mapDSCRStatus(dscr);

      expect(dscr).toBe(2.0);
      expect(status).toBe('ok');

      // 2.0 DSCR = Borç servisinden 2 kat fazla nakit üretiliyor
      // Bankalar genelde 1.25+ DSCR ister, 2.0 mükemmel
    });

    it('500K operasyonel CF, 200K borç servisi → DSCR: 2.5 (EXCELLENT)', () => {
      const operatingCF = 500000;
      const debtService = 200000;

      const dscr = calculateDSCR(operatingCF, debtService);
      const status = mapDSCRStatus(dscr);

      expect(dscr).toBe(2.5);
      expect(status).toBe('ok');

      // Çok sağlıklı - ek kredi kapasitesi var
    });

    it('KOBİ örneği: 180K CF, 100K debt → DSCR: 1.8 (HEALTHY)', () => {
      const operatingCF = 180000;
      const debtService = 100000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBeCloseTo(1.8, 1);
      expect(mapDSCRStatus(dscr)).toBe('ok');
    });
  });

  describe('Senaryo 2: Riskli Durum (1.0 ≤ DSCR < 1.5)', () => {
    it('200K operasyonel CF, 150K borç servisi → DSCR: 1.33 (WARNING)', () => {
      const operatingCF = 200000;
      const debtService = 150000;

      const dscr = calculateDSCR(operatingCF, debtService);
      const status = mapDSCRStatus(dscr);

      expect(dscr).toBeCloseTo(1.33, 0.01);
      expect(status).toBe('warning');

      // 1.33 = Borç servisini ödüyor ama marj dar
      // Herhangi bir gelir düşüşünde problem olur
    });

    it('120K operasyonel CF, 100K borç servisi → DSCR: 1.2 (MARGINAL)', () => {
      const operatingCF = 120000;
      const debtService = 100000;

      const dscr = calculateDSCR(operatingCF, debtService);
      const status = mapDSCRStatus(dscr);

      expect(dscr).toBe(1.2);
      expect(status).toBe('warning');

      // Bankalar genelde minimum 1.25 DSCR ister
      // 1.2 = Kredi başvurusu reddedilebilir
    });

    it('Startup büyüme: 220K CF, 180K debt → DSCR: 1.22 (TIGHT)', () => {
      const operatingCF = 220000;
      const debtService = 180000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBeCloseTo(1.22, 0.01);
      expect(mapDSCRStatus(dscr)).toBe('warning');
    });
  });

  describe('Senaryo 3: Kritik Durum (DSCR < 1.0)', () => {
    it('80K operasyonel CF, 120K borç servisi → DSCR: 0.67 (CRITICAL)', () => {
      const operatingCF = 80000;
      const debtService = 120000;

      const dscr = calculateDSCR(operatingCF, debtService);
      const status = mapDSCRStatus(dscr);

      expect(dscr).toBeCloseTo(0.67, 0.01);
      expect(status).toBe('critical');

      // 0.67 = Borç servisini karşılayamıyor!
      // 40K eksik var, restructuring gerekli
    });

    it('Negatif CF: -50K CF, 100K debt → DSCR: -0.5 (EMERGENCY)', () => {
      const operatingCF = -50000; // İşletme zarar ediyor
      const debtService = 100000;

      const dscr = calculateDSCR(operatingCF, debtService);
      const status = mapDSCRStatus(dscr);

      expect(dscr).toBe(-0.5);
      expect(status).toBe('critical');

      // Hem zarar ediyor hem borç ödeyemiyor - acil durum!
    });

    it('Minimum cash flow: 95K CF, 100K debt → DSCR: 0.95 (BORDERLINE)', () => {
      const operatingCF = 95000;
      const debtService = 100000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(0.95);
      expect(mapDSCRStatus(dscr)).toBe('critical');

      // 1.0'ın altında - default riski var
    });
  });

  describe('Senaryo 4: İnşaat Sektörü', () => {
    it('Büyük proje: 1.2M yıllık CF, 600K debt service → DSCR: 2.0', () => {
      const operatingCF = 1200000; // Büyük proje geliri
      const debtService = 600000; // Ekipman kredisi + KMH

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(2.0);
      expect(mapDSCRStatus(dscr)).toBe('ok');
    });

    it('Proje arası dönem: 200K CF, 250K debt → DSCR: 0.8 (CONCERN)', () => {
      const operatingCF = 200000; // Ara dönem, düşük gelir
      const debtService = 250000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(0.8);
      expect(mapDSCRStatus(dscr)).toBe('critical');

      // İnşaatta mevsimsellik normal, ama izlenmeli
    });
  });

  describe('Senaryo 5: Üretim Tesisi', () => {
    it('Tam kapasite: 800K CF, 400K debt (makine kredileri) → DSCR: 2.0', () => {
      const operatingCF = 800000;
      const debtService = 400000; // Makine kredileri + işletme kredisi

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(2.0);
      expect(mapDSCRStatus(dscr)).toBe('ok');
    });

    it('Düşük kapasite: 300K CF, 400K debt → DSCR: 0.75 (PROBLEM)', () => {
      const operatingCF = 300000; // %50 kapasite
      const debtService = 400000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(0.75);
      expect(mapDSCRStatus(dscr)).toBe('critical');
    });
  });

  describe('Senaryo 6: Restoran Zinciri', () => {
    it('4 şube: 600K toplam CF, 350K debt (mülk + işletme kredisi) → DSCR: 1.71', () => {
      const operatingCF = 600000; // Şube başı 150K × 4
      const debtService = 350000; // Mülk kredisi + işletme sermayesi

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBeCloseTo(1.71, 0.01);
      expect(mapDSCRStatus(dscr)).toBe('ok');
    });

    it('Pandemi etkisi: 250K CF, 350K debt → DSCR: 0.71 (CRISIS)', () => {
      const operatingCF = 250000; // %60 düşüş
      const debtService = 350000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBeCloseTo(0.71, 0.01);
      expect(mapDSCRStatus(dscr)).toBe('critical');
    });
  });

  describe('Senaryo 7: Teknoloji Startup', () => {
    it('Erken aşama: 500K CF, 200K debt (küçük borç) → DSCR: 2.5', () => {
      const operatingCF = 500000; // Hızlı büyüme
      const debtService = 200000; // Az borç

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(2.5);
      expect(mapDSCRStatus(dscr)).toBe('ok');
    });

    it('Burn fazlası: 100K CF, 300K debt → DSCR: 0.33 (CRITICAL)', () => {
      const operatingCF = 100000; // Hızlı burn
      const debtService = 300000; // Yatırımcı borcu + kredi

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBeCloseTo(0.33, 0.01);
      expect(mapDSCRStatus(dscr)).toBe('critical');
    });
  });

  describe('Edge Cases - Özel Durumlar', () => {
    it('Sıfır borç → DSCR: Infinity (IDEAL)', () => {
      const operatingCF = 200000;
      const debtService = 0; // Borçsuz işletme

      const dscr = calculateDSCR(operatingCF, debtService);
      const status = mapDSCRStatus(dscr);

      expect(dscr).toBe(Infinity);
      expect(status).toBe('ok');
    });

    it('Tam eşitlik: 100K CF = 100K debt → DSCR: 1.0 (BREAKEVEN)', () => {
      const operatingCF = 100000;
      const debtService = 100000;

      const dscr = calculateDSCR(operatingCF, debtService);
      const status = mapDSCRStatus(dscr);

      expect(dscr).toBe(1.0);
      expect(status).toBe('warning'); // 1.0 = kritik eşik
    });

    it('Çok küçük değerler: 1K CF, 800 debt → DSCR: 1.25', () => {
      const operatingCF = 1000;
      const debtService = 800;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(1.25);
      expect(mapDSCRStatus(dscr)).toBe('warning');
    });

    it('Çok büyük değerler: 10M CF, 5M debt → DSCR: 2.0', () => {
      const operatingCF = 10000000;
      const debtService = 5000000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(2.0);
      expect(mapDSCRStatus(dscr)).toBe('ok');

      // Büyük tutarlarla da doğru çalışmalı
    });

    it('Sıfır CF, pozitif debt → DSCR: 0 (WORST CASE)', () => {
      const operatingCF = 0;
      const debtService = 100000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(0);
      expect(mapDSCRStatus(dscr)).toBe('critical');
    });
  });

  describe('Senaryo 8: Kredi Başvuru Kriterleri', () => {
    it('Banka standardı: DSCR ≥ 1.25 → Kredi onaylanabilir', () => {
      const scenarios = [
        { cf: 125000, debt: 100000, canGetLoan: true }, // 1.25 - Sınırda
        { cf: 150000, debt: 100000, canGetLoan: true }, // 1.5 - İyi
        { cf: 120000, debt: 100000, canGetLoan: false }, // 1.2 - Yetersiz
        { cf: 100000, debt: 100000, canGetLoan: false }, // 1.0 - Red
      ];

      scenarios.forEach(scenario => {
        const dscr = calculateDSCR(scenario.cf, scenario.debt);
        const eligibleForLoan = dscr >= 1.25;

        expect(eligibleForLoan).toBe(scenario.canGetLoan);
      });
    });

    it('KOBİ kredisi: DSCR 1.3-1.5 arası ideal', () => {
      const operatingCF = 140000;
      const debtService = 100000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(1.4);
      expect(dscr).toBeGreaterThanOrEqual(1.3);
      expect(dscr).toBeLessThanOrEqual(1.5);
      expect(mapDSCRStatus(dscr)).toBe('warning'); // Banka için hala warning
    });

    it('Kurumsal kredi: DSCR ≥ 2.0 tercih ediliyor', () => {
      const operatingCF = 2000000;
      const debtService = 1000000;

      const dscr = calculateDSCR(operatingCF, debtService);

      expect(dscr).toBe(2.0);
      expect(mapDSCRStatus(dscr)).toBe('ok');
    });
  });

  describe('Senaryo 9: Restructuring Durumu', () => {
    it('Kredi yeniden yapılandırma öncesi: DSCR: 0.7', () => {
      const operatingCF = 350000;
      const debtService = 500000; // Ağır borç yükü

      const dscrBefore = calculateDSCR(operatingCF, debtService);

      expect(dscrBefore).toBe(0.7);
      expect(mapDSCRStatus(dscrBefore)).toBe('critical');
    });

    it('Kredi yeniden yapılandırma sonrası: DSCR: 1.4', () => {
      const operatingCF = 350000;
      const debtServiceAfter = 250000; // Vade uzatıldı, taksit azaldı

      const dscrAfter = calculateDSCR(operatingCF, debtServiceAfter);

      expect(dscrAfter).toBe(1.4);
      expect(mapDSCRStatus(dscrAfter)).toBe('warning'); // İyileşti ama hala dikkatli olunmalı
    });
  });

  describe('Senaryo 10: Franchising İşletmesi', () => {
    it('3 franchise: Her biri farklı DSCR → Konsolide değerlendirme', () => {
      const franchises = [
        { name: 'Şube 1', cf: 150000, debt: 80000, dscr: 1.875 }, // Sağlıklı
        { name: 'Şube 2', cf: 120000, debt: 100000, dscr: 1.2 }, // Risk
        { name: 'Şube 3', cf: 80000, debt: 100000, dscr: 0.8 }, // Kritik
      ];

      franchises.forEach(f => {
        const calculatedDSCR = calculateDSCR(f.cf, f.debt);
        expect(calculatedDSCR).toBeCloseTo(f.dscr, 0.01);
      });

      // Konsolide DSCR
      const totalCF = franchises.reduce((sum, f) => sum + f.cf, 0);
      const totalDebt = franchises.reduce((sum, f) => sum + f.debt, 0);
      const consolidatedDSCR = calculateDSCR(totalCF, totalDebt);

      expect(consolidatedDSCR).toBeCloseTo(1.25, 0.01); // 350K / 280K
      expect(mapDSCRStatus(consolidatedDSCR)).toBe('warning');
    });
  });

  describe('Senaryo 11: Mevsimsel İşletme Yıllık DSCR', () => {
    it('Turizm işletmesi: Yıllık bazda değerlendirme', () => {
      // Yaz sezonları yüksek, kış düşük
      const quarterlyData = [
        { q: 'Q1 (Kış)', cf: 50000, debt: 100000, dscr: 0.5 },
        { q: 'Q2 (İlkbahar)', cf: 200000, debt: 100000, dscr: 2.0 },
        { q: 'Q3 (Yaz)', cf: 350000, debt: 100000, dscr: 3.5 },
        { q: 'Q4 (Sonbahar)', cf: 200000, debt: 100000, dscr: 2.0 },
      ];

      // Yıllık toplam
      const annualCF = quarterlyData.reduce((sum, q) => sum + q.cf, 0);
      const annualDebt = 400000; // 4 × 100K
      const annualDSCR = calculateDSCR(annualCF, annualDebt);

      expect(annualCF).toBe(800000);
      expect(annualDSCR).toBe(2.0);
      expect(mapDSCRStatus(annualDSCR)).toBe('ok');

      // Yıllık bazda sağlıklı ama Q1'de risk var
    });
  });

  describe('Senaryo 12: Ölçeklendirme Kararı', () => {
    it('Mevcut durum: DSCR 1.8 → Ek borç alabilir mi?', () => {
      const currentCF = 360000;
      const currentDebt = 200000;
      const currentDSCR = calculateDSCR(currentCF, currentDebt);

      expect(currentDSCR).toBe(1.8);

      // Ek 150K borç alınırsa ne olur?
      const newDebt = 350000;
      const projectedDSCR = calculateDSCR(currentCF, newDebt);

      expect(projectedDSCR).toBeCloseTo(1.03, 0.01);
      expect(mapDSCRStatus(projectedDSCR)).toBe('warning');

      // Sonuç: Ek borç riskli, CF artmalı önce
    });

    it('Gelir artışı ile ölçeklendirme: CF +50%, Debt +75% → DSCR kontrolü', () => {
      const baseC = 400000;
      const baseDebt = 200000;

      // Expansion scenario
      const newCF = baseC * 1.5; // %50 artış
      const newDebt = baseDebt * 1.75; // %75 artış

      const newDSCR = calculateDSCR(newCF, newDebt);

      expect(newDSCR).toBeCloseTo(1.71, 0.01); // 600K / 350K
      expect(mapDSCRStatus(newDSCR)).toBe('ok');

      // Expansion yapılabilir ama yakından izlenmeli
    });
  });

  describe('Senaryo 13: Gerçek Banka Değerlendirme Kriterleri', () => {
    it('Tier 1 (Excellent): DSCR ≥ 2.0 → En düşük faiz', () => {
      const dscr = 2.2;
      expect(mapDSCRStatus(dscr)).toBe('ok');
      expect(dscr).toBeGreaterThanOrEqual(2.0);
    });

    it('Tier 2 (Good): 1.5 ≤ DSCR < 2.0 → Normal faiz', () => {
      const dscr = 1.7;
      expect(mapDSCRStatus(dscr)).toBe('ok');
      expect(dscr).toBeGreaterThanOrEqual(1.5);
      expect(dscr).toBeLessThan(2.0);
    });

    it('Tier 3 (Acceptable): 1.25 ≤ DSCR < 1.5 → Yüksek faiz', () => {
      const dscr = 1.35;
      expect(mapDSCRStatus(dscr)).toBe('warning');
      expect(dscr).toBeGreaterThanOrEqual(1.25);
      expect(dscr).toBeLessThan(1.5);
    });

    it('Tier 4 (Risky): 1.0 ≤ DSCR < 1.25 → Ek teminat gerekir', () => {
      const dscr = 1.15;
      expect(mapDSCRStatus(dscr)).toBe('warning');
      expect(dscr).toBeGreaterThanOrEqual(1.0);
      expect(dscr).toBeLessThan(1.25);
    });

    it('Tier 5 (Unacceptable): DSCR < 1.0 → Kredi red', () => {
      const dscr = 0.85;
      expect(mapDSCRStatus(dscr)).toBe('critical');
      expect(dscr).toBeLessThan(1.0);
    });
  });
});
