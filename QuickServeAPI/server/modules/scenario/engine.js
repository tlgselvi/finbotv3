// @ts-nocheck - Temporary fix for TypeScript errors
import { eq, and, gte } from 'drizzle-orm';
import { db } from '../../db';
import { accounts, transactions, recurringTransactions, } from '../../db/schema';
export const SCENARIO_HORIZONS = [
    { months: 3, label: '3 Ay' },
    { months: 6, label: '6 Ay' },
    { months: 12, label: '12 Ay' },
];
/**
 * Run scenario analysis with given parameters
 */
export async function runScenarioAnalysis(userId, parameters, horizon = 12) {
    const scenarioId = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Get current financial data
    const currentData = await getCurrentFinancialData(userId);
    // Calculate projections
    const projections = await calculateProjections(currentData, parameters, horizon);
    // Generate summary
    const summary = generateScenarioSummary(projections, parameters);
    const result = {
        scenarioId,
        parameters,
        projections,
        summary,
        createdAt: new Date(),
    };
    return result;
}
/**
 * Get current financial data for scenario analysis
 */
async function getCurrentFinancialData(userId) {
    // Get current account balances
    const userAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId));
    const currentCash = userAccounts.reduce((sum, account) => {
        return sum + parseFloat(account.balance);
    }, 0);
    // Get last 3 months of transactions for trend analysis
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentTransactions = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.userId, userId), gte(transactions.createdAt, threeMonthsAgo)));
    // Calculate monthly averages
    const monthlyRevenue = calculateMonthlyAverage(recentTransactions.filter(t => parseFloat(t.amount) > 0));
    const monthlyOperatingExpenses = Math.abs(calculateMonthlyAverage(recentTransactions.filter(t => parseFloat(t.amount) < 0)));
    // Get recurring transactions for predictable income/expenses
    const recurringTransactionsList = await db
        .select()
        .from(recurringTransactions)
        .where(and(eq(recurringTransactions.userId, userId), eq(recurringTransactions.isActive, true)));
    const monthlyRecurringIncome = calculateMonthlyRecurring(recurringTransactionsList.filter(t => parseFloat(t.amount) > 0));
    const monthlyRecurringExpenses = Math.abs(calculateMonthlyRecurring(recurringTransactionsList.filter(t => parseFloat(t.amount) < 0)));
    // Estimate investment returns (simplified)
    const monthlyInvestmentReturns = (currentCash * 0.02) / 12; // Assume 2% annual return
    // Estimate interest expense (simplified)
    const monthlyInterestExpense = monthlyOperatingExpenses * 0.1; // Assume 10% of expenses are interest
    return {
        currentCash,
        monthlyRevenue: monthlyRevenue + monthlyRecurringIncome,
        monthlyOperatingExpenses: monthlyOperatingExpenses + monthlyRecurringExpenses,
        monthlyInvestmentReturns,
        monthlyInterestExpense,
        accounts: userAccounts.map(account => ({
            balance: parseFloat(account.balance),
            type: account.type,
            currency: account.currency,
        })),
    };
}
/**
 * Calculate monthly projections
 */
async function calculateProjections(currentData, parameters, horizon) {
    const projections = [];
    let cumulativeCash = currentData.currentCash;
    for (let month = 1; month <= horizon; month++) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() + month);
        // Apply parameter adjustments
        const adjustedRevenue = currentData.monthlyRevenue * (1 + (parameters.revenueDelta || 0) / 100);
        const adjustedOperatingExpenses = currentData.monthlyOperatingExpenses *
            (1 + (parameters.opexDelta || 0) / 100);
        const adjustedInvestmentReturns = currentData.monthlyInvestmentReturns *
            (1 + (parameters.investmentDelta || 0) / 100);
        const adjustedInterestExpense = currentData.monthlyInterestExpense *
            (1 + (parameters.rateDelta || 0) / 100);
        // Apply inflation adjustment
        const inflationAdjustment = 1 + (parameters.inflationDelta || 0) / 100;
        const inflationAdjustedRevenue = adjustedRevenue * inflationAdjustment;
        const inflationAdjustedExpenses = adjustedOperatingExpenses * inflationAdjustment;
        // Calculate net cash flow
        const netCashFlow = inflationAdjustedRevenue -
            inflationAdjustedExpenses +
            adjustedInvestmentReturns -
            adjustedInterestExpense;
        // Calculate closing cash
        const closingCash = cumulativeCash + netCashFlow;
        projections.push({
            month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
            openingCash: cumulativeCash,
            revenue: inflationAdjustedRevenue,
            operatingExpenses: inflationAdjustedExpenses,
            investmentReturns: adjustedInvestmentReturns,
            interestExpense: adjustedInterestExpense,
            netCashFlow,
            closingCash,
            cumulativeCash: closingCash,
        });
        cumulativeCash = closingCash;
    }
    return projections;
}
/**
 * Generate scenario summary
 */
