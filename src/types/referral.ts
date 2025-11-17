export interface ReferralLink {
  id: string;
  userId: string;
  postId: string;
  productId: string;
  referralCode: string;
  createdAt: string;
  clicks: number;
  purchases: number;
  totalRevenue: number;
}

export interface ReferralPurchase {
  id: string;
  referralCode: string;
  referrerId: string; // 추천한 사람
  buyerId: string; // 구매한 사람
  productId: string;
  productName: string;
  purchaseAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: 'pending' | 'confirmed' | 'paid';
  purchaseDate: string;
  paidDate?: string;
}

export interface ReferralStats {
  totalClicks: number;
  totalPurchases: number;
  totalRevenue: number;
  pendingRevenue: number;
  paidRevenue: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    purchases: number;
    revenue: number;
  }>;
}

export interface UserReferralLevel {
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  commissionRate: number;
  totalReferrals: number;
  requiredReferrals: number;
  benefits: string[];
}

// Commission rates by level
export const COMMISSION_RATES = {
  bronze: 0.03, // 3%
  silver: 0.04, // 4%
  gold: 0.05, // 5%
  platinum: 0.06, // 6%
} as const;

// Level requirements
export const LEVEL_REQUIREMENTS = {
  bronze: 0,
  silver: 11,
  gold: 51,
  platinum: 201,
} as const;
