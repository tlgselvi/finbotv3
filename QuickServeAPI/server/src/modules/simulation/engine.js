// @ts-nocheck - Temporary fix for TypeScript errors
import { formatCurrency } from '../../../lib/utils/formatCurrency';
/**
 * Simülasyon motoru - nakit, borç ve net değer projeksiyonu
 */
export class SimulationEngine {
    baseCash;
    baseDebt;
    baseNetWorth;
    constructor(baseCash, baseDebt) {
        this.baseCash = baseCash;
        this.baseDebt = baseDebt;
        this.baseNetWorth = baseCash - baseDebt;
    }
    /**
     * Ana simülasyon fonksiyonu
     */
    runSimulation(parameters) {
        const projections = this.generateProjections(parameters);
        const cashDeficitMonth = this.findCashDeficitMonth(projections);
        const summary = this.generateSummary(projections, cashDeficitMonth, parameters);
        const totalCashChange = projections[projections.length - 1].cash - this.baseCash;
        const totalDebtChange = projections[projections.length - 1].debt - this.baseDebt;
        const totalNetWorthChange = projections[projections.length - 1].netWorth - this.baseNetWorth;
        return {
            projections,
            summary,
            cashDeficitMonth,
            totalCashChange,
            totalDebtChange,
            totalNetWorthChange,
            formattedSummary: this.formatSummary(summary, cashDeficitMonth, parameters.horizonMonths),
        };
    }
    /**
     * Aylık projeksiyonları hesaplar
     */
    generateProjections(parameters) {
        const projections = [];
        let currentCash = this.baseCash;
        let currentDebt = this.baseDebt;
        for (let month = 1; month <= parameters.horizonMonths; month++) {
            // Döviz etkisi (döviz pozisyonu varsayımı: %15)
            const fxEffect = this.calculateFxEffect(currentCash, parameters.fxDelta, month);
            // Faiz etkisi (nakit getirisi ve borç faizi)
            const rateEffect = this.calculateRateEffect(currentCash, currentDebt, parameters.rateDelta, month);
            // Enflasyon etkisi (satın alma gücü kaybı)
            const inflationEffect = this.calculateInflationEffect(currentCash, parameters.inflationDelta, month);
            // Aylık gelir/gider varsayımı (sabit)
            const monthlyIncome = 50000; // Aylık gelir varsayımı
            const monthlyExpenses = 35000; // Aylık gider varsayımı
            const monthlyNet = monthlyIncome - monthlyExpenses;
            // Nakit güncelleme
            currentCash =
                currentCash + fxEffect + rateEffect - inflationEffect + monthlyNet;
            // Borç güncelleme (faiz etkisi ile)
            currentDebt = currentDebt + rateEffect * 0.3; // Borç faiz etkisi
            // Net değer hesaplama
            const netWorth = currentCash - currentDebt;
            projections.push({
                month,
                cash: Math.round(currentCash),
                debt: Math.round(currentDebt),
                netWorth: Math.round(netWorth),
            });
        }
        return projections;
    }
    /**
     * Döviz kuru etkisini hesaplar
     */
    calculateFxEffect(cash, fxDelta, month) {
        // Döviz pozisyonu varsayımı: %15
        const fxPosition = cash * 0.15;
        // Aylık etki (yıllık değişimin 1/12'si)
        const monthlyFxDelta = fxDelta / 12;
        return fxPosition * (monthlyFxDelta / 100);
    }
    /**
     * Faiz oranı etkisini hesaplar
     */
    calculateRateEffect(cash, debt, rateDelta, month) {
        // Nakit getirisi (pozitif)
        const cashReturn = cash * 0.02; // %2 aylık nakit getirisi varsayımı
        const rateMultiplier = 1 + rateDelta / 100 / 12; // Aylık etki
        // Borç faizi (negatif)
        const debtInterest = debt * 0.03; // %3 aylık borç faizi varsayımı
        const debtRateMultiplier = 1 + rateDelta / 100 / 12;
        return cashReturn * rateMultiplier - debtInterest * debtRateMultiplier;
    }
    /**
     * Enflasyon etkisini hesaplar
     */
    calculateInflationEffect(cash, inflationDelta, month) {
        // Satın alma gücü kaybı
        const monthlyInflation = inflationDelta / 12;
        return cash * (monthlyInflation / 100);
    }
    /**
     * Nakit açığı ayını bulur
     */
    findCashDeficitMonth(projections) {
        for (const projection of projections) {
            if (projection.cash < 0) {
                return projection.month;
            }
        }
        return undefined;
    }
    /**
     * Özet metni oluşturur
     */
    generateSummary(projections, cashDeficitMonth, parameters) {
        const finalProjection = projections[projections.length - 1];
        const cashChange = finalProjection.cash - this.baseCash;
        const debtChange = finalProjection.debt - this.baseDebt;
        const netWorthChange = finalProjection.netWorth - this.baseNetWorth;
        let summary = `${parameters.horizonMonths} aylık simülasyon sonuçları:\n`;
        summary += `• Nakit değişimi: ${cashChange >= 0 ? '+' : ''}${formatCurrency(cashChange, 'TRY')}\n`;
        summary += `• Borç değişimi: ${debtChange >= 0 ? '+' : ''}${formatCurrency(debtChange, 'TRY')}\n`;
        summary += `• Net değer değişimi: ${netWorthChange >= 0 ? '+' : ''}${formatCurrency(netWorthChange, 'TRY')}\n`;
        if (cashDeficitMonth) {
            summary += `• Nakit açığı: ${cashDeficitMonth}. ayda oluşabilir`;
        }
        else {
            summary += `• Nakit açığı riski: Düşük`;
        }
        return summary;
    }
    /**
     * Özet metnini formatlar
     */
    formatSummary(summary, cashDeficitMonth, horizonMonths) {
        if (cashDeficitMonth) {
            return `Bu senaryoda ${cashDeficitMonth} ay içinde nakit açığı oluşabilir.`;
        }
        else {
            return `Bu senaryoda ${horizonMonths} ay boyunca nakit açığı riski düşük görünüyor.`;
        }
    }
    /**
     * Parametrelerin etkisini analiz eder
     */
    analyzeParameterImpact(parameters) {
        const totalImpact = Math.abs(parameters.fxDelta) +
            Math.abs(parameters.rateDelta) +
            Math.abs(parameters.inflationDelta);
        let fxImpact = 'Nötr';
        if (parameters.fxDelta > 5)
            fxImpact = 'Olumlu (güçlü TRY)';
        else if (parameters.fxDelta < -5)
            fxImpact = 'Olumsuz (zayıf TRY)';
        else if (parameters.fxDelta > 0)
            fxImpact = 'Hafif olumlu';
        else if (parameters.fxDelta < 0)
            fxImpact = 'Hafif olumsuz';
        let rateImpact = 'Nötr';
        if (parameters.rateDelta > 2)
            rateImpact = 'Olumlu (yüksek getiri)';
        else if (parameters.rateDelta < -2)
            rateImpact = 'Olumsuz (düşük getiri)';
        else if (parameters.rateDelta > 0)
            rateImpact = 'Hafif olumlu';
        else if (parameters.rateDelta < 0)
            rateImpact = 'Hafif olumsuz';
        let inflationImpact = 'Nötr';
        if (parameters.inflationDelta > 10)
            inflationImpact = 'Olumsuz (yüksek enflasyon)';
        else if (parameters.inflationDelta < 5)
            inflationImpact = 'Olumlu (düşük enflasyon)';
        else if (parameters.inflationDelta > 8)
            inflationImpact = 'Hafif olumsuz';
        else if (parameters.inflationDelta < 7)
            inflationImpact = 'Hafif olumlu';
        let riskLevel = 'low';
        if (totalImpact > 20)
            riskLevel = 'high';
        else if (totalImpact > 10)
            riskLevel = 'medium';
        return {
            fxImpact,
            rateImpact,
            inflationImpact,
            riskLevel,
        };
    }
}
/**
 * Simülasyon çalıştırma fonksiyonu
 */
