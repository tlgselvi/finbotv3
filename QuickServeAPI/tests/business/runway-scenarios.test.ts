/**
 * Runway Analysis - Real Business Scenarios
 * Gerçek iş senaryolarına göre runway hesaplama testleri
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateRunway } from '../../server/modules/dashboard/runway-cashgap';
import { MockFactory } from '../utils/mock-factory';

describe('Runway Analysis - Gerçek İş Senaryoları', () => {
  describe('Senaryo 1: Başlangıç Aşaması Startup', () => {
    it('50K nakit, 15K/ay harcama → 3.3 ay runway (WARNING)', async () => {
      // Mock data: Yeni başlamış bir startup
      let callCount = 0;
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: (condition: any) => {
              callCount++;
              if (callCount === 1) {
                // First call: accounts
                return Promise.resolve([
                  { balance: 50000, user_id: 'startup-user-1', currency: 'TRY', type: 'company' }
                ]);
              } else {
                // Second call: transactions
                return Promise.resolve([
                  // Son 6 ayda toplam 90K harcama (15K/ay ortalama)
                  { amount: -15000, user_id: 'startup-user-1', created_at: new Date('2024-09-01').toISOString() },
                  { amount: -14500, user_id: 'startup-user-1', created_at: new Date('2024-08-01').toISOString() },
                  { amount: -15200, user_id: 'startup-user-1', created_at: new Date('2024-07-01').toISOString() },
                  { amount: -15800, user_id: 'startup-user-1', created_at: new Date('2024-06-01').toISOString() },
                  { amount: -14200, user_id: 'startup-user-1', created_at: new Date('2024-05-01').toISOString() },
                  { amount: -15300, user_id: 'startup-user-1', created_at: new Date('2024-04-01').toISOString() }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('startup-user-1', 12, mockDb as any);

      expect(result.currentCash).toBeCloseTo(50000, 0);
      expect(result.monthlyExpenses).toBeCloseTo(15000, 500); // ~15K/month
      expect(result.runwayMonths).toBeCloseTo(3.3, 0.5);
      expect(result.runwayDays).toBeCloseTo(100, 15);
      expect(result.status).toBe('warning');
      expect(result.recommendations.some(r => r.includes('nakit'))).toBe(true);
    });

    it('30K nakit, 12K/ay harcama → 2.5 ay runway (CRITICAL)', async () => {
      let callCount = 0;
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: (condition: any) => {
              callCount++;
              if (callCount === 1) {
                return Promise.resolve([
                  { balance: 30000, user_id: 'critical-user-1', currency: 'TRY', type: 'company' }
                ]);
              } else {
                return Promise.resolve([
                  { amount: -12000, user_id: 'critical-user-1', created_at: new Date('2024-09-01').toISOString() },
                  { amount: -12000, user_id: 'critical-user-1', created_at: new Date('2024-08-01').toISOString() },
                  { amount: -12000, user_id: 'critical-user-1', created_at: new Date('2024-07-01').toISOString() },
                  { amount: -12000, user_id: 'critical-user-1', created_at: new Date('2024-06-01').toISOString() },
                  { amount: -12000, user_id: 'critical-user-1', created_at: new Date('2024-05-01').toISOString() },
                  { amount: -12000, user_id: 'critical-user-1', created_at: new Date('2024-04-01').toISOString() }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('critical-user-1', 12, mockDb as any);

      expect(result.runwayMonths).toBeLessThan(3);
      expect(result.status).toBe('critical');
      expect(result.recommendations.length).toBeGreaterThan(1);
      expect(result.recommendations.some(r => r.toLowerCase().includes('nakit') || r.toLowerCase().includes('acil'))).toBe(true);
    });
  });

  describe('Senaryo 2: Büyüme Aşaması Şirket', () => {
    it('300K nakit, 35K/ay harcama → 8.5 ay runway (HEALTHY)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '200000', currency: 'TRY', type: 'company' },
                  { balance: '100000', currency: 'TRY', type: 'company' }
                ]);
              } else {
                return Promise.resolve([
                  { amount: '-35000', created_at: new Date('2024-09-01') },
                  { amount: '-34500', created_at: new Date('2024-08-01') },
                  { amount: '-35800', created_at: new Date('2024-07-01') },
                  { amount: '-35200', created_at: new Date('2024-06-01') },
                  { amount: '-34800', created_at: new Date('2024-05-01') },
                  { amount: '-35700', created_at: new Date('2024-04-01') }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('growth-user-1', 12, mockDb as any);

      expect(result.currentCash).toBeCloseTo(300000, 0);
      expect(result.monthlyExpenses).toBeCloseTo(35000, 1000);
      expect(result.runwayMonths).toBeCloseTo(8.5, 0.5);
      expect(result.status).toBe('healthy');
      expect(result.monthlyBreakdown).toHaveLength(12);
      
      // İlk ay projeksiyon kontrolü
      expect(result.monthlyBreakdown[0].projectedCash).toBeCloseTo(265000, 5000); // 300K - 35K
    });

    it('Mevsimsel harcama değişkenliği ile runway hesaplama', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '180000', currency: 'TRY', type: 'company' }
                ]);
              } else {
                // Mevsimsel değişkenlik: kış ayları daha yüksek harcama
                return Promise.resolve([
                  { amount: '-45000', created_at: new Date('2024-09-01') }, // Sonbahar
                  { amount: '-48000', created_at: new Date('2024-08-01') }, // Yaz
                  { amount: '-52000', created_at: new Date('2024-07-01') }, // Yaz peak
                  { amount: '-40000', created_at: new Date('2024-06-01') }, // Yaz başı
                  { amount: '-38000', created_at: new Date('2024-05-01') }, // İlkbahar
                  { amount: '-37000', created_at: new Date('2024-04-01') }  // İlkbahar
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('seasonal-user-1', 12, mockDb as any);

      // Ortalama harcama: 43.3K/ay
      expect(result.monthlyExpenses).toBeCloseTo(43333, 2000);
      expect(result.runwayMonths).toBeCloseTo(4.15, 0.5);
      expect(result.status).toBe('warning');
    });
  });

  describe('Senaryo 3: Karlı İşletme', () => {
    it('500K nakit, 25K/ay harcama → 20 ay runway (HEALTHY)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '300000', currency: 'TRY', type: 'company' },
                  { balance: '150000', currency: 'USD', type: 'company' },
                  { balance: '50000', currency: 'EUR', type: 'company' }
                ]);
              } else {
                return Promise.resolve([
                  { amount: '-25000', created_at: new Date('2024-09-01') },
                  { amount: '-24500', created_at: new Date('2024-08-01') },
                  { amount: '-25500', created_at: new Date('2024-07-01') },
                  { amount: '-25200', created_at: new Date('2024-06-01') },
                  { amount: '-24800', created_at: new Date('2024-05-01') },
                  { amount: '-25000', created_at: new Date('2024-04-01') }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('profitable-user-1', 12, mockDb as any);

      expect(result.runwayMonths).toBeGreaterThan(12);
      expect(result.status).toBe('healthy');
      expect(result.recommendations.length).toBe(0); // Sağlıklı durumda tavsiye az
    });
  });

  describe('Senaryo 4: Kriz Durumu', () => {
    it('10K nakit, 20K/ay harcama → 0.5 ay runway (CRITICAL)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '10000', currency: 'TRY', type: 'company' }
                ]);
              } else {
                return Promise.resolve([
                  { amount: '-20000', created_at: new Date('2024-09-01') },
                  { amount: '-19500', created_at: new Date('2024-08-01') },
                  { amount: '-20500', created_at: new Date('2024-07-01') },
                  { amount: '-20200', created_at: new Date('2024-06-01') },
                  { amount: '-19800', created_at: new Date('2024-05-01') },
                  { amount: '-20000', created_at: new Date('2024-04-01') }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('crisis-user-1', 12, mockDb as any);

      expect(result.runwayMonths).toBeLessThan(1);
      expect(result.runwayDays).toBeLessThan(30);
      expect(result.status).toBe('critical');
      expect(result.recommendations).toContain('Acil nakit girişi gerekli');
      expect(result.recommendations).toContain('Harcamaları %50 azaltın');
    });

    it('Negatif nakit pozisyonu → 0 runway (CRITICAL)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '-15000', currency: 'TRY', type: 'company' }
                ]);
              } else {
                return Promise.resolve([
                  { amount: '-10000', created_at: new Date('2024-09-01') }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('negative-user-1', 12, mockDb as any);

      expect(result.currentCash).toBeLessThanOrEqual(0);
      expect(result.runwayMonths).toBe(0);
      expect(result.runwayDays).toBe(0);
      expect(result.status).toBe('critical');
      expect(result.recommendations.length).toBeGreaterThan(3);
    });
  });

  describe('Senaryo 5: Çoklu Para Birimi', () => {
    it('TRY + USD + EUR hesaplar → Doğru toplam nakit', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '100000', currency: 'TRY', type: 'company' },
                  { balance: '5000', currency: 'USD', type: 'company' }, // ~165K TRY
                  { balance: '3000', currency: 'EUR', type: 'company' }  // ~105K TRY
                ]);
              } else {
                return Promise.resolve([
                  { amount: '-30000', created_at: new Date('2024-09-01') } // TRY bazlı
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('multicurrency-user-1', 12, mockDb as any);

      // Toplam nakit (döviz kuru varsayımı ile)
      expect(result.currentCash).toBeGreaterThan(100000); // En az TRY kısmı
      expect(result.monthlyBreakdown[0]).toBeDefined();
    });
  });

  describe('Senaryo 6: Şirket vs Kişisel Hesaplar', () => {
    it('Şirket ve kişisel hesapları ayrı değerlendirme', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '200000', currency: 'TRY', type: 'company' },
                  { balance: '50000', currency: 'TRY', type: 'personal' } // Kişisel hesap
                ]);
              } else {
                return Promise.resolve([
                  { amount: '-40000', created_at: new Date('2024-09-01') } // Şirket harcaması
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('mixed-user-1', 12, mockDb as any);

      // Toplam nakit 250K ama runway şirket harcamalarına göre hesaplanmalı
      expect(result.currentCash).toBe(250000);
      expect(result.monthlyExpenses).toBeCloseTo(40000, 5000);
    });
  });

  describe('Senaryo 7: Hızlı Büyüme Senaryosu', () => {
    it('Artan harcama trendi ile runway projeksiyonu', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '400000', currency: 'TRY', type: 'company' }
                ]);
              } else {
                // Her ay %10 artan harcamalar
                return Promise.resolve([
                  { amount: '-50000', created_at: new Date('2024-09-01') }, // En yüksek
                  { amount: '-45000', created_at: new Date('2024-08-01') },
                  { amount: '-41000', created_at: new Date('2024-07-01') },
                  { amount: '-37000', created_at: new Date('2024-06-01') },
                  { amount: '-34000', created_at: new Date('2024-05-01') },
                  { amount: '-31000', created_at: new Date('2024-04-01') }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('growth-trend-user-1', 12, mockDb as any);

      // Ortalama ~40K/ay harcama
      expect(result.monthlyExpenses).toBeCloseTo(39666, 2000);
      expect(result.runwayMonths).toBeCloseTo(10, 1);
      
      // Son aylarda runway azalmalı (harcama artışı nedeniyle)
      const lastMonth = result.monthlyBreakdown[11];
      expect(lastMonth.netCash).toBeLessThan(result.currentCash);
    });
  });

  describe('Senaryo 8: Sıfır Harcama (Pasif Gelir)', () => {
    it('100K nakit, 0 harcama → Sonsuz runway (HEALTHY)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '100000', currency: 'TRY', type: 'company' }
                ]);
              } else {
                return Promise.resolve([]); // Hiç harcama yok
              }
            }
          })
        })
      };

      const result = await calculateRunway('passive-user-1', 12, mockDb as any);

      expect(result.monthlyExpenses).toBe(0);
      expect(result.runwayMonths).toBe(Infinity);
      expect(result.runwayDays).toBe(Infinity);
      expect(result.status).toBe('healthy');
    });
  });

  describe('Senaryo 9: Küçük İşletme (SME)', () => {
    it('120K nakit, 18K/ay harcama → 6.6 ay runway (HEALTHY)', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '80000', currency: 'TRY', type: 'company' }, // İşletme hesabı
                  { balance: '40000', currency: 'TRY', type: 'company' }  // Vadeli mevduat
                ]);
              } else {
                // Düzenli aylık harcamalar
                return Promise.resolve([
                  { amount: '-18000', created_at: new Date('2024-09-01') }, // Maaşlar + kira
                  { amount: '-17800', created_at: new Date('2024-08-01') },
                  { amount: '-18200', created_at: new Date('2024-07-01') },
                  { amount: '-18100', created_at: new Date('2024-06-01') },
                  { amount: '-17900', created_at: new Date('2024-05-01') },
                  { amount: '-18000', created_at: new Date('2024-04-01') }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('sme-user-1', 12, mockDb as any);

      expect(result.currentCash).toBe(120000);
      expect(result.monthlyExpenses).toBeCloseTo(18000, 200);
      expect(result.runwayMonths).toBeCloseTo(6.6, 0.5);
      expect(result.status).toBe('healthy');
      
      // 6. ay nakit pozisyonu pozitif olmalı
      expect(result.monthlyBreakdown[5].projectedCash).toBeGreaterThan(0);
      
      // 7. ay kritik seviyeye yaklaşmalı
      if (result.monthlyBreakdown[6]) {
        expect(result.monthlyBreakdown[6].projectedCash).toBeLessThan(20000);
      }
    });
  });

  describe('Senaryo 10: Franchise Operasyonu', () => {
    it('Birden fazla lokasyon ile toplam runway', async () => {
      const mockDb = {
        select: () => ({
          from: (table: any) => ({
            where: () => {
              if (table.name === 'accounts') {
                return Promise.resolve([
                  { balance: '150000', currency: 'TRY', type: 'company', name: 'Şube 1 Vadesiz' },
                  { balance: '120000', currency: 'TRY', type: 'company', name: 'Şube 2 Vadesiz' },
                  { balance: '80000', currency: 'TRY', type: 'company', name: 'Merkez Hesap' }
                ]);
              } else {
                return Promise.resolve([
                  // Şube 1 harcamaları
                  { amount: '-22000', created_at: new Date('2024-09-01'), category: 'Şube 1' },
                  { amount: '-21500', created_at: new Date('2024-08-01'), category: 'Şube 1' },
                  // Şube 2 harcamaları
                  { amount: '-18000', created_at: new Date('2024-09-01'), category: 'Şube 2' },
                  { amount: '-17800', created_at: new Date('2024-08-01'), category: 'Şube 2' },
                  // Merkez harcamalar
                  { amount: '-15000', created_at: new Date('2024-09-01'), category: 'Genel' },
                  { amount: '-14800', created_at: new Date('2024-08-01'), category: 'Genel' }
                ]);
              }
            }
          })
        })
      };

      const result = await calculateRunway('franchise-user-1', 12, mockDb as any);

      expect(result.currentCash).toBe(350000);
      // Toplam harcama: ~109K/ay (22K + 18K + 15K) × 6 ay / 6
      expect(result.monthlyExpenses).toBeCloseTo(54550, 3000);
      expect(result.runwayMonths).toBeCloseTo(6.4, 1);
    });
  });
});

