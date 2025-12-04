/**
 * Notification Helper
 * 협상 관련 알림 통합 헬퍼
 */

import { EmailService } from './email-service';
import { PushNotificationService } from './push-notification-service';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

export class NotificationHelper {
    /**
     * 협상 성공 시 모든 참여자에게 알림
     */
    static async notifyNegotiationSuccess(
        negotiationId: string,
        finalPrice: number,
        productName: string,
        productImage: string
    ): Promise<{
        emailsSent: number;
        pushSent: number;
    }> {
        try {
            const supabase = await createClient();

            // 참여자 조회
            const { data: negotiation } = await supabase
                .from('negotiations')
                .select('product_id, total_participants')
                .eq('id', negotiationId)
                .single();

            if (!negotiation) {
                throw new Error('Negotiation not found');
            }

            // 해당 제품을 추적 중인 사용자 조회
            const { data: trackings } = await supabase
                .from('price_tracking')
                .select('user_id, target_price')
                .eq('product_id', negotiation.product_id)
                .eq('status', 'active');

            if (!trackings || trackings.length === 0) {
                logger.warn('No participants found for negotiation', { negotiationId });
                return { emailsSent: 0, pushSent: 0 };
            }

            let emailsSent = 0;
            let pushSent = 0;

            // 각 참여자에게 알림 전송
            for (const tracking of trackings) {
                const savings = tracking.target_price - finalPrice;
                const purchaseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/products/${negotiation.product_id}/purchase?negotiation=${negotiationId}`;
                const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

                // 사용자 정보 조회
                const { data: user } = await supabase.auth.admin.getUserById(tracking.user_id);

                // 이메일 전송
                if (user?.user?.email) {
                    const emailSuccess = await EmailService.sendNegotiationSuccess(
                        user.user.email,
                        {
                            userName: user.user.email.split('@')[0],
                            productName,
                            productImage,
                            targetPrice: tracking.target_price,
                            finalPrice,
                            savings,
                            purchaseUrl,
                            expiresAt,
                        }
                    );

                    if (emailSuccess) emailsSent++;
                }

                // 푸시 알림 전송
                const pushSuccess = await PushNotificationService.sendNegotiationSuccessNotification(
                    tracking.user_id,
                    {
                        productName,
                        finalPrice,
                        savings,
                        negotiationId,
                    }
                );

                if (pushSuccess) pushSent++;
            }

            logger.info('Negotiation success notifications sent', {
                negotiationId,
                totalParticipants: trackings.length,
                emailsSent,
                pushSent,
            });

            return { emailsSent, pushSent };

        } catch (error) {
            logger.error('Failed to send negotiation success notifications', error as Error, {
                negotiationId,
            });
            return { emailsSent: 0, pushSent: 0 };
        }
    }

    /**
     * 마일스톤 달성 시 알림
     */
    static async notifyMilestone(
        productId: string,
        milestone: number,
        currentParticipants: number,
        negotiationId: string
    ): Promise<void> {
        try {
            const supabase = await createClient();

            // 참여자 조회
            const { data: trackings } = await supabase
                .from('price_tracking')
                .select('user_id')
                .eq('product_id', productId)
                .eq('status', 'active');

            if (!trackings) return;

            // 푸시 알림 일괄 전송
            const userIds = trackings.map(t => t.user_id);
            await PushNotificationService.sendBulk(
                userIds,
                {
                    title: `🔥 ${milestone}명 달성!`,
                    body: `네고딜에 ${currentParticipants}명 참여 중! AI가 판매자와 협상 시작합니다.`,
                    icon: '/icons/milestone.png',
                    data: {
                        type: 'milestone',
                        negotiationId,
                        url: `/negotiations/${negotiationId}`,
                    },
                }
            );

            logger.info('Milestone notifications sent', {
                productId,
                milestone,
                participants: userIds.length,
            });

        } catch (error) {
            logger.error('Failed to send milestone notifications', error as Error);
        }
    }
}
