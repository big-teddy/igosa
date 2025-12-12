import { NextRequest, NextResponse } from 'next/server';
import { metricsService } from '@/lib/services/metrics-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/metrics
 * Returns aggregated business and technical metrics
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const timeRange = (searchParams.get('range') || 'day') as 'hour' | 'day' | 'week';

        const [businessMetrics, technicalMetrics] = await Promise.all([
            metricsService.getBusinessMetrics(timeRange),
            metricsService.getTechnicalMetrics(),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                business: businessMetrics,
                technical: technicalMetrics,
                timestamp: new Date().toISOString(),
                timeRange,
            },
        });
    } catch (error) {
        console.error('Metrics API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch metrics',
            },
            { status: 500 }
        );
    }
}
