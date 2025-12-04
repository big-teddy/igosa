/**
 * Cron Job: Auto-trigger negotiations
 * 매시간 실행: 조건 충족 제품 자동 협상 트리거
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, REDIS_KEYS } from '@/lib/redis/client';
import { NegotiationService } from '@/lib/services/negotiation-service';
import { getAINegotiationEngine } from '@/lib/ai/negotiation-engine';
import { NotificationHelper } from '@/lib/services/notification-helper';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs'; // Changed from 'edge' to support ioredis
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/trigger-negotiations
 * Vercel Cron으로 매시간 실행
 */
export async function GET(request: NextRequest) {
    try {
        // Cron secret 검증
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        logger.info('Cron job started: trigger-negotiations');

        const redis = getRedisClient();
        const engine = getAINegotiationEngine();

        // 1. 모든 제품의 수요 데이터 조회
        const productKeys = await redis.keys(REDIS_KEYS.PRODUCT_DEMAND('*'));
        const productIds = productKeys.map((key: string) => {
            const match = key.match(/product_demand:(.+)/);
            return match ? match[1] : null;
        }).filter(Boolean) as string[];

        logger.info('Found products with demand', { count: productIds.length });

        const results = {
            checked: 0,
            triggered: 0,
            failed: 0,
            skipped: 0,
            details: [] as Array<{
                productId: string;
                status: 'triggered' | 'skipped' | 'failed';
                reason: string;
                negotiationId?: string;
            }>,
        };

        // 2. 각 제품별로 협상 트리거 조건 확인
        for (const productId of productIds) {
            results.checked++;

            try {
                // 기존 활성 협상 확인
                const existingNegotiation = await NegotiationService.getActiveNegotiation(productId);
                if (existingNegotiation) {
                    results.skipped++;
                    results.details.push({
                        productId,
                        status: 'skipped',
                        reason: '이미 진행 중인 협상 존재',
                    });
                    continue;
                }

                // 트리거 조건 확인
                const canTrigger = await NegotiationService.canTriggerNegotiation(productId);

                if (!canTrigger.canTrigger) {
                    results.skipped++;
                    results.details.push({
                        productId,
                        status: 'skipped',
                        reason: canTrigger.reason,
                    });
                    continue;
                }

                // AI 협상 엔진 실행
                const result = await engine.execute(productId);

                if (result.success && result.negotiationId) {
                    results.triggered++;
                    results.details.push({
                        productId,
                        status: 'triggered',
                        reason: '협상 트리거 성공',
                        negotiationId: result.negotiationId,
                    });

                    // 마일스톤 알림 전송
                    await NotificationHelper.notifyMilestone(
                        productId,
                        canTrigger.metrics.participants,
                        canTrigger.metrics.participants,
                        result.negotiationId
                    );

                    logger.info('Negotiation triggered by cron', {
                        productId,
                        negotiationId: result.negotiationId,
                        participants: canTrigger.metrics.participants,
                    });
                } else {
                    results.failed++;
                    results.details.push({
                        productId,
                        status: 'failed',
                        reason: result.errors.join(', ') || '알 수 없는 오류',
                    });
                }

            } catch (error) {
                results.failed++;
                results.details.push({
                    productId,
                    status: 'failed',
                    reason: (error as Error).message,
                });

                logger.error('Failed to process product in cron', error as Error, {
                    productId,
                });
            }
        }

        logger.info('Cron job completed: trigger-negotiations', results);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            summary: {
                checked: results.checked,
                triggered: results.triggered,
                skipped: results.skipped,
                failed: results.failed,
            },
            details: results.details,
        });

    } catch (error) {
        logger.error('Cron job failed: trigger-negotiations', error as Error);

        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
