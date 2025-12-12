/**
 * Metrics Service
 * Aggregates business and technical metrics for monitoring dashboard
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BusinessMetrics {
    activeNegotiations: number;
    negotiationSuccessRate: number;
    visualSearchUsage: number;
    watchlistItemsCount: number;
    avgNegotiationDuration: number;
}

export interface TechnicalMetrics {
    apiErrorRate: number;
    avgResponseTime: number;
    activeUsers: number;
}

export class MetricsService {
    /**
     * Get business KPIs
     */
    async getBusinessMetrics(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<BusinessMetrics> {
        const startTime = this.getStartTime(timeRange);

        try {
            // Active negotiations count
            const activeNegotiations = await prisma.negotiation.count({
                where: {
                    status: 'pending',
                    createdAt: { gte: startTime },
                },
            });

            // Negotiation success rate
            const totalNegotiations = await prisma.negotiation.count({
                where: { createdAt: { gte: startTime } },
            });
            const successfulNegotiations = await prisma.negotiation.count({
                where: {
                    status: 'accepted',
                    createdAt: { gte: startTime },
                },
            });
            const negotiationSuccessRate = totalNegotiations > 0
                ? (successfulNegotiations / totalNegotiations) * 100
                : 0;

            // Visual search usage (placeholder - would need tracking table)
            const visualSearchUsage = 0; // TODO: Implement when tracking is added

            // Watchlist items count
            const watchlistItemsCount = await prisma.productLike.count({
                where: { createdAt: { gte: startTime } },
            });

            // Avg negotiation duration (in hours)
            const completedNegotiations = await prisma.negotiation.findMany({
                where: {
                    status: { in: ['accepted', 'rejected'] },
                    createdAt: { gte: startTime },
                    updatedAt: { not: null },
                },

                return {
                    activeNegotiations,
                    negotiationSuccessRate: Math.round(negotiationSuccessRate * 10) / 10,
                    visualSearchUsage,
                    watchlistItemsCount,
                    avgNegotiationDuration: Math.round(avgNegotiationDuration * 10) / 10,
                };
            } catch (error) {
                console.error('MetricsService.getBusinessMetrics failed:', error);
                return {
                    activeNegotiations: 0,
                    negotiationSuccessRate: 0,
                    visualSearchUsage: 0,
                    watchlistItemsCount: 0,
                    avgNegotiationDuration: 0,
                };
            }
        }

    /**
     * Get technical metrics (placeholder)
     * In production, these would come from APM tools (Sentry, Vercel Analytics, etc.)
     */
    async getTechnicalMetrics(): Promise < TechnicalMetrics > {
            return {
                apiErrorRate: 0, // Would come from Sentry
                avgResponseTime: 0, // Would come from Vercel Analytics
                activeUsers: 0, // Would come from PostHog/Vercel Analytics
            };
        }

    private getStartTime(timeRange: 'hour' | 'day' | 'week'): Date {
        const now = new Date();
        switch (timeRange) {
            case 'hour':
                return new Date(now.getTime() - 60 * 60 * 1000);
            case 'day':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case 'week':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }
}

export const metricsService = new MetricsService();
