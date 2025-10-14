import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { logger } from '../../../utils/logger';
/**
 * Hesapları kategorilere göre gruplandırır
 */
function categorizeAccounts(accounts) {
    const breakdown = {
        company: { bank: 0, cash: 0, credit: 0, invest: 0 },
        personal: { bank: 0, cash: 0, credit: 0, invest: 0 },
        total: { bank: 0, cash: 0, credit: 0, invest: 0 },
    };
    accounts.forEach(account => {
        const targetCategory = account.type === 'company' ? breakdown.company : breakdown.personal;
        // Ana hesap bakiyesi - bank kategorisine ekle
        const balance = parseFloat(account.balance || '0');
        targetCategory.bank += balance;
        breakdown.total.bank += balance;
        // Alt hesapları analiz et
        if (account.subAccounts) {
            try {
                const subAccounts = JSON.parse(account.subAccounts);
                subAccounts.forEach(subAccount => {
                    const sa = subAccount;
                    switch (sa.type) {
                        case 'checking':
                            // Vadesiz hesap - cash kategorisi
                            if (sa.balance) {
                                targetCategory.cash += sa.balance;
                                breakdown.total.cash += sa.balance;
                            }
                            break;
                        case 'creditCard':
                            // Kredi kartı - credit kategorisi (negatif bakiye)
                            if (sa.used) {
                                const creditAmount = sa.used;
                                targetCategory.credit += creditAmount;
                                breakdown.total.credit += creditAmount;
                            }
                            break;
                        case 'loan':
                            // Kredi - credit kategorisi
                            if (sa.principalRemaining) {
                                targetCategory.credit += sa.principalRemaining;
                                breakdown.total.credit += sa.principalRemaining;
                            }
                            break;
                        case 'kmh':
                            // KMH - credit kategorisi (negatif bakiye)
                            if (sa.used) {
                                targetCategory.credit += sa.used;
                                breakdown.total.credit += sa.used;
                            }
                            break;
                        case 'deposit':
                            // Vadeli hesap - invest kategorisi
                            if (sa.balance) {
                                targetCategory.invest += sa.balance;
                                breakdown.total.invest += sa.balance;
                            }
                            break;
                        default:
                            // Bilinmeyen alt hesap tipleri için hiçbir işlem yapma
                            break;
                    }
                });
            }
            catch (error) {
                logger.warn('Sub-account parsing error:', error);
            }
        }
    });
    return breakdown;
}
/**
 * Breakdown verilerini tablo formatına dönüştürür
 */
export function formatBreakdownTable(breakdown) {
    const categories = [
        { key: 'bank', label: 'Banka Hesapları' },
        { key: 'cash', label: 'Nakit/Vadesiz' },
        { key: 'credit', label: 'Kredi/Borç' },
        { key: 'invest', label: 'Yatırım/Vadeli' },
    ];
    const calculateTotal = (category) => {
        return (Math.abs(category.bank) +
            Math.abs(category.cash) +
            Math.abs(category.credit) +
            Math.abs(category.invest));
    };
    const formatCategory = (category, type) => {
        const total = calculateTotal(category);
        return categories.map(cat => {
            const amount = category[cat.key];
            const percentage = total > 0 ? (Math.abs(amount) / total) * 100 : 0;
            return {
                category: cat.label,
                amount,
                formattedAmount: formatCurrency(amount, 'TRY'),
                percentage: Math.round(percentage * 100) / 100,
            };
        });
    };
    return {
        company: formatCategory(breakdown.company, 'company'),
        personal: formatCategory(breakdown.personal, 'personal'),
        total: formatCategory(breakdown.total, 'total'),
    };
}
/**
 * Ana breakdown hesaplama fonksiyonu
 */
export function calculateConsolidationBreakdown(accounts) {
    const breakdown = categorizeAccounts(accounts);
    const table = formatBreakdownTable(breakdown);
    // Özet hesaplamalar
    const totalAssets = breakdown.total.bank + breakdown.total.cash + breakdown.total.invest;
    const totalLiabilities = Math.abs(breakdown.total.credit);
    const netWorth = totalAssets - totalLiabilities;
    const companyTotal = breakdown.company.bank +
        breakdown.company.cash +
        breakdown.company.invest -
        Math.abs(breakdown.company.credit);
    const personalTotal = breakdown.personal.bank +
        breakdown.personal.cash +
        breakdown.personal.invest -
        Math.abs(breakdown.personal.credit);
    const grandTotal = companyTotal + personalTotal;
    return {
        breakdown,
        table,
        summary: {
            totalAssets: Math.round(totalAssets * 100) / 100,
            totalLiabilities: Math.round(totalLiabilities * 100) / 100,
            netWorth: Math.round(netWorth * 100) / 100,
            companyRatio: grandTotal > 0
                ? Math.round((companyTotal / grandTotal) * 10000) / 100
                : 0,
            personalRatio: grandTotal > 0
                ? Math.round((personalTotal / grandTotal) * 10000) / 100
                : 0,
        },
    };
}
/**
 * Breakdown verilerini grafik için hazırlar
 */
export function prepareBreakdownChartData(breakdown) {
    const categories = ['Banka', 'Nakit', 'Kredi', 'Yatırım'];
    return {
        labels: categories,
        datasets: [
            {
                label: 'Şirket',
                data: [
                    breakdown.company.bank,
                    breakdown.company.cash,
                    Math.abs(breakdown.company.credit),
                    breakdown.company.invest,
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
            {
                label: 'Kişisel',
                data: [
                    breakdown.personal.bank,
                    breakdown.personal.cash,
                    Math.abs(breakdown.personal.credit),
                    breakdown.personal.invest,
                ],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
            },
        ],
    };
}
