import type { Express } from 'express';
import { Router } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { logger } from './utils/logger';
import {
  insertAccountSchema,
  insertTransactionSchema,
  insertCreditSchema,
  updateAccountSchema,
  deleteAccountSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  updateCreditSchema,
  deleteCreditSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  insertTeamSchema,
  updateTeamSchema,
  insertTeamMemberSchema,
  inviteUserSchema,
  acceptInviteSchema,
  insertSystemAlertSchema,
  insertFixedExpenseSchema,
  insertInvestmentSchema,
  insertForecastSchema,
  insertAISettingsSchema,
  importTransactionJsonSchema,
  exportTransactionsByDateSchema,
  transactionJsonFileSchema,
  Permission,
  UserRole,
  TeamPermission,
  hasTeamPermission,
  TeamRole,
} from '../shared/schema';
import { db, dbInterface } from './db';
import bcrypt from 'bcryptjs';
import { randomBytes, randomUUID } from 'crypto';
import type { AuthenticatedRequest } from './middleware/auth';
import {
  requireAuth,
  requirePermission,
  requireAccountTypeAccess,
  optionalAuth,
  logAccess,
} from './middleware/auth';
import {
  requireJWTAuth,
  requireJWTPermission,
  requireJWTAdmin,
  logJWTAccess,
} from './middleware/jwt-auth';
import { responseCache } from './middleware/response-cache';
import { securityAudit, rateLimitWithAudit } from './middleware/security-audit';
import aiAnalysisRouter from './routes/ai-analysis';
import { updateUserRoleSchema, updateUserStatusSchema } from '../shared/schema';
import { alertService } from './alert-service';
import { transactionJsonService } from './transaction-json-service';
import { realtimeService } from './realtime-service';
import { JWTAuthService, TokenBlacklist } from './jwt-auth';
import type { AuthenticatedRequest as JWTAuthenticatedRequest } from './middleware/jwt-auth';
import { openaiService } from './services/ai/openaiService';
import tenantsRouter from './routes/tenants';
import investmentsRouter from './routes/investments';
import portfolioRouter from './routes/portfolio';
import aiAgentsRouter from './routes/ai-agents';
import riskRouter from './routes/risk';
import simulationRouter from './routes/simulation';
import advisorRouter from './routes/advisor';
import financeRouter from './routes/finance';
import emailVerificationRouter from './routes/email-verification';
import budgetLinesRouter from './routes/budget-lines';
import exportRouter from './routes/export';
import recurringRouter from './routes/recurring';
import budgetCompareRouter from './routes/budget-compare';
import scenarioRouter from './routes/scenario';
import agingRouter from './routes/aging';
import dashboardExtendedRouter from './routes/dashboard-extended';
import dashboardLayoutRouter from './routes/dashboard-layout';
import realtimeRouter from './routes/realtime';
import analyticsRouter from './routes/analytics';
import performanceRouter from './routes/performance';
import enhancedExportRouter from './routes/enhanced-export';
import cashboxRouter from './routes/cashbox';
import bankIntegrationRouter from './routes/bank-integration';
import securityRouter from './routes/security';
import {
  securityHeadersMiddleware,
  advancedSecurityHeaders,
} from './middleware/security-headers-advanced';
import {
  auditComplianceMiddleware,
  auditComplianceManager,
} from './middleware/audit-compliance';
import { rateLimitMiddleware } from './middleware/rate-limit-advanced';
import { authHardeningService } from './services/auth/auth-hardening';

