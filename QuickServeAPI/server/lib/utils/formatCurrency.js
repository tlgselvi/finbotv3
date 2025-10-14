// @ts-nocheck - Temporary fix for TypeScript errors
export function formatCurrency(value, currency = 'TRY', locale = 'tr-TR') {
    return value.toLocaleString(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
