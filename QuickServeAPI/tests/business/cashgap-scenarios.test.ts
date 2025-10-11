/**
 * Cash Gap Analysis - Real Business Scenarios
 * AR/AP yaşlandırma ve cash gap risk analizi testleri
 */

import { describe, it, expect } from 'vitest';
import { calculateCashGap } from '../../server/modules/dashboard/runway-cashgap';

describe('Cash Gap Analysis - Gerçek İş Senaryoları', () => {
  describe('Senaryo 1: Sağlıklı Cash Flow', () => {
    it('AR > AP: 200K alacak, 120K borç → 80K pozitif gap (LOW RISK)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Alacaklar (Receivables)
                  {
                    type: 'receivable',
                    amount: '80000',
                    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                  }, // 15 gün
                  {
                    type: 'receivable',
                    amount: '60000',
                    due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                  }, // 25 gün
                  {
                    type: 'receivable',
                    amount: '40000',
                    due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                  }, // 45 gün
                  {
                    type: 'receivable',
                    amount: '20000',
                    due_date: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
                  }, // 70 gün

                  // Borçlar (Payables)
                  {
                    type: 'payable',
                    amount: '50000',
                    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '40000',
                    due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '30000',
                    due_date: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap(
        'healthy-cashflow-user',
        6,
        mockDb as any
      );

      expect(result.totalAR).toBe(200000);
      expect(result.totalAP).toBe(120000);
      expect(result.cashGap).toBe(80000); // Pozitif gap
      expect(result.riskLevel).toBe('low');

      // 30 gün içinde AR > AP olmalı
      expect(result.arDueIn30Days).toBeGreaterThan(result.apDueIn30Days);
      expect(result.netGap30Days).toBeGreaterThan(0);
    });
  });

  describe('Senaryo 2: Nakit Sıkışıklığı', () => {
    it('AR < AP: 100K alacak, 180K borç → -80K negatif gap (HIGH RISK)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Az alacak, geç tahsilat
                  {
                    type: 'receivable',
                    amount: '40000',
                    due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '30000',
                    due_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '30000',
                    due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                  },

                  // Çok borç, yakın vadeler
                  {
                    type: 'payable',
                    amount: '80000',
                    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  }, // Acil!
                  {
                    type: 'payable',
                    amount: '60000',
                    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '40000',
                    due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap(
        'cashcrunch-user',
        6,
        mockDb as any
      );

      expect(result.totalAR).toBe(100000);
      expect(result.totalAP).toBe(180000);
      expect(result.cashGap).toBe(-80000); // Negatif gap - tehlikeli!
      expect(result.riskLevel).toBe('high');

      // 30 günde ciddi nakit çıkışı bekleniyor
      expect(result.apDueIn30Days).toBeGreaterThan(result.arDueIn30Days);
      expect(result.netGap30Days).toBeLessThan(0);

      // Öneriler içinde acil aksiyon olmalı
      expect(result.recommendations).toContain('Acil nakit ihtiyacı var');
      expect(result.recommendations.some(r => r.includes('tahsilat'))).toBe(
        true
      );
    });
  });

  describe('Senaryo 3: İnşaat/Proje Bazlı İşletme', () => {
    it('Hakediş ödemeleri ile cash gap yönetimi', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Büyük proje hakediş alacağı (90 gün vadeli)
                  {
                    type: 'receivable',
                    amount: '500000',
                    due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    invoiceNumber: 'HAK-001',
                  },
                  {
                    type: 'receivable',
                    amount: '300000',
                    due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    invoiceNumber: 'HAK-002',
                  },

                  // Malzeme/işçilik borçları (30 gün vadeli)
                  {
                    type: 'payable',
                    amount: '200000',
                    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '150000',
                    due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '100000',
                    due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap(
        'construction-user',
        6,
        mockDb as any
      );

      expect(result.totalAR).toBe(800000);
      expect(result.totalAP).toBe(450000);
      expect(result.cashGap).toBe(350000); // Toplam pozitif

      // Ama 30 günde negatif gap (ödemeler önce geliyor!)
      expect(result.apDueIn30Days).toBeGreaterThan(result.arDueIn30Days);
      expect(result.netGap30Days).toBeLessThan(0);

      // 60 günde daha iyi
      expect(result.netGap60Days).toBeGreaterThan(result.netGap30Days);

      // Risk seviyesi orta-yüksek olmalı (timing riski)
      expect(['medium', 'high']).toContain(result.riskLevel);
      expect(result.recommendations).toContain(
        'Hakediş tahsilatlarını hızlandırın'
      );
    });
  });

  describe('Senaryo 4: E-ticaret İşletmesi', () => {
    it('Hızlı döner sermaye: 150K AR, 180K AP → Tight cash management', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Kredi kartı tahsilatları (kısa vadeli - 7-15 gün)
                  {
                    type: 'receivable',
                    amount: '30000',
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '40000',
                    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '50000',
                    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '30000',
                    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                  },

                  // Tedarikçi ödemeleri (30-45 gün vadeli)
                  {
                    type: 'payable',
                    amount: '60000',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '70000',
                    due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '50000',
                    due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap('ecommerce-user', 6, mockDb as any);

      // 30 günde AR > AP (tahsilatlar daha önce)
      expect(result.arDueIn30Days).toBeGreaterThan(result.apDueIn30Days);
      expect(result.netGap30Days).toBeGreaterThan(0);

      // Toplam gap negatif olsa bile timing avantajı var
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('Senaryo 5: Mevsimsel İşletme (Turizm)', () => {
    it('Sezon sonu: Az AR, çok AP → Kış hazırlığı', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Sezon bitmiş, az alacak kalmış
                  {
                    type: 'receivable',
                    amount: '20000',
                    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '15000',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },

                  // Kış için stok ve hazırlık borçları
                  {
                    type: 'payable',
                    amount: '80000',
                    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '60000',
                    due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '40000',
                    due_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap(
        'seasonal-tourism',
        6,
        mockDb as any
      );

      expect(result.totalAR).toBe(35000);
      expect(result.totalAP).toBe(180000);
      expect(result.cashGap).toBe(-145000); // Ciddi negatif gap
      expect(result.riskLevel).toBe('critical');

      expect(result.recommendations).toContain(
        'Mevsimsel nakit planlaması yapın'
      );
      expect(result.recommendations.some(r => r.includes('kredi'))).toBe(true);
    });
  });

  describe('Senaryo 6: B2B SaaS İşletmesi', () => {
    it('Düzenli aylık gelirler: AR ve AP dengeli', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Aylık abonelik tahsilatları (düzenli)
                  {
                    type: 'receivable',
                    amount: '25000',
                    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '25000',
                    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '25000',
                    due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '25000',
                    due_date: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
                  },

                  // Sunucu, lisans, maaş ödemeleri
                  {
                    type: 'payable',
                    amount: '20000',
                    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '30000',
                    due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '25000',
                    due_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap('saas-company', 6, mockDb as any);

      expect(result.totalAR).toBe(100000);
      expect(result.totalAP).toBe(75000);
      expect(result.cashGap).toBe(25000);
      expect(result.riskLevel).toBe('low');

      // Timeline dengeli olmalı
      expect(result.timeline).toHaveLength(6);
      result.timeline.forEach(period => {
        expect(period.cumulativeCash).toBeDefined();
      });
    });
  });

  describe('Senaryo 7: İmalat Şirketi', () => {
    it('Hammadde ödemeleri vs satış tahsilatları timing gap', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Satış alacakları (60-90 gün vade)
                  {
                    type: 'receivable',
                    amount: '200000',
                    due_date: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '150000',
                    due_date: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '180000',
                    due_date: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
                  },

                  // Hammadde ödemeleri (30 gün vade)
                  {
                    type: 'payable',
                    amount: '120000',
                    due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '100000',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '90000',
                    due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap(
        'manufacturing-user',
        6,
        mockDb as any
      );

      expect(result.totalAR).toBe(530000);
      expect(result.totalAP).toBe(310000);
      expect(result.cashGap).toBe(220000); // Toplam pozitif

      // Ama 30 günde negatif (ödemeler önce!)
      expect(result.apDueIn30Days).toBeGreaterThan(result.arDueIn30Days);
      expect(result.netGap30Days).toBeLessThan(0);

      // 60 günde daha iyi
      expect(result.arDueIn60Days).toBeGreaterThan(0);

      expect(result.riskLevel).toBe('medium');
      expect(result.recommendations).toContain(
        'İşletme sermayesi kredisi değerlendirin'
      );
    });
  });

  describe('Senaryo 8: Perakende Mağaza Zinciri', () => {
    it('Günlük nakit girişi vs aylık kira/maaş ödemeleri', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Günlük kredi kartı tahsilatları (kısa vade)
                  {
                    type: 'receivable',
                    amount: '15000',
                    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '18000',
                    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '20000',
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '22000',
                    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  },

                  // Toplu ödemeler (kira, maaşlar)
                  {
                    type: 'payable',
                    amount: '80000',
                    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                  }, // Maaşlar
                  {
                    type: 'payable',
                    amount: '45000',
                    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  }, // Kiralar
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap('retail-chain', 6, mockDb as any);

      expect(result.totalAR).toBe(75000);
      expect(result.totalAP).toBe(125000);
      expect(result.cashGap).toBe(-50000);

      // 30 günde tamamı kapanacak
      expect(result.arDueIn30Days).toBe(result.totalAR);
      expect(result.apDueIn30Days).toBe(result.totalAP);

      expect(result.riskLevel).toBe('medium');
    });
  });

  describe('Senaryo 9: Danışmanlık Firması', () => {
    it('Proje bazlı gelirler: Büyük faturalar, düzenli küçük giderler', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Büyük proje faturaları (60 gün vade)
                  {
                    type: 'receivable',
                    amount: '120000',
                    due_date: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
                    invoiceNumber: 'PRJ-001',
                  },
                  {
                    type: 'receivable',
                    amount: '90000',
                    due_date: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
                    invoiceNumber: 'PRJ-002',
                  },

                  // Küçük düzenli giderler (kısa vade)
                  {
                    type: 'payable',
                    amount: '15000',
                    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  }, // Ofis
                  {
                    type: 'payable',
                    amount: '12000',
                    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                  }, // Yazılım
                  {
                    type: 'payable',
                    amount: '8000',
                    due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                  }, // Diğer
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap(
        'consulting-firm',
        6,
        mockDb as any
      );

      expect(result.totalAR).toBe(210000);
      expect(result.totalAP).toBe(35000);
      expect(result.cashGap).toBe(175000); // Çok pozitif

      // Ama 30 günde AR az, AP var
      expect(result.arDueIn30Days).toBeLessThan(result.apDueIn30Days);
      expect(result.netGap30Days).toBeLessThan(0);

      // 60 günde çok daha iyi
      expect(result.netGap60Days).toBeGreaterThan(100000);

      expect(result.riskLevel).toBe('low');
    });
  });

  describe('Senaryo 10: Kritik Durum - Gecikmiş Alacaklar', () => {
    it('Vadesi geçmiş alacaklar: 200K AR (120 gün gecikmiş) + 150K AP (yakın)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                const now = Date.now();
                return Promise.resolve([
                  // Vadesi çoktan geçmiş alacaklar (tahsilat riski yüksek)
                  {
                    type: 'receivable',
                    amount: '80000',
                    due_date: new Date(now - 120 * 24 * 60 * 60 * 1000),
                  }, // 120 gün gecikmiş!
                  {
                    type: 'receivable',
                    amount: '70000',
                    due_date: new Date(now - 90 * 24 * 60 * 60 * 1000),
                  }, // 90 gün gecikmiş
                  {
                    type: 'receivable',
                    amount: '50000',
                    due_date: new Date(now - 60 * 24 * 60 * 60 * 1000),
                  }, // 60 gün gecikmiş

                  // Acil ödenecek borçlar
                  {
                    type: 'payable',
                    amount: '70000',
                    due_date: new Date(now + 5 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '50000',
                    due_date: new Date(now + 10 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '30000',
                    due_date: new Date(now + 15 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap(
        'overdue-receivables',
        6,
        mockDb as any
      );

      expect(result.totalAR).toBe(200000);
      expect(result.totalAP).toBe(150000);
      expect(result.cashGap).toBe(50000); // Görünürde pozitif

      // Ama vadesi geçmiş alacaklar 30 gün içinde sayılmamalı
      expect(result.arDueIn30Days).toBe(0); // Hepsi gecikmiş
      expect(result.apDueIn30Days).toBe(150000); // Hepsi yakın vadede
      expect(result.netGap30Days).toBe(-150000); // Kritik durum!

      expect(result.riskLevel).toBe('critical');
      expect(result.recommendations).toContain(
        'Gecikmiş alacaklar için hukuki süreç başlatın'
      );
      expect(result.recommendations).toContain('Acil nakit ihtiyacı var');
    });
  });

  describe('Senaryo 11: İhracat Şirketi', () => {
    it('Döviz bazlı AR, TRY bazlı AP → Kur riski', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // USD bazlı alacaklar (döviz kuru: 33 TRY)
                  {
                    type: 'receivable',
                    amount: '165000',
                    due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                    currency: 'USD',
                  }, // 5K USD
                  {
                    type: 'receivable',
                    amount: '198000',
                    due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    currency: 'USD',
                  }, // 6K USD

                  // TRY bazlı borçlar (yerel giderler)
                  {
                    type: 'payable',
                    amount: '120000',
                    due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                    currency: 'TRY',
                  },
                  {
                    type: 'payable',
                    amount: '80000',
                    due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                    currency: 'TRY',
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap('export-company', 6, mockDb as any);

      expect(result.totalAR).toBe(363000); // USD → TRY
      expect(result.totalAP).toBe(200000);
      expect(result.cashGap).toBe(163000);

      // Döviz bazlı alacaklar geç, TRY borçlar erken
      expect(result.apDueIn30Days).toBeGreaterThan(result.arDueIn30Days);
      expect(
        result.recommendations.some(
          r => r.includes('döviz') || r.includes('kur')
        )
      ).toBe(true);
    });
  });

  describe('Senaryo 12: Holding Yapısı', () => {
    it('Birden fazla şirket: Konsolide cash gap analizi', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Şirket A alacakları
                  {
                    type: 'receivable',
                    amount: '100000',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    company: 'A',
                  },
                  // Şirket B alacakları
                  {
                    type: 'receivable',
                    amount: '80000',
                    due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                    company: 'B',
                  },
                  // Şirket C alacakları
                  {
                    type: 'receivable',
                    amount: '120000',
                    due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    company: 'C',
                  },

                  // Şirket A borçları
                  {
                    type: 'payable',
                    amount: '60000',
                    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                    company: 'A',
                  },
                  // Şirket B borçları
                  {
                    type: 'payable',
                    amount: '50000',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    company: 'B',
                  },
                  // Şirket C borçları
                  {
                    type: 'payable',
                    amount: '70000',
                    due_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
                    company: 'C',
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap('holding-user', 6, mockDb as any);

      expect(result.totalAR).toBe(300000);
      expect(result.totalAP).toBe(180000);
      expect(result.cashGap).toBe(120000);

      // Timeline her ay için projeksiyon
      expect(result.timeline.length).toBeGreaterThan(0);

      // İlk ayda nakit çıkışı olabilir
      const firstPeriod = result.timeline[0];
      expect(firstPeriod.netCashFlow).toBeDefined();
    });
  });

  describe('Edge Cases - Özel Durumlar', () => {
    it('Tüm alacaklar tahsil edildi → 0 AR, sadece AP var', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  // Hiç alacak yok
                  {
                    type: 'payable',
                    amount: '50000',
                    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '30000',
                    due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap('no-ar-user', 6, mockDb as any);

      expect(result.totalAR).toBe(0);
      expect(result.totalAP).toBe(80000);
      expect(result.cashGap).toBe(-80000);
      expect(result.riskLevel).toBe('high');
    });

    it('Hiç AR/AP yok → 0 gap (NEUTRAL)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => Promise.resolve([]),
          }),
        }),
      };

      const result = await calculateCashGap('no-arap-user', 6, mockDb as any);

      expect(result.totalAR).toBe(0);
      expect(result.totalAP).toBe(0);
      expect(result.cashGap).toBe(0);
      expect(result.riskLevel).toBe('low');
    });

    it('Çok büyük tutarlar: 10M+ AR/AP', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'ar_ap_items') {
                return Promise.resolve([
                  {
                    type: 'receivable',
                    amount: '5000000',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'receivable',
                    amount: '6000000',
                    due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                  },

                  {
                    type: 'payable',
                    amount: '4000000',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                  {
                    type: 'payable',
                    amount: '5000000',
                    due_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
                  },
                ]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      };

      const result = await calculateCashGap(
        'enterprise-user',
        6,
        mockDb as any
      );

      expect(result.totalAR).toBe(11000000);
      expect(result.totalAP).toBe(9000000);
      expect(result.cashGap).toBe(2000000);

      // Büyük tutarlarla hesaplama doğru çalışmalı
      expect(result.netGap30Days).toBeDefined();
      expect(isNaN(result.cashGap)).toBe(false);
    });
  });
});
