import {
  ReferralLink,
  ReferralPurchase,
  ReferralStats,
  UserReferralLevel,
  COMMISSION_RATES,
  LEVEL_REQUIREMENTS,
} from '@/types/referral';

const REFERRAL_LINKS_KEY = 'igosa-referral-links';
const REFERRAL_PURCHASES_KEY = 'igosa-referral-purchases';

/**
 * Referral Service
 * Manages referral links, tracking, and commission calculations
 */
class ReferralService {
  // ==================== REFERRAL LINKS ====================

  /**
   * Generate a unique referral code
   */
  private generateReferralCode(): string {
    return `REF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Create a referral link for a post
   */
  createReferralLink(userId: string, postId: string, productId: string): ReferralLink {
    try {
      const referralLink: ReferralLink = {
        id: this.generateId(),
        userId,
        postId,
        productId,
        referralCode: this.generateReferralCode(),
        createdAt: new Date().toISOString(),
        clicks: 0,
        purchases: 0,
        totalRevenue: 0,
      };

      const stored = localStorage.getItem(REFERRAL_LINKS_KEY);
      const links: ReferralLink[] = stored ? JSON.parse(stored) : [];
      links.push(referralLink);

      localStorage.setItem(REFERRAL_LINKS_KEY, JSON.stringify(links));
      return referralLink;
    } catch (error) {
      console.error('Failed to create referral link:', error);
      throw error;
    }
  }

  /**
   * Get referral link by code
   */
  getReferralLinkByCode(referralCode: string): ReferralLink | null {
    try {
      const stored = localStorage.getItem(REFERRAL_LINKS_KEY);
      if (!stored) return null;

      const links: ReferralLink[] = JSON.parse(stored);
      return links.find((link) => link.referralCode === referralCode) || null;
    } catch (error) {
      console.error('Failed to get referral link:', error);
      return null;
    }
  }

  /**
   * Get referral link for a post (or create if doesn't exist)
   */
  getOrCreateReferralLink(userId: string, postId: string, productId: string): ReferralLink {
    try {
      const stored = localStorage.getItem(REFERRAL_LINKS_KEY);
      const links: ReferralLink[] = stored ? JSON.parse(stored) : [];

      // Find existing link
      const existing = links.find((link) => link.postId === postId && link.userId === userId);
      if (existing) return existing;

      // Create new link
      return this.createReferralLink(userId, postId, productId);
    } catch (error) {
      console.error('Failed to get or create referral link:', error);
      throw error;
    }
  }

  /**
   * Track a click on a referral link
   */
  trackClick(referralCode: string): void {
    try {
      const stored = localStorage.getItem(REFERRAL_LINKS_KEY);
      if (!stored) return;

      const links: ReferralLink[] = JSON.parse(stored);
      const link = links.find((l) => l.referralCode === referralCode);

      if (link) {
        link.clicks += 1;
        localStorage.setItem(REFERRAL_LINKS_KEY, JSON.stringify(links));
      }
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }

  // ==================== REFERRAL PURCHASES ====================

  /**
   * Record a purchase from a referral
   */
  recordReferralPurchase(
    referralCode: string,
    buyerId: string,
    productId: string,
    productName: string,
    purchaseAmount: number
  ): ReferralPurchase {
    try {
      const link = this.getReferralLinkByCode(referralCode);
      if (!link) {
        throw new Error('Invalid referral code');
      }

      // Get user's level and commission rate
      const level = this.getUserLevel(link.userId);
      const commissionRate = COMMISSION_RATES[level.level];
      const commissionAmount = purchaseAmount * commissionRate;

      const purchase: ReferralPurchase = {
        id: this.generateId(),
        referralCode,
        referrerId: link.userId,
        buyerId,
        productId,
        productName,
        purchaseAmount,
        commissionAmount,
        commissionRate,
        status: 'pending',
        purchaseDate: new Date().toISOString(),
      };

      // Save purchase
      const stored = localStorage.getItem(REFERRAL_PURCHASES_KEY);
      const purchases: ReferralPurchase[] = stored ? JSON.parse(stored) : [];
      purchases.push(purchase);
      localStorage.setItem(REFERRAL_PURCHASES_KEY, JSON.stringify(purchases));

      // Update link stats
      this.updateLinkStats(referralCode, commissionAmount);

      return purchase;
    } catch (error) {
      console.error('Failed to record referral purchase:', error);
      throw error;
    }
  }

  /**
   * Update link stats after purchase
   */
  private updateLinkStats(referralCode: string, commissionAmount: number): void {
    try {
      const stored = localStorage.getItem(REFERRAL_LINKS_KEY);
      if (!stored) return;

      const links: ReferralLink[] = JSON.parse(stored);
      const link = links.find((l) => l.referralCode === referralCode);

      if (link) {
        link.purchases += 1;
        link.totalRevenue += commissionAmount;
        localStorage.setItem(REFERRAL_LINKS_KEY, JSON.stringify(links));
      }
    } catch (error) {
      console.error('Failed to update link stats:', error);
    }
  }

  /**
   * Get all referral purchases for a user
   */
  getUserPurchases(userId: string): ReferralPurchase[] {
    try {
      const stored = localStorage.getItem(REFERRAL_PURCHASES_KEY);
      if (!stored) return [];

      const purchases: ReferralPurchase[] = JSON.parse(stored);
      return purchases
        .filter((p) => p.referrerId === userId)
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    } catch (error) {
      console.error('Failed to get user purchases:', error);
      return [];
    }
  }

  /**
   * Update purchase status
   */
  updatePurchaseStatus(
    purchaseId: string,
    status: ReferralPurchase['status'],
    paidDate?: string
  ): void {
    try {
      const stored = localStorage.getItem(REFERRAL_PURCHASES_KEY);
      if (!stored) return;

      const purchases: ReferralPurchase[] = JSON.parse(stored);
      const purchase = purchases.find((p) => p.id === purchaseId);

      if (purchase) {
        purchase.status = status;
        if (paidDate) {
          purchase.paidDate = paidDate;
        }
        localStorage.setItem(REFERRAL_PURCHASES_KEY, JSON.stringify(purchases));
      }
    } catch (error) {
      console.error('Failed to update purchase status:', error);
    }
  }

  // ==================== STATS & LEVELS ====================

  /**
   * Get user's referral stats
   */
  getUserStats(userId: string): ReferralStats {
    try {
      const links = this.getUserLinks(userId);
      const purchases = this.getUserPurchases(userId);

      const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
      const totalPurchases = purchases.length;
      const totalRevenue = purchases.reduce((sum, p) => sum + p.commissionAmount, 0);
      const pendingRevenue = purchases
        .filter((p) => p.status === 'pending' || p.status === 'confirmed')
        .reduce((sum, p) => sum + p.commissionAmount, 0);
      const paidRevenue = purchases
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.commissionAmount, 0);
      const conversionRate = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;

      // Top products
      const productMap = new Map<
        string,
        { productId: string; productName: string; purchases: number; revenue: number }
      >();

      purchases.forEach((p) => {
        if (!productMap.has(p.productId)) {
          productMap.set(p.productId, {
            productId: p.productId,
            productName: p.productName,
            purchases: 0,
            revenue: 0,
          });
        }
        const product = productMap.get(p.productId)!;
        product.purchases += 1;
        product.revenue += p.commissionAmount;
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        totalClicks,
        totalPurchases,
        totalRevenue,
        pendingRevenue,
        paidRevenue,
        conversionRate,
        topProducts,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalClicks: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
        paidRevenue: 0,
        conversionRate: 0,
        topProducts: [],
      };
    }
  }

  /**
   * Get user's referral level
   */
  getUserLevel(userId: string): UserReferralLevel {
    const purchases = this.getUserPurchases(userId);
    const totalReferrals = purchases.filter((p) => p.status === 'confirmed' || p.status === 'paid')
      .length;

    let level: UserReferralLevel['level'] = 'bronze';
    let requiredReferrals: number = LEVEL_REQUIREMENTS.silver;

    if (totalReferrals >= LEVEL_REQUIREMENTS.platinum) {
      level = 'platinum';
      requiredReferrals = LEVEL_REQUIREMENTS.platinum;
    } else if (totalReferrals >= LEVEL_REQUIREMENTS.gold) {
      level = 'gold';
      requiredReferrals = LEVEL_REQUIREMENTS.platinum;
    } else if (totalReferrals >= LEVEL_REQUIREMENTS.silver) {
      level = 'silver';
      requiredReferrals = LEVEL_REQUIREMENTS.gold;
    }

    const benefits = this.getLevelBenefits(level);

    return {
      level,
      commissionRate: COMMISSION_RATES[level],
      totalReferrals,
      requiredReferrals,
      benefits,
    };
  }

  /**
   * Get benefits for a level
   */
  private getLevelBenefits(level: UserReferralLevel['level']): string[] {
    const benefits: Record<UserReferralLevel['level'], string[]> = {
      bronze: ['3% 기본 수수료', '추천 링크 생성', '기본 통계'],
      silver: ['4% 수수료', '우선 정산', '상세 통계', 'Silver 배지'],
      gold: ['5% 수수료', '빠른 정산', '고급 분석', 'Gold 배지', '월간 보너스'],
      platinum: [
        '6% 수수료',
        '즉시 정산',
        '프리미엄 분석',
        'Platinum 배지',
        '월간 보너스',
        '전담 매니저',
      ],
    };

    return benefits[level];
  }

  /**
   * Get all user's referral links
   */
  getUserLinks(userId: string): ReferralLink[] {
    try {
      const stored = localStorage.getItem(REFERRAL_LINKS_KEY);
      if (!stored) return [];

      const links: ReferralLink[] = JSON.parse(stored);
      return links.filter((link) => link.userId === userId);
    } catch (error) {
      console.error('Failed to get user links:', error);
      return [];
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(REFERRAL_LINKS_KEY);
    localStorage.removeItem(REFERRAL_PURCHASES_KEY);
  }
}

// Export singleton instance
export const referralService = new ReferralService();
