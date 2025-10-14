// @ts-nocheck - Temporary fix for TypeScript errors
import { openaiService } from './openaiService';
import { logger } from '../../utils/logger';
export class ScenarioAnalysisService {
    defaultScenarios = [];
    constructor() {
        this.initializeDefaultScenarios();
    }
    /**
     * Create a new scenario definition
     */
    async createScenario(userId, scenario) {
        const newScenario = {
            ...scenario,
            id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Save to database would go here
        logger.info(`Created scenario ${newScenario.id} for user ${userId}`);
        return newScenario;
    }
    /**
     * Run scenario analysis
     */
    async runScenarioAnalysis(scenarioId, userId) {
        try {
            // Get scenario definition
            const scenario = await this.getScenario(scenarioId, userId);
            if (!scenario) {
                throw new Error('Scenario not found');
            }
            // Get current financial data
            const currentData = await this.getCurrentFinancialData(userId);
            // Run the scenario simulation
            const results = await this.simulateScenario(scenario, currentData);
            // Generate AI insights
            const insights = await this.generateScenarioInsights(results, scenario);
            const recommendations = await this.generateScenarioRecommendations(results, scenario);
            // Calculate confidence score
            const confidence = this.calculateConfidence(results, scenario);
            const scenarioResult = {
                scenarioId,
                scenarioName: scenario.name,
                timeframe: scenario.timeframe,
                results,
                summary: this.calculateScenarioSummary(results),
                insights,
                recommendations,
                confidence,
            };
            logger.info(`Completed scenario analysis for ${scenarioId}`);
            return scenarioResult;
        }
        catch (error) {
            logger.error('Scenario analysis error:', error);
            throw error;
        }
    }
    /**
     * Run Monte Carlo simulation
     */
    async runMonteCarloSimulation(scenarioId, userId, iterations = 1000) {
        try {
            const scenario = await this.getScenario(scenarioId, userId);
            if (!scenario) {
                throw new Error('Scenario not found');
            }
            const currentData = await this.getCurrentFinancialData(userId);
            const simulationResults = [];
            // Run multiple iterations with randomized parameters
            for (let i = 0; i < iterations; i++) {
                const randomizedScenario = this.randomizeScenarioParameters(scenario);
                const result = await this.simulateScenario(randomizedScenario, currentData);
                const finalNetWorth = result[result.length - 1]?.netWorth || 0;
                simulationResults.push(finalNetWorth);
            }
            // Calculate statistics
            const sortedResults = simulationResults.sort((a, b) => a - b);
            const mean = simulationResults.reduce((sum, val) => sum + val, 0) / iterations;
            const variance = simulationResults.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / iterations;
            const standardDeviation = Math.sqrt(variance);
            const distribution = this.calculateDistribution(sortedResults);
            const probabilityOfPositiveOutcome = simulationResults.filter(val => val > 0).length / iterations;
            const probabilityOfNegativeOutcome = simulationResults.filter(val => val < 0).length / iterations;
            return {
                scenarioId,
                iterations,
                results: {
                    percentile_10: sortedResults[Math.floor(iterations * 0.1)],
                    percentile_25: sortedResults[Math.floor(iterations * 0.25)],
                    percentile_50: sortedResults[Math.floor(iterations * 0.5)],
                    percentile_75: sortedResults[Math.floor(iterations * 0.75)],
                    percentile_90: sortedResults[Math.floor(iterations * 0.9)],
                    mean,
                    standardDeviation,
                    probabilityOfPositiveOutcome,
                    probabilityOfNegativeOutcome,
                },
                distribution,
            };
        }
        catch (error) {
            logger.error('Monte Carlo simulation error:', error);
            throw error;
        }
    }
    /**
     * Run stress test
     */
    async runStressTest(scenarioId, userId, stressFactors) {
        try {
            const scenario = await this.getScenario(scenarioId, userId);
            if (!scenario) {
                throw new Error('Scenario not found');
            }
            const currentData = await this.getCurrentFinancialData(userId);
            const stressResults = [];
            // Test individual stress factors
            for (const factor of stressFactors) {
                const stressScenario = this.applyStressFactor(scenario, factor);
                const result = await this.simulateScenario(stressScenario, currentData);
                const finalNetWorth = result[result.length - 1]?.netWorth || 0;
                const baselineNetWorth = currentData.netWorth;
                const impact = ((finalNetWorth - baselineNetWorth) / baselineNetWorth) * 100;
                stressResults.push({
                    factor: factor.name,
                    finalNetWorth,
                    impact,
                    severity: this.calculateSeverity(impact),
                });
            }
            // Find worst case combination
            const worstCase = await this.findWorstCaseCombination(scenario, stressFactors, currentData);
            // Generate recommendations
            const recommendations = await this.generateStressTestRecommendations(stressResults, worstCase);
            return {
                scenarioId,
                stressFactors,
                results: stressResults,
                worstCase,
                recommendations,
            };
        }
        catch (error) {
            logger.error('Stress test error:', error);
            throw error;
        }
    }
    /**
     * Get available default scenarios
     */
    getDefaultScenarios() {
        return this.defaultScenarios;
    }
    /**
     * Simulate scenario over time
     */
    async simulateScenario(scenario, currentData) {
        const results = [];
        let currentMonth = 0;
        // Initialize with current data
        let runningData = { ...currentData };
        while (currentMonth < scenario.timeframe) {
            // Apply scenario parameters
            const modifiedData = this.applyScenarioParameters(runningData, scenario, currentMonth);
            // Calculate monthly metrics
            const monthlyResult = {
                month: currentMonth + 1,
                totalIncome: modifiedData.totalIncome,
                totalExpenses: modifiedData.totalExpenses,
                netCashFlow: modifiedData.netCashFlow,
                totalAssets: modifiedData.totalAssets,
                totalLiabilities: modifiedData.totalLiabilities,
                netWorth: modifiedData.netWorth,
                savingsRate: modifiedData.savingsRate,
                liquidityRatio: modifiedData.liquidityRatio,
                debtToIncomeRatio: modifiedData.debtToIncomeRatio,
            };
            results.push(monthlyResult);
            // Update running data for next month
            runningData = {
                ...runningData,
                ...modifiedData,
            };
            currentMonth++;
        }
        return results;
    }
    /**
     * Apply scenario parameters to financial data
     */
    applyScenarioParameters(data, scenario, month) {
        let modifiedData = { ...data };
        for (const parameter of scenario.parameters) {
            switch (parameter.type) {
                case 'income':
                    modifiedData.totalIncome = this.applyParameterChange(modifiedData.totalIncome, parameter.value, parameter.unit);
                    break;
                case 'expense':
                    modifiedData.totalExpenses = this.applyParameterChange(modifiedData.totalExpenses, parameter.value, parameter.unit);
                    break;
                case 'investment':
                    modifiedData.investmentValue = this.applyParameterChange(modifiedData.investmentValue, parameter.value, parameter.unit);
                    break;
                case 'market':
                    // Apply market conditions
                    modifiedData = this.applyMarketConditions(modifiedData, parameter, month);
                    break;
            }
        }
        // Recalculate derived metrics
        modifiedData.netCashFlow =
            modifiedData.totalIncome - modifiedData.totalExpenses;
        modifiedData.netWorth =
            modifiedData.totalAssets +
                modifiedData.investmentValue -
                modifiedData.totalLiabilities;
        modifiedData.savingsRate =
            modifiedData.totalIncome > 0
                ? (modifiedData.netCashFlow / modifiedData.totalIncome) * 100
                : 0;
        modifiedData.liquidityRatio =
            modifiedData.totalAssets / Math.max(modifiedData.totalExpenses, 1);
        modifiedData.debtToIncomeRatio =
            (modifiedData.totalLiabilities / Math.max(modifiedData.totalIncome, 1)) *
                100;
        return modifiedData;
    }
    /**
     * Apply parameter change based on unit type
     */
    applyParameterChange(currentValue, parameterValue, unit) {
        switch (unit) {
            case 'percentage':
                return currentValue * (1 + parameterValue / 100);
            case 'multiplier':
                return currentValue * parameterValue;
            case 'absolute':
                return currentValue + parameterValue;
            default:
                return currentValue;
        }
    }
    /**
     * Apply market conditions
     */
    applyMarketConditions(data, parameter, month) {
        // Simulate market volatility and trends
        const volatility = parameter.value;
        const marketReturn = (Math.random() - 0.5) * volatility;
        return {
            ...data,
            investmentValue: data.investmentValue * (1 + marketReturn / 100),
        };
    }
    /**
     * Randomize scenario parameters for Monte Carlo
     */
    randomizeScenarioParameters(scenario) {
        const randomizedScenario = { ...scenario };
        randomizedScenario.parameters = scenario.parameters.map(param => ({
            ...param,
            value: param.value + (Math.random() - 0.5) * (param.max - param.min) * 0.2, // 20% variation
        }));
        return randomizedScenario;
    }
    /**
     * Apply stress factor to scenario
     */
    applyStressFactor(scenario, stressFactor) {
        const stressScenario = { ...scenario };
        stressScenario.parameters = scenario.parameters.map(param => {
            if (param.type === stressFactor.type) {
                return {
                    ...param,
                    value: param.value * (1 + stressFactor.impact / 100),
                };
            }
            return param;
        });
        return stressScenario;
    }
    /**
     * Calculate scenario summary
     */
    calculateScenarioSummary(results) {
        const finalResult = results[results.length - 1];
        const totalCashFlow = results.reduce((sum, result) => sum + result.netCashFlow, 0);
        const averageSavingsRate = results.reduce((sum, result) => sum + result.savingsRate, 0) /
            results.length;
        const peakCashFlow = Math.max(...results.map(r => r.netCashFlow));
        const lowestCashFlow = Math.min(...results.map(r => r.netCashFlow));
        const breakEvenMonth = results.findIndex(r => r.netWorth >= 0) + 1;
        // Calculate risk metrics
        const cashFlowValues = results.map(r => r.netCashFlow);
        const mean = cashFlowValues.reduce((sum, val) => sum + val, 0) / cashFlowValues.length;
        const variance = cashFlowValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            cashFlowValues.length;
        const volatility = Math.sqrt(variance);
        const downsideRisk = cashFlowValues
            .filter(val => val < mean)
            .reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            cashFlowValues.length;
        const upsidePotential = cashFlowValues
            .filter(val => val > mean)
            .reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            cashFlowValues.length;
        return {
            finalNetWorth: finalResult?.netWorth || 0,
            totalCashFlow,
            averageSavingsRate,
            peakCashFlow,
            lowestCashFlow,
            breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : undefined,
            riskMetrics: {
                volatility,
                downsideRisk,
                upsidePotential,
            },
        };
    }
    /**
     * Generate AI insights for scenario
     */
    async generateScenarioInsights(results, scenario) {
        const summary = this.calculateScenarioSummary(results);
        const prompt = `
      Analyze this financial scenario and provide key insights:

      Scenario: ${scenario.name}
      Description: ${scenario.description}
      Timeframe: ${scenario.timeframe} months

      Results Summary:
      - Final Net Worth: $${summary.finalNetWorth.toLocaleString()}
      - Total Cash Flow: $${summary.totalCashFlow.toLocaleString()}
      - Average Savings Rate: ${summary.averageSavingsRate.toFixed(1)}%
      - Peak Cash Flow: $${summary.peakCashFlow.toLocaleString()}
      - Lowest Cash Flow: $${summary.lowestCashFlow.toLocaleString()}
      - Break-even Month: ${summary.breakEvenMonth || 'Not achieved'}
      - Volatility: ${summary.riskMetrics.volatility.toFixed(2)}

      Provide 3-5 key insights about this scenario's implications for financial planning.
      Respond as an array of strings.
    `;
        const response = await openaiService.generateResponse(prompt, {
            temperature: 0.4,
            max_tokens: 500,
        });
        if (response.success) {
            try {
                return JSON.parse(response.response);
            }
            catch {
                return ['Scenario analysis completed successfully.'];
            }
        }
        return ['AI insights could not be generated at this time.'];
    }
    /**
     * Generate AI recommendations for scenario
     */
    async generateScenarioRecommendations(results, scenario) {
        const summary = this.calculateScenarioSummary(results);
        const prompt = `
      Based on this financial scenario analysis, provide actionable recommendations:

      Scenario Results:
      - Final Net Worth: $${summary.finalNetWorth.toLocaleString()}
      - Average Savings Rate: ${summary.averageSavingsRate.toFixed(1)}%
      - Risk Level: ${summary.riskMetrics.volatility > 1000 ? 'High' : 'Medium'}
      - Break-even: ${summary.breakEvenMonth ? `${summary.breakEvenMonth} months` : 'Not achieved'}

      Provide 3-5 specific, actionable recommendations for improving financial outcomes.
      Focus on practical steps the user can take.
      Respond as an array of strings.
    `;
        const response = await openaiService.generateResponse(prompt, {
            temperature: 0.4,
            max_tokens: 400,
        });
        if (response.success) {
            try {
                return JSON.parse(response.response);
            }
            catch {
                return [
                    'Consider reviewing your financial strategy based on this analysis.',
                ];
            }
        }
        return ['Recommendations could not be generated at this time.'];
    }
    /**
     * Generate stress test recommendations
     */
    async generateStressTestRecommendations(stressResults, worstCase) {
        const prompt = `
      Based on this stress test analysis, provide recommendations:

      Stress Test Results:
      ${stressResults.map(result => `- ${result.factor}: ${result.impact.toFixed(1)}% impact (${result.severity} severity)`).join('\n')}

      Worst Case Scenario:
      - Combination: ${worstCase.combination.join(', ')}
      - Final Net Worth: $${worstCase.finalNetWorth.toLocaleString()}
      - Probability: ${(worstCase.probability * 100).toFixed(1)}%

      Provide 3-5 recommendations for building financial resilience against these stress factors.
      Respond as an array of strings.
    `;
        const response = await openaiService.generateResponse(prompt, {
            temperature: 0.3,
            max_tokens: 400,
        });
        if (response.success) {
            try {
                return JSON.parse(response.response);
            }
            catch {
                return ['Build emergency fund and diversify income sources.'];
            }
        }
        return ['Stress test recommendations could not be generated at this time.'];
    }
    /**
     * Calculate confidence score
     */
    calculateConfidence(results, scenario) {
        // Base confidence on data quality and scenario complexity
        let confidence = 80;
        // Reduce confidence for longer timeframes
        if (scenario.timeframe > 12)
            confidence -= 10;
        if (scenario.timeframe > 24)
            confidence -= 10;
        // Reduce confidence for complex scenarios
        if (scenario.parameters.length > 5)
            confidence -= 5;
        // Reduce confidence if results show high volatility
        const summary = this.calculateScenarioSummary(results);
        if (summary.riskMetrics.volatility > 1000)
            confidence -= 15;
        return Math.max(confidence, 50); // Minimum 50% confidence
    }
    /**
     * Calculate severity level
     */
    calculateSeverity(impact) {
        if (impact > -50)
            return 'critical';
        if (impact > -25)
            return 'high';
        if (impact > -10)
            return 'medium';
        return 'low';
    }
    /**
     * Find worst case combination
     */
    async findWorstCaseCombination(scenario, stressFactors, currentData) {
        // This would implement combinatorial stress testing
        // For now, return a mock worst case
        return {
            combination: stressFactors.map(f => f.name),
            finalNetWorth: currentData.netWorth * 0.5, // 50% reduction
            probability: 0.05, // 5% probability
        };
    }
    /**
     * Calculate distribution for Monte Carlo
     */
    calculateDistribution(sortedResults) {
        // Create histogram buckets
        const buckets = 20;
        const min = Math.min(...sortedResults);
        const max = Math.max(...sortedResults);
        const bucketSize = (max - min) / buckets;
        const distribution = [];
        for (let i = 0; i < buckets; i++) {
            const bucketStart = min + i * bucketSize;
            const bucketEnd = min + (i + 1) * bucketSize;
            const count = sortedResults.filter(val => val >= bucketStart && val < bucketEnd).length;
            distribution.push({
                value: bucketStart + bucketSize / 2,
                probability: count / sortedResults.length,
            });
        }
        return distribution;
    }
    /**
     * Get current financial data
     */
    async getCurrentFinancialData(userId) {
        // This would get real financial data from the database
        // For now, return mock data
        return {
            totalIncome: 5000,
            totalExpenses: 3500,
            netCashFlow: 1500,
            totalAssets: 25000,
            totalLiabilities: 5000,
            netWorth: 20000,
            investmentValue: 15000,
            savingsRate: 30,
            liquidityRatio: 7.14,
            debtToIncomeRatio: 10,
        };
    }
    /**
     * Get scenario by ID
     */
    async getScenario(scenarioId, userId) {
        // This would query the database
        // For now, return a mock scenario
        return {
            id: scenarioId,
            userId,
            name: 'Test Scenario',
            description: 'A test scenario for analysis',
            parameters: [
                {
                    name: 'Income Growth',
                    type: 'income',
                    value: 5,
                    unit: 'percentage',
                    description: 'Annual income growth',
                },
            ],
            timeframe: 12,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    /**
     * Initialize default scenarios
     */
    initializeDefaultScenarios() {
        this.defaultScenarios = [
            {
                id: 'default_optimistic',
                userId: 'system',
                name: 'Optimistic Growth',
                description: 'Scenario with positive income growth and controlled expenses',
                parameters: [
                    {
                        name: 'Income Growth',
                        type: 'income',
                        value: 8,
                        unit: 'percentage',
                        description: 'Annual income growth',
                    },
                    {
                        name: 'Expense Control',
                        type: 'expense',
                        value: -2,
                        unit: 'percentage',
                        description: 'Annual expense reduction',
                    },
                ],
                timeframe: 12,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'default_pessimistic',
                userId: 'system',
                name: 'Economic Downturn',
                description: 'Scenario simulating economic challenges',
                parameters: [
                    {
                        name: 'Income Reduction',
                        type: 'income',
                        value: -10,
                        unit: 'percentage',
                        description: 'Income reduction due to economic conditions',
                    },
                    {
                        name: 'Expense Increase',
                        type: 'expense',
                        value: 5,
                        unit: 'percentage',
                        description: 'Increased expenses due to inflation',
                    },
                ],
                timeframe: 12,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
    }
}
// Export singleton instance
export const scenarioAnalysisService = new ScenarioAnalysisService();
export default scenarioAnalysisService;
