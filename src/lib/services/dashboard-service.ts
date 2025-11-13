/**
 * Dashboard Service
 * 사용자 대시보드 통계 및 활동 내역 관리
 *
 * Features:
 * - 전체 사용자 통계 집계
 * - 활동 내역 관리
 * - 레퍼럴 대시보드 통계
 */

import type {
  DashboardStats,
  UserActivity,
  ReferralDashboardStats,
  PeriodStats,
  TopProduct,
} from '@/types/dashboard';
import { negoDealService } from './nego-deal-service';
import { priceAlertService } from './price-alert-service';
import { referralService } from './referral-service';

const ACTIVITIES_KEY = 'igosa_user_activities';

class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  // ==================== DASHBOARD STATS ====================

  /**
   * Get comprehensive dashboard stats for user
   */
  getDashboardStats(userId: string): DashboardStats {
    try {
      // Nego deals stats
      const negoStats = negoDealService.getUserStats(userId);
      const activeParticipations = negoDealService
        .getUserParticipations(userId)
        .filter((p) => p.status === 'active');

      // Price alerts stats
      const priceAlertStats = priceAlertService.getUserStats(userId);

      // Referral stats
      const referralStats = referralService.getUserStats(userId);
      const referralLevel = referralService.getUserLevel(userId);

      // Social stats (mock for now)
      const socialStats = this.getSocialStats(userId);

      return {
        userId,
        // Overall
        totalPurchases: 0, // TODO: Integrate with order service
        totalSpent: 0,
        totalSaved: negoStats.totalSavings || 0,

        // Nego deals
        activeNegoDeals: activeParticipations.length,
        completedNegoDeals: negoStats.completedDeals || 0,
        avgNegoDealDiscount: 0,

        // Price alerts
        activePriceAlerts: priceAlertStats.activeAlerts,
        triggeredPriceAlerts: priceAlertStats.triggeredAlerts,

        // Referrals
        totalReferralEarnings: referralStats.totalRevenue,
        pendingReferralEarnings: referralStats.pendingRevenue,
        paidReferralEarnings: referralStats.paidRevenue,
        totalReferrals: referralStats.totalPurchases,
        referralLevel: referralLevel.level,

        // Social
        totalLikes: socialStats.likes,
        totalComments: socialStats.comments,
        totalShares: socialStats.shares,

        // Wishlist
        wishlistCount: 0, // TODO: Integrate with wishlist service
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return this.getEmptyStats(userId);
    }
  }

  /**
   * Get empty stats
   */
  private getEmptyStats(userId: string): DashboardStats {
    return {
      userId,
      totalPurchases: 0,
      totalSpent: 0,
      totalSaved: 0,
      activeNegoDeals: 0,
      completedNegoDeals: 0,
      avgNegoDealDiscount: 0,
      activePriceAlerts: 0,
      triggeredPriceAlerts: 0,
      totalReferralEarnings: 0,
      pendingReferralEarnings: 0,
      paidReferralEarnings: 0,
      totalReferrals: 0,
      referralLevel: 'bronze',
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      wishlistCount: 0,
    };
  }

  /**
   * Get social stats (mock for now)
   */
  private getSocialStats(userId: string): { likes: number; comments: number; shares: number } {
    // TODO: Integrate with social feed service
    return {
      likes: 0,
      comments: 0,
      shares: 0,
    };
  }

  // ==================== REFERRAL DASHBOARD ====================

  /**
   * Get comprehensive referral dashboard stats
   */
  getReferralDashboardStats(userId: string): ReferralDashboardStats {
    try {
      const referralStats = referralService.getUserStats(userId);
      const referralLevel = referralService.getUserLevel(userId);
      const purchases = referralService.getUserPurchases(userId);

      // Calculate top products
      const productMap = new Map<
        string,
        { productId: string; productName: string; revenue: number }
      >();
      purchases.forEach((p) => {
        const existing = productMap.get(p.productId);
        if (existing) {
          existing.revenue += p.commissionAmount;
        } else {
          productMap.set(p.productId, {
            productId: p.productId,
            productName: p.productName,
            revenue: p.commissionAmount,
          });
        }
      });

      const topProducts: TopProduct[] = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({
          productId: p.productId,
          productName: p.productName,
          productImage: '', // TODO: Get from product service
          metric: p.revenue,
          metricLabel: '수익',
        }));

      // Calculate period stats (mock for now)
      const periodStats: PeriodStats[] = this.calculatePeriodStats(userId);

      return {
        // Overview
        totalEarnings: referralStats.totalRevenue,
        pendingEarnings: referralStats.pendingRevenue,
        paidEarnings: referralStats.paidRevenue,

        // Level
        currentLevel: referralLevel.level,
        levelProgress: (referralLevel.totalReferrals / referralLevel.requiredReferrals) * 100,
        currentReferrals: referralLevel.totalReferrals,
        nextLevelReferrals: referralLevel.requiredReferrals,
        commissionRate: referralLevel.commissionRate,

        // Performance
        totalClicks: referralStats.totalClicks,
        totalPurchases: referralStats.totalPurchases,
        conversionRate: referralStats.conversionRate,

        // Top products
        topProducts,

        // Trend
        periodStats,
      };
    } catch (error) {
      console.error('Failed to get referral dashboard stats:', error);
      return this.getEmptyReferralStats();
    }
  }

  /**
   * Get empty referral stats
   */
  private getEmptyReferralStats(): ReferralDashboardStats {
    return {
      totalEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      currentLevel: 'bronze',
      levelProgress: 0,
      currentReferrals: 0,
      nextLevelReferrals: 11,
      commissionRate: 0.03,
      totalClicks: 0,
      totalPurchases: 0,
      conversionRate: 0,
      topProducts: [],
      periodStats: [],
    };
  }

  /**
   * Calculate period stats (mock implementation)
   */
  private calculatePeriodStats(userId: string): PeriodStats[] {
    // TODO: Implement real period calculation
    return [
      {
        period: 'week',
        label: '이번 주',
        purchases: 0,
        spent: 0,
        saved: 0,
        earnings: 0,
        negoDealsJoined: 0,
      },
      {
        period: 'month',
        label: '이번 달',
        purchases: 0,
        spent: 0,
        saved: 0,
        earnings: 0,
        negoDealsJoined: 0,
      },
    ];
  }

  // ==================== ACTIVITY HISTORY ====================

  /**
   * Add activity to user's history
   */
  addActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): UserActivity {
    try {
      const newActivity: UserActivity = {
        ...activity,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
      };

      const stored = localStorage.getItem(ACTIVITIES_KEY);
      const activities: UserActivity[] = stored ? JSON.parse(stored) : [];
      activities.unshift(newActivity);

      // Keep only last 1000 activities
      const trimmed = activities.slice(0, 1000);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(trimmed));

      return newActivity;
    } catch (error) {
      console.error('Failed to add activity:', error);
      throw error;
    }
  }

  /**
   * Get user activities
   */
  getUserActivities(userId: string, limit = 50): UserActivity[] {
    try {
      const stored = localStorage.getItem(ACTIVITIES_KEY);
      if (!stored) return [];

      const activities: UserActivity[] = JSON.parse(stored);
      return activities
        .filter((a) => a.userId === userId)
        .slice(0, limit)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get user activities:', error);
      return [];
    }
  }

  /**
   * Get filtered activities
   */
  getFilteredActivities(
    userId: string,
    types?: string[],
    limit = 50
  ): UserActivity[] {
    try {
      let activities = this.getUserActivities(userId, 1000);

      if (types && types.length > 0) {
        activities = activities.filter((a) => types.includes(a.type));
      }

      return activities.slice(0, limit);
    } catch (error) {
      console.error('Failed to get filtered activities:', error);
      return [];
    }
  }

  /**
   * Clear all user activities
   */
  clearActivities(userId: string): void {
    try {
      const stored = localStorage.getItem(ACTIVITIES_KEY);
      if (!stored) return;

      const activities: UserActivity[] = JSON.parse(stored);
      const filtered = activities.filter((a) => a.userId !== userId);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to clear activities:', error);
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(ACTIVITIES_KEY);
  }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance();
