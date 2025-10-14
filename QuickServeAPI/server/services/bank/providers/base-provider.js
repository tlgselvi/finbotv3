// @ts-nocheck - Temporary fix for TypeScript errors
/**
 * Base Bank Integration Provider Interface
 * Defines the contract for all bank integration providers
 */
/**
 * Abstract base class for all bank integration providers
 */
export class BaseBankProvider {
    credentials;
    config;
    constructor(credentials) {
        this.credentials = credentials;
        this.config = this.getProviderConfig();
    }
    /**
     * Handle rate limiting
     */
    async handleRateLimit() {
        // Default implementation - can be overridden by providers
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    /**
     * Retry failed request with exponential backoff
     */
    async retryRequest(requestFn, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await requestFn();
                if (result.success) {
                    return result;
                }
                lastError = result.error;
            }
            catch (error) {
                lastError = error;
            }
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return {
            success: false,
            error: {
                code: 'MAX_RETRIES_EXCEEDED',
                message: this.getErrorMessage(lastError),
                details: lastError,
            },
        };
    }
    /**
     * Validate transaction data
     */
    validateTransaction(transaction) {
        const errors = [];
        if (!transaction.id)
            errors.push('Transaction ID is required');
        if (!transaction.accountId)
            errors.push('Account ID is required');
        if (!transaction.date)
            errors.push('Transaction date is required');
        if (!transaction.amount)
            errors.push('Transaction amount is required');
        if (!transaction.type)
            errors.push('Transaction type is required');
        if (!['debit', 'credit'].includes(transaction.type)) {
            errors.push('Transaction type must be debit or credit');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Validate account data
     */
    validateAccount(account) {
        const errors = [];
        if (!account.id)
            errors.push('Account ID is required');
        if (!account.name)
            errors.push('Account name is required');
        if (!account.type)
            errors.push('Account type is required');
        if (!account.currency)
            errors.push('Account currency is required');
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Get provider name
     */
    getProviderName() {
        return this.config.name;
    }
    /**
     * Get supported features
     */
    getSupportedFeatures() {
        return this.config.supportedFeatures;
    }
    /**
     * Check if feature is supported
     */
    supportsFeature(feature) {
        return this.config.supportedFeatures.includes(feature);
    }
    /**
     * Get rate limits
     */
    getRateLimits() {
        return this.config.rateLimits;
    }
}
