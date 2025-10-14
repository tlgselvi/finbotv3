import { z } from 'zod';
// User Roles V2
export var UserRoleV2;
(function (UserRoleV2) {
    UserRoleV2["ADMIN"] = "ADMIN";
    UserRoleV2["FINANCE"] = "FINANCE";
    UserRoleV2["VIEWER"] = "VIEWER";
    UserRoleV2["AUDITOR"] = "AUDITOR";
    UserRoleV2["PERSONAL_USER"] = "PERSONAL_USER";
    UserRoleV2["COMPANY_USER"] = "COMPANY_USER";
})(UserRoleV2 || (UserRoleV2 = {}));
// Permissions V2
export var PermissionV2;
(function (PermissionV2) {
    // User Management
    PermissionV2["MANAGE_USERS"] = "MANAGE_USERS";
    PermissionV2["VIEW_USERS"] = "VIEW_USERS";
    PermissionV2["ASSIGN_ROLES"] = "ASSIGN_ROLES";
    // Cashbox Management
    PermissionV2["MANAGE_CASHBOXES"] = "MANAGE_CASHBOXES";
    PermissionV2["VIEW_CASHBOXES"] = "VIEW_CASHBOXES";
    PermissionV2["TRANSFER_CASHBOX"] = "TRANSFER_CASHBOX";
    // Bank Integration
    PermissionV2["MANAGE_BANK_INTEGRATIONS"] = "MANAGE_BANK_INTEGRATIONS";
    PermissionV2["VIEW_BANK_INTEGRATIONS"] = "VIEW_BANK_INTEGRATIONS";
    PermissionV2["IMPORT_BANK_DATA"] = "IMPORT_BANK_DATA";
    // Budget Management
    PermissionV2["MANAGE_BUDGET"] = "MANAGE_BUDGET";
    PermissionV2["VIEW_BUDGET"] = "VIEW_BUDGET";
    // Transaction Management
    PermissionV2["MANAGE_TRANSACTIONS"] = "MANAGE_TRANSACTIONS";
    PermissionV2["VIEW_TRANSACTIONS"] = "VIEW_TRANSACTIONS";
    PermissionV2["VIEW_PERSONAL_TRANSACTIONS"] = "VIEW_PERSONAL_TRANSACTIONS";
    PermissionV2["VIEW_COMPANY_TRANSACTIONS"] = "VIEW_COMPANY_TRANSACTIONS";
    PermissionV2["VIEW_ALL_TRANSACTIONS"] = "VIEW_ALL_TRANSACTIONS";
    PermissionV2["EDIT_PERSONAL_TRANSACTIONS"] = "EDIT_PERSONAL_TRANSACTIONS";
    PermissionV2["EDIT_COMPANY_TRANSACTIONS"] = "EDIT_COMPANY_TRANSACTIONS";
    PermissionV2["EDIT_ALL_TRANSACTIONS"] = "EDIT_ALL_TRANSACTIONS";
    PermissionV2["CREATE_PERSONAL_TRANSACTIONS"] = "CREATE_PERSONAL_TRANSACTIONS";
    PermissionV2["CREATE_COMPANY_TRANSACTIONS"] = "CREATE_COMPANY_TRANSACTIONS";
    PermissionV2["CREATE_ALL_TRANSACTIONS"] = "CREATE_ALL_TRANSACTIONS";
    PermissionV2["UPDATE_PERSONAL_TRANSACTIONS"] = "UPDATE_PERSONAL_TRANSACTIONS";
    PermissionV2["UPDATE_COMPANY_TRANSACTIONS"] = "UPDATE_COMPANY_TRANSACTIONS";
    PermissionV2["UPDATE_ALL_TRANSACTIONS"] = "UPDATE_ALL_TRANSACTIONS";
    PermissionV2["DELETE_PERSONAL_TRANSACTIONS"] = "DELETE_PERSONAL_TRANSACTIONS";
    PermissionV2["DELETE_COMPANY_TRANSACTIONS"] = "DELETE_COMPANY_TRANSACTIONS";
    PermissionV2["DELETE_ALL_TRANSACTIONS"] = "DELETE_ALL_TRANSACTIONS";
    // Account Management
    PermissionV2["VIEW_PERSONAL_ACCOUNTS"] = "VIEW_PERSONAL_ACCOUNTS";
    PermissionV2["VIEW_COMPANY_ACCOUNTS"] = "VIEW_COMPANY_ACCOUNTS";
    PermissionV2["VIEW_ALL_ACCOUNTS"] = "VIEW_ALL_ACCOUNTS";
    PermissionV2["EDIT_PERSONAL_ACCOUNTS"] = "EDIT_PERSONAL_ACCOUNTS";
    PermissionV2["EDIT_COMPANY_ACCOUNTS"] = "EDIT_COMPANY_ACCOUNTS";
    PermissionV2["EDIT_ALL_ACCOUNTS"] = "EDIT_ALL_ACCOUNTS";
    PermissionV2["DELETE_PERSONAL_ACCOUNTS"] = "DELETE_PERSONAL_ACCOUNTS";
    PermissionV2["DELETE_COMPANY_ACCOUNTS"] = "DELETE_COMPANY_ACCOUNTS";
    PermissionV2["DELETE_ALL_ACCOUNTS"] = "DELETE_ALL_ACCOUNTS";
    // Reports
    PermissionV2["VIEW_REPORTS"] = "VIEW_REPORTS";
    PermissionV2["VIEW_ALL_REPORTS"] = "VIEW_ALL_REPORTS";
    PermissionV2["VIEW_COMPANY_REPORTS"] = "VIEW_COMPANY_REPORTS";
    PermissionV2["VIEW_PERSONAL_REPORTS"] = "VIEW_PERSONAL_REPORTS";
    PermissionV2["EXPORT_REPORTS"] = "EXPORT_REPORTS";
    // Dashboard
    PermissionV2["VIEW_DASHBOARD"] = "VIEW_DASHBOARD";
    // Audit
    PermissionV2["VIEW_AUDIT_LOGS"] = "VIEW_AUDIT_LOGS";
    // System
    PermissionV2["VIEW_SYSTEM_STATUS"] = "VIEW_SYSTEM_STATUS";
    PermissionV2["MANAGE_SETTINGS"] = "MANAGE_SETTINGS";
})(PermissionV2 || (PermissionV2 = {}));
// Legacy aliases for backward compatibility
export const Permission = PermissionV2; // Legacy enum alias
export const UserRole = UserRoleV2; // Legacy enum alias
// Role-Permission Mapping
export const rolePermissionsV2 = {
    ADMIN: [
        'MANAGE_USERS',
        'VIEW_USERS',
        'ASSIGN_ROLES',
        'MANAGE_CASHBOXES',
        'VIEW_CASHBOXES',
        'TRANSFER_CASHBOX',
        'MANAGE_BANK_INTEGRATIONS',
        'VIEW_BANK_INTEGRATIONS',
        'IMPORT_BANK_DATA',
        'MANAGE_BUDGET',
        'VIEW_BUDGET',
        'MANAGE_TRANSACTIONS',
        'VIEW_TRANSACTIONS',
        'VIEW_PERSONAL_TRANSACTIONS',
        'VIEW_COMPANY_TRANSACTIONS',
        'VIEW_ALL_TRANSACTIONS',
        'VIEW_REPORTS',
        'VIEW_ALL_REPORTS',
        'VIEW_COMPANY_REPORTS',
        'VIEW_PERSONAL_REPORTS',
        'EXPORT_REPORTS',
        'VIEW_DASHBOARD',
        'VIEW_AUDIT_LOGS',
        'VIEW_SYSTEM_STATUS',
        'MANAGE_SETTINGS',
        'VIEW_PERSONAL_ACCOUNTS',
        'EDIT_PERSONAL_ACCOUNTS',
        'DELETE_PERSONAL_ACCOUNTS',
        'VIEW_COMPANY_ACCOUNTS',
        'EDIT_COMPANY_ACCOUNTS',
        'DELETE_COMPANY_ACCOUNTS',
        'VIEW_ALL_ACCOUNTS',
        'EDIT_ALL_ACCOUNTS',
        'DELETE_ALL_ACCOUNTS',
    ],
    FINANCE: [
        'MANAGE_CASHBOXES',
        'VIEW_CASHBOXES',
        'TRANSFER_CASHBOX',
        'MANAGE_BANK_INTEGRATIONS',
        'VIEW_BANK_INTEGRATIONS',
        'IMPORT_BANK_DATA',
        'MANAGE_BUDGET',
        'VIEW_BUDGET',
        'MANAGE_TRANSACTIONS',
        'VIEW_TRANSACTIONS',
        'VIEW_REPORTS',
        'EXPORT_REPORTS',
        'VIEW_DASHBOARD',
    ],
    VIEWER: [
        'VIEW_CASHBOXES',
        'VIEW_DASHBOARD',
        'VIEW_BUDGET',
        'VIEW_TRANSACTIONS',
        'VIEW_REPORTS',
        'VIEW_BANK_INTEGRATIONS',
        'EXPORT_REPORTS',
    ],
    AUDITOR: [
        'VIEW_AUDIT_LOGS',
        'VIEW_USERS',
        'VIEW_REPORTS',
        'VIEW_DASHBOARD',
        'VIEW_CASHBOXES',
        'VIEW_BANK_INTEGRATIONS',
        'EXPORT_REPORTS',
    ],
    PERSONAL_USER: [
        'VIEW_PERSONAL_ACCOUNTS',
        'EDIT_PERSONAL_ACCOUNTS',
        'DELETE_PERSONAL_ACCOUNTS',
        'VIEW_PERSONAL_TRANSACTIONS',
        'EDIT_PERSONAL_TRANSACTIONS',
        'CREATE_PERSONAL_TRANSACTIONS',
        'UPDATE_PERSONAL_TRANSACTIONS',
        'DELETE_PERSONAL_TRANSACTIONS',
        'VIEW_PERSONAL_REPORTS',
        'VIEW_BUDGET',
        'VIEW_DASHBOARD',
    ],
    COMPANY_USER: [
        'VIEW_COMPANY_ACCOUNTS',
        'EDIT_COMPANY_ACCOUNTS',
        'DELETE_COMPANY_ACCOUNTS',
        'VIEW_COMPANY_TRANSACTIONS',
        'EDIT_COMPANY_TRANSACTIONS',
        'CREATE_COMPANY_TRANSACTIONS',
        'UPDATE_COMPANY_TRANSACTIONS',
        'DELETE_COMPANY_TRANSACTIONS',
        'VIEW_COMPANY_REPORTS',
        'VIEW_BUDGET',
        'VIEW_DASHBOARD',
        'VIEW_REPORTS',
    ],
};
// Permission helper functions
export function hasPermissionV2(userRole, permission) {
    const normalizedRole = userRole.toUpperCase();
    const permissions = rolePermissionsV2[normalizedRole];
    if (!permissions) {
        console.warn(`Unknown role: ${userRole}`);
        return false;
    }
    return permissions.includes(permission);
}
export function hasAnyPermissionV2(userRole, permissions) {
    const normalizedRole = userRole.toUpperCase();
    const userPermissions = rolePermissionsV2[normalizedRole];
    if (!userPermissions) {
        console.warn(`Unknown role: ${userRole}`);
        return false;
    }
    return permissions.some(permission => userPermissions.includes(permission));
}
// Legacy aliases
export const hasAnyPermission = hasAnyPermissionV2;
// Permission helper
export function hasPermission(userRole, requiredRole) {
    const roles = ['user', 'admin', 'super_admin'];
    const userRoleIndex = roles.indexOf(userRole);
    const requiredRoleIndex = roles.indexOf(requiredRole);
    return userRoleIndex >= requiredRoleIndex;
}
// Team-based permissions
export var TeamPermission;
(function (TeamPermission) {
    TeamPermission["VIEW_TEAM"] = "view_team";
    TeamPermission["MANAGE_TEAM"] = "manage_team";
    TeamPermission["INVITE_MEMBERS"] = "invite_members";
    TeamPermission["REMOVE_MEMBERS"] = "remove_members";
    TeamPermission["MANAGE_ROLES"] = "manage_roles";
})(TeamPermission || (TeamPermission = {}));
export var TeamRole;
(function (TeamRole) {
    TeamRole["OWNER"] = "owner";
    TeamRole["ADMIN"] = "admin";
    TeamRole["MEMBER"] = "member";
    TeamRole["VIEWER"] = "viewer";
})(TeamRole || (TeamRole = {}));
export function hasTeamPermission(role, permission) {
    const permissions = {
        [TeamRole.OWNER]: [
            TeamPermission.VIEW_TEAM,
            TeamPermission.MANAGE_TEAM,
            TeamPermission.INVITE_MEMBERS,
            TeamPermission.REMOVE_MEMBERS,
            TeamPermission.MANAGE_ROLES,
        ],
        [TeamRole.ADMIN]: [
            TeamPermission.VIEW_TEAM,
            TeamPermission.MANAGE_TEAM,
            TeamPermission.INVITE_MEMBERS,
            TeamPermission.REMOVE_MEMBERS,
        ],
        [TeamRole.MEMBER]: [TeamPermission.VIEW_TEAM],
        [TeamRole.VIEWER]: [TeamPermission.VIEW_TEAM],
    };
    return permissions[role]?.includes(permission) || false;
}
// Category helper
export function getCategoryLabel(category) {
    const labels = {
        salary: 'Maaş',
        freelance: 'Serbest Çalışma',
        investment: 'Yatırım',
        other_income: 'Diğer Gelir',
        rent: 'Kira',
        food: 'Yiyecek',
        transport: 'Ulaşım',
        utilities: 'Faturalar',
        entertainment: 'Eğlence',
        health: 'Sağlık',
        education: 'Eğitim',
        shopping: 'Alışveriş',
        other_expense: 'Diğer Gider',
    };
    return labels[category] || category;
}
// Validation schemas
export const loginSchema = z.object({
    email: z.string().email('Geçerli bir email adresi girin'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});
export const registerSchema = z.object({
    username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
    email: z.string().email('Geçerli bir email adresi girin'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});
export const updateUserRoleSchema = z.object({
    role: z.enum([
        'USER',
        'ACCOUNTANT',
        'MANAGER',
        'ADMIN',
        'SUPER_ADMIN',
        'AUDITOR',
    ]),
});
export const updateUserStatusSchema = z.object({
    status: z.enum(['active', 'inactive', 'suspended']),
});
export const forgotPasswordSchema = z.object({
    email: z.string().email('Geçerli bir email adresi girin'),
});
export const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});
export const accountSchema = z.object({
    name: z.string().min(1, 'Hesap adı gereklidir'),
    type: z.enum(['cash', 'checking', 'savings', 'credit_card']),
    balance: z.number(),
    currency: z.string().default('TRY'),
});
export const insertTransactionSchema = z.object({
    accountId: z.string().uuid(),
    amount: z.number(),
    type: z.enum(['income', 'expense', 'transfer']),
    category: z.string(),
    description: z.string().optional(),
    date: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed']).default('pending'),
});
export const insertCreditSchema = z.object({
    userId: z.string().uuid(),
    totalAmount: z.number(),
    remainingAmount: z.number(),
    interestRate: z.number(),
    monthlyPayment: z.number(),
    dueDate: z.string(),
    currency: z.string().default('TRY'),
});
export const transactionSchema = z.object({
    accountId: z.string(),
    amount: z.number().positive('Tutar pozitif olmalıdır'),
    type: z.enum(['income', 'expense']),
    category: z.string(),
    description: z.string().optional(),
    date: z.string(),
});
export const transactionJsonFileSchema = z.object({
    transactions: z.array(transactionSchema),
    metadata: z
        .object({
        exportDate: z.string(),
        totalCount: z.number(),
    })
        .optional(),
});
// Transaction categories
export const transactionCategories = {
    income: [
        { value: 'salary', label: 'Maaş' },
        { value: 'freelance', label: 'Serbest Çalışma' },
        { value: 'investment', label: 'Yatırım Geliri' },
        { value: 'other_income', label: 'Diğer Gelir' },
    ],
    expense: [
        { value: 'rent', label: 'Kira' },
        { value: 'food', label: 'Yiyecek' },
        { value: 'transport', label: 'Ulaşım' },
        { value: 'utilities', label: 'Faturalar' },
        { value: 'entertainment', label: 'Eğlence' },
        { value: 'health', label: 'Sağlık' },
        { value: 'education', label: 'Eğitim' },
        { value: 'shopping', label: 'Alışveriş' },
        { value: 'other_expense', label: 'Diğer Gider' },
    ],
    transfer: [{ value: 'transfer', label: 'Transfer' }],
};
// Team Member Schema
export const insertTeamMemberSchema = z.object({
    teamId: z.string().uuid(),
    userId: z.string().uuid(),
    role: z.enum(['owner', 'admin', 'member', 'viewer']),
});
// Invite User Schema
export const inviteUserSchema = z.object({
    teamId: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['admin', 'member', 'viewer']),
});
// Accept Invite Schema
export const acceptInviteSchema = z.object({
    token: z.string(),
});
// Account Schemas
export const insertAccountSchema = z.object({
    name: z.string(),
    type: z.enum(['bank', 'cash', 'credit_card', 'investment']),
    balance: z.number().default(0),
    currency: z.string().default('TRY'),
    isActive: z.boolean().default(true),
});
export const updateAccountSchema = z.object({
    name: z.string().optional(),
    type: z.enum(['bank', 'cash', 'credit_card', 'investment']).optional(),
    balance: z.number().optional(),
    currency: z.string().optional(),
    isActive: z.boolean().optional(),
});
export const deleteAccountSchema = z.object({
    id: z.string().uuid(),
});
// Transaction Schemas
export const updateTransactionSchema = z.object({
    accountId: z.string().uuid().optional(),
    amount: z.number().optional(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed']).optional(),
});
export const deleteTransactionSchema = z.object({
    id: z.string().uuid(),
});
// Credit Schemas
export const updateCreditSchema = z.object({
    totalAmount: z.number().optional(),
    remainingAmount: z.number().optional(),
    interestRate: z.number().optional(),
    monthlyPayment: z.number().optional(),
    dueDate: z.string().optional(),
});
export const deleteCreditSchema = z.object({
    id: z.string().uuid(),
});
// Team Schemas
export const insertTeamSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});
export const updateTeamSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
});
// System Alert Schema
export const insertSystemAlertSchema = z.object({
    userId: z.string().uuid(),
    type: z.enum(['budget_exceeded', 'low_balance', 'payment_due', 'general']),
    message: z.string(),
    description: z.string().optional(),
    severity: z.enum(['info', 'warning', 'error']).default('info'),
});
// Fixed Expense Schema
export const insertFixedExpenseSchema = z.object({
    userId: z.string().uuid(),
    name: z.string(),
    amount: z.number(),
    category: z.string(),
    frequency: z.enum(['monthly', 'yearly', 'weekly', 'daily']),
    dueDay: z.number().min(1).max(31),
});
// Investment Schema
export const insertInvestmentSchema = z.object({
    userId: z.string().uuid(),
    name: z.string(),
    type: z.string(),
    amount: z.number(),
    currentValue: z.number(),
    purchaseDate: z.string(),
});
// Forecast Schema
export const insertForecastSchema = z.object({
    userId: z.string().uuid(),
    period: z.enum(['monthly', 'quarterly', 'yearly']),
    projectedIncome: z.number(),
    projectedExpenses: z.number(),
});
// AI Settings Schema
export const insertAISettingsSchema = z.object({
    userId: z.string().uuid(),
    provider: z.enum(['openai', 'anthropic', 'gemini']),
    model: z.string(),
    isEnabled: z.boolean().default(true),
});
// Import/Export Schemas
export const importTransactionJsonSchema = z.object({
    file: z.any(), // File upload
});
export const exportTransactionsByDateSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    format: z.enum(['json', 'csv', 'pdf']).default('json'),
});
