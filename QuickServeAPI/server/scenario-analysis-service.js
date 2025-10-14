export class ScenarioAnalysisService {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    async analyzeScenario(parameters, scenarioName = 'Base Scenario') {
        const { monthsToProject, monthlyIncome, monthlyExpenses, currentBalance, growthRate = 0.02, // 2% annual growth
        inflationRate = 0.05, // 5% annual inflation
         } = parameters;
        // Calculate monthly growth and inflation rates
        const monthlyGrowthRate = growthRate / 12;
        const monthlyInflationRate = inflationRate / 12;
        // Calculate projected balance
        let projectedBalance = currentBalance;
        let totalIncome = 0;
        let totalExpenses = 0;
        for (let month = 1; month <= monthsToProject; month++) {
            // Apply growth to income and inflation to expenses
            const adjustedIncome = monthlyIncome * Math.pow(1 + monthlyGrowthRate, month - 1);
            const adjustedExpenses = monthlyExpenses * Math.pow(1 + monthlyInflationRate, month - 1);
            const monthlyCashFlow = adjustedIncome - adjustedExpenses;
            projectedBalance += monthlyCashFlow;
            totalIncome += adjustedIncome;
            totalExpenses += adjustedExpenses;
        }
        const netCashFlow = totalIncome - totalExpenses;
        const monthlyCashFlow = netCashFlow / monthsToProject;
        // Create forecast data for storage
        const forecastData = {
            title: scenarioName,
            description: `Scenario analysis: ${scenarioName}`,
            type: 'scenario',
            scenario: scenarioName.toLowerCase().replace(/\s+/g, '_'),
            forecastDate: new Date(),
            targetDate: new Date(Date.now() + parameters.monthsToProject * 30 * 24 * 60 * 60 * 1000),
            predictedValue: projectedBalance.toString(),
            confidenceInterval: '85', // Scenario analysis confidence
            lowerBound: (projectedBalance * 0.85).toString(),
            upperBound: (projectedBalance * 1.15).toString(),
            currency: 'TRY',
            category: 'balance',
            parameters: JSON.stringify(parameters),
            isActive: true,
        };
        return {
            scenarioName,
            projectedBalance,
            monthlyCashFlow,
            totalIncome,
            totalExpenses,
            netCashFlow,
            growthRate,
            inflationRate,
            monthsToProject,
            forecastData,
        };
    }
    async runMultipleScenarios(baseParameters, scenarios) {
        const results = [];
        for (const scenario of scenarios) {
            const mergedParameters = { ...baseParameters, ...scenario.parameters };
            const result = await this.analyzeScenario(mergedParameters, scenario.name);
            results.push(result);
        }
        return results;
    }
    async getOptimisticScenario(parameters) {
        return this.analyzeScenario({
            ...parameters,
            growthRate: (parameters.growthRate || 0.02) + 0.02, // +2% growth
            inflationRate: (parameters.inflationRate || 0.05) - 0.01, // -1% inflation
        }, 'Optimistic Scenario');
    }
    async getPessimisticScenario(parameters) {
        return this.analyzeScenario({
            ...parameters,
            growthRate: (parameters.growthRate || 0.02) - 0.02, // -2% growth
            inflationRate: (parameters.inflationRate || 0.05) + 0.02, // +2% inflation
        }, 'Pessimistic Scenario');
    }
    async getRealisticScenario(parameters) {
        return this.analyzeScenario(parameters, 'Realistic Scenario');
    }
    async compareScenarios(parameters) {
        const [optimistic, realistic, pessimistic] = await Promise.all([
            this.getOptimisticScenario(parameters),
            this.getRealisticScenario(parameters),
            this.getPessimisticScenario(parameters),
        ]);
        return { optimistic, realistic, pessimistic };
    }
    async saveScenarioForecast(forecastData) {
        await this.storage.createForecast(forecastData);
    }
    async getScenarioForecasts() {
        return this.storage.getForecasts();
    }
    async deleteScenarioForecast(id) {
        await this.storage.deleteForecast(id);
    }
    // Helper method to calculate risk metrics
    calculateRiskMetrics(scenarios) {
        const balances = scenarios.map(s => s.projectedBalance);
        const mean = balances.reduce((sum, balance) => sum + balance, 0) / balances.length;
        // Calculate volatility (standard deviation)
        const variance = balances.reduce((sum, balance) => sum + Math.pow(balance - mean, 2), 0) /
            balances.length;
        const volatility = Math.sqrt(variance);
        // Calculate max drawdown
        let maxDrawdown = 0;
        let peak = balances[0];
        for (const balance of balances) {
            if (balance > peak) {
                peak = balance;
            }
            const drawdown = (peak - balance) / peak;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        // Calculate probability of loss
        const lossCount = balances.filter(balance => balance < 0).length;
        const probabilityOfLoss = lossCount / balances.length;
        return {
            volatility,
            maxDrawdown,
            probabilityOfLoss,
            expectedValue: mean,
        };
    }
    // Helper method to generate recommendations
    generateRecommendations(scenarios) {
        const recommendations = [];
        const riskMetrics = this.calculateRiskMetrics(scenarios);
        if (riskMetrics.probabilityOfLoss > 0.3) {
            recommendations.push('Yüksek kayıp riski var. Daha konservatif bir yaklaşım düşünün.');
        }
        if (riskMetrics.volatility > 10000) {
            recommendations.push('Yüksek volatilite var. Portföyünüzü çeşitlendirin.');
        }
        if (riskMetrics.maxDrawdown > 0.2) {
            recommendations.push("Maksimum düşüş %20'nin üzerinde. Risk yönetimi stratejileri uygulayın.");
        }
        const avgBalance = scenarios.reduce((sum, s) => sum + s.projectedBalance, 0) /
            scenarios.length;
        if (avgBalance < 0) {
            recommendations.push('Tüm senaryolarda negatif bakiye var. Harcamalarınızı gözden geçirin.');
        }
        return recommendations;
    }
}