function generateScenarioSummary(projections, parameters) {
    const initialCash = projections[0]?.openingCash || 0;
    const finalCash = projections[projections.length - 1]?.closingCash || 0;
    const totalNetCashFlow = projections.reduce((sum, proj) => sum + proj.netCashFlow, 0);
    const averageMonthlyGrowth = projections.length > 0
        ? ((finalCash - initialCash) / (initialCash * projections.length)) * 100
        : 0;
    // Determine risk level
    let riskLevel = 'low';
    if (finalCash < initialCash * 0.8) {
        riskLevel = 'high';
    }
    else if (finalCash < initialCash || averageMonthlyGrowth < -2) {
        riskLevel = 'medium';
    }
    // Generate key insights
    const keyInsights = [];
    if (finalCash > initialCash * 1.2) {
        keyInsights.push('Senaryo pozitif sonuçlar gösteriyor - nakit pozisyonunuz güçlenecek.');
    }
    else if (finalCash < initialCash) {
        keyInsights.push('Senaryo negatif sonuçlar gösteriyor - nakit pozisyonunuzda düşüş bekleniyor.');
    }
    if (Math.abs(averageMonthlyGrowth) > 10) {
        keyInsights.push('Yüksek volatilite riski var - durumu yakından takip edin.');
    }
    if (parameters.opexDelta && parameters.opexDelta > 20) {
        keyInsights.push('Operasyonel giderlerdeki artış nakit akışını olumsuz etkileyebilir.');
    }
    if (parameters.revenueDelta && parameters.revenueDelta < -10) {
        keyInsights.push('Gelir düşüşü senaryosu kritik - alternatif gelir kaynakları düşünün.');
    }
    return {
        initialCash,
        finalCash,
        totalNetCashFlow,
        averageMonthlyGrowth,
        riskLevel,
        keyInsights,
    };
}
/**
 * Calculate monthly average from transactions
 */
function calculateMonthlyAverage(transactions) {
    if (transactions.length === 0)
        return 0;
    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    return totalAmount / 3; // Average over 3 months
}
/**
 * Calculate monthly recurring amount
 */
function calculateMonthlyRecurring(recurringTransactions) {
    return recurringTransactions.reduce((sum, t) => {
        const amount = parseFloat(t.amount);
        let monthlyAmount = amount;
        // Convert to monthly amount based on interval
        switch (t.interval) {
            case 'daily':
                monthlyAmount = amount * 30;
                break;
            case 'weekly':
                monthlyAmount = amount * 4.33; // Average weeks per month
                break;
            case 'monthly':
                monthlyAmount = amount;
                break;
            case 'quarterly':
                monthlyAmount = amount / 3;
                break;
            case 'yearly':
                monthlyAmount = amount / 12;
                break;
        }
        return sum + monthlyAmount;
    }, 0);
}
/**
 * Compare multiple scenarios
 */
export async function compareScenarios(userId, scenarios) {
    const results = await Promise.all(scenarios.map(async (scenario) => {
        const result = await runScenarioAnalysis(userId, scenario.parameters, scenario.horizon);
        return {
            name: scenario.name,
            result,
        };
    }));
    // Find best and worst scenarios by final cash
    const sortedByCash = results.sort((a, b) => b.result.summary.finalCash - a.result.summary.finalCash);
    const bestScenario = sortedByCash[0].name;
    const worstScenario = sortedByCash[sortedByCash.length - 1].name;
    // Find scenarios by risk level
    const highRiskScenarios = results.filter(s => s.result.summary.riskLevel === 'high');
    const lowRiskScenarios = results.filter(s => s.result.summary.riskLevel === 'low');
    const highestRisk = highRiskScenarios.length > 0 ? highRiskScenarios[0].name : '';
    const lowestRisk = lowRiskScenarios.length > 0 ? lowRiskScenarios[0].name : '';
    return {
        scenarios: results,
        comparison: {
            bestScenario,
            worstScenario,
            riskAnalysis: {
                highestRisk,
                lowestRisk,
            },
        },
    };
}
/**
 * Get scenario recommendations based on current financial position
 */
export async function getScenarioRecommendations(userId, baseParameters = {}) {
    return {
        conservative: {
            ...baseParameters,
            revenueDelta: (baseParameters.revenueDelta || 0) + 2,
            opexDelta: (baseParameters.opexDelta || 0) - 5,
            investmentDelta: (baseParameters.investmentDelta || 0) + 1,
        },
        moderate: {
            ...baseParameters,
            revenueDelta: baseParameters.revenueDelta || 0,
            opexDelta: baseParameters.opexDelta || 0,
            investmentDelta: baseParameters.investmentDelta || 0,
        },
        aggressive: {
            ...baseParameters,
            revenueDelta: (baseParameters.revenueDelta || 0) - 5,
            opexDelta: (baseParameters.opexDelta || 0) + 10,
            investmentDelta: (baseParameters.investmentDelta || 0) + 3,
        },
        description: {
            conservative: 'Muhafazakar yaklaşım - düşük risk, istikrarlı büyüme',
            moderate: 'Orta seviye yaklaşım - dengeli risk-getiri profili',
            aggressive: 'Agresif yaklaşım - yüksek risk, potansiyel yüksek getiri',
        },
    };
}
