// @ts-nocheck - Temporary fix for TypeScript errors
import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../../db';
import { agingReports } from '../../db/schema';
/**
 * Calculate aging buckets (0-30, 30-60, 60-90, 90+)
 */
export function calculateAgingBucket(agingDays) {
    if (agingDays <= 30)
        return '0-30';
    if (agingDays <= 60)
        return '30-60';
    if (agingDays <= 90)
        return '60-90';
    return '90+';
}
/**
 * Calculate aging days from due date
 */
export function calculateAgingDays(dueDate) {
    const now = new Date();
    const diffTime = now.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
/**
 * Determine risk level based on aging
 */
export function getRiskLevel(agingDays) {
    if (agingDays <= 30)
        return 'low';
    if (agingDays <= 60)
        return 'medium';
    if (agingDays <= 90)
        return 'high';
    return 'critical';
}
/**
 * Create aging report entry
 */
export async function createAgingReport(userId, data) {
    const agingDays = calculateAgingDays(data.dueDate);
    const agingBucket = calculateAgingBucket(agingDays);
    const riskLevel = getRiskLevel(agingDays);
    const agingData = {
        userId,
        ...data,
        originalAmount: data.originalAmount.toString(),
        currentAmount: data.currentAmount.toString(),
        agingDays,
        agingBucket,
        status: agingDays > 0 ? 'overdue' : 'outstanding',
        metadata: data.metadata || { riskLevel },
    };
    const [created] = await db.insert(agingReports).values(agingData).returning();
    return created;
}
/**
 * Get aging reports for a specific type (AR or AP)
 */
export async function getAgingReports(userId, reportType, filters) {
    let query = db
        .select()
        .from(agingReports)
        .where(and(eq(agingReports.userId, userId), eq(agingReports.reportType, reportType)));
    if (filters) {
        const conditions = [
            eq(agingReports.userId, userId),
            eq(agingReports.reportType, reportType),
        ];
        if (filters.customerVendorId) {
            conditions.push(eq(agingReports.customerVendorId, filters.customerVendorId));
        }
        if (filters.status) {
            conditions.push(eq(agingReports.status, filters.status));
        }
        if (filters.agingBucket) {
            conditions.push(eq(agingReports.agingBucket, filters.agingBucket));
        }
        if (filters.minAmount !== undefined) {
            conditions.push(gte(agingReports.currentAmount, filters.minAmount.toString()));
        }
        if (filters.maxAmount !== undefined) {
            conditions.push(lte(agingReports.currentAmount, filters.maxAmount.toString()));
        }
        query = query.where(and(...conditions));
    }
    const reports = await query.orderBy(agingReports.agingDays);
    return reports.map(report => ({
        ...report,
        daysOverdue: Math.max(0, report.agingDays),
        riskLevel: getRiskLevel(report.agingDays),
    }));
}
/**
 * Get aging summary by buckets
 */
export async function getAgingSummary(userId, reportType) {
    const reports = await getAgingReports(userId, reportType);
    const totalAmount = reports.reduce((sum, report) => sum + parseFloat(report.currentAmount), 0);
    const totalCount = reports.length;
    // Calculate bucket totals
    const bucketTotals = {};
    reports.forEach(report => {
        const bucket = report.agingBucket;
        if (!bucketTotals[bucket]) {
            bucketTotals[bucket] = { amount: 0, count: 0 };
        }
        bucketTotals[bucket].amount += parseFloat(report.currentAmount);
        bucketTotals[bucket].count += 1;
    });
    const buckets = [
        {
            bucket: '0-30',
            days: '0-30 gün',
            amount: bucketTotals['0-30']?.amount || 0,
            count: bucketTotals['0-30']?.count || 0,
            percentage: 0,
        },
        {
            bucket: '30-60',
            days: '30-60 gün',
            amount: bucketTotals['30-60']?.amount || 0,
            count: bucketTotals['30-60']?.count || 0,
            percentage: 0,
        },
        {
            bucket: '60-90',
            days: '60-90 gün',
            amount: bucketTotals['60-90']?.amount || 0,
            count: bucketTotals['60-90']?.count || 0,
            percentage: 0,
        },
        {
            bucket: '90+',
            days: '90+ gün',
            amount: bucketTotals['90+']?.amount || 0,
            count: bucketTotals['90+']?.count || 0,
            percentage: 0,
        },
    ];
    // Calculate percentages
    buckets.forEach(bucket => {
        bucket.percentage =
            totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0;
    });
    // Calculate overdue amounts
    const overdueReports = reports.filter(report => report.agingDays > 0);
    const overdueAmount = overdueReports.reduce((sum, report) => sum + parseFloat(report.currentAmount), 0);
    const overdueCount = overdueReports.length;
    const overduePercentage = totalAmount > 0 ? (overdueAmount / totalAmount) * 100 : 0;
    // Calculate average aging days
    const averageAgingDays = reports.length > 0
        ? reports.reduce((sum, report) => sum + report.agingDays, 0) /
            reports.length
        : 0;
    return {
        reportType,
        totalAmount,
        totalCount,
        buckets,
        averageAgingDays: Math.round(averageAgingDays),
        overdueAmount,
        overdueCount,
        overduePercentage: Math.round(overduePercentage * 100) / 100,
    };
}
/**
 * Get aging reports by customer/vendor
 */
export async function getAgingByCustomer(userId, reportType) {
    const reports = await getAgingReports(userId, reportType);
    // Group by customer/vendor
    const customerMap = new Map();
    reports.forEach(report => {
        const customerId = report.customerVendorId;
        if (!customerMap.has(customerId)) {
            customerMap.set(customerId, []);
        }
        customerMap.get(customerId).push(report);
    });
    // Calculate customer summaries
    const customerSummaries = Array.from(customerMap.entries()).map(([customerId, customerReports]) => {
        const totalAmount = customerReports.reduce((sum, report) => sum + parseFloat(report.currentAmount), 0);
        const overdueReports = customerReports.filter(report => report.agingDays > 0);
        const overdueAmount = overdueReports.reduce((sum, report) => sum + parseFloat(report.currentAmount), 0);
        const averageAgingDays = customerReports.reduce((sum, report) => sum + report.agingDays, 0) /
            customerReports.length;
        // Determine overall risk level
        const maxAgingDays = Math.max(...customerReports.map(report => report.agingDays));
        const riskLevel = getRiskLevel(maxAgingDays);
        return {
            customerVendorId: customerId,
            customerVendorName: customerReports[0].customerVendorName,
            totalAmount,
            overdueAmount,
            averageAgingDays: Math.round(averageAgingDays),
            riskLevel,
            reportCount: customerReports.length,
            reports: customerReports.sort((a, b) => b.agingDays - a.agingDays),
        };
    });
    return customerSummaries.sort((a, b) => b.totalAmount - a.totalAmount);
}
/**
 * Update aging report
 */
export async function updateAgingReport(id, userId, updates) {
    const updateData = {
        updatedAt: new Date(),
    };
    // Update basic fields
    if (updates.currentAmount !== undefined)
        updateData.currentAmount = updates.currentAmount.toString();
    if (updates.description !== undefined)
        updateData.description = updates.description;
    if (updates.status !== undefined)
        updateData.status = updates.status;
    if (updates.metadata !== undefined)
        updateData.metadata = updates.metadata;
    // If due date changed, recalculate aging
    if (updates.dueDate !== undefined) {
        const agingDays = calculateAgingDays(updates.dueDate);
        const agingBucket = calculateAgingBucket(agingDays);
        const riskLevel = getRiskLevel(agingDays);
        updateData.agingDays = agingDays;
        updateData.agingBucket = agingBucket;
        updateData.status = agingDays > 0 ? 'overdue' : 'outstanding';
        updateData.metadata = { ...updateData.metadata, riskLevel };
    }
    const [updated] = await db
        .update(agingReports)
        .set(updateData)
        .where(and(eq(agingReports.id, id), eq(agingReports.userId, userId)))
        .returning();
    return updated || null;
}
/**
 * Delete aging report
 */
export async function deleteAgingReport(id, userId) {
    const [deleted] = await db
        .delete(agingReports)
        .where(and(eq(agingReports.id, id), eq(agingReports.userId, userId)))
        .returning();
    return !!deleted;
}
/**
 * Get aging statistics
 */
export async function getAgingStatistics(userId, reportType) {
    const types = reportType ? [reportType] : ['ar', 'ap'];
    let allReports = [];
    for (const type of types) {
        const reports = await getAgingReports(userId, type);
        allReports = allReports.concat(reports);
    }
    const totalReports = allReports.length;
    const totalAmount = allReports.reduce((sum, report) => sum + parseFloat(report.currentAmount), 0);
    const overdueReports = allReports.filter(report => report.agingDays > 0);
    const overdueAmount = overdueReports.reduce((sum, report) => sum + parseFloat(report.currentAmount), 0);
    const averageAgingDays = allReports.length > 0
        ? allReports.reduce((sum, report) => sum + report.agingDays, 0) /
            allReports.length
        : 0;
    const criticalRiskCount = allReports.filter(report => report.agingDays > 90).length;
    // Get top customers by amount
    const customerMap = new Map();
    allReports.forEach(report => {
        const customerId = report.customerVendorId;
        if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
                name: report.customerVendorName,
                totalAmount: 0,
                overdueAmount: 0,
            });
        }
        const customer = customerMap.get(customerId);
        customer.totalAmount += parseFloat(report.currentAmount);
        if (report.agingDays > 0) {
            customer.overdueAmount += parseFloat(report.currentAmount);
        }
    });
    const topCustomers = Array.from(customerMap.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);
    return {
        totalReports,
        totalAmount,
        overdueAmount,
        averageAgingDays: Math.round(averageAgingDays),
        criticalRiskCount,
        topCustomers,
    };
}
/**
 * Recalculate aging for all reports
 */
export async function recalculateAging(userId) {
    const result = { updated: 0, errors: [] };
    try {
        const allReports = await db
            .select()
            .from(agingReports)
            .where(eq(agingReports.userId, userId));
        for (const report of allReports) {
            try {
                const agingDays = calculateAgingDays(new Date(report.dueDate));
                const agingBucket = calculateAgingBucket(agingDays);
                const riskLevel = getRiskLevel(agingDays);
                const status = agingDays > 0 ? 'overdue' : 'outstanding';
                await db
                    .update(agingReports)
                    .set({
                    agingDays,
                    agingBucket,
                    status,
                    metadata: { ...report.metadata, riskLevel },
                    updatedAt: new Date(),
                })
                    .where(eq(agingReports.id, report.id));
                result.updated++;
            }
            catch (error) {
                result.errors.push(`Failed to update report ${report.id}: ${error}`);
            }
        }
    }
    catch (error) {
        result.errors.push(`Failed to recalculate aging: ${error}`);
    }
    return result;
}
