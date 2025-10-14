// @ts-nocheck - Temporary fix for TypeScript errors
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, desc } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './db/schema';
// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/finbot';
// Add SSL mode for production (Render requires SSL)
const sslConnectionString = connectionString.includes('?')
    ? `${connectionString}&sslmode=require`
    : `${connectionString}?sslmode=require`;
const client = postgres(sslConnectionString);
export const db = drizzle(client, { schema });
// Database interface for backward compatibility - PostgreSQL version
const dbInterface = {
    getAccounts: async () => {
        return await db.select().from(schema.accounts);
    },
    getAccountById: async (id) => {
        const result = await db.select().from(schema.accounts).where(eq(schema.accounts.id, id));
        return result[0] || null;
    },
    createAccount: async (accountData) => {
        return await db.insert(schema.accounts).values({
            userId: accountData.user_id,
            name: accountData.name,
            type: accountData.type,
            balance: accountData.balance,
            currency: accountData.currency || 'TRY',
        });
    },
    updateAccount: async (id, accountData) => {
        return await db.update(schema.accounts)
            .set({
            name: accountData.name,
            type: accountData.type,
            balance: accountData.balance,
            currency: accountData.currency,
            updatedAt: new Date(),
        })
            .where(eq(schema.accounts.id, id));
    },
    deleteAccount: async (id) => {
        return await db.delete(schema.accounts).where(eq(schema.accounts.id, id));
    },
    getTransactions: async (userId) => {
        let query = db.select().from(schema.transactions);
        if (userId) {
            query = query.where(eq(schema.transactions.userId, userId));
        }
        return await query.orderBy(desc(schema.transactions.date));
    },
    getTransactionById: async (id) => {
        const result = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id));
        return result[0] || null;
    },
    createTransaction: async (transactionData) => {
        return await db.insert(schema.transactions).values({
            accountId: transactionData.account_id,
            userId: transactionData.user_id,
            amount: transactionData.amount,
            type: transactionData.type,
            category: transactionData.category,
            description: transactionData.description,
            date: transactionData.date,
        });
    },
    updateTransaction: async (id, transactionData) => {
        return await db.update(schema.transactions)
            .set({
            amount: transactionData.amount,
            type: transactionData.type,
            category: transactionData.category,
            description: transactionData.description,
            date: transactionData.date,
            updatedAt: new Date(),
        })
            .where(eq(schema.transactions.id, id));
    },
    deleteTransaction: async (id) => {
        return await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
    },
    getUsers: async () => {
        return await db.select().from(schema.users);
    },
    getUserById: async (id) => {
        const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
        return result[0] || null;
    },
    getUserByEmail: async (email) => {
        const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
        return result[0] || null;
    },
    createUser: async (userData) => {
        return await db.insert(schema.users).values({
            email: userData.email,
            username: userData.username,
            passwordHash: userData.password_hash,
            role: userData.role || 'user',
            isActive: userData.is_active !== false,
        });
    },
    updateUser: async (id, userData) => {
        return await db.update(schema.users)
            .set({
            username: userData.name,
            role: userData.role,
            isActive: userData.is_active,
            updatedAt: new Date(),
        })
            .where(eq(schema.users.id, id));
    },
    createAlert: async (alertData) => {
        return await db.insert(schema.systemAlerts).values({
            userId: alertData.user_id,
            accountId: alertData.account_id,
            type: alertData.type,
            title: alertData.title,
            message: alertData.description,
            severity: alertData.severity || 'medium',
        });
    },
    getAlerts: async (userId) => {
        return await db.select()
            .from(schema.systemAlerts)
            .where(and(eq(schema.systemAlerts.userId, userId), eq(schema.systemAlerts.isActive, true)))
            .orderBy(desc(schema.systemAlerts.createdAt));
    },
};
export { dbInterface };
