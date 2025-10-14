import * as ss from 'simple-statistics';
export class ForecastingService {
    /**
     * Monte Carlo simulation for financial forecasting
     */
    static monteCarloSimulation(historicalData, parameters) {
        if (historicalData.length < 2) {
            throw new Error('Insufficient historical data for simulation');
        }
        // Calculate historical statistics
        const mean = ss.mean(historicalData);
        const stdDev = ss.standardDeviation(historicalData);
        const volatility = parameters.volatility || stdDev;
        // Generate scenarios
        const scenarios = [];
        const confidenceLevel = parameters.confidenceLevel || 0.95;
        for (let i = 0; i < parameters.iterations; i++) {
            let scenarioValue = mean;
            // Simulate over time horizon
            for (let month = 0; month < parameters.timeHorizon; month++) {
                // Generate random return (normal distribution)
                const randomReturn = this.generateNormalRandom(0, volatility);
                scenarioValue *= 1 + randomReturn;
            }
            scenarios.push(scenarioValue);
        }
        // Sort scenarios for percentile calculations
        scenarios.sort((a, b) => a - b);
        // Calculate statistics
        const result = {
            mean: ss.mean(scenarios),
            median: ss.median(scenarios),
            percentiles: {
                p10: this.percentile(scenarios, 0.1),
                p25: this.percentile(scenarios, 0.25),
                p75: this.percentile(scenarios, 0.75),
                p90: this.percentile(scenarios, 0.9),
                p95: this.percentile(scenarios, 0.95),
                p99: this.percentile(scenarios, 0.99),
            },
            confidenceInterval: {
                lower: this.percentile(scenarios, (1 - confidenceLevel) / 2),
                upper: this.percentile(scenarios, 1 - (1 - confidenceLevel) / 2),
            },
            scenarios,
        };
        return result;
    }
    /**
     * Trend-based forecasting using linear regression
     */
    static trendForecast(historicalData, forecastMonths) {
        if (historicalData.length < 3) {
            throw new Error('Insufficient data for trend analysis');
        }
        // Convert dates to numeric values (months since start)
        const startDate = historicalData[0].date;
        const dataPoints = historicalData.map((point, index) => ({
            x: index,
            y: point.value,
        }));
        // Perform linear regression - convert to number[][]
        const regressionData = dataPoints.map(p => [p.x, p.y]);
        const regression = ss.linearRegression(regressionData);
        const rSquared = ss.rSquared(regressionData, (x) => regression.m * x + regression.b);
        // Generate predictions
        const predictions = [];
        const totalMonths = historicalData.length + forecastMonths;
        for (let i = 0; i < totalMonths; i++) {
            const predictedValue = regression.m * i + regression.b;
            const predictionDate = new Date(startDate);
            predictionDate.setMonth(predictionDate.getMonth() + i);
            predictions.push({
                date: predictionDate,
                value: Math.max(0, predictedValue), // Ensure non-negative values
            });
        }
        return {
            predictions,
            trend: regression.m,
            rSquared,
        };
    }
    /**
     * Generate scenario-based forecasts (optimistic, realistic, pessimistic)
     */
    static generateScenarios(currentValue, historicalGrowth, volatility) {
        const timeHorizon = 12; // 12 months
        return {
            optimistic: currentValue * Math.pow(1 + historicalGrowth + volatility, timeHorizon),
            realistic: currentValue * Math.pow(1 + historicalGrowth, timeHorizon),
            pessimistic: currentValue * Math.pow(1 + historicalGrowth - volatility, timeHorizon),
        };
    }
    /**
     * Create forecast record for database
     */
    static createForecastRecord(title, type, scenario, forecastDate, targetDate, predictedValue, confidenceInterval, lowerBound, upperBound, category, accountId, parameters) {
        return {
            title,
            description: `${type} forecast for ${category || 'financial data'}`,
            type,
            scenario,
            forecastDate,
            targetDate,
            predictedValue: predictedValue.toString(),
            confidenceInterval: confidenceInterval.toString(),
            lowerBound: lowerBound?.toString() || null,
            upperBound: upperBound?.toString() || null,
            currency: 'TRY',
            category: category || 'balance',
            accountId,
            parameters: parameters ? JSON.stringify(parameters) : null,
            isActive: true,
        };
    }
    /**
     * Analyze transaction patterns for forecasting
     */
    static analyzeTransactionPatterns(transactions) {
        // Group transactions by month
        const monthlyData = new Map();
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, { income: 0, expense: 0 });
            }
            const amount = parseFloat(transaction.amount);
            const monthData = monthlyData.get(monthKey);
            if (transaction.type === 'income' || transaction.type === 'transfer_in') {
                monthData.income += amount;
            }
            else {
                monthData.expense += amount;
            }
        });
        // Convert to arrays
        const monthlyIncome = [];
        const monthlyExpenses = [];
        const netCashFlow = [];
        const sortedMonths = Array.from(monthlyData.keys()).sort();
        sortedMonths.forEach(month => {
            const data = monthlyData.get(month);
            monthlyIncome.push(data.income);
            monthlyExpenses.push(data.expense);
            netCashFlow.push(data.income - data.expense);
        });
        // Calculate statistics
        const volatility = monthlyIncome.length > 1 ? ss.standardDeviation(netCashFlow) : 0;
        let trend = 0;
        if (netCashFlow.length > 1) {
            const trendData = netCashFlow.map((value, index) => ({
                x: index,
                y: value,
            }));
            const regressionData = trendData.map(p => [p.x, p.y]);
            const regression = ss.linearRegression(regressionData);
            trend = regression.m;
        }
        return {
            monthlyIncome,
            monthlyExpenses,
            netCashFlow,
            volatility,
            trend,
        };
    }
    // Helper methods
    static generateNormalRandom(mean, stdDev) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + stdDev * z0;
    }
    static percentile(sortedArray, p) {
        if (p < 0 || p > 1) {
            throw new Error('Percentile must be between 0 and 1');
        }
        const index = p * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        if (upper >= sortedArray.length) {
            return sortedArray[sortedArray.length - 1];
        }
        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }
}
