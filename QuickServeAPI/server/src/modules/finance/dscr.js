// @ts-nocheck - Temporary fix for TypeScript errors
export function calculateDSCR(operatingCF, debtService) {
    if (debtService === 0)
        return Infinity;
    return operatingCF / debtService;
}
export function mapDSCRStatus(dscr) {
    if (dscr >= 1.5)
        return 'ok';
    if (dscr >= 1.0)
        return 'warning';
    return 'critical';
}
