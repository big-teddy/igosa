/**
 * POST /api/negotiations/trigger
 * 협상 자동 트리거 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAINegotiationEngine } from '@/lib/ai/negotiation-engine';
import { NegotiationService } from '@/lib/services/negotiation-service';
import { withErrorHandling } from '@/lib/errors/api-error-handler';
import { withSecurity } from '@/lib/security/middleware';
import { success, error as errorResponse } from '@/lib/api/response-helpers';
import { logger } from '@/lib/logger';
import type { TriggerNegotiationRequest, TriggerNegotiationResponse } from '@/types/negotiation';

async function handler(request: NextRequest) {
    const body: TriggerNegotiationRequest = await request.json();
    const { productId, forceTrigger = false } = body;

    if (!productId) {
        return errorResponse('Missing required field: productId', 400);
    }

    logger.info('Negotiation trigger requested', { productId, forceTrigger });

    // 1. 기존 활성 협상 확인
    const existingNegotiation = await NegotiationService.getActiveNegotiation(productId);
    if (existingNegotiation) {
        return errorResponse(
            '이미 진행 중인 협상이 있습니다',
            409,
            { negotiationId: existingNegotiation.id }
        );
    }

    // 2. 협상 트리거 가능 여부 확인
    if (!forceTrigger) {
        const canTrigger = await NegotiationService.canTriggerNegotiation(productId);

        if (!canTrigger.canTrigger) {
            return errorResponse(
                `협상 트리거 조건 미충족: ${canTrigger.reason}`,
                400,
                { metrics: canTrigger.metrics }
            );
        }

        logger.info('Negotiation trigger conditions met', {
            productId,
            metrics: canTrigger.metrics,
        });
    }

    // 3. AI 협상 엔진 실행
    const engine = getAINegotiationEngine();
    const result = await engine.execute(productId);

    if (!result.success) {
        logger.error('Negotiation execution failed', new Error(result.errors.join(', ')), {
            productId,
        });

        return errorResponse(
            '협상 실행 실패',
            500,
            { errors: result.errors, reasoning: result.reasoning }
        );
    }

    // 4. 성공 응답
    const response: TriggerNegotiationResponse = {
        success: true,
        data: {
            negotiationId: result.negotiationId!,
            status: 'in_progress',
            participants: result.proposedVolume || 0,
            proposedPrice: result.proposedPrice || 0,
            estimatedSuccess: 0.85, // AI 신뢰도
        },
    };

    logger.info('Negotiation triggered successfully', {
        productId,
        negotiationId: result.negotiationId,
        proposedPrice: result.proposedPrice,
    });

    return success(response.data, 201);
}

export const POST = withSecurity(withErrorHandling(handler), {
    enableCsrf: true,
    enableRateLimit: true,
    rateLimitType: 'api',
});
