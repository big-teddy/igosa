/**
 * Dashboard Types
 * 사용자 대시보드 및 활동 내역 타입
 */

export type ActivityType =
  | 'purchase'          // 구매
  | 'nego_join'         // 네고딜 참여
  | 'nego_complete'     // 네고딜 완료
  | 'price_alert_set'   // 가격 알림 설정
  | 'price_alert_hit'   // 가격 알림 도달
  | 'referral_earn'     // 레퍼럴 수익
  | 'like'              // 좋아요
  | 'comment'           // 댓글
  | 'share'             // 공유
  | 'wishlist_add';     // 찜 추가

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  data?: {
    productId?: string;
    productName?: string;
    productImage?: string;
    dealId?: string;
    amount?: number;
    earnings?: number;
    postId?: string;
  };
  icon?: string; // Icon name or emoji
  color?: string; // Color class
}

export interface DashboardStats {
  userId: string;
  // Overall stats
  totalPurchases: number;
  totalSpent: number;
  totalSaved: number;  // Total discount amount saved

  // Nego deals
  activeNegoDeals: number;
  completedNegoDeals: number;
  avgNegoDealDiscount: number;

  // Price alerts
  activePriceAlerts: number;
  triggeredPriceAlerts: number;

  // Referrals
  totalReferralEarnings: number;
  pendingReferralEarnings: number;
  paidReferralEarnings: number;
  totalReferrals: number;
  referralLevel: string;

  // Social
  totalLikes: number;
  totalComments: number;
  totalShares: number;

  // Wishlist
  wishlistCount: number;
}

export interface PeriodStats {
  period: 'day' | 'week' | 'month' | 'year';
  label: string;
  purchases: number;
  spent: number;
  saved: number;
  earnings: number;
  negoDealsJoined: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  productImage: string;
  metric: number; // purchases, saves, views, etc
  metricLabel: string;
}

export interface ReferralDashboardStats {
  // Overview
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;

  // Level
  currentLevel: string;
  levelProgress: number;
  currentReferrals: number;
  nextLevelReferrals: number;
  commissionRate: number;

  // Performance
  totalClicks: number;
  totalPurchases: number;
  conversionRate: number;

  // Top products
  topProducts: TopProduct[];

  // Trend
  periodStats: PeriodStats[];
}
