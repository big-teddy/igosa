/**
 * 알림 타입 정의
 */

export type NotificationType =
  | 'price_alert'        // 가격 알림 도달
  | 'deal_goal_reached'  // 네고딜 목표 달성
  | 'referral_earned'    // 레퍼럴 수익 발생
  | 'deal_ending_soon'   // 네고딜 마감 임박
  | 'new_follower'       // 새 팔로워
  | 'comment'            // 댓글
  | 'like';              // 좋아요

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;

  // 타입별 추가 데이터
  data?: {
    productId?: string;
    productName?: string;
    productImage?: string;
    dealId?: string;
    price?: number;
    targetPrice?: number;
    earnings?: number;
    fromUserId?: string;
    fromUserName?: string;
  };
}

export interface NotificationPreferences {
  userId: string;
  enableBrowser: boolean;      // 브라우저 알림
  enableEmail: boolean;         // 이메일 알림 (미구현)
  enablePush: boolean;          // 푸시 알림 (미구현)

  // 알림 타입별 설정
  priceAlerts: boolean;
  dealAlerts: boolean;
  referralAlerts: boolean;
  socialAlerts: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}
