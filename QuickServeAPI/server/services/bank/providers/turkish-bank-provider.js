// @ts-nocheck - Temporary fix for TypeScript errors
/**
 * Turkish Bank Provider Implementation
 * Implements Turkish banking APIs (Ziraat, İş Bankası, Garanti, etc.)
 */
import { BaseBankProvider, } from './base-provider';
import crypto from 'crypto';
import axios from 'axios';
export class TurkishBankProvider extends BaseBankProvider {
    apiClient;
    sessionToken;
    sessionExpiresAt;
    getProviderConfig() {
        return {
            name: 'Turkish Bank',
            version: '1.0.0',
            supportedFeatures: [
                'accounts',
                'transactions',
                'transfers',
                'balance',
                'statements',
                'cards',
                'webhooks',
            ],
            rateLimits: {
                requestsPerMinute: 60,
                requestsPerHour: 1000,
                requestsPerDay: 10000,
            },
            supportedCurrencies: ['TRY', 'USD', 'EUR'],
            supportedAccountTypes: ['checking', 'savings', 'credit', 'loan'],
            webhookSupported: true,
            oauthSupported: false,
            sandboxSupported: true,
        };
    }
    constructor(credentials) {
        super(credentials);
        this.apiClient = axios.create({
            baseURL: this.credentials.baseUrl || 'https://api.turkishbank.com',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'User-Agent': 'FinBot-V3/1.0.0',
            },
        });
        // Add request interceptor for authentication
        this.apiClient.interceptors.request.use(async (config) => {
            await this.ensureAuthenticated();
            if (this.sessionToken) {
                config.headers['Authorization'] = `Bearer ${this.sessionToken}`;
            }
            return config;
        });
        // Add response interceptor for error handling
        this.apiClient.interceptors.response.use(response => response, async (error) => {
            if (error.response?.status === 401) {
                // Token expired, try to refresh
                this.sessionToken = undefined;
                this.sessionExpiresAt = undefined;
                await this.ensureAuthenticated();
                // Retry the original request
                return this.apiClient.request(error.config);
            }
            return Promise.reject(error);
        });
    }
    async validateCredentials() {
        try {
            // Validate required credentials for Turkish banks
            if (!this.credentials.username || !this.credentials.password) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Username and password are required for Turkish bank authentication',
                    },
                };
            }
            // Test authentication
            const authResult = await this.authenticate();
            return {
                success: authResult.success,
                data: authResult.success,
                error: authResult.error,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async getAccounts() {
        try {
            const response = await this.apiClient.post('/api/v1/accounts/list', {
                customerId: this.credentials.customerId || this.credentials.username,
            });
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to fetch accounts',
                    },
                };
            }
            const accounts = response.data.data.accounts.map((account) => ({
                id: account.accountNumber,
                name: account.accountName,
                type: this.mapAccountType(account.accountType),
                balance: parseFloat(account.currentBalance || '0'),
                currency: account.currency || 'TRY',
                accountNumber: account.accountNumber,
                iban: account.iban,
                lastUpdated: new Date(account.lastUpdateDate || new Date()),
                metadata: {
                    branchCode: account.branchCode,
                    accountStatus: account.status,
                    openingDate: account.openingDate,
                    interestRate: account.interestRate,
                },
            }));
            return {
                success: true,
                data: accounts,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_ACCOUNTS_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async getAccount(accountId) {
        try {
            const response = await this.apiClient.post('/api/v1/accounts/detail', {
                accountNumber: accountId,
            });
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to fetch account details',
                    },
                };
            }
            const account = response.data.data.account;
            const bankAccount = {
                id: account.accountNumber,
                name: account.accountName,
                type: this.mapAccountType(account.accountType),
                balance: parseFloat(account.currentBalance || '0'),
                currency: account.currency || 'TRY',
                accountNumber: account.accountNumber,
                iban: account.iban,
                lastUpdated: new Date(account.lastUpdateDate || new Date()),
                metadata: {
                    branchCode: account.branchCode,
                    accountStatus: account.status,
                    openingDate: account.openingDate,
                    interestRate: account.interestRate,
                    availableBalance: account.availableBalance,
                    blockedAmount: account.blockedAmount,
                },
            };
            return {
                success: true,
                data: bankAccount,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_ACCOUNT_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async getTransactions(accountId, options) {
        try {
            const requestData = {
                accountNumber: accountId,
                startDate: options?.startDate?.toISOString().split('T')[0],
                endDate: options?.endDate?.toISOString().split('T')[0],
                pageSize: options?.limit || 50,
                pageNumber: Math.floor((options?.offset || 0) / (options?.limit || 50)) + 1,
            };
            const response = await this.apiClient.post('/api/v1/transactions/list', requestData);
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to fetch transactions',
                    },
                };
            }
            const transactions = response.data.data.transactions.map((txn) => ({
                id: txn.transactionId || txn.id,
                accountId: accountId,
                date: new Date(txn.transactionDate || txn.date),
                amount: Math.abs(parseFloat(txn.amount || '0')),
                currency: txn.currency || 'TRY',
                description: txn.description || txn.transactionDescription,
                reference: txn.reference || txn.transactionReference,
                category: txn.category || txn.transactionType,
                balance: parseFloat(txn.balanceAfter || '0'),
                type: txn.transactionDirection === 'IN' ? 'credit' : 'debit',
                status: this.mapTransactionStatus(txn.status),
                merchant: txn.merchantName
                    ? {
                        name: txn.merchantName,
                        category: txn.merchantCategory,
                        location: txn.merchantLocation,
                    }
                    : undefined,
                metadata: {
                    transactionCode: txn.transactionCode,
                    transactionDirection: txn.transactionDirection,
                    channel: txn.channel,
                    balanceBefore: txn.balanceBefore,
                    balanceAfter: txn.balanceAfter,
                },
            }));
            return {
                success: true,
                data: transactions,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_TRANSACTIONS_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async getTransaction(accountId, transactionId) {
        try {
            const response = await this.apiClient.post('/api/v1/transactions/detail', {
                accountNumber: accountId,
                transactionId: transactionId,
            });
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to fetch transaction details',
                    },
                };
            }
            const txn = response.data.data.transaction;
            const transaction = {
                id: txn.transactionId || txn.id,
                accountId: accountId,
                date: new Date(txn.transactionDate || txn.date),
                amount: Math.abs(parseFloat(txn.amount || '0')),
                currency: txn.currency || 'TRY',
                description: txn.description || txn.transactionDescription,
                reference: txn.reference || txn.transactionReference,
                category: txn.category || txn.transactionType,
                balance: parseFloat(txn.balanceAfter || '0'),
                type: txn.transactionDirection === 'IN' ? 'credit' : 'debit',
                status: this.mapTransactionStatus(txn.status),
                merchant: txn.merchantName
                    ? {
                        name: txn.merchantName,
                        category: txn.merchantCategory,
                        location: txn.merchantLocation,
                    }
                    : undefined,
                metadata: {
                    transactionCode: txn.transactionCode,
                    transactionDirection: txn.transactionDirection,
                    channel: txn.channel,
                    balanceBefore: txn.balanceBefore,
                    balanceAfter: txn.balanceAfter,
                    processingDate: txn.processingDate,
                    valueDate: txn.valueDate,
                },
            };
            return {
                success: true,
                data: transaction,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_TRANSACTION_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async syncData(options) {
        try {
            const { includeTransactions = true, transactionDaysBack = 90 } = options || {};
            // Get accounts
            const accountsResponse = await this.getAccounts();
            if (!accountsResponse.success) {
                return accountsResponse;
            }
            let transactionsCount = 0;
            const errors = [];
            if (includeTransactions && accountsResponse.data) {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - transactionDaysBack);
                for (const account of accountsResponse.data) {
                    try {
                        const transactionsResponse = await this.getTransactions(account.id, {
                            startDate,
                            endDate,
                            limit: 1000,
                        });
                        if (transactionsResponse.success && transactionsResponse.data) {
                            transactionsCount += transactionsResponse.data.length;
                        }
                        else if (transactionsResponse.error) {
                            errors.push(`Failed to sync transactions for account ${account.id}: ${transactionsResponse.error.message}`);
                        }
                    }
                    catch (error) {
                        errors.push(`Error syncing transactions for account ${account.id}: ${this.getErrorMessage(error)}`);
                    }
                }
            }
            return {
                success: true,
                data: {
                    success: true,
                    accountsUpdated: accountsResponse.data?.length || 0,
                    transactionsCount,
                    lastSyncDate: new Date(),
                    errors: errors.length > 0 ? errors : undefined,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'SYNC_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async createTransfer(fromAccountId, toAccountId, amount, description, metadata) {
        try {
            const transferData = {
                fromAccount: fromAccountId,
                toAccount: toAccountId,
                amount: amount,
                currency: 'TRY',
                description: description,
                transferType: 'EFT', // Default to EFT for Turkish banks
                ...metadata,
            };
            const response = await this.apiClient.post('/api/v1/transfers/create', transferData);
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to create transfer',
                    },
                };
            }
            const transfer = response.data.data.transfer;
            const bankTransfer = {
                id: transfer.transferId || transfer.id,
                fromAccountId,
                toAccountId,
                amount,
                currency: 'TRY',
                description,
                status: this.mapTransferStatus(transfer.status),
                initiatedAt: new Date(transfer.createdDate || new Date()),
                completedAt: transfer.completedDate
                    ? new Date(transfer.completedDate)
                    : undefined,
                reference: transfer.reference || transfer.transferReference,
                metadata: {
                    ...metadata,
                    transferType: transfer.transferType,
                    processingFee: transfer.processingFee,
                    exchangeRate: transfer.exchangeRate,
                },
            };
            return {
                success: true,
                data: bankTransfer,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CREATE_TRANSFER_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async getTransfer(transferId) {
        try {
            const response = await this.apiClient.post('/api/v1/transfers/detail', {
                transferId: transferId,
            });
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to fetch transfer details',
                    },
                };
            }
            const transfer = response.data.data.transfer;
            const bankTransfer = {
                id: transfer.transferId || transfer.id,
                fromAccountId: transfer.fromAccount,
                toAccountId: transfer.toAccount,
                amount: parseFloat(transfer.amount || '0'),
                currency: transfer.currency || 'TRY',
                description: transfer.description,
                status: this.mapTransferStatus(transfer.status),
                initiatedAt: new Date(transfer.createdDate || new Date()),
                completedAt: transfer.completedDate
                    ? new Date(transfer.completedDate)
                    : undefined,
                reference: transfer.reference || transfer.transferReference,
                metadata: {
                    transferType: transfer.transferType,
                    processingFee: transfer.processingFee,
                    exchangeRate: transfer.exchangeRate,
                    statusHistory: transfer.statusHistory,
                },
            };
            return {
                success: true,
                data: bankTransfer,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_TRANSFER_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async getCards(accountId) {
        try {
            const response = await this.apiClient.post('/api/v1/cards/list', {
                accountNumber: accountId,
            });
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to fetch cards',
                    },
                };
            }
            const cards = response.data.data.cards.map((card) => ({
                id: card.cardId || card.id,
                accountId: accountId,
                cardNumber: card.maskedCardNumber || '****' + card.cardNumber.slice(-4),
                cardType: this.mapCardType(card.cardType),
                expiryMonth: parseInt(card.expiryMonth || '12'),
                expiryYear: parseInt(card.expiryYear || '2025'),
                holderName: card.cardHolderName,
                status: this.mapCardStatus(card.status),
                limit: card.cardLimit ? parseFloat(card.cardLimit) : undefined,
                availableLimit: card.availableLimit
                    ? parseFloat(card.availableLimit)
                    : undefined,
                metadata: {
                    cardBrand: card.cardBrand,
                    cardProgram: card.cardProgram,
                    activationDate: card.activationDate,
                    lastUsedDate: card.lastUsedDate,
                },
            }));
            return {
                success: true,
                data: cards,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_CARDS_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async updateCardStatus(cardId, status) {
        try {
            const response = await this.apiClient.post('/api/v1/cards/update-status', {
                cardId: cardId,
                status: this.mapStatusToTurkish(status),
            });
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to update card status',
                    },
                };
            }
            const card = response.data.data.card;
            const bankCard = {
                id: card.cardId || card.id,
                accountId: card.accountNumber,
                cardNumber: card.maskedCardNumber || '****' + card.cardNumber.slice(-4),
                cardType: this.mapCardType(card.cardType),
                expiryMonth: parseInt(card.expiryMonth || '12'),
                expiryYear: parseInt(card.expiryYear || '2025'),
                holderName: card.cardHolderName,
                status: this.mapCardStatus(card.status),
                limit: card.cardLimit ? parseFloat(card.cardLimit) : undefined,
                availableLimit: card.availableLimit
                    ? parseFloat(card.availableLimit)
                    : undefined,
                metadata: {
                    cardBrand: card.cardBrand,
                    cardProgram: card.cardProgram,
                    activationDate: card.activationDate,
                    lastUsedDate: card.lastUsedDate,
                    statusUpdateDate: new Date().toISOString(),
                },
            };
            return {
                success: true,
                data: bankCard,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'UPDATE_CARD_STATUS_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async getBalance(accountId) {
        try {
            const accountResponse = await this.getAccount(accountId);
            if (!accountResponse.success || !accountResponse.data) {
                return accountResponse;
            }
            return {
                success: true,
                data: accountResponse.data.balance,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_BALANCE_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async getStatement(accountId, startDate, endDate, format) {
        try {
            const response = await this.apiClient.post('/api/v1/statements/download', {
                accountNumber: accountId,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                format: format,
            }, {
                responseType: 'arraybuffer',
            });
            if (!response.data) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: 'Failed to download statement',
                    },
                };
            }
            return {
                success: true,
                data: Buffer.from(response.data),
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_STATEMENT_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async setupWebhook(webhookUrl, events) {
        try {
            const response = await this.apiClient.post('/api/v1/webhooks/setup', {
                webhookUrl: webhookUrl,
                events: events,
                isActive: true,
            });
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: response.data.message || 'Failed to setup webhook',
                    },
                };
            }
            return {
                success: true,
                data: {
                    webhookId: response.data.data.webhookId,
                    secret: response.data.data.secret,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'SETUP_WEBHOOK_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async verifyWebhook(payload, signature, secret) {
        try {
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
        }
        catch (error) {
            return false;
        }
    }
    async handleWebhook(eventType, payload) {
        try {
            switch (eventType) {
                case 'account.balance.updated':
                    return {
                        success: true,
                        data: { message: 'Account balance updated' },
                    };
                case 'transaction.created':
                    return { success: true, data: { message: 'Transaction created' } };
                case 'transfer.status.updated':
                    return {
                        success: true,
                        data: { message: 'Transfer status updated' },
                    };
                case 'card.status.updated':
                    return { success: true, data: { message: 'Card status updated' } };
                default:
                    return {
                        success: false,
                        error: {
                            code: 'UNKNOWN_EVENT_TYPE',
                            message: `Unknown webhook event type: ${eventType}`,
                        },
                    };
            }
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'WEBHOOK_HANDLER_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async refreshToken() {
        // Turkish banks typically don't use OAuth, so we'll refresh the session
        try {
            const authResult = await this.authenticate();
            if (!authResult.success || !authResult.data) {
                return authResult;
            }
            return {
                success: true,
                data: {
                    token: this.sessionToken,
                    expiresAt: this.sessionExpiresAt,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'REFRESH_TOKEN_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async revokeAuth() {
        try {
            await this.apiClient.post('/api/v1/auth/logout');
            this.sessionToken = undefined;
            this.sessionExpiresAt = undefined;
            return { success: true, data: true };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'REVOKE_AUTH_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    getErrorMessage(error) {
        if (error?.response?.data?.message) {
            return error.response.data.message;
        }
        if (error?.response?.data?.error) {
            return error.response.data.error;
        }
        if (error?.message) {
            return error.message;
        }
        return 'Unknown error occurred';
    }
    async makeRequest(method, endpoint, data, headers) {
        try {
            const config = {
                method,
                url: endpoint,
                data,
                headers: {
                    ...headers,
                },
            };
            const response = await this.apiClient.request(config);
            return {
                success: true,
                data: response.data,
                metadata: {
                    requestId: response.headers['x-request-id'] || crypto.randomUUID(),
                    timestamp: new Date(),
                    rateLimitRemaining: parseInt(response.headers['x-ratelimit-remaining'] || '0'),
                    rateLimitReset: response.headers['x-ratelimit-reset']
                        ? new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000)
                        : undefined,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async authenticate() {
        try {
            const authData = {
                username: this.credentials.username,
                password: this.credentials.password,
                customerId: this.credentials.customerId,
            };
            const response = await this.apiClient.post('/api/v1/auth/login', authData);
            if (!response.data.success) {
                return {
                    success: false,
                    error: {
                        code: 'AUTH_ERROR',
                        message: response.data.message || 'Authentication failed',
                    },
                };
            }
            this.sessionToken = response.data.data.sessionToken;
            this.sessionExpiresAt = new Date(Date.now() + response.data.data.expiresIn * 1000);
            return {
                success: true,
                data: {
                    access_token: this.sessionToken,
                    expires_in: response.data.data.expiresIn,
                    refresh_token: this.sessionToken, // Turkish banks typically don't have separate refresh tokens
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'AUTH_ERROR',
                    message: this.getErrorMessage(error),
                },
            };
        }
    }
    async ensureAuthenticated() {
        if (!this.sessionToken ||
            !this.sessionExpiresAt ||
            this.sessionExpiresAt <= new Date()) {
            const authResult = await this.authenticate();
            if (!authResult.success) {
                throw new Error(authResult.error?.message || 'Authentication failed');
            }
        }
    }
    mapAccountType(accountType) {
        const typeMap = {
            Vadesiz: 'checking',
            Vadeli: 'savings',
            Kredi: 'credit',
            'Kredi Kartı': 'credit',
            Yatırım: 'investment',
            Personal: 'checking',
            Business: 'checking',
        };
        return typeMap[accountType] || 'checking';
    }
    mapTransactionStatus(status) {
        const statusMap = {
            Tamamlandı: 'completed',
            Beklemede: 'pending',
            Başarısız: 'failed',
            İptal: 'cancelled',
            Completed: 'completed',
            Pending: 'pending',
            Failed: 'failed',
            Cancelled: 'cancelled',
        };
        return statusMap[status] || 'pending';
    }
    mapTransferStatus(status) {
        const statusMap = {
            Gönderildi: 'processing',
            Tamamlandı: 'completed',
            Başarısız: 'failed',
            İptal: 'cancelled',
            Beklemede: 'pending',
            Sent: 'processing',
            Completed: 'completed',
            Failed: 'failed',
            Cancelled: 'cancelled',
            Pending: 'pending',
        };
        return statusMap[status] || 'pending';
    }
    mapCardType(cardType) {
        const typeMap = {
            Debit: 'debit',
            Credit: 'credit',
            Prepaid: 'prepaid',
            'Banka Kartı': 'debit',
            'Kredi Kartı': 'credit',
            'Ön Ödemeli': 'prepaid',
        };
        return typeMap[cardType] || 'debit';
    }
    mapCardStatus(status) {
        const statusMap = {
            Aktif: 'active',
            Bloke: 'blocked',
            'Süresi Dolmuş': 'expired',
            İptal: 'cancelled',
            Active: 'active',
            Blocked: 'blocked',
            Expired: 'expired',
            Cancelled: 'cancelled',
        };
        return statusMap[status] || 'active';
    }
    mapStatusToTurkish(status) {
        const statusMap = {
            active: 'Aktif',
            blocked: 'Bloke',
            cancelled: 'İptal',
        };
        return statusMap[status] || 'Aktif';
    }
}
