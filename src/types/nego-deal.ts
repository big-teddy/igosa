/**
 * 공동구매 (Negotiate Deal) 타입 정의
 */

export type NegoDealStatus = 'active' | 'goal_reached' | 'expired' | 'completed';
export type Platform = 'coupang' | 'naver' | '11st';

/**
 * 공동구매 딜 정보
 */
export interface NegoDeal {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;

  // 가격 정보
  originalPrice: number;
  targetPrice: number;
  discountRate: number; // 퍼센트
  savings: number; // 절약 금액

  // 참여 정보
  currentParticipants: number;
  targetParticipants: number;
  participantGoal: number; // 목표 인원

  // 진행 상태
  status: NegoDealStatus;
  progress: number; // 0-100 퍼센트

  // 시간 정보
  startDate: string;
  endDate: string;
  hoursRemaining: number;

  // 플랫폼 정보
  platform: Platform;

  // 추가 정보
  description: string;
  highlights: string[];

  // 참여자 정보
  participants?: NegoDealParticipant[];

  // 할인 단계 정보 (인원에 따른 할인율 증가)
  discountTiers?: DiscountTier[];
}

/**
 * 공동구매 참여자 정보
 */
export interface NegoDealParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  referralCode?: string; // 레퍼럴 코드 (친구 초대용)
}

/**
 * 할인 단계 (인원이 늘어날수록 할인율 증가)
 */
export interface DiscountTier {
  participantCount: number; // 필요 인원
  discountRate: number; // 할인율 (%)
  price: number; // 할인 가격
}

/**
 * 사용자의 공동구매 참여 내역
 */
export interface UserNegoDealParticipation {
  dealId: string;
  userId: string;
  joinedAt: string;
  invitedBy?: string; // 초대한 사람 userId (레퍼럴)
  status: 'active' | 'completed' | 'expired';
  notified: boolean; // 목표 달성 알림 여부
}

/**
 * 공동구매 통계
 */
export interface NegoDealStats {
  totalDeals: number; // 전체 딜 수
  activeDeals: number; // 진행 중인 딜 수
  participatedDeals: number; // 참여한 딜 수
  completedDeals: number; // 완료된 딜 수
  totalSavings: number; // 총 절약 금액
  friendsInvited: number; // 초대한 친구 수
  referralEarnings: number; // 레퍼럴 수익 (친구 초대 보상)
}

/**
 * 공동구매 알림
 */
export interface NegoDealNotification {
  id: string;
  dealId: string;
  userId: string;
  type: 'goal_reached' | 'tier_upgraded' | 'ending_soon' | 'deal_completed';
  message: string;
  createdAt: string;
  read: boolean;
}
