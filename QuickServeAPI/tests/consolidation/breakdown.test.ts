import { describe, test, expect } from 'vitest';
import { calculateConsolidationBreakdown, prepareBreakdownChartData } from '../../server/src/modules/consolidation/breakdown';

describe('Consolidation Breakdown', () => {
  const mockAccounts = [
    {
      id: '1',
      userId: 'user1',
      name: 'Şirket Vadesiz',
      type: 'company', // Şirket hesabı
      bankName: 'Ziraat Bank',
      accountNumber: '1234567890',
      balance: '100000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      userId: 'user1',
      name: 'Şirket Vadeli',
      type: 'company', // Şirket hesabı
      bankName: 'İş Bank',
      accountNumber: '0987654321',
      balance: '200000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      userId: 'user1',
      name: 'Kişisel Vadesiz',
      type: 'personal', // Kişisel hesap
      bankName: 'Garanti BBVA',
      accountNumber: '1111111111',
      balance: '50000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      userId: 'user1',
      name: 'Kredi Kartı',
      type: 'personal', // Kişisel hesap
      bankName: 'Yapı Kredi',
      accountNumber: '2222222222',
      balance: '-25000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      userId: 'user1',
      name: 'Yatırım Hesabı',
      type: 'company', // Şirket hesabı
      bankName: 'Akbank',
      accountNumber: '3333333333',
      balance: '150000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as any[];

  test('calculateConsolidationBreakdown - doğru kategorilere ayırma', () => {
    const result = calculateConsolidationBreakdown(mockAccounts);

    // Şirket hesapları kontrolü (hesap 1, 2, 5)
    expect(result.breakdown.company.bank).toBe(450000); // 100000 + 200000 + 150000
    expect(result.breakdown.company.cash).toBe(0); // subAccounts yok
    expect(result.breakdown.company.credit).toBe(0);
    expect(result.breakdown.company.invest).toBe(0); // subAccounts yok

    // Kişisel hesaplar kontrolü (hesap 3, 4)
    expect(result.breakdown.personal.bank).toBe(25000); // 50000 + (-25000)
    expect(result.breakdown.personal.cash).toBe(0); // subAccounts yok
    expect(result.breakdown.personal.credit).toBe(0); // subAccounts yok
    expect(result.breakdown.personal.invest).toBe(0); // subAccounts yok
  });

  test('calculateConsolidationBreakdown - tablo verilerini doğru oluşturma', () => {
    const result = calculateConsolidationBreakdown(mockAccounts);

    // Table is an object with company, personal, total arrays
    expect(result.table.company).toHaveLength(4); // 4 categories
    expect(result.table.personal).toHaveLength(4); // 4 categories
    expect(result.table.total).toHaveLength(4); // 4 categories
    
    // Şirket banka kontrolü
    const companyBank = result.table.company.find(item => 
      item.category === 'Banka Hesapları'
    );
    expect(companyBank).toBeDefined();
    expect(companyBank?.amount).toBe(450000); // 100000 + 200000 + 150000
    expect(companyBank?.percentage).toBeCloseTo(100, 0); // All company money is in bank

    // Kişisel banka kontrolü
    const personalBank = result.table.personal.find(item => 
      item.category === 'Banka Hesapları'
    );
    expect(personalBank).toBeDefined();
    expect(personalBank?.amount).toBe(25000); // 50000 + (-25000)
  });

  test('calculateConsolidationBreakdown - özet hesaplamaları', () => {
    const result = calculateConsolidationBreakdown(mockAccounts);

    expect(result.summary.totalAssets).toBe(475000); // 450000 + 25000
    expect(result.summary.totalLiabilities).toBe(0); // No credit in subAccounts
    expect(result.summary.netWorth).toBe(475000); // 475000 - 0
    expect(result.summary.companyRatio).toBeCloseTo(94.74, 1); // 450000/475000 * 100
    expect(result.summary.personalRatio).toBeCloseTo(5.26, 1); // 25000/475000 * 100
  });

  test('prepareBreakdownChartData - grafik verilerini doğru oluşturma', () => {
    const breakdown = {
      company: {
        bank: 300000,
        cash: 0,
        credit: 0,
        invest: 150000
      },
      personal: {
        bank: 50000,
        cash: 0,
        credit: 25000,
        invest: 0
      },
      total: {
        bank: 350000,
        cash: 0,
        credit: 25000,
        invest: 150000
      }
    };

    const chartData = prepareBreakdownChartData(breakdown);

    // Chart data has labels and datasets
    expect(chartData.labels).toHaveLength(4); // 4 categories
    expect(chartData.datasets).toHaveLength(2); // Company and Personal

    // Check company dataset
    const companyDataset = chartData.datasets[0];
    expect(companyDataset.label).toBe('Şirket');
    expect(companyDataset.data[0]).toBe(300000); // Bank
    expect(companyDataset.data[3]).toBe(150000); // Investment

    // Check personal dataset
    const personalDataset = chartData.datasets[1];
    expect(personalDataset.label).toBe('Kişisel');
    expect(personalDataset.data[0]).toBe(50000); // Bank
    expect(personalDataset.data[2]).toBe(25000); // Credit (absolute value)
  });

  test('boş hesap listesi ile çalışma', () => {
    const result = calculateConsolidationBreakdown([]);

    expect(result.breakdown.company.bank).toBe(0);
    expect(result.breakdown.company.cash).toBe(0);
    expect(result.breakdown.company.credit).toBe(0);
    expect(result.breakdown.company.invest).toBe(0);
    expect(result.breakdown.personal.bank).toBe(0);
    expect(result.breakdown.personal.cash).toBe(0);
    expect(result.breakdown.personal.credit).toBe(0);
    expect(result.breakdown.personal.invest).toBe(0);
    expect(result.table.company).toHaveLength(4); // Always 4 categories
    expect(result.summary.totalAssets).toBe(0);
    expect(result.summary.netWorth).toBe(0);
  });

  test('negatif bakiyeli hesaplar', () => {
    const negativeAccounts = [
      {
        id: '1',
        userId: 'user1',
        name: 'Kredi Kartı',
        type: 'personal', // Personal account type
        bankName: 'Test Bank',
        accountNumber: '123',
        balance: '-50000',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        userId: 'user1',
        name: 'Kredi Kartı 2',
        type: 'personal', // Personal account type
        bankName: 'Test Bank 2',
        accountNumber: '456',
        balance: '-25000',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ] as any[];

    const result = calculateConsolidationBreakdown(negativeAccounts);

    // Negatif bakiyeler bank kategorisinde görünür (subAccounts olmadığı için)
    expect(result.breakdown.personal.bank).toBe(-75000); // -50000 + (-25000)
  });
});
