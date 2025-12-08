/**
 * GET /api/negotiations/[id]
 * 협상 상태 조회 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { NegotiationService } from '@/lib/services/negotiation-service';
import { withErrorHandling } from '@/lib/errors/api-error-handler';
import { success, error as errorResponse } from '@/lib/api/response-helpers';

async function handler(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // 협상 조회
    const negotiation = await NegotiationService.getNegotiation(id);

    if (!negotiation) {
        return errorResponse('협상을 찾을 수 없습니다', 404);
    }

    // 타임라인 조회
    const timeline = await NegotiationService.getNegotiationTimeline(id);

    return success({
        ...negotiation,
        timeline,
    });
}

export const GET = withErrorHandling(handler);