export function runSimulation(baseCash, baseDebt, parameters) {
    const engine = new SimulationEngine(baseCash, baseDebt);
    return engine.runSimulation(parameters);
}
/**
 * Simülasyon parametrelerini doğrular
 */
export function validateSimulationParameters(parameters) {
    const errors = [];
    // fxDelta kontrolü
    if (typeof parameters.fxDelta !== 'number' ||
        parameters.fxDelta < -50 ||
        parameters.fxDelta > 50) {
        errors.push('fxDelta -50 ile +50 arasında olmalıdır');
    }
    // rateDelta kontrolü
    if (typeof parameters.rateDelta !== 'number' ||
        parameters.rateDelta < -20 ||
        parameters.rateDelta > 20) {
        errors.push('rateDelta -20 ile +20 arasında olmalıdır');
    }
    // inflationDelta kontrolü
    if (typeof parameters.inflationDelta !== 'number' ||
        parameters.inflationDelta < 0 ||
        parameters.inflationDelta > 100) {
        errors.push('inflationDelta 0 ile 100 arasında olmalıdır');
    }
    // horizonMonths kontrolü
    if (![3, 6, 12].includes(parameters.horizonMonths)) {
        errors.push('horizonMonths 3, 6 veya 12 olmalıdır');
    }
    if (errors.length > 0) {
        return {
            valid: false,
            errors,
            normalized: null,
        };
    }
    return {
        valid: true,
        errors: [],
        normalized: {
            fxDelta: parameters.fxDelta,
            rateDelta: parameters.rateDelta,
            inflationDelta: parameters.inflationDelta,
            horizonMonths: parameters.horizonMonths,
        },
    };
}
