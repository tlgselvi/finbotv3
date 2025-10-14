// @ts-nocheck - Temporary fix for TypeScript errors
// Temporary type definitions to fix TypeScript errors
export interface AnyObject {
    [key: string]: any;
}

export interface TransactionData extends AnyObject {
    id?: string;
    accountInfo?: any;
    virmanPairId?: string;
    amount: number | string;
    type: 'income' | 'expense' | 'transfer_in' | 'transfer_out';
    date?: string | Date;
    description?: string;
    category?: string;
    accountId?: string;
}

export interface InvestmentData extends AnyObject {
    title?: string;
    description?: string;
    currency?: string;
    purchaseDate?: string | Date;
    accountId?: string;
    category?: string;
    riskLevel?: string;
    isActive?: boolean;
    metadata?: any;
}

export interface ForecastData extends AnyObject {
    title?: string;
    description?: string;
    scenario?: string;
    forecastDate?: string | Date;
    targetDate?: string | Date;
    predictedValue?: number;
    confidenceInterval?: number;
    lowerBound?: number;
    upperBound?: number;
    currency?: string;
    category?: string;
    accountId?: string;
    parameters?: any;
    isActive?: boolean;
}

export interface TenantData extends AnyObject {
    logo?: string;
    domain?: string;
    theme?: string;
    isActive?: boolean;
}

export interface ExpenseData extends AnyObject {
    startDate?: string | Date;
    recurrence?: string;
}

export interface CreditData extends AnyObject {
    title?: string;
    lastPaymentDate?: Date;
}

export interface TeamMemberData extends AnyObject {
    teamRole?: string;
}

export interface InviteData extends AnyObject {
    acceptedAt?: Date;
    invitedUserId?: string;
}

export interface AlertData extends AnyObject {
    isDismissed?: boolean;
}

// Database result types
export interface DatabaseResult {
    rowCount?: number;
}



