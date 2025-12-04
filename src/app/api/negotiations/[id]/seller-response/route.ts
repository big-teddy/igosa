/**
 * POST /api/negotiations/[id]/seller-response
 * 판매자 응답 처리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { NegotiationService } from '@/lib/services/negotiation-service';
import { NotificationHelper } from '@/lib/services/notification-helper';
import { withErrorHandling } from '@/lib/errors/api-error-handler';
import { success, error as errorResponse } from '@/lib/api/response-helpers';
import { logger } from '@/lib/logger';
import type { SellerResponseRequest, SellerResponseResponse } from '@/types/negotiation';

async function handler(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const body: SellerResponseRequest = await request.json();
    const { response, counterPrice, reasoning } = body;

    // 협상 조회
    const negotiation = await NegotiationService.getNegotiation(id);

    if (!negotiation) {
        return errorResponse('협상을 찾을 수 없습니다', 404);
    }

    if (negotiation.status !== 'in_progress') {
        return errorResponse(
            `협상 상태가 올바르지 않습니다: ${negotiation.status}`,
            400
        );
    }

    logger.info('Seller response received', {
        negotiationId: id,
        response,
        counterPrice,
    });

    // 판매자 응답 처리
    if (response === 'accepted') {
        // 수락: 협상 완료
        await NegotiationService.completeNegotiation(
            id,
            negotiation.aiProposedPrice!,
            negotiation.aiProposedVolume!
        );

        // 참여자들에게 알림 전송
        const notifications = await NotificationHelper.notifyNegotiationSuccess(
            id,
            negotiation.aiProposedPrice!,
            `Product ${negotiation.productId}`, // TODO: 실제 제품명
            '/images/product-placeholder.jpg' // TODO: 실제 제품 이미지
        );

        logger.info('Negotiation accepted by seller', {
            negotiationId: id,
            finalPrice: negotiation.aiProposedPrice,
            emailsSent: notifications.emailsSent,
            pushSent: notifications.pushSent,
        });

        const responseData: SellerResponseResponse = {
            success: true,
            data: {
                status: 'accepted',
                finalPrice: negotiation.aiProposedPrice,
                notificationsSent: notifications.emailsSent + notifications.pushSent,
            },
        };

        return success(responseData.data);

    } else if (response === 'rejected') {
        // 거절: 협상 실패
        await NegotiationService.failNegotiation(
            id,
            reasoning || '판매자가 제안을 거절했습니다'
        );

        logger.info('Negotiation rejected by seller', {
            negotiationId: id,
            reasoning,
        });

        const responseData: SellerResponseResponse = {
            success: true,
            data: {
                status: 'rejected',
                notificationsSent: 0,
            },
        };

        return success(responseData.data);

    } else if (response === 'counter') {
        // 역제안
        if (!counterPrice) {
            return errorResponse('역제안 가격이 필요합니다', 400);
        }

        await NegotiationService.updateNegotiationStatus(id, 'in_progress', {
            sellerResponse: 'counter',
            sellerCounterPrice: counterPrice,
            sellerReasoning: reasoning,
            sellerRespondedAt: new Date(),
        });

        await NegotiationService.logEvent(
            id,
            'counter_offer',
            `판매자가 ₩${counterPrice.toLocaleString()}에 역제안`,
            { counterPrice, reasoning },
            'neutral'
        );

        logger.info('Seller made counter offer', {
            negotiationId: id,
            counterPrice,
        });

        // TODO: AI가 역제안 평가 및 재협상

        const responseData: SellerResponseResponse = {
            success: true,
            data: {
                status: 'in_progress',
                notificationsSent: 0,
            },
        };

        return success(responseData.data);
    }

    return errorResponse('Invalid response type', 400);
}

export const POST = withErrorHandling(handler);