// Extend Express session to include user
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email: string;
      username: string;
      role: string;
      isActive: boolean;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ===================================
  // ADVANCED SECURITY MIDDLEWARE
  // ===================================

  // Security audit middleware for all routes
  app.use(securityAudit);

  // AI Analysis routes
  app.use('/api/ai', aiAnalysisRouter);

  // Enhanced rate limiting with security audit (relaxed for development)
  app.use('/api/auth', rateLimitWithAudit(15 * 60 * 1000, 50)); // 50 attempts per 15 minutes for auth
  app.use('/api', rateLimitWithAudit(60 * 1000, 1000)); // 1000 requests per minute for general API

  // Security headers for all routes
  app.use(securityHeadersMiddleware.main);

  // Rate limiting with advanced policies
  app.use('/api/auth', rateLimitMiddleware.login);
  app.use('/api/security', rateLimitMiddleware.login);
  app.use('/api', rateLimitMiddleware.slowDown);

  // Audit compliance middleware - temporarily disabled until userActivityLogs table is created
  // app.use('/api', auditComplianceMiddleware.logRequests);
  // app.use('/api/auth', auditComplianceMiddleware.logAuth);
  // app.use('/api', auditComplianceMiddleware.logDataAccess);

  // API-specific security headers
  app.use('/api', securityHeadersMiddleware.api);

  // Development bypass for testing
  if (process.env.NODE_ENV === 'development') {
    app.use(securityHeadersMiddleware.development);
  }

  // Static file security headers
  app.use(securityHeadersMiddleware.static);

  // Error page security headers
  app.use(securityHeadersMiddleware.error);

  // CSP violation reporting endpoint
  app.post('/api/security/csp-report', securityHeadersMiddleware.cspReport);

  // Lightweight health endpoint for uptime checks
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  // Account routes - Protected by authentication and account type permissions
  // Finance routes
  const financeApi = Router();
  financeApi.use('/finance', financeRouter);
  app.use('/api', financeApi);
  app.get(
    '/api/accounts',
    responseCache({ ttl: 2 * 60 * 1000 }), // 2 minutes cache
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_ACCOUNTS,
      Permission.VIEW_COMPANY_ACCOUNTS,
      Permission.VIEW_ALL_ACCOUNTS
    ),
    logAccess('VIEW_ACCOUNTS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const accounts = await storage.getAccounts();

        // Filter accounts based on user role
        const filteredAccounts = accounts.filter(account => {
          if (req.user!.role === UserRole.ADMIN) {
            return true;
          }
          if (req.user!.role === UserRole.COMPANY_USER) {
            return true;
          } // Can see both
          if (req.user!.role === UserRole.PERSONAL_USER) {
            return account.type === 'personal';
          }
          return false;
        });

        res.json(filteredAccounts);
      } catch (error) {
        res.status(500).json({ error: 'Hesaplar yüklenirken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/accounts',
    requireAuth,
    logAccess('CREATE_ACCOUNT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        logger.debug('Received account data');
        const validatedData = insertAccountSchema.parse(req.body);
        logger.debug('Account validation passed');

        // Check if user can create this account type
        const accountType = validatedData.type as 'personal' | 'company';
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          accountType === 'company'
        ) {
          return res
            .status(403)
            .json({ error: 'Şirket hesabı oluşturma yetkiniz bulunmuyor' });
        }

        const account = await storage.createAccount(validatedData);
        logger.info('Account created successfully');
        res.json(account);
      } catch (error) {
        logger.error('❌ Account validation error:', error);
        res.status(400).json({
          error: 'Geçersiz hesap verisi',
          details: (error as Error).message,
        });
      }
    }
  );

  // PUT /api/accounts/:id - Update account
  app.put(
    '/api/accounts/:id',
    requireAuth,
    requirePermission(
      Permission.EDIT_PERSONAL_ACCOUNTS,
      Permission.EDIT_COMPANY_ACCOUNTS,
      Permission.EDIT_ALL_ACCOUNTS
    ),
    logAccess('UPDATE_ACCOUNT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const validatedData = updateAccountSchema.parse(req.body);

        // Check if account exists and user has access
        const accounts = await storage.getAccounts();
        const account = accounts.find(acc => acc.id === id);

        if (!account) {
          return res.status(404).json({ error: 'Hesap bulunamadı' });
        }

        // Check if user can edit this account type
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          account.type === 'company'
        ) {
          return res
            .status(403)
            .json({ error: 'Şirket hesabı düzenleme yetkiniz bulunmuyor' });
        }

        const updatedAccount = await storage.updateAccount(id, validatedData);
        if (!updatedAccount) {
          return res.status(404).json({ error: 'Hesap güncellenemedi' });
        }

        res.json(updatedAccount);
      } catch (error) {
        logger.error('❌ Account update error:', error);
        res.status(400).json({
          error: 'Hesap güncellenirken hata oluştu',
          details: (error as Error).message,
        });
      }
    }
  );

  // DELETE /api/accounts/:id - Soft delete account
  app.delete(
    '/api/accounts/:id',
    requireAuth,
    requirePermission(
      Permission.DELETE_PERSONAL_ACCOUNTS,
      Permission.DELETE_COMPANY_ACCOUNTS,
      Permission.DELETE_ALL_ACCOUNTS
    ),
    logAccess('DELETE_ACCOUNT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const validatedData = deleteAccountSchema.parse(req.body);

        // Check if account exists and user has access
        const accounts = await storage.getAccounts();
        const account = accounts.find(acc => acc.id === id);

        if (!account) {
          return res.status(404).json({ error: 'Hesap bulunamadı' });
        }

        // Check if user can delete this account type
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          account.type === 'company'
        ) {
          return res
            .status(403)
            .json({ error: 'Şirket hesabı silme yetkiniz bulunmuyor' });
        }

        const deleted = await storage.deleteAccount(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Hesap silinemedi' });
        }

        res.json({
          message: 'Hesap başarıyla silindi',
          reason: validatedData.reason,
        });
      } catch (error) {
        logger.error('❌ Account delete error:', error);
        res.status(400).json({
          error: 'Hesap silinirken hata oluştu',
          details: (error as Error).message,
        });
      }
    }
  );

  // PATCH /api/accounts/:id/status - Toggle account status (active/passive)
  app.patch(
    '/api/accounts/:id/status',
    requireAuth,
    requirePermission(
      Permission.EDIT_PERSONAL_ACCOUNTS,
      Permission.EDIT_COMPANY_ACCOUNTS,
      Permission.EDIT_ALL_ACCOUNTS
    ),
    logAccess('TOGGLE_ACCOUNT_STATUS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
          return res
            .status(400)
            .json({ error: 'isActive değeri boolean olmalıdır' });
        }

        // Check if account exists and user has access
        const accounts = await storage.getAccounts();
        const account = accounts.find(acc => acc.id === id);

        if (!account) {
          return res.status(404).json({ error: 'Hesap bulunamadı' });
        }

        // Check if user can edit this account type
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          account.type === 'company'
        ) {
          return res.status(403).json({
            error: 'Şirket hesabı durumu değiştirme yetkiniz bulunmuyor',
          });
        }

        const updatedAccount = await storage.updateAccount(id, { isActive });
        if (!updatedAccount) {
          return res.status(404).json({ error: 'Hesap durumu güncellenemedi' });
        }

        res.json(updatedAccount);
      } catch (error) {
        logger.error('❌ Account status update error:', error);
        res.status(400).json({
          error: 'Hesap durumu güncellenirken hata oluştu',
          details: (error as Error).message,
        });
      }
    }
  );

  // Account summary endpoint - Enhanced account details with transactions and history
  app.get(
    '/api/accounts/:id/summary',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_ACCOUNTS,
      Permission.VIEW_COMPANY_ACCOUNTS,
      Permission.VIEW_ALL_ACCOUNTS
    ),
    logAccess('VIEW_ACCOUNT_SUMMARY'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const accountId = req.params.id;
        const summary = await storage.getAccountSummary(accountId);

        if (!summary) {
          return res.status(404).json({ error: 'Hesap bulunamadı' });
        }

        // Check if user has access to this account
        const accounts = await storage.getAccounts();
        const allowedAccountIds = accounts
          .filter(account => {
            if (req.user!.role === UserRole.ADMIN) {
              return true;
            }
            if (req.user!.role === UserRole.COMPANY_USER) {
              return true;
            }
            if (req.user!.role === UserRole.PERSONAL_USER) {
              return account.type === 'personal';
            }
            return false;
          })
          .map(account => account.id);

        if (!allowedAccountIds.includes(accountId)) {
          return res
            .status(403)
            .json({ error: 'Bu hesaba erişim yetkiniz yok' });
        }

        res.set({
          'Cache-Control': 'private, max-age=300', // 5 minutes cache
        });

        res.json(summary);
      } catch (error) {
        logger.error('Account summary error:', error);
        res.status(500).json({ error: 'Hesap özeti yüklenirken hata oluştu' });
      }
    }
  );

  // Transaction routes - Protected by authentication and account type permissions
  app.get(
    '/api/transactions',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_TRANSACTIONS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        // Parse pagination and search parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 items per page
        const search = req.query.search as string;
        const accountId = req.query.accountId as string;

        // Get accounts for filtering
        const accounts = await storage.getAccounts();
        const allowedAccountIds = accounts
          .filter(account => {
            if (req.user!.role === UserRole.ADMIN) {
              return true;
            }
            if (req.user!.role === UserRole.COMPANY_USER) {
              return true;
            } // Can see both
            if (req.user!.role === UserRole.PERSONAL_USER) {
              return account.type === 'personal';
            }
            return false;
          })
          .map(account => account.id);

        // Use paginated endpoint for better performance
        const result = await storage.getTransactionsPaginated(
          page,
          limit,
          search,
          accountId
        );

        // Filter transactions based on user role and account access
        const filteredTransactions = result.transactions.filter(transaction =>
          allowedAccountIds.includes(transaction.accountId)
        );

        res.set({
          'Cache-Control': 'private, max-age=60',
          'X-Total-Count': result.total.toString(),
          'X-Total-Pages': result.totalPages.toString(),
          'X-Current-Page': page.toString(),
        });

        res.json({
          transactions: filteredTransactions,
          total: result.total,
          totalPages: result.totalPages,
          currentPage: page,
        });
      } catch (error) {
        res.status(500).json({ error: 'İşlemler yüklenirken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/transactions',
    requireAuth,
    logAccess('CREATE_TRANSACTION'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertTransactionSchema.parse(req.body);

        // Validate transaction type for this endpoint
        if (!['income', 'expense'].includes(validatedData.type)) {
          return res.status(400).json({
            error: 'Bu endpoint sadece gelir ve gider işlemlerini destekler',
          });
        }

        // Check if user can access the target account
        const account = await storage.getAccount(validatedData.accountId);
        if (!account) {
          return res.status(404).json({ error: 'Hesap bulunamadı' });
        }

        // Check account type permissions
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          account.type === 'company'
        ) {
          return res.status(403).json({
            error: 'Şirket hesabında işlem yapma yetkiniz bulunmuyor',
          });
        }

        // Calculate balance adjustment
        let balanceAdjustment = 0;
        const amount =
          typeof validatedData.amount === 'string'
            ? parseFloat(validatedData.amount)
            : validatedData.amount;

        if (validatedData.type === 'income') {
          balanceAdjustment = amount;
        } else if (validatedData.type === 'expense') {
          balanceAdjustment = -amount;
        }

        // Use atomic transaction operation
        const transaction = await storage.performTransaction(
          validatedData,
          balanceAdjustment
        );

        res.json(transaction);
      } catch (error) {
        res.status(400).json({ error: 'Geçersiz işlem verisi' });
      }
    }
  );

  // PUT /api/transactions/:id - Update transaction
  app.put(
    '/api/transactions/:id',
    requireAuth,
    requirePermission(
      Permission.EDIT_PERSONAL_TRANSACTIONS,
      Permission.EDIT_COMPANY_TRANSACTIONS,
      Permission.EDIT_ALL_TRANSACTIONS
    ),
    logAccess('UPDATE_TRANSACTION'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const validatedData = updateTransactionSchema.parse(req.body);

        // Check if transaction exists and user has access
        const transaction = await storage.getTransaction(id);
        if (!transaction) {
          return res.status(404).json({ error: 'İşlem bulunamadı' });
        }

        // Check if user can access the account
        const account = await storage.getAccount(transaction.accountId);
        if (!account) {
          return res.status(404).json({ error: 'Hesap bulunamadı' });
        }

        // Check account type permissions
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          account.type === 'company'
        ) {
          return res.status(403).json({
            error: 'Şirket hesabındaki işlemi düzenleme yetkiniz bulunmuyor',
          });
        }

        const updatedTransaction = await storage.updateTransaction(
          id,
          validatedData
        );
        if (!updatedTransaction) {
          return res.status(404).json({ error: 'İşlem güncellenemedi' });
        }

        res.json(updatedTransaction);
      } catch (error) {
        logger.error('❌ Transaction update error:', error);
        res.status(400).json({
          error: 'İşlem güncellenirken hata oluştu',
          details: (error as Error).message,
        });
      }
    }
  );

  // DELETE /api/transactions/:id - Soft delete transaction
  app.delete(
    '/api/transactions/:id',
    requireAuth,
    requirePermission(
      Permission.DELETE_PERSONAL_TRANSACTIONS,
      Permission.DELETE_COMPANY_TRANSACTIONS,
      Permission.DELETE_ALL_TRANSACTIONS
    ),
    logAccess('DELETE_TRANSACTION'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const validatedData = deleteTransactionSchema.parse(req.body);

        // Check if transaction exists and user has access
        const transaction = await storage.getTransaction(id);
        if (!transaction) {
          return res.status(404).json({ error: 'İşlem bulunamadı' });
        }

        // Check if user can access the account
        const account = await storage.getAccount(transaction.accountId);
        if (!account) {
          return res.status(404).json({ error: 'Hesap bulunamadı' });
        }

        // Check account type permissions
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          account.type === 'company'
        ) {
          return res.status(403).json({
            error: 'Şirket hesabındaki işlemi silme yetkiniz bulunmuyor',
          });
        }

        const deleted = await storage.deleteTransaction(id);
        if (!deleted) {
          return res.status(404).json({ error: 'İşlem silinemedi' });
        }

        res.json({
          message: 'İşlem başarıyla silindi',
          reason: validatedData.reason,
        });
      } catch (error) {
        logger.error('❌ Transaction delete error:', error);
        res.status(400).json({
          error: 'İşlem silinirken hata oluştu',
          details: (error as Error).message,
        });
      }
    }
  );

  // PATCH /api/transactions/:id/category - Update transaction category
  app.patch(
    '/api/transactions/:id/category',
    requireAuth,
    requirePermission(
      Permission.EDIT_PERSONAL_TRANSACTIONS,
      Permission.EDIT_COMPANY_TRANSACTIONS,
      Permission.EDIT_ALL_TRANSACTIONS
    ),
    logAccess('UPDATE_TRANSACTION_CATEGORY'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const { category } = req.body;

        if (!category || typeof category !== 'string') {
          return res
            .status(400)
            .json({ error: 'Kategori değeri string olmalıdır' });
        }

        // Check if transaction exists and user has access
        const transaction = await storage.getTransaction(id);
        if (!transaction) {
          return res.status(404).json({ error: 'İşlem bulunamadı' });
        }

        // Check if user can access the account
        const account = await storage.getAccount(transaction.accountId);
        if (!account) {
          return res.status(404).json({ error: 'Hesap bulunamadı' });
        }

        // Check account type permissions
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          account.type === 'company'
        ) {
          return res.status(403).json({
            error: 'Şirket hesabındaki işlemi düzenleme yetkiniz bulunmuyor',
          });
        }

        const updatedTransaction = await storage.updateTransaction(id, {
          category,
        });
        if (!updatedTransaction) {
          return res
            .status(404)
            .json({ error: 'İşlem kategorisi güncellenemedi' });
        }

        res.json(updatedTransaction);
      } catch (error) {
        logger.error('❌ Transaction category update error:', error);
        res.status(400).json({
          error: 'İşlem kategorisi güncellenirken hata oluştu',
          details: (error as Error).message,
        });
      }
    }
  );

  // Money transfer (virman) route - Protected by authentication
  app.post(
    '/api/virman',
    requireAuth,
    logAccess('TRANSFER_FUNDS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { fromAccountId, toAccountId, amount, description } = req.body;

        const fromAccount = await storage.getAccount(fromAccountId);
        const toAccount = await storage.getAccount(toAccountId);

        if (!fromAccount || !toAccount) {
          return res.status(400).json({ error: 'Hesap bulunamadı' });
        }

        // Check if user can access both accounts
        const canAccessFrom =
          req.user!.role === UserRole.ADMIN ||
          req.user!.role === UserRole.COMPANY_USER ||
          (req.user!.role === UserRole.PERSONAL_USER &&
            fromAccount.type === 'personal');

        const canAccessTo =
          req.user!.role === UserRole.ADMIN ||
          req.user!.role === UserRole.COMPANY_USER ||
          (req.user!.role === UserRole.PERSONAL_USER &&
            toAccount.type === 'personal');

        if (!canAccessFrom || !canAccessTo) {
          return res.status(403).json({
            error: 'Bu hesaplar arasında virman yapma yetkiniz bulunmuyor',
          });
        }

        const transferAmount = parseFloat(amount);
        const virmanId = randomUUID();

        // Use atomic transfer operation
        const { outTransaction, inTransaction } = await storage.performTransfer(
          fromAccountId,
          toAccountId,
          transferAmount,
          description || 'Hesaplar arası transfer',
          virmanId
        );

        // Get updated balances
        const updatedFromAccount = await storage.getAccount(fromAccountId);
        const updatedToAccount = await storage.getAccount(toAccountId);

        res.json({
          message: 'Virman başarılı',
          fromBalance: parseFloat(updatedFromAccount?.balance || '0'),
          toBalance: parseFloat(updatedToAccount?.balance || '0'),
          transactions: [outTransaction, inTransaction],
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Yetersiz bakiye') {
          return res.status(400).json({ error: 'Yetersiz bakiye' });
        }
        res.status(400).json({ error: 'Virman işleminde hata oluştu' });
      }
    }
  );

  // Credit routes - Protected by authentication and account type permissions
  app.get(
    '/api/credits',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_ACCOUNTS,
      Permission.VIEW_COMPANY_ACCOUNTS,
      Permission.VIEW_ALL_ACCOUNTS
    ),
    logAccess('VIEW_CREDITS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const credits = await storage.getCredits();

        // Filter credits based on user role
        const filteredCredits = credits.filter(credit => {
          if (req.user!.role === UserRole.ADMIN) {
            return true;
          }
          if (req.user!.role === UserRole.COMPANY_USER) {
            return true;
          } // Can see both
          if (req.user!.role === UserRole.PERSONAL_USER) {
            // Personal users can only see credits linked to personal accounts
            return !credit.accountId || credit.accountId.startsWith('personal');
          }
          return false;
        });

        res.json(filteredCredits);
      } catch (error) {
        res.status(500).json({ error: 'Krediler yüklenirken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/credits',
    requireAuth,
    logAccess('CREATE_CREDIT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertCreditSchema.parse(req.body);

        // Check if user can create this credit type
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          validatedData.type === 'company'
        ) {
          return res
            .status(403)
            .json({ error: 'Şirket kredisi oluşturma yetkiniz bulunmuyor' });
        }

        const credit = await storage.createCredit(validatedData);
        res.json(credit);
      } catch (error) {
        logger.error('❌ Credit validation error:', error);
        res.status(400).json({
          error: 'Geçersiz kredi verisi',
          details: (error as Error).message,
        });
      }
    }
  );

  // PUT /api/credits/:id - Update credit
  app.put(
    '/api/credits/:id',
    requireAuth,
    requirePermission(
      Permission.EDIT_PERSONAL_ACCOUNTS,
      Permission.EDIT_COMPANY_ACCOUNTS,
      Permission.EDIT_ALL_ACCOUNTS
    ),
    logAccess('UPDATE_CREDIT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const validatedData = updateCreditSchema.parse(req.body);

        // Check if credit exists and user has access
        const credit = await storage.getCredit(id);
        if (!credit) {
          return res.status(404).json({ error: 'Kredi bulunamadı' });
        }

        // Check if user can edit this credit type
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          credit.type === 'company'
        ) {
          return res
            .status(403)
            .json({ error: 'Şirket kredisini düzenleme yetkiniz bulunmuyor' });
        }

        const updatedCredit = await storage.updateCredit(id, validatedData);
        if (!updatedCredit) {
          return res.status(404).json({ error: 'Kredi güncellenemedi' });
        }

        res.json(updatedCredit);
      } catch (error) {
        logger.error('❌ Credit update error:', error);
        res.status(400).json({
          error: 'Kredi güncellenirken hata oluştu',
          details: (error as Error).message,
        });
      }
    }
  );

  // DELETE /api/credits/:id - Soft delete credit
  app.delete(
    '/api/credits/:id',
    requireAuth,
    requirePermission(
      Permission.DELETE_PERSONAL_ACCOUNTS,
      Permission.DELETE_COMPANY_ACCOUNTS,
      Permission.DELETE_ALL_ACCOUNTS
    ),
    logAccess('DELETE_CREDIT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const validatedData = deleteCreditSchema.parse(req.body);

        // Check if credit exists and user has access
        const credit = await storage.getCredit(id);
        if (!credit) {
          return res.status(404).json({ error: 'Kredi bulunamadı' });
        }

        // Check if user can delete this credit type
        if (
          req.user!.role === UserRole.PERSONAL_USER &&
          credit.type === 'company'
        ) {
          return res
            .status(403)
            .json({ error: 'Şirket kredisini silme yetkiniz bulunmuyor' });
        }

        const deleted = await storage.deleteCredit(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Kredi silinemedi' });
        }

        res.json({
          message: 'Kredi başarıyla silindi',
          reason: validatedData.reason,
        });
      } catch (error) {
        logger.error('❌ Credit delete error:', error);
        res.status(400).json({
          error: 'Kredi silinirken hata oluştu',
          details: (error as Error).message,
        });
      }
    }
  );

  // Dashboard route - Protected by authentication with role-based filtering
  app.get(
    '/api/dashboard',
    responseCache({ ttl: 30 * 1000 }), // 30 seconds cache for dashboard
    requireAuth,
    logAccess('VIEW_DASHBOARD'),
    async (req: AuthenticatedRequest, res) => {
      try {
        // Get dashboard data with optimized caching
        const dashboardData = await storage.getDashboardStats();

        // Enhanced caching headers for better performance
        res.set({
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
          ETag: `"dashboard-${req.user!.id}-${Date.now()}"`,
          Vary: 'Authorization',
        });

        // Pre-compute role-based filtering for better performance
        const userRole = req.user!.role;

        if (userRole === UserRole.ADMIN || userRole === UserRole.COMPANY_USER) {
          // Admin and Company users see all data
          res.json(dashboardData);
        } else if (userRole === UserRole.PERSONAL_USER) {
          // Personal user only sees personal account data - optimized filtering
          const personalAccounts = dashboardData.accounts.filter(
            account => account.type === 'personal'
          );
          const personalAccountIds = new Set(
            personalAccounts.map(acc => acc.id)
          );

          // Pre-calculate personal balances efficiently
          const personalBalance = personalAccounts.reduce(
            (sum, account) => sum + parseFloat(account.balance),
            0
          );
          const personalCash = personalAccounts
            .filter(acc => parseFloat(acc.balance) > 0)
            .reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
          const personalDebt = personalAccounts
            .filter(acc => parseFloat(acc.balance) < 0)
            .reduce((sum, acc) => sum + Math.abs(parseFloat(acc.balance)), 0);

          const personalTransactions = dashboardData.recentTransactions.filter(
            tx => personalAccountIds.has(tx.accountId)
          );

          res.json({
            totalBalance: personalBalance,
            companyBalance: 0,
            personalBalance: personalBalance,
            totalCash: personalCash,
            totalDebt: personalDebt,
            totalTransactions: personalTransactions.length,
            recentTransactions: personalTransactions,
            accounts: personalAccounts,
          });
        } else {
          res.json({
            totalBalance: 0,
            companyBalance: 0,
            personalBalance: 0,
            totalCash: 0,
            totalDebt: 0,
            totalTransactions: 0,
            recentTransactions: [],
            accounts: [],
          });
        }
      } catch (error) {
        logger.error('Dashboard error:', error);
        res
          .status(500)
          .json({ error: 'Dashboard verisi yüklenirken hata oluştu' });
      }
    }
  );

  // Real-time updates endpoint using Server-Sent Events
  app.get(
    '/api/dashboard/stream',
    requireAuth,
    logAccess('VIEW_DASHBOARD_STREAM'),
    (req: AuthenticatedRequest, res) => {
      realtimeService.addClient(req.user!.id, res);
    }
  );

  // Consolidation breakdown endpoint
  app.get(
    '/api/consolidation/breakdown',
    requireAuth,
    requirePermission(
      Permission.VIEW_ALL_REPORTS,
      Permission.VIEW_COMPANY_REPORTS,
      Permission.VIEW_PERSONAL_REPORTS
    ),
    logAccess('VIEW_CONSOLIDATION_BREAKDOWN'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { calculateConsolidationBreakdown, prepareBreakdownChartData } =
          await import('./src/modules/consolidation/breakdown');
        const accounts = await storage.getAccounts();

        // Filter accounts based on user role
        const filteredAccounts = accounts.filter(account => {
          if (req.user!.role === UserRole.ADMIN) {
            return true;
          }
          if (req.user!.role === UserRole.COMPANY_USER) {
            return account.type === 'company' || account.type === 'personal';
          }
          if (req.user!.role === UserRole.PERSONAL_USER) {
            return account.type === 'personal';
          }
          return false;
        });

        const result = calculateConsolidationBreakdown(filteredAccounts);
        const chartData = prepareBreakdownChartData(result.breakdown);

        res.json({
          breakdown: result.breakdown,
          table: result.table,
          summary: result.summary,
          chartData,
          accounts: filteredAccounts.length,
        });
      } catch (error) {
        console.error('Consolidation breakdown error:', error);
        logger.error('Consolidation breakdown error:', error);
        res.status(500).json({
          error: 'Konsolidasyon breakdown hesaplanırken hata oluştu',
          details: error instanceof Error ? error.message : 'Bilinmeyen hata',
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
  );

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    logger.info('Register endpoint hit');
    try {
      const validatedData = registerSchema.parse(req.body);
      logger.debug('Registration validation passed');

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        logger.warn('Registration failed: email already exists');
        return res
          .status(400)
          .json({ error: 'Bu email adresi zaten kullanılıyor' });
      }

      const existingUsername = await storage.getUserByUsername(
        validatedData.username
      );
      if (existingUsername) {
        logger.warn('Registration failed: username already exists');
        return res
          .status(400)
          .json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
      }

      // Hash password
      logger.debug('Hashing password');
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      // Debug log removed
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
      });

      // Don't return password
      const { password, ...userWithoutPassword } = user;
      // Business log removed
      // Info log removed

      const response = {
        message: 'Kullanıcı başarıyla oluşturuldu',
        user: userWithoutPassword,
      };
      res.status(201).json(response);
    } catch (error) {
      logger.error('❌ Register error:', error);
      res.status(400).json({ error: 'Kayıt sırasında hata oluştu' });
    }
  });

  // DSCR endpoint
  app.get(
    '/api/finance/dscr',
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { operatingCF, debtService } = req.query;

        if (!operatingCF || !debtService) {
          return res.status(400).json({
            error: 'operatingCF ve debtService parametreleri gerekli',
          });
        }

        const operatingCFNum = parseFloat(operatingCF as string);
        const debtServiceNum = parseFloat(debtService as string);

        if (
          isNaN(operatingCFNum) ||
          isNaN(debtServiceNum) ||
          debtServiceNum === 0
        ) {
          return res.status(400).json({ error: 'Geçersiz parametreler' });
        }

        const dscr = operatingCFNum / debtServiceNum;
        let status: 'ok' | 'warning' | 'critical' = 'ok';

        if (dscr < 1.0) {
          status = 'critical';
        } else if (dscr < 1.25) {
          status = 'warning';
        }

        res.json({ dscr, status });
      } catch (error) {
        logger.error('DSCR calculation error:', error);
        res.status(500).json({ error: 'DSCR hesaplama hatası' });
      }
    }
  );

  app.post('/api/auth/login', async (req, res) => {
    try {
      logger.info('🔐 Login attempt started');
      logger.debug('Request body:', req.body);

      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email ve şifre gerekli' });
      }

      const validatedData = { email, password };
      logger.debug('✓ Validation passed');

      // Find user by email - use db interface
      logger.debug('Searching for user:', validatedData.email);
      const user = dbInterface.getUserByEmail(validatedData.email) as any;

      if (!user) {
        logger.warn('Login failed: user not found', {
          email: validatedData.email,
        });
        return res.status(401).json({ error: 'Geçersiz email veya şifre' });
      }

      logger.debug('User found:', {
        userId: user.id,
        email: user.email,
        fields: Object.keys(user),
      });

      // Check password - SQLite uses password_hash field
      const passwordToCheck = user.password_hash;

      if (!passwordToCheck) {
        logger.error('Login failed: no password hash found for user', {
          userId: user.id,
          userFields: Object.keys(user),
        });
        return res.status(500).json({ error: 'Sistem hatası' });
      }

      logger.debug('Comparing passwords...');
      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        passwordToCheck
      );
      logger.debug('Password comparison result:', isValidPassword);

      if (!isValidPassword) {
        logger.warn('Login failed: invalid password', {
          email: validatedData.email,
        });
        return res.status(401).json({ error: 'Geçersiz email veya şifre' });
      }

      // Check if user account is active (SQLite stores as integer)
      if (user.is_active === 0) {
        return res.status(403).json({
          error: 'Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin',
          code: 'ACCOUNT_INACTIVE',
        });
      }

      // Generate JWT token
      const token = JWTAuthService.generateToken(user);

      // Remove sensitive fields
      const userResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.is_active === 1 || user.is_active === true,
      };

      logger.info('✅ Login successful', {
        userId: user.id,
        email: user.email,
      });

      res.json({
        message: 'Giriş başarılı',
        user: userResponse,
        token,
      });
    } catch (error) {
      console.error('❌ LOGIN ERROR CAUGHT:', error);
      logger.error('❌ Login error:', error);
      res.status(500).json({
        error: 'Giriş sırasında hata oluştu',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.post(
    '/api/auth/logout',
    requireAuth,
    logAccess('LOGOUT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        if (req.session.userId) {
          // Auth log removed

          // Destroy session
          req.session.destroy(err => {
            if (err) {
              logger.error('❌ Session destruction error:', err);
              return res
                .status(500)
                .json({ error: 'Çıkış sırasında hata oluştu' });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            res.json({ message: 'Çıkış başarılı' });
          });
        } else {
          res.json({ message: 'Zaten çıkış yapılmış' });
        }
      } catch (error) {
        logger.error('❌ Logout error:', error);
        res.status(500).json({ error: 'Çıkış sırasında hata oluştu' });
      }
    }
  );

  // JWT Authentication Routes
  app.post('/api/auth/jwt/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: 'Geçersiz email veya şifre' });
      }

      // Check password with Argon2id
      const isValidPassword = await authHardeningService.verifyPassword(
        validatedData.password,
        user.password
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Geçersiz email veya şifre' });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({
          error: 'Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin',
          code: 'ACCOUNT_INACTIVE',
        });
      }

      // Check for revoked tokens
      const isTokenRevoked = await authHardeningService.isTokenRevoked(user.id);
      if (isTokenRevoked) {
        return res.status(401).json({ error: 'Oturumunuz sonlandırılmış' });
      }

      // Update last login
      await storage.updateLastLogin(user.id);

      // Generate JWT tokens with rotation
      const tokenPair = await authHardeningService.generateTokenPair(user.id);

      // Auth log removed

      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json({
        message: 'Giriş başarılı',
        user: userWithoutPassword,
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        tokenType: 'Bearer',
      });
    } catch (error) {
      logger.error('JWT Login error:', error);
      res.status(401).json({ error: 'Giriş sırasında hata oluştu' });
    }
  });

  app.post('/api/auth/jwt/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token is required' });
      }

      // Verify refresh token with rotation
      const result =
        await authHardeningService.rotateRefreshToken(refreshToken);
      if (!result.success) {
        return res
          .status(401)
          .json({ error: result.error || 'Invalid or expired refresh token' });
      }

      res.json({
        message: 'Token refreshed successfully',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: 'Bearer',
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({ error: 'Token yenileme sırasında hata oluştu' });
    }
  });

  app.post(
    '/api/auth/jwt/logout',
    requireJWTAuth,
    logJWTAccess('JWT_LOGOUT'),
    async (req: JWTAuthenticatedRequest, res) => {
      try {
        // Extract token from Authorization header
        const token = JWTAuthService.extractTokenFromHeader(
          req.headers.authorization
        );

        if (token) {
          // Revoke token using auth hardening service
          await authHardeningService.revokeToken(token, req.user?.id || '');
          logger.info('🚪 JWT token revoked for user:', req.user?.id);
        }

        res.json({ message: 'Çıkış başarılı' });
      } catch (error) {
        logger.error('❌ JWT Logout error:', error);
        res.status(500).json({ error: 'Çıkış sırasında hata oluştu' });
      }
    }
  );

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);

      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({
          message:
            'Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderilecek',
        });
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      await storage.setResetToken(
        validatedData.email,
        resetToken,
        resetTokenExpires
      );

      // Send email with reset link
      const { emailService } = await import('./services/email-service.js');
      const template = emailService.generatePasswordResetTemplate(resetToken);
      await emailService.sendEmail(validatedData.email, template);

      res.json({
        message: 'Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderilecek',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res
        .status(500)
        .json({ error: 'Şifre sıfırlama isteği sırasında hata oluştu' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);

      // Find user by reset token
      const user = await storage.findUserByResetToken(validatedData.token);
      if (!user) {
        return res.status(400).json({
          error: 'Geçersiz veya süresi dolmuş şifre sıfırlama tokeni',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

      // Update user password and clear reset token
      await storage.updateUserPassword(user.id, hashedPassword);
      await storage.clearPasswordResetToken(validatedData.token);

      res.json({ message: 'Şifreniz başarıyla güncellendi' });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(400).json({ error: 'Şifre sıfırlama sırasında hata oluştu' });
    }
  });

  app.get(
    '/api/auth/me',
    requireAuth,
    async (req: AuthenticatedRequest, res) => {
      try {
        // Return current user from session
        res.json({
          user: req.user,
        });
      } catch (error) {
        logger.error('❌ Get user error:', error);
        res
          .status(500)
          .json({ error: 'Kullanıcı bilgileri alınırken hata oluştu' });
      }
    }
  );

  // Admin User Management Routes
  app.get(
    '/api/admin/users',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS, Permission.VIEW_USERS),
    logAccess('VIEW_ALL_USERS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const users = await storage.getAllUsers();

        // Remove password from all users for security
        const safeUsers = users.map(({ password, ...user }) => user);

        res.json(safeUsers);
      } catch (error) {
        logger.error('Get all users error:', error);
        res.status(500).json({ error: 'Kullanıcılar yüklenirken hata oluştu' });
      }
    }
  );

  app.put(
    '/api/admin/users/:userId/role',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS),
    logAccess('CHANGE_USER_ROLE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { userId } = req.params;
        try {
          var validatedData = updateUserRoleSchema.parse(req.body);
        } catch (error) {
          return res.status(400).json({ error: 'Geçersiz veri formatı' });
        }
        const { role } = validatedData;

        // Prevent self role change to avoid lockout
        if (userId === req.user!.id) {
          return res
            .status(403)
            .json({ error: 'Kendi rolünüzü değiştiremezsiniz' });
        }

        const updatedUser = await storage.updateUserRole(userId, role);
        if (!updatedUser) {
          return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Remove password for security
        const { password, ...safeUser } = updatedUser;

        res.json({
          message: 'Kullanıcı rolü başarıyla değiştirildi',
          user: safeUser,
        });
      } catch (error) {
        logger.error('Update user role error:', error);
        res.status(500).json({ error: 'Rol değiştirilirken hata oluştu' });
      }
    }
  );

  app.put(
    '/api/admin/users/:userId/status',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS),
    logAccess('CHANGE_USER_STATUS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { userId } = req.params;
        try {
          var validatedData = updateUserStatusSchema.parse(req.body);
        } catch (error) {
          return res.status(400).json({ error: 'Geçersiz veri formatı' });
        }
        const { isActive } = validatedData;

        // Prevent self deactivation to avoid lockout
        if (userId === req.user!.id && !isActive) {
          return res
            .status(403)
            .json({ error: 'Kendi hesabınızı pasif hale getiremezsiniz' });
        }

        const updatedUser = await storage.updateUserStatus(userId, isActive);
        if (!updatedUser) {
          return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Remove password for security
        const { password, ...safeUser } = updatedUser;

        res.json({
          message: `Kullanıcı ${isActive ? 'aktif' : 'pasif'} hale getirildi`,
          user: safeUser,
        });
      } catch (error) {
        logger.error('Update user status error:', error);
        res
          .status(500)
          .json({ error: 'Kullanıcı durumu değiştirilirken hata oluştu' });
      }
    }
  );

  // JWT-based Admin User Management Routes
  app.get(
    '/api/jwt/admin/users',
    requireJWTAuth,
    requireJWTPermission(Permission.MANAGE_USERS, Permission.VIEW_USERS),
    logJWTAccess('JWT_VIEW_ALL_USERS'),
    async (req: JWTAuthenticatedRequest, res) => {
      try {
        const users = await storage.getAllUsers();

        // Remove password from all users for security
        const safeUsers = users.map(({ password, ...user }) => user);

        res.json(safeUsers);
      } catch (error) {
        logger.error('JWT Get all users error:', error);
        res.status(500).json({ error: 'Kullanıcılar yüklenirken hata oluştu' });
      }
    }
  );

  app.put(
    '/api/jwt/admin/users/:userId/role',
    requireJWTAuth,
    requireJWTPermission(Permission.MANAGE_USERS),
    logJWTAccess('JWT_CHANGE_USER_ROLE'),
    async (req: JWTAuthenticatedRequest, res) => {
      try {
        const { userId } = req.params;
        try {
          var validatedData = updateUserRoleSchema.parse(req.body);
        } catch (error) {
          return res.status(400).json({ error: 'Geçersiz veri formatı' });
        }
        const { role } = validatedData;

        // Prevent self role change to avoid lockout
        if (userId === req.user!.id) {
          return res
            .status(403)
            .json({ error: 'Kendi rolünüzü değiştiremezsiniz' });
        }

        const updatedUser = await storage.updateUserRole(userId, role);
        if (!updatedUser) {
          return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Remove password for security
        const { password, ...safeUser } = updatedUser;

        res.json({
          message: 'Kullanıcı rolü başarıyla değiştirildi',
          user: safeUser,
        });
      } catch (error) {
        logger.error('JWT Update user role error:', error);
        res
          .status(500)
          .json({ error: 'Kullanıcı rolü değiştirilirken hata oluştu' });
      }
    }
  );

  app.put(
    '/api/jwt/admin/users/:userId/status',
    requireJWTAuth,
    requireJWTPermission(Permission.MANAGE_USERS),
    logJWTAccess('JWT_CHANGE_USER_STATUS'),
    async (req: JWTAuthenticatedRequest, res) => {
      try {
        const { userId } = req.params;
        try {
          var validatedData = updateUserStatusSchema.parse(req.body);
        } catch (error) {
          return res.status(400).json({ error: 'Geçersiz veri formatı' });
        }
        const { isActive } = validatedData;

        // Prevent self deactivation to avoid lockout
        if (userId === req.user!.id && !isActive) {
          return res
            .status(403)
            .json({ error: 'Kendi hesabınızı pasif hale getiremezsiniz' });
        }

        const updatedUser = await storage.updateUserStatus(userId, isActive);
        if (!updatedUser) {
          return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Remove password for security
        const { password, ...safeUser } = updatedUser;

        res.json({
          message: `Kullanıcı ${isActive ? 'aktif' : 'pasif'} hale getirildi`,
          user: safeUser,
        });
      } catch (error) {
        logger.error('JWT Update user status error:', error);
        res
          .status(500)
          .json({ error: 'Kullanıcı durumu değiştirilirken hata oluştu' });
      }
    }
  );

  // JWT-based User Profile Routes
  app.get(
    '/api/jwt/auth/me',
    requireJWTAuth,
    logJWTAccess('JWT_GET_PROFILE'),
    async (req: JWTAuthenticatedRequest, res) => {
      try {
        const user = await storage.getUser(req.user!.id);
        if (!user) {
          return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Remove password for security
        const { password, ...safeUser } = user;
        res.json({ user: safeUser });
      } catch (error) {
        logger.error('JWT Get profile error:', error);
        res
          .status(500)
          .json({ error: 'Profil bilgileri alınırken hata oluştu' });
      }
    }
  );

  app.put(
    '/api/jwt/auth/profile',
    requireJWTAuth,
    logJWTAccess('JWT_UPDATE_PROFILE'),
    async (req: JWTAuthenticatedRequest, res) => {
      try {
        const { username, email } = req.body;

        // Validate input
        if (!username || !email) {
          return res
            .status(400)
            .json({ error: 'Kullanıcı adı ve email gereklidir' });
        }

        // Check if email is already taken by another user
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== req.user!.id) {
          return res.status(400).json({
            error:
              'Bu email adresi başka bir kullanıcı tarafından kullanılıyor',
          });
        }

        const updatedUser = await storage.updateUserProfile(req.user!.id, {
          username,
          email,
        });
        if (!updatedUser) {
          return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Remove password for security
        const { password, ...safeUser } = updatedUser;

        res.json({
          message: 'Profil başarıyla güncellendi',
          user: safeUser,
        });
      } catch (error) {
        logger.error('JWT Update profile error:', error);
        res.status(500).json({ error: 'Profil güncellenirken hata oluştu' });
      }
    }
  );

  // ==================== FIXED EXPENSES API ROUTES ====================

  // Get all fixed expenses
  app.get(
    '/api/fixed-expenses',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_FIXED_EXPENSES'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const expenses = await storage.getFixedExpenses();
        res.json(expenses);
      } catch (error) {
        logger.error('Get fixed expenses error:', error);
        res
          .status(500)
          .json({ error: 'Sabit giderler yüklenirken hata oluştu' });
      }
    }
  );

  // Get specific fixed expense
  app.get(
    '/api/fixed-expenses/:id',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_FIXED_EXPENSE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const expense = await storage.getFixedExpense(id);

        if (!expense) {
          return res.status(404).json({ error: 'Sabit gider bulunamadı' });
        }

        res.json(expense);
      } catch (error) {
        logger.error('Get fixed expense error:', error);
        res.status(500).json({ error: 'Sabit gider yüklenirken hata oluştu' });
      }
    }
  );

  // Create new fixed expense
  app.post(
    '/api/fixed-expenses',
    requireAuth,
    requirePermission(
      Permission.CREATE_PERSONAL_TRANSACTIONS,
      Permission.CREATE_COMPANY_TRANSACTIONS,
      Permission.CREATE_ALL_TRANSACTIONS
    ),
    logAccess('CREATE_FIXED_EXPENSE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertFixedExpenseSchema.parse(req.body);

        // Check if user has access to the specified account
        if (validatedData.accountId) {
          const accounts = await storage.getAccounts();
          const account = accounts.find(
            acc => acc.id === validatedData.accountId
          );

          if (!account) {
            return res.status(404).json({ error: 'Hesap bulunamadı' });
          }

          // Check account type access based on user role
          if (
            req.user!.role === UserRole.PERSONAL_USER &&
            account.type !== 'personal'
          ) {
            return res
              .status(403)
              .json({ error: 'Bu hesap türüne erişim yetkiniz yok' });
          }
        }

        const expense = await storage.createFixedExpense(validatedData);

        res.status(201).json({
          message: 'Sabit gider başarıyla oluşturuldu',
          expense,
        });
      } catch (error) {
        logger.error('Create fixed expense error:', error);
        res
          .status(400)
          .json({ error: 'Sabit gider oluşturulurken hata oluştu' });
      }
    }
  );

  // Update fixed expense
  app.put(
    '/api/fixed-expenses/:id',
    requireAuth,
    requirePermission(
      Permission.UPDATE_PERSONAL_TRANSACTIONS,
      Permission.UPDATE_COMPANY_TRANSACTIONS,
      Permission.UPDATE_ALL_TRANSACTIONS
    ),
    logAccess('UPDATE_FIXED_EXPENSE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;

        const updatedExpense = await storage.updateFixedExpense(id, updates);

        if (!updatedExpense) {
          return res.status(404).json({ error: 'Sabit gider bulunamadı' });
        }

        res.json({
          message: 'Sabit gider başarıyla güncellendi',
          expense: updatedExpense,
        });
      } catch (error) {
        logger.error('Update fixed expense error:', error);
        res
          .status(500)
          .json({ error: 'Sabit gider güncellenirken hata oluştu' });
      }
    }
  );

  // Delete fixed expense
  app.delete(
    '/api/fixed-expenses/:id',
    requireAuth,
    requirePermission(
      Permission.DELETE_PERSONAL_TRANSACTIONS,
      Permission.DELETE_COMPANY_TRANSACTIONS,
      Permission.DELETE_ALL_TRANSACTIONS
    ),
    logAccess('DELETE_FIXED_EXPENSE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;

        const deleted = await storage.deleteFixedExpense(id);

        if (!deleted) {
          return res.status(404).json({ error: 'Sabit gider bulunamadı' });
        }

        res.json({ message: 'Sabit gider başarıyla silindi' });
      } catch (error) {
        logger.error('Delete fixed expense error:', error);
        res.status(500).json({ error: 'Sabit gider silinirken hata oluştu' });
      }
    }
  );

  // Process recurring expenses (admin only)
  app.post(
    '/api/fixed-expenses/process',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS),
    logAccess('PROCESS_RECURRING_EXPENSES'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const result = await storage.processRecurringExpenses();

        res.json({
          message: `${result.processed} adet tekrarlayan gider işlendi`,
          processed: result.processed,
          transactions: result.transactions,
        });
      } catch (error) {
        logger.error('Process recurring expenses error:', error);
        res
          .status(500)
          .json({ error: 'Tekrarlayan giderler işlenirken hata oluştu' });
      }
    }
  );

  // ==================== INVESTMENT & PORTFOLIO API ROUTES ====================

  // Get all investments
  app.get(
    '/api/investments',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_INVESTMENTS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const investments = await storage.getInvestments();
        res.json(investments);
      } catch (error) {
        logger.error('Get investments error:', error);
        res.status(500).json({ error: 'Yatırımlar getirilirken hata oluştu' });
      }
    }
  );

  // Get portfolio summary
  app.get(
    '/api/investments/portfolio',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_PORTFOLIO'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const portfolio = await storage.getPortfolioSummary();
        res.json(portfolio);
      } catch (error) {
        logger.error('Get portfolio summary error:', error);
        res
          .status(500)
          .json({ error: 'Portföy özeti getirilirken hata oluştu' });
      }
    }
  );

  // Get investments by type
  app.get(
    '/api/investments/type/:type',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_INVESTMENTS_BY_TYPE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { type } = req.params;
        const investments = await storage.getInvestmentsByType(type);
        res.json(investments);
      } catch (error) {
        logger.error('Get investments by type error:', error);
        res
          .status(500)
          .json({ error: 'Yatırımlar türe göre getirilirken hata oluştu' });
      }
    }
  );

  // Get specific investment
  app.get(
    '/api/investments/:id',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_INVESTMENT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const investment = await storage.getInvestment(id);

        if (!investment) {
          return res.status(404).json({ error: 'Yatırım bulunamadı' });
        }

        res.json(investment);
      } catch (error) {
        logger.error('Get investment error:', error);
        res.status(500).json({ error: 'Yatırım getirilirken hata oluştu' });
      }
    }
  );

  // Create new investment
  app.post(
    '/api/investments',
    requireAuth,
    requirePermission(
      Permission.CREATE_PERSONAL_TRANSACTIONS,
      Permission.CREATE_COMPANY_TRANSACTIONS,
      Permission.CREATE_ALL_TRANSACTIONS
    ),
    logAccess('CREATE_INVESTMENT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertInvestmentSchema.parse(req.body);
        const investment = await storage.createInvestment(validatedData);
        res.status(201).json(investment);
      } catch (error) {
        logger.error('Create investment error:', error);
        if (error instanceof Error && error.name === 'ZodError') {
          res
            .status(400)
            .json({ error: 'Geçersiz veri formatı', details: error.message });
        } else {
          res.status(500).json({ error: 'Yatırım oluşturulurken hata oluştu' });
        }
      }
    }
  );

  // Update investment
  app.put(
    '/api/investments/:id',
    requireAuth,
    requirePermission(
      Permission.UPDATE_PERSONAL_TRANSACTIONS,
      Permission.UPDATE_COMPANY_TRANSACTIONS,
      Permission.UPDATE_ALL_TRANSACTIONS
    ),
    logAccess('UPDATE_INVESTMENT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const validatedData = insertInvestmentSchema.partial().parse(req.body);

        const investment = await storage.updateInvestment(id, validatedData);

        if (!investment) {
          return res.status(404).json({ error: 'Yatırım bulunamadı' });
        }

        res.json(investment);
      } catch (error) {
        logger.error('Update investment error:', error);
        if (error instanceof Error && error.name === 'ZodError') {
          res
            .status(400)
            .json({ error: 'Geçersiz veri formatı', details: error.message });
        } else {
          res.status(500).json({ error: 'Yatırım güncellenirken hata oluştu' });
        }
      }
    }
  );

  // Update investment price
  app.patch(
    '/api/investments/:id/price',
    requireAuth,
    requirePermission(
      Permission.UPDATE_PERSONAL_TRANSACTIONS,
      Permission.UPDATE_COMPANY_TRANSACTIONS,
      Permission.UPDATE_ALL_TRANSACTIONS
    ),
    logAccess('UPDATE_INVESTMENT_PRICE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const { currentPrice } = req.body;

        if (typeof currentPrice !== 'number' || currentPrice < 0) {
          return res
            .status(400)
            .json({ error: 'Geçerli bir fiyat değeri giriniz' });
        }

        const investment = await storage.updateInvestmentPrice(
          id,
          currentPrice
        );

        if (!investment) {
          return res.status(404).json({ error: 'Yatırım bulunamadı' });
        }

        res.json(investment);
      } catch (error) {
        logger.error('Update investment price error:', error);
        res
          .status(500)
          .json({ error: 'Yatırım fiyatı güncellenirken hata oluştu' });
      }
    }
  );

  // Delete investment
  app.delete(
    '/api/investments/:id',
    requireAuth,
    requirePermission(
      Permission.DELETE_PERSONAL_TRANSACTIONS,
      Permission.DELETE_COMPANY_TRANSACTIONS,
      Permission.DELETE_ALL_TRANSACTIONS
    ),
    logAccess('DELETE_INVESTMENT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const success = await storage.deleteInvestment(id);

        if (!success) {
          return res.status(404).json({ error: 'Yatırım bulunamadı' });
        }

        res.json({ message: 'Yatırım başarıyla silindi' });
      } catch (error) {
        logger.error('Delete investment error:', error);
        res.status(500).json({ error: 'Yatırım silinirken hata oluştu' });
      }
    }
  );

  // ==================== FORECAST & SCENARIO ANALYSIS API ROUTES ====================

  // Get all forecasts
  app.get(
    '/api/forecasts',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_FORECASTS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const forecasts = await storage.getForecasts();
        res.json(forecasts);
      } catch (error) {
        logger.error('Get forecasts error:', error);
        res.status(500).json({ error: 'Tahminler getirilirken hata oluştu' });
      }
    }
  );

  // Get active forecasts
  app.get(
    '/api/forecasts/active',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_ACTIVE_FORECASTS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const forecasts = await storage.getActiveForecasts();
        res.json(forecasts);
      } catch (error) {
        logger.error('Get active forecasts error:', error);
        res
          .status(500)
          .json({ error: 'Aktif tahminler getirilirken hata oluştu' });
      }
    }
  );

  // Get forecasts by scenario
  app.get(
    '/api/forecasts/scenario/:scenario',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_FORECASTS_BY_SCENARIO'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { scenario } = req.params;
        const forecasts = await storage.getForecastsByScenario(scenario);
        res.json(forecasts);
      } catch (error) {
        logger.error('Get forecasts by scenario error:', error);
        res
          .status(500)
          .json({ error: 'Senaryoya göre tahminler getirilirken hata oluştu' });
      }
    }
  );

  // Get specific forecast
  app.get(
    '/api/forecasts/:id',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_FORECAST'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const forecast = await storage.getForecast(id);

        if (!forecast) {
          return res.status(404).json({ error: 'Tahmin bulunamadı' });
        }

        res.json(forecast);
      } catch (error) {
        logger.error('Get forecast error:', error);
        res.status(500).json({ error: 'Tahmin getirilirken hata oluştu' });
      }
    }
  );

  // Create new forecast
  app.post(
    '/api/forecasts',
    requireAuth,
    requirePermission(
      Permission.CREATE_PERSONAL_TRANSACTIONS,
      Permission.CREATE_COMPANY_TRANSACTIONS,
      Permission.CREATE_ALL_TRANSACTIONS
    ),
    logAccess('CREATE_FORECAST'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertForecastSchema.parse(req.body);
        const forecast = await storage.createForecast(validatedData);
        res.status(201).json(forecast);
      } catch (error) {
        logger.error('Create forecast error:', error);
        if (error instanceof Error && error.name === 'ZodError') {
          res
            .status(400)
            .json({ error: 'Geçersiz veri formatı', details: error.message });
        } else {
          res.status(500).json({ error: 'Tahmin oluşturulurken hata oluştu' });
        }
      }
    }
  );

  // Update forecast
  app.put(
    '/api/forecasts/:id',
    requireAuth,
    requirePermission(
      Permission.UPDATE_PERSONAL_TRANSACTIONS,
      Permission.UPDATE_COMPANY_TRANSACTIONS,
      Permission.UPDATE_ALL_TRANSACTIONS
    ),
    logAccess('UPDATE_FORECAST'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const validatedData = insertForecastSchema.partial().parse(req.body);

        const forecast = await storage.updateForecast(id, validatedData);

        if (!forecast) {
          return res.status(404).json({ error: 'Tahmin bulunamadı' });
        }

        res.json(forecast);
      } catch (error) {
        logger.error('Update forecast error:', error);
        if (error instanceof Error && error.name === 'ZodError') {
          res
            .status(400)
            .json({ error: 'Geçersiz veri formatı', details: error.message });
        } else {
          res.status(500).json({ error: 'Tahmin güncellenirken hata oluştu' });
        }
      }
    }
  );

  // Delete forecast
  app.delete(
    '/api/forecasts/:id',
    requireAuth,
    requirePermission(
      Permission.DELETE_PERSONAL_TRANSACTIONS,
      Permission.DELETE_COMPANY_TRANSACTIONS,
      Permission.DELETE_ALL_TRANSACTIONS
    ),
    logAccess('DELETE_FORECAST'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { id } = req.params;
        const success = await storage.deleteForecast(id);

        if (!success) {
          return res.status(404).json({ error: 'Tahmin bulunamadı' });
        }

        res.json({ message: 'Tahmin başarıyla silindi' });
      } catch (error) {
        logger.error('Delete forecast error:', error);
        res.status(500).json({ error: 'Tahmin silinirken hata oluştu' });
      }
    }
  );

  // Get predefined scenarios
  app.get(
    '/api/scenarios/predefined',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('VIEW_PREDEFINED_SCENARIOS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { ScenarioAnalysisService } = await import(
          './scenario-analysis-service'
        );
        const service = new ScenarioAnalysisService(storage);
        const scenarios = await service.getScenarioForecasts();
        res.json(scenarios);
      } catch (error) {
        logger.error('Get predefined scenarios error:', error);
        res.status(500).json({
          error: 'Önceden tanımlanmış senaryolar getirilirken hata oluştu',
        });
      }
    }
  );

  // Analyze custom scenario
  app.post(
    '/api/scenarios/analyze',
    requireAuth,
    requirePermission(
      Permission.CREATE_PERSONAL_TRANSACTIONS,
      Permission.CREATE_COMPANY_TRANSACTIONS,
      Permission.CREATE_ALL_TRANSACTIONS
    ),
    logAccess('ANALYZE_SCENARIO'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { scenarioName, parameters } = req.body;

        if (!scenarioName || !parameters) {
          return res
            .status(400)
            .json({ error: 'Senaryo adı ve parametreler gerekli' });
        }

        const { ScenarioAnalysisService } = await import(
          './scenario-analysis-service'
        );
        const service = new ScenarioAnalysisService(storage);
        const result = await service.analyzeScenario(parameters, scenarioName);

        res.json(result);
      } catch (error) {
        logger.error('Analyze scenario error:', error);
        res
          .status(500)
          .json({ error: 'Senaryo analizi yapılırken hata oluştu' });
      }
    }
  );

  // Analyze predefined scenario
  app.post(
    '/api/scenarios/analyze/:scenarioKey',
    requireAuth,
    requirePermission(
      Permission.CREATE_PERSONAL_TRANSACTIONS,
      Permission.CREATE_COMPANY_TRANSACTIONS,
      Permission.CREATE_ALL_TRANSACTIONS
    ),
    logAccess('ANALYZE_PREDEFINED_SCENARIO'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { scenarioKey } = req.params;

        const { ScenarioAnalysisService } = await import(
          './scenario-analysis-service'
        );
        const service = new ScenarioAnalysisService(storage);
        const scenarios = await service.getScenarioForecasts();

        const scenario = scenarios.find(
          (s: any) =>
            s.scenario?.toLowerCase().replace(/\s+/g, '_') === scenarioKey
        );

        if (!scenario) {
          return res.status(404).json({ error: 'Senaryo bulunamadı' });
        }

        const result = await service.analyzeScenario(
          scenario.parameters ? JSON.parse(scenario.parameters) : {},
          scenario.title
        );

        res.json(result);
      } catch (error) {
        logger.error('Analyze predefined scenario error:', error);
        res.status(500).json({
          error: 'Önceden tanımlanmış senaryo analizi yapılırken hata oluştu',
        });
      }
    }
  );

  // ==================== TEAM MANAGEMENT API ROUTES ====================

  // Team CRUD routes
  app.post(
    '/api/teams',
    requireAuth,
    logAccess('CREATE_TEAM'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = insertTeamSchema.parse(req.body);

        // Set the current user as the team owner
        const teamData = {
          ...validatedData,
          ownerId: req.user!.id,
        };

        const team = await storage.createTeam(teamData);

        // Automatically add the creator as team owner member
        await storage.addTeamMember({
          teamId: team.id,
          userId: req.user!.id,
          teamRole: 'owner',
          permissions: undefined,
          isActive: true,
        });

        res.json(team);
      } catch (error) {
        logger.error('Create team error:', error);
        res.status(400).json({ error: 'Takım oluşturulurken hata oluştu' });
      }
    }
  );

  app.get(
    '/api/teams',
    requireAuth,
    logAccess('VIEW_TEAMS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const teams = await storage.getTeamsByUserId(req.user!.id);
        res.json(teams);
      } catch (error) {
        logger.error('Get teams error:', error);
        res.status(500).json({ error: 'Takımlar yüklenirken hata oluştu' });
      }
    }
  );

  app.get(
    '/api/teams/:teamId',
    requireAuth,
    logAccess('VIEW_TEAM_DETAILS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId } = req.params;

        // Check if user is a member of this team
        const teamMember = await storage.getTeamMember(teamId, req.user!.id);
        if (!teamMember) {
          return res
            .status(403)
            .json({ error: 'Bu takıma erişim yetkiniz bulunmuyor' });
        }

        const team = await storage.getTeam(teamId);
        if (!team) {
          return res.status(404).json({ error: 'Takım bulunamadı' });
        }

        res.json(team);
      } catch (error) {
        logger.error('Get team error:', error);
        res
          .status(500)
          .json({ error: 'Takım bilgileri yüklenirken hata oluştu' });
      }
    }
  );

  app.put(
    '/api/teams/:teamId',
    requireAuth,
    logAccess('UPDATE_TEAM'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId } = req.params;

        // Check if user has team management permission
        const userRole = await storage.getUserTeamRole(teamId, req.user!.id);
        if (
          !userRole ||
          !(userRole === TeamRole.OWNER || userRole === TeamRole.ADMIN)
        ) {
          return res
            .status(403)
            .json({ error: 'Takım düzenleme yetkiniz bulunmuyor' });
        }

        // SECURITY FIX: Use secure update schema that only allows name/description
        const validatedData = updateTeamSchema.parse(req.body);
        const updatedTeam = await storage.updateTeam(teamId, validatedData);

        if (!updatedTeam) {
          return res.status(404).json({ error: 'Takım bulunamadı' });
        }

        res.json(updatedTeam);
      } catch (error) {
        logger.error('Update team error:', error);
        res.status(400).json({ error: 'Takım güncellenirken hata oluştu' });
      }
    }
  );

  app.delete(
    '/api/teams/:teamId',
    requireAuth,
    logAccess('DELETE_TEAM'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId } = req.params;

        // Only team owner can delete the team
        const team = await storage.getTeam(teamId);
        if (!team || team.ownerId !== req.user!.id) {
          return res
            .status(403)
            .json({ error: 'Sadece takım sahibi takımı silebilir' });
        }

        const deleted = await storage.deleteTeam(teamId);
        if (!deleted) {
          return res.status(404).json({ error: 'Takım bulunamadı' });
        }

        res.json({ message: 'Takım başarıyla silindi' });
      } catch (error) {
        logger.error('Delete team error:', error);
        res.status(500).json({ error: 'Takım silinirken hata oluştu' });
      }
    }
  );

  // Team Member Management routes
  app.get(
    '/api/teams/:teamId/members',
    requireAuth,
    logAccess('VIEW_TEAM_MEMBERS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId } = req.params;

        // Check if user is a member of this team
        const teamMember = await storage.getTeamMember(teamId, req.user!.id);
        if (!teamMember) {
          return res
            .status(403)
            .json({ error: 'Bu takıma erişim yetkiniz bulunmuyor' });
        }

        const members = await storage.getTeamMembers(teamId);
        res.json(members);
      } catch (error) {
        logger.error('Get team members error:', error);
        res
          .status(500)
          .json({ error: 'Takım üyeleri yüklenirken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/teams/:teamId/members',
    requireAuth,
    logAccess('ADD_TEAM_MEMBER'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId } = req.params;

        // Check if user has invite members permission
        const userRole = await storage.getUserTeamRole(teamId, req.user!.id);
        if (
          !userRole ||
          !hasTeamPermission(userRole as any, TeamPermission.INVITE_MEMBERS)
        ) {
          return res
            .status(403)
            .json({ error: 'Üye ekleme yetkiniz bulunmuyor' });
        }

        const validatedData = insertTeamMemberSchema.parse(req.body);
        const member = await storage.addTeamMember(validatedData);

        res.json(member);
      } catch (error) {
        logger.error('Add team member error:', error);
        res.status(400).json({ error: 'Takım üyesi eklenirken hata oluştu' });
      }
    }
  );

  app.put(
    '/api/teams/:teamId/members/:userId',
    requireAuth,
    logAccess('UPDATE_TEAM_MEMBER'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId, userId } = req.params;

        // SECURITY FIX: Check if user has manage roles permission OR is owner
        const userRole = await storage.getUserTeamRole(teamId, req.user!.id);
        const team = await storage.getTeam(teamId);

        const isOwner = team?.ownerId === req.user!.id;
        const hasManagePermission =
          userRole &&
          (userRole === TeamRole.OWNER || userRole === TeamRole.ADMIN);

        if (!isOwner && !hasManagePermission) {
          return res
            .status(403)
            .json({ error: 'Rol düzenleme yetkiniz bulunmuyor' });
        }

        // SECURITY FIX: Prevent demoting/changing team owner
        if (team && team.ownerId === userId) {
          return res
            .status(403)
            .json({ error: 'Takım sahibinin rolü değiştirilemez' });
        }

        const member = await storage.getTeamMember(teamId, userId);
        if (!member) {
          return res.status(404).json({ error: 'Takım üyesi bulunamadı' });
        }

        // SECURITY FIX: Restrict what can be updated - only teamRole allowed
        const allowedUpdates = { teamRole: req.body.teamRole };
        if (!allowedUpdates.teamRole) {
          return res.status(400).json({ error: 'Geçersiz güncelleme verisi' });
        }

        const updatedMember = await storage.updateTeamMember(
          member.id,
          allowedUpdates
        );

        res.json(updatedMember);
      } catch (error) {
        logger.error('Update team member error:', error);
        res
          .status(400)
          .json({ error: 'Takım üyesi güncellenirken hata oluştu' });
      }
    }
  );

  app.delete(
    '/api/teams/:teamId/members/:userId',
    requireAuth,
    logAccess('REMOVE_TEAM_MEMBER'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId, userId } = req.params;

        // SECURITY FIX: Check if user has remove members permission OR is owner
        const userRole = await storage.getUserTeamRole(teamId, req.user!.id);
        const team = await storage.getTeam(teamId);

        const isOwner = team?.ownerId === req.user!.id;
        const hasRemovePermission =
          userRole &&
          (userRole === TeamRole.OWNER || userRole === TeamRole.ADMIN);

        if (!isOwner && !hasRemovePermission) {
          return res
            .status(403)
            .json({ error: 'Üye çıkarma yetkiniz bulunmuyor' });
        }

        // SECURITY FIX: Cannot remove team owner - ENFORCED PROTECTION
        if (team && team.ownerId === userId) {
          return res.status(403).json({ error: 'Takım sahibi çıkarılamaz' });
        }

        // SECURITY FIX: Verify target member exists before removal
        const targetMember = await storage.getTeamMember(teamId, userId);
        if (!targetMember) {
          return res.status(404).json({ error: 'Takım üyesi bulunamadı' });
        }

        const removed = await storage.removeTeamMember(teamId, userId);
        if (!removed) {
          return res
            .status(500)
            .json({ error: 'Takım üyesi çıkarılırken hata oluştu' });
        }

        res.json({
          message: 'Takım üyesi başarıyla çıkarıldı',
          removedUserId: userId,
        });
      } catch (error) {
        logger.error('Remove team member error:', error);
        res.status(500).json({ error: 'Takım üyesi çıkarılırken hata oluştu' });
      }
    }
  );

  // Team Invite System routes
  app.post(
    '/api/teams/:teamId/invites',
    requireAuth,
    logAccess('CREATE_TEAM_INVITE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId } = req.params;

        // Check if user has invite members permission
        const userRole = await storage.getUserTeamRole(teamId, req.user!.id);
        if (
          !userRole ||
          !hasTeamPermission(userRole as any, TeamPermission.INVITE_MEMBERS)
        ) {
          return res
            .status(403)
            .json({ error: 'Davet gönderme yetkiniz bulunmuyor' });
        }

        const validatedData = inviteUserSchema.parse(req.body);

        // Generate invite token
        const inviteToken = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const invite = await storage.createInvite({
          teamId: validatedData.teamId,
          inviterUserId: req.user!.id,
          invitedEmail: validatedData.email,
          invitedUserId: undefined,
          teamRole: validatedData.teamRole,
          status: 'pending',
          inviteToken,
          expiresAt,
        });

        // Send email invitation
        const { emailService } = await import('./services/email-service.js');
        const team = await storage.getTeam(validatedData.teamId);
        if (team) {
          const template = emailService.generateTeamInviteTemplate(
            team.name,
            inviteToken
          );
          await emailService.sendEmail(validatedData.email, template);
        }

        res.json({
          message: 'Davet başarıyla gönderildi',
          inviteId: invite.id,
        });
      } catch (error) {
        logger.error('Create invite error:', error);
        res.status(400).json({ error: 'Davet oluşturulurken hata oluştu' });
      }
    }
  );

  app.get(
    '/api/teams/:teamId/invites',
    requireAuth,
    logAccess('VIEW_TEAM_INVITES'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { teamId } = req.params;

        // Check if user has team management permission
        const userRole = await storage.getUserTeamRole(teamId, req.user!.id);
        if (
          !userRole ||
          !hasTeamPermission(userRole as any, TeamPermission.MANAGE_TEAM)
        ) {
          return res
            .status(403)
            .json({ error: 'Davet görüntüleme yetkiniz bulunmuyor' });
        }

        const invites = await storage.getTeamInvites(teamId);
        res.json(invites);
      } catch (error) {
        logger.error('Get team invites error:', error);
        res.status(500).json({ error: 'Davetler yüklenirken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/invites/accept',
    requireAuth,
    logAccess('ACCEPT_TEAM_INVITE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = acceptInviteSchema.parse(req.body);

        const invite = await storage.getInviteByToken(validatedData.token);
        if (!invite) {
          return res.status(404).json({ error: 'Geçersiz davet linki' });
        }

        // SECURITY FIX: Strict status and expiry checks
        if (invite.status !== 'pending') {
          return res
            .status(400)
            .json({ error: 'Bu davet zaten işleme alınmış' });
        }

        // SECURITY FIX: Enforce expiry check
        const now = new Date();
        if (invite.expiresAt <= now) {
          await storage.updateInviteStatus(invite.id, 'expired');
          return res.status(400).json({ error: 'Davet süresi dolmuş' });
        }

        // SECURITY FIX: Strict email verification
        if (invite.invitedEmail !== req.user!.email) {
          return res.status(403).json({ error: 'Bu davet size gönderilmemiş' });
        }

        // SECURITY FIX: Check if user is already a team member
        const existingMember = await storage.getTeamMember(
          invite.teamId,
          req.user!.id
        );
        if (existingMember) {
          return res.status(400).json({ error: 'Bu takımın zaten üyesisiniz' });
        }

        // SECURITY FIX: Verify team still exists and is active
        const team = await storage.getTeam(invite.teamId);
        if (!team?.isActive) {
          return res
            .status(400)
            .json({ error: 'Davet edilen takım artık mevcut değil' });
        }

        // Add user to team - atomic operation
        try {
          await storage.addTeamMember({
            teamId: invite.teamId,
            userId: req.user!.id,
            teamRole: invite.teamRole,
            permissions: undefined,
            isActive: true,
          });

          // Update invite status only after successful team addition
          await storage.updateInviteStatus(invite.id, 'accepted', req.user!.id);

          res.json({
            message: 'Takım davetini başarıyla kabul ettiniz',
            teamId: invite.teamId,
            teamName: team.name,
          });
        } catch (memberError) {
          logger.error('Add team member error:', memberError);
          res
            .status(500)
            .json({ error: 'Takıma katılım sırasında hata oluştu' });
        }
      } catch (error) {
        logger.error('Accept invite error:', error);
        res.status(400).json({ error: 'Davet kabul edilirken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/invites/:inviteId/decline',
    requireAuth,
    logAccess('DECLINE_TEAM_INVITE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { inviteId } = req.params;

        const invite = await storage.getInvite(inviteId);
        if (!invite) {
          return res.status(404).json({ error: 'Davet bulunamadı' });
        }

        if (invite.invitedEmail !== req.user!.email) {
          return res.status(403).json({ error: 'Bu davet size gönderilmemiş' });
        }

        await storage.updateInviteStatus(inviteId, 'declined');

        res.json({ message: 'Takım daveti reddedildi' });
      } catch (error) {
        logger.error('Decline invite error:', error);
        res.status(500).json({ error: 'Davet reddedilirken hata oluştu' });
      }
    }
  );

  app.get(
    '/api/user/invites',
    requireAuth,
    logAccess('VIEW_USER_INVITES'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const invites = await storage.getPendingInvitesByEmail(req.user!.email);
        res.json(invites);
      } catch (error) {
        logger.error('Get user invites error:', error);
        res.status(500).json({ error: 'Davetleriniz yüklenirken hata oluştu' });
      }
    }
  );

  // Export API routes - Protected by authentication
  app.get(
    '/api/export/csv',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('EXPORT_CSV'),
    async (req: AuthenticatedRequest, res) => {
      try {
        // CSV writer handled manually for security
        const accounts = await storage.getAccounts();
        const transactions = await storage.getTransactions();

        // Filter accounts and transactions based on user role
        const allowedAccountIds = accounts
          .filter(account => {
            if (req.user!.role === UserRole.ADMIN) {
              return true;
            }
            if (req.user!.role === UserRole.COMPANY_USER) {
              return true;
            }
            if (req.user!.role === UserRole.PERSONAL_USER) {
              return account.type === 'personal';
            }
            return false;
          })
          .map(account => account.id);

        const filteredAccounts = accounts.filter(account =>
          allowedAccountIds.includes(account.id)
        );

        const filteredTransactions = transactions.filter(transaction =>
          allowedAccountIds.includes(transaction.accountId)
        );

        // Safe CSV escaping function to prevent injection
        const escapeCsvValue = (value: string | number): string => {
          if (value == null) {
            return '';
          }
          let escaped = String(value).trimStart(); // Remove leading whitespace
          // Neutralize formula injection (Excel formula prefixes)
          if (escaped.match(/^[=+\-@]/)) {
            escaped = `'${escaped}`;
          }
          // Always wrap in quotes for safety
          escaped = `"${escaped.replace(/"/g, '""')}"`;
          return escaped;
        };

        // Create safe CSV data with UNIVERSAL escaping for all fields
        const csvData = filteredTransactions.map(transaction => {
          const account = filteredAccounts.find(
            acc => acc.id === transaction.accountId
          );
          const tipLabel =
            transaction.type === 'income'
              ? 'Gelir'
              : transaction.type === 'expense'
                ? 'Gider'
                : transaction.type === 'transfer_in'
                  ? 'Gelen Virman'
                  : 'Giden Virman';

          return {
            tarih: escapeCsvValue(
              new Date(transaction.date).toLocaleDateString('tr-TR')
            ),
            hesap: escapeCsvValue(account ? account.bankName : 'Bilinmeyen'),
            tip: escapeCsvValue(tipLabel),
            miktar: escapeCsvValue(transaction.amount),
            aciklama: escapeCsvValue(transaction.description),
            kategori: escapeCsvValue(transaction.category || ''),
            para_birimi: escapeCsvValue(account ? account.currency : 'TRY'),
          };
        });

        // Set response headers
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="finbot-islemler-${timestamp}.csv"`
        );

        // Add BOM for Turkish characters in Excel
        res.write('\uFEFF');

        // Write CSV header
        const headerRow =
          'Tarih,Hesap,İşlem Tipi,Miktar,Açıklama,Kategori,Para Birimi\n';
        res.write(headerRow);

        // Write CSV data with safe escaping
        csvData.forEach(row => {
          const csvRow = `${row.tarih},${row.hesap},${row.tip},${row.miktar},${row.aciklama},${row.kategori},${row.para_birimi}\n`;
          res.write(csvRow);
        });

        res.end();
      } catch (error) {
        logger.error('CSV export error:', error);
        res.status(500).json({ error: 'CSV export sırasında hata oluştu' });
      }
    }
  );

  app.get(
    '/api/export/pdf',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('EXPORT_PDF'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const puppeteer = require('puppeteer');
        const accounts = await storage.getAccounts();
        const transactions = await storage.getTransactions();
        const dashboardStats = await storage.getDashboardStats();

        // Filter data based on user role
        const allowedAccountIds = accounts
          .filter(account => {
            if (req.user!.role === UserRole.ADMIN) {
              return true;
            }
            if (req.user!.role === UserRole.COMPANY_USER) {
              return true;
            }
            if (req.user!.role === UserRole.PERSONAL_USER) {
              return account.type === 'personal';
            }
            return false;
          })
          .map(account => account.id);

        const filteredAccounts = accounts.filter(account =>
          allowedAccountIds.includes(account.id)
        );

        const filteredTransactions = transactions.filter(transaction =>
          allowedAccountIds.includes(transaction.accountId)
        );

        const formatCurrency = (amount: string) => {
          const num = parseFloat(amount);
          return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
          }).format(num);
        };

        // HTML escape function to prevent XSS
        const escapeHtml = (unsafe: string): string => {
          if (unsafe == null) {
            return '';
          }
          return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };

        // Create HTML content for PDF
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>FinBot - Finansal Rapor</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; text-align: center; }
            h2 { color: #666; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .summary { display: flex; justify-content: space-around; margin: 30px 0; }
            .kpi { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .kpi-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1>FinBot - Finansal Rapor</h1>
          <p style="text-align: center; color: #666;">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
          
          <div class="summary">
            <div class="kpi">
              <div>Toplam Nakit</div>
              <div class="kpi-value positive">${formatCurrency(dashboardStats.totalCash.toString())}</div>
            </div>
            <div class="kpi">
              <div>Toplam Borç</div>
              <div class="kpi-value negative">${formatCurrency(dashboardStats.totalDebt.toString())}</div>
            </div>
            <div class="kpi">
              <div>Net Bakiye</div>
              <div class="kpi-value">${formatCurrency(dashboardStats.totalBalance.toString())}</div>
            </div>
          </div>
          
          <h2>Hesaplar (${filteredAccounts.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Banka</th>
                <th>Hesap Adı</th>
                <th>Tip</th>
                <th>Bakiye</th>
                <th>Para Birimi</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAccounts
                .map(
                  account => `
                <tr>
                  <td>${escapeHtml(account.bankName)}</td>
                  <td>${escapeHtml(account.accountName)}</td>
                  <td>${account.type === 'company' ? 'Şirket' : 'Kişisel'}</td>
                  <td class="${parseFloat(account.balance) >= 0 ? 'positive' : 'negative'}">${formatCurrency(account.balance)}</td>
                  <td>${escapeHtml(account.currency)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <h2>Son İşlemler (${filteredTransactions.slice(0, 20).length})</h2>
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Hesap</th>
                <th>İşlem Tipi</th>
                <th>Miktar</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions
                .slice(0, 20)
                .map(transaction => {
                  const account = filteredAccounts.find(
                    acc => acc.id === transaction.accountId
                  );
                  const tipLabel =
                    transaction.type === 'income'
                      ? 'Gelir'
                      : transaction.type === 'expense'
                        ? 'Gider'
                        : transaction.type === 'transfer_in'
                          ? 'Gelen Virman'
                          : 'Giden Virman';
                  return `
                <tr>
                  <td>${escapeHtml(new Date(transaction.date).toLocaleDateString('tr-TR'))}</td>
                  <td>${escapeHtml(account ? account.bankName : 'Bilinmeyen')}</td>
                  <td>${escapeHtml(tipLabel)}</td>
                  <td class="${transaction.type === 'income' || transaction.type === 'transfer_in' ? 'positive' : 'negative'}">${formatCurrency(transaction.amount)}</td>
                  <td>${escapeHtml(transaction.description)}</td>
                </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </body>
        </html>
        `;

        // Generate PDF with hardened Puppeteer settings and proper resource management
        let browser = null;
        let pdfBuffer;
        try {
          browser = await puppeteer.launch({
            headless: 'new',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
            ],
          });
          const page = await browser.newPage();
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

          pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
              top: '20px',
              right: '20px',
              bottom: '20px',
              left: '20px',
            },
          });
        } finally {
          if (browser) {
            await browser.close();
          }
        }

        // Set response headers
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="finbot-rapor-${timestamp}.pdf"`
        );

        res.send(pdfBuffer);
      } catch (error) {
        logger.error('PDF export error:', error);
        res.status(500).json({ error: 'PDF export sırasında hata oluştu' });
      }
    }
  );

  app.post(
    '/api/export/google-sheets',
    requireAuth,
    requirePermission(
      Permission.VIEW_PERSONAL_TRANSACTIONS,
      Permission.VIEW_COMPANY_TRANSACTIONS,
      Permission.VIEW_ALL_TRANSACTIONS
    ),
    logAccess('EXPORT_GOOGLE_SHEETS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { google } = require('googleapis');
        const { JWT } = require('google-auth-library');

        // Initialize Google Sheets API with service account
        const auth = new JWT({
          email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        if (
          !spreadsheetId ||
          !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
          !process.env.GOOGLE_PRIVATE_KEY
        ) {
          return res.status(500).json({
            error: 'Google Sheets konfigürasyonu eksik',
            message: 'Gerekli environment değişkenleri ayarlanmamış',
          });
        }

        // Get data similar to CSV export
        const accounts = await storage.getAccounts();
        const transactions = await storage.getTransactions();

        // Filter data based on user role
        const allowedAccountIds = accounts
          .filter(account => {
            if (req.user!.role === UserRole.ADMIN) {
              return true;
            }
            if (req.user!.role === UserRole.COMPANY_USER) {
              return true;
            }
            if (req.user!.role === UserRole.PERSONAL_USER) {
              return account.type === 'personal';
            }
            return false;
          })
          .map(account => account.id);

        const filteredAccounts = accounts.filter(account =>
          allowedAccountIds.includes(account.id)
        );

        const filteredTransactions = transactions.filter(transaction =>
          allowedAccountIds.includes(transaction.accountId)
        );

        // Prepare data for Google Sheets
        const headers = [
          'Tarih',
          'Hesap',
          'Tip',
          'Miktar',
          'Açıklama',
          'Kategori',
        ];
        const sheetData = [headers];

        filteredTransactions.forEach(transaction => {
          const account = filteredAccounts.find(
            acc => acc.id === transaction.accountId
          );
          const tipLabel =
            transaction.type === 'income'
              ? 'Gelir'
              : transaction.type === 'expense'
                ? 'Gider'
                : transaction.type === 'transfer_in'
                  ? 'Gelen Virman'
                  : 'Giden Virman';

          sheetData.push([
            new Date(transaction.date).toLocaleDateString('tr-TR'),
            account ? account.bankName : 'Bilinmeyen',
            tipLabel,
            transaction.amount,
            transaction.description,
            transaction.category || '',
          ]);
        });

        // Create a new worksheet with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const worksheetTitle = `FinBot-${timestamp}`;

        // First, create the spreadsheet or add a new sheet
        try {
          // Try to add a new sheet to the existing spreadsheet
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: worksheetTitle,
                      gridProperties: {
                        rowCount: sheetData.length + 10,
                        columnCount: headers.length,
                      },
                    },
                  },
                },
              ],
            },
          });
        } catch (error) {
          logger.error('Error creating new sheet:', error);
          // If we can't create a new sheet, we'll use the first sheet
        }

        // Write data to the sheet
        const range = `${worksheetTitle}!A1:${String.fromCharCode(65 + headers.length - 1)}${sheetData.length}`;

        try {
          await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'RAW',
            resource: {
              values: sheetData,
            },
          });
        } catch (error) {
          // Fallback to Sheet1 if the named sheet doesn't work
          const fallbackRange = `Sheet1!A1:${String.fromCharCode(65 + headers.length - 1)}${sheetData.length}`;
          await sheets.spreadsheets.values.clear({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A:Z',
          });

          await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: fallbackRange,
            valueInputOption: 'RAW',
            resource: {
              values: sheetData,
            },
          });
        }

        // Generate the Google Sheets URL
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

        res.json({
          message: "Veriler Google Sheets'e başarıyla aktarıldı",
          url: sheetUrl,
          worksheetTitle: worksheetTitle,
          recordCount: filteredTransactions.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Google Sheets export error:', error);
        res.status(500).json({
          error: 'Google Sheets export sırasında hata oluştu',
          details: error instanceof Error ? error.message : 'Bilinmeyen hata',
        });
      }
    }
  );

  // System Alerts API Routes
  app.get(
    '/api/alerts',
    requireAuth,
    logAccess('VIEW_ALERTS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const alerts = await storage.getActiveSystemAlerts();
        res.json(alerts);
      } catch (error) {
        logger.error('Get alerts error:', error);
        res.status(500).json({ error: 'Uyarılar yüklenirken hata oluştu' });
      }
    }
  );

  app.get(
    '/api/alerts/all',
    requireAuth,
    requirePermission(Permission.MANAGE_SETTINGS), // Only admins can see all alerts
    logAccess('VIEW_ALL_ALERTS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const alerts = await storage.getSystemAlerts();
        res.json(alerts);
      } catch (error) {
        logger.error('Get all alerts error:', error);
        res.status(500).json({ error: 'Tüm uyarılar yüklenirken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/alerts/:alertId/dismiss',
    requireAuth,
    logAccess('DISMISS_ALERT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { alertId } = req.params;
        const alert = await storage.dismissSystemAlert(alertId);

        if (!alert) {
          return res.status(404).json({ error: 'Uyarı bulunamadı' });
        }

        res.json({ message: 'Uyarı başarıyla kapatıldı', alert });
      } catch (error) {
        logger.error('Dismiss alert error:', error);
        res.status(500).json({ error: 'Uyarı kapatılırken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/alerts/run-checks',
    requireAuth,
    requirePermission(Permission.MANAGE_SETTINGS), // Only admins can trigger checks
    logAccess('RUN_ALERT_CHECKS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        await alertService.runAllChecks();
        res.json({ message: 'Uyarı kontrolleri başarıyla çalıştırıldı' });
      } catch (error) {
        logger.error('Run alert checks error:', error);
        res
          .status(500)
          .json({ error: 'Uyarı kontrolleri çalıştırılırken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/alerts',
    requireAuth,
    requirePermission(Permission.MANAGE_SETTINGS),
    logAccess('CREATE_ALERT'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const alertData = insertSystemAlertSchema.parse(req.body);
        const alert = await storage.createSystemAlert(alertData);
        res.status(201).json(alert);
      } catch (error) {
        logger.error('Create alert error:', error);
        res.status(400).json({ error: 'Uyarı oluşturulurken hata oluştu' });
      }
    }
  );

  // Transaction JSON Service API Routes
  app.post(
    '/api/transactions/export-json',
    requireAuth,
    requirePermission(Permission.VIEW_ALL_TRANSACTIONS),
    logAccess('EXPORT_TRANSACTIONS_JSON'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const result = await transactionJsonService.exportTransactionsToJson();

        if (result.success) {
          res.json({
            message: result.message,
            filePath: result.filePath,
            success: true,
          });
        } else {
          res.status(400).json({
            error: result.message,
            success: false,
          });
        }
      } catch (error) {
        logger.error('Export transactions JSON error:', error);
        res
          .status(500)
          .json({ error: "İşlemler JSON'a aktarılırken hata oluştu" });
      }
    }
  );

  app.post(
    '/api/transactions/import-json',
    requireAuth,
    requirePermission(Permission.MANAGE_SETTINGS),
    logAccess('IMPORT_TRANSACTIONS_JSON'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = importTransactionJsonSchema.parse(req.body);
        const result = await transactionJsonService.importTransactionsFromJson(
          validatedData.overwriteExisting
        );

        if (result.success) {
          res.json({
            message: result.message,
            importedCount: result.importedCount,
            success: true,
          });
        } else {
          res.status(400).json({
            error: result.message,
            success: false,
          });
        }
      } catch (error) {
        logger.error('Import transactions JSON error:', error);
        res
          .status(500)
          .json({ error: "JSON'dan işlemler içe aktarılırken hata oluştu" });
      }
    }
  );

  app.get(
    '/api/transactions/json-status',
    requireAuth,
    requirePermission(Permission.VIEW_ALL_TRANSACTIONS),
    logAccess('CHECK_TRANSACTIONS_JSON'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const status = await transactionJsonService.checkJsonFile();
        res.json(status);
      } catch (error) {
        logger.error('Check transactions JSON status error:', error);
        res
          .status(500)
          .json({ error: 'JSON dosya durumu kontrol edilirken hata oluştu' });
      }
    }
  );

  app.post(
    '/api/transactions/export-json-by-date',
    requireAuth,
    requirePermission(Permission.VIEW_ALL_TRANSACTIONS),
    logAccess('EXPORT_TRANSACTIONS_JSON_BY_DATE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const validatedData = exportTransactionsByDateSchema.parse(req.body);

        const result =
          await transactionJsonService.exportTransactionsByDateRange(
            new Date(validatedData.startDate),
            new Date(validatedData.endDate)
          );

        if (result.success) {
          res.json({
            message: result.message,
            filePath: result.filePath,
            success: true,
          });
        } else {
          res.status(400).json({
            error: result.message,
            success: false,
          });
        }
      } catch (error) {
        logger.error('Export transactions by date JSON error:', error);
        res
          .status(500)
          .json({ error: "Tarihli işlemler JSON'a aktarılırken hata oluştu" });
      }
    }
  );

  app.post(
    '/api/transactions/export-category-analysis',
    requireAuth,
    requirePermission(Permission.VIEW_ALL_TRANSACTIONS),
    logAccess('EXPORT_CATEGORY_ANALYSIS_JSON'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const result =
          await transactionJsonService.exportCategoryAnalysisToJson();

        if (result.success) {
          res.json({
            message: result.message,
            filePath: result.filePath,
            success: true,
          });
        } else {
          res.status(400).json({
            error: result.message,
            success: false,
          });
        }
      } catch (error) {
        logger.error('Export category analysis JSON error:', error);
        res
          .status(500)
          .json({ error: "Kategori analizi JSON'a aktarılırken hata oluştu" });
      }
    }
  );

  // =====================
  // AI ROUTES
  // =====================

  // Get AI settings (Admin only)
  app.get(
    '/api/admin/ai/settings',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS),
    logAccess('VIEW_AI_SETTINGS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const settings = openaiService.getSettings();
        // Don't return the actual API key for security
        const safeSettings = {
          ...settings,
          apiKey: settings.apiKey ? '***hidden***' : null,
        };
        res.json(safeSettings);
      } catch (error) {
        res.status(500).json({ error: 'AI ayarları yüklenirken hata oluştu' });
      }
    }
  );

  // Update AI settings (Admin only)
  app.put(
    '/api/admin/ai/settings',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS),
    logAccess('UPDATE_AI_SETTINGS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const {
          provider,
          apiKey,
          isActive,
          defaultModel,
          cacheDuration,
          maxTokens,
          temperature,
        } = req.body;

        await openaiService.updateSettings({
          provider,
          apiKey,
          isActive,
          defaultModel,
          cacheDuration,
        });

        res.json({ message: 'AI ayarları güncellendi' });
      } catch (error) {
        res
          .status(400)
          .json({ error: 'AI ayarları güncellenirken hata oluştu' });
      }
    }
  );

  // Test AI connection (Admin only)
  app.post(
    '/api/admin/ai/test',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS),
    logAccess('TEST_AI_CONNECTION'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const result = await openaiService.testConnection();
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Bağlantı testi sırasında hata oluştu',
        });
      }
    }
  );

  // Generate AI response (Authenticated users - supports both JWT and Session)
  app.post(
    '/api/ai/generate',
    async (req: AuthenticatedRequest, res, next) => {
      // Try JWT auth first, fallback to session auth
      const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.substring(7)
        : null;

      if (token) {
        // Use JWT auth
        return requireJWTAuth(req, res, next);
      } else {
        // Use session auth
        return requireAuth(req, res, next);
      }
    },
    logAccess('GENERATE_AI_RESPONSE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { query, persona } = req.body;

        if (!query || typeof query !== 'string') {
          return res.status(400).json({ error: 'Sorgu metni gereklidir' });
        }

        const response = await openaiService.generateResponse(
          query,
          persona || 'default'
        );

        if (!response.success) {
          return res
            .status(500)
            .json({ error: response.error || 'AI yanıtı oluşturulamadı' });
        }

        res.json({
          response: response.response,
          model: response.model,
          cached: response.cached || false,
        });
      } catch (error) {
        res.status(500).json({ error: 'AI yanıtı oluşturulurken hata oluştu' });
      }
    }
  );

  // Get AI cache stats (Admin only)
  app.get(
    '/api/admin/ai/cache/stats',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS),
    logAccess('VIEW_AI_CACHE_STATS'),
    async (req: AuthenticatedRequest, res) => {
      try {
        // Cache stats not available - return empty stats
        res.json({ hits: 0, misses: 0, size: 0 });
      } catch (error) {
        res
          .status(500)
          .json({ error: 'Cache istatistikleri yüklenirken hata oluştu' });
      }
    }
  );

  // Clear AI cache (Admin only)
  app.post(
    '/api/admin/ai/cache/clear',
    requireAuth,
    requirePermission(Permission.MANAGE_USERS),
    logAccess('CLEAR_AI_CACHE'),
    async (req: AuthenticatedRequest, res) => {
      try {
        openaiService.clearCache();
        res.json({ message: 'AI cache temizlendi' });
      } catch (error) {
        res.status(500).json({ error: 'Cache temizlenirken hata oluştu' });
      }
    }
  );

  // ===================================
  // TENANT ROUTES (White-Label)
  // ===================================
  app.use('/api/tenants', tenantsRouter);

  // ===================================
  // INVESTMENT & PORTFOLIO ROUTES
  // ===================================
  app.use('/api/investments', requireAuth, investmentsRouter);
  app.use('/api/portfolio', requireAuth, portfolioRouter);

  // ===================================
  // AI AGENTS ROUTES
  // ===================================
  app.use('/api/ai-agents', requireAuth, aiAgentsRouter);

  // ===================================
  // RISK ANALYSIS ROUTES
  // ===================================
  app.use('/api/risk', requireAuth, riskRouter(Router()));

  // ===================================
  // SIMULATION ROUTES
  // ===================================
  app.use('/api/simulation', requireAuth, simulationRouter(Router()));

  // ===================================
  // ADVISOR ROUTES
  // ===================================
  app.use('/api/advisor', requireAuth, advisorRouter(Router()));

  // ===================================
  // EMAIL VERIFICATION ROUTES
  // ===================================
  app.use('/api/email-verification', emailVerificationRouter);

  // ===================================
  // BUDGET LINES ROUTES
  // ===================================
  app.use('/api/budget-lines', budgetLinesRouter);

  // ===================================
  // EXPORT ROUTES
  // ===================================
  app.use('/api/export', exportRouter);

  // ===================================
  // RECURRING TRANSACTIONS ROUTES
  // ===================================
  app.use('/api/recurring', recurringRouter);

  // ===================================
  // BUDGET COMPARE ROUTES
  // ===================================
  app.use('/api/budget', budgetCompareRouter);

  // ===================================
  // SCENARIO ANALYSIS ROUTES
  // ===================================
  app.use('/api/scenario', scenarioRouter);

  // ===================================
  // AGING ANALYSIS ROUTES
  // ===================================
  app.use('/api/aging', agingRouter);

  // ===================================
  // DASHBOARD EXTENDED ROUTES
  // ===================================
  app.use('/api/dashboard', dashboardExtendedRouter);

  // ===================================
  // DASHBOARD LAYOUT ROUTES
  // ===================================
  app.use('/api/dashboard', dashboardLayoutRouter);

  // ===================================
  // REALTIME ROUTES
  // ===================================
  app.use('/api/realtime', realtimeRouter);

  // ===================================
  // ANALYTICS ROUTES
  // ===================================
  app.use('/api/analytics', analyticsRouter);

  // ===================================
  // PERFORMANCE ROUTES
  // ===================================
  app.use('/api/performance', performanceRouter);

  // ===================================
  // ENHANCED EXPORT ROUTES
  // ===================================
  app.use('/api/export', enhancedExportRouter);

  // ===================================
  // CASHBOX ROUTES
  // ===================================
  app.use('/api/cashbox', cashboxRouter);

  // ===================================
  // BANK INTEGRATION ROUTES
  // ===================================
  app.use('/api/bank-integrations', bankIntegrationRouter);

  // ===================================
  // SECURITY ROUTES
  // ===================================
  app.use('/api/security', securityRouter);

  // Return app instead of httpServer (httpServer will be created in index.ts)
  // @ts-ignore - return type mismatch but we need this for flexibility
  return app;
}
