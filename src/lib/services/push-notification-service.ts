/**
 * Push Notification Service
 * 웹 푸시 및 모바일 푸시 알림
 */

import { logger } from '@/lib/logger';

interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: string;
    data?: Record<string, any>;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

export class PushNotificationService {
    /**
     * 협상 성공 알림 전송
     */
    static async sendNegotiationSuccessNotification(
        userId: string,
        data: {
            productName: string;
            finalPrice: number;
            savings: number;
            negotiationId: string;
        }
    ): Promise<boolean> {
        try {
            const payload: PushNotificationPayload = {
                title: '🎉 네고딜 성공!',
                body: `${data.productName} ₩${data.finalPrice.toLocaleString()}에 협상 성공! ₩${data.savings.toLocaleString()} 절약`,
                icon: '/icons/success.png',
                badge: '/icons/badge.png',
                data: {
                    type: 'negotiation_success',
                    negotiationId: data.negotiationId,
                    url: `/negotiations/${data.negotiationId}`,
                },
                actions: [
                    {
                        action: 'view',
                        title: '지금 구매하기',
                    },
                    {
                        action: 'share',
                        title: '친구에게 공유',
                    },
                ],
            };

            await this.send(userId, payload);

            logger.info('Success notification sent', {
                userId,
                negotiationId: data.negotiationId,
            });

            return true;
        } catch (error) {
            logger.error('Failed to send success notification', error as Error, {
                userId,
            });
            return false;
        }
    }

    /**
     * 협상 마일스톤 알림
     */
    static async sendMilestoneNotification(
        userId: string,
        data: {
            productName: string;
            milestone: number;
            currentParticipants: number;
            negotiationId: string;
        }
    ): Promise<boolean> {
        try {
            const payload: PushNotificationPayload = {
                title: `🔥 ${data.milestone}명 달성!`,
                body: `${data.productName} 네고딜에 ${data.currentParticipants}명 참여 중! AI가 판매자와 협상 시작합니다.`,
                icon: '/icons/milestone.png',
                data: {
                    type: 'milestone',
                    negotiationId: data.negotiationId,
                    url: `/negotiations/${data.negotiationId}`,
                },
            };

            await this.send(userId, payload);

            return true;
        } catch (error) {
            logger.error('Failed to send milestone notification', error as Error);
            return false;
        }
    }

    /**
     * 친구 초대 보상 알림
     */
    static async sendInviteRewardNotification(
        userId: string,
        data: {
            friendName: string;
            reward: number;
        }
    ): Promise<boolean> {
        try {
            const payload: PushNotificationPayload = {
                title: '🎁 초대 보상 도착!',
                body: `${data.friendName}님이 가입했어요! ₩${data.reward.toLocaleString()} 쿠폰을 받았습니다.`,
                icon: '/icons/reward.png',
                data: {
                    type: 'invite_reward',
                    url: '/my/coupons',
                },
            };

            await this.send(userId, payload);

            return true;
        } catch (error) {
            logger.error('Failed to send invite reward notification', error as Error);
            return false;
        }
    }

    /**
     * 실제 푸시 알림 전송
     */
    private static async send(
        userId: string,
        payload: PushNotificationPayload
    ): Promise<void> {
        // TODO: 실제 푸시 알림 서비스 연동
        // - Web Push API (service worker)
        // - Firebase Cloud Messaging (FCM)
        // - Apple Push Notification Service (APNS)

        // 현재: 로그만 기록
        logger.info('Push notification would be sent', {
            userId,
            title: payload.title,
            body: payload.body,
        });

        // Mock: 개발 환경에서는 debug 로그
        if (process.env.NODE_ENV === 'development') {
            logger.debug('Push Notification Preview', {
                userId,
                title: payload.title,
                body: payload.body,
                data: payload.data,
            });
        }

        // TODO: DB에 알림 기록 저장
        // await this.saveNotificationHistory(userId, payload);
    }

    /**
     * 여러 사용자에게 일괄 전송
     */
    static async sendBulk(
        userIds: string[],
        payload: PushNotificationPayload
    ): Promise<{
        success: number;
        failed: number;
    }> {
        let success = 0;
        let failed = 0;

        // 배치 처리 (100명씩)
        const batchSize = 100;
        for (let i = 0; i < userIds.length; i += batchSize) {
            const batch = userIds.slice(i, i + batchSize);

            const results = await Promise.allSettled(
                batch.map(userId => this.send(userId, payload))
            );

            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    success++;
                } else {
                    failed++;
                }
            });
        }

        logger.info('Bulk notifications sent', {
            total: userIds.length,
            success,
            failed,
        });

        return { success, failed };
    }
}
