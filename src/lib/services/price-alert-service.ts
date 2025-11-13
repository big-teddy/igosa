import { PriceAlert, PriceHistory, PriceTracking, PriceAlertStats } from '@/types/price-alert';
import { notificationService } from './notification-service';

const PRICE_ALERTS_KEY = 'igosa-price-alerts';
const PRICE_HISTORY_KEY = 'igosa-price-history';

/**
 * Price Alert Service
 * Manages price alerts, tracking, and notifications
 */
class PriceAlertService {
  // ==================== PRICE ALERTS ====================

  /**
   * Create a price alert
   */
  createAlert(
    userId: string,
    productId: string,
    productName: string,
    productImage: string,
    currentPrice: number,
    targetPrice: number
  ): PriceAlert {
    try {
      const alert: PriceAlert = {
        id: this.generateId(),
        userId,
        productId,
        productName,
        productImage,
        currentPrice,
        targetPrice,
        createdAt: new Date().toISOString(),
        isActive: true,
        notified: false,
      };

      const stored = localStorage.getItem(PRICE_ALERTS_KEY);
      const alerts: PriceAlert[] = stored ? JSON.parse(stored) : [];
      alerts.push(alert);

      localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
      return alert;
    } catch (error) {
      console.error('Failed to create price alert:', error);
      throw error;
    }
  }

  /**
   * Get all alerts for a user
   */
  getUserAlerts(userId: string): PriceAlert[] {
    try {
      const stored = localStorage.getItem(PRICE_ALERTS_KEY);
      if (!stored) return [];

      const alerts: PriceAlert[] = JSON.parse(stored);
      return alerts
        .filter((alert) => alert.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to get user alerts:', error);
      return [];
    }
  }

  /**
   * Get active alerts for a user
   */
  getActiveAlerts(userId: string): PriceAlert[] {
    return this.getUserAlerts(userId).filter((alert) => alert.isActive);
  }

  /**
   * Check if user has an alert for a product
   */
  hasAlert(userId: string, productId: string): boolean {
    const alerts = this.getUserAlerts(userId);
    return alerts.some((alert) => alert.productId === productId && alert.isActive);
  }

  /**
   * Delete an alert
   */
  deleteAlert(alertId: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(PRICE_ALERTS_KEY);
      if (!stored) return false;

      let alerts: PriceAlert[] = JSON.parse(stored);
      const alert = alerts.find((a) => a.id === alertId);

      // Only allow user to delete their own alerts
      if (!alert || alert.userId !== userId) {
        return false;
      }

      alerts = alerts.filter((a) => a.id !== alertId);
      localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
      return true;
    } catch (error) {
      console.error('Failed to delete alert:', error);
      return false;
    }
  }

  /**
   * Toggle alert active status
   */
  toggleAlert(alertId: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(PRICE_ALERTS_KEY);
      if (!stored) return false;

      const alerts: PriceAlert[] = JSON.parse(stored);
      const alert = alerts.find((a) => a.id === alertId && a.userId === userId);

      if (alert) {
        alert.isActive = !alert.isActive;
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
        return alert.isActive;
      }

      return false;
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      return false;
    }
  }

  /**
   * Update alert target price
   */
  updateTargetPrice(alertId: string, userId: string, newTargetPrice: number): boolean {
    try {
      const stored = localStorage.getItem(PRICE_ALERTS_KEY);
      if (!stored) return false;

      const alerts: PriceAlert[] = JSON.parse(stored);
      const alert = alerts.find((a) => a.id === alertId && a.userId === userId);

      if (alert) {
        alert.targetPrice = newTargetPrice;
        alert.notified = false; // Reset notification status
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update target price:', error);
      return false;
    }
  }

  /**
   * Check alerts and trigger notifications
   * This would typically be called by a background job
   */
  checkAlerts(userId: string): PriceAlert[] {
    try {
      const stored = localStorage.getItem(PRICE_ALERTS_KEY);
      if (!stored) return [];

      const alerts: PriceAlert[] = JSON.parse(stored);
      const triggeredAlerts: PriceAlert[] = [];

      alerts.forEach((alert) => {
        if (
          alert.userId === userId &&
          alert.isActive &&
          !alert.notified &&
          alert.currentPrice <= alert.targetPrice
        ) {
          alert.notified = true;
          alert.triggeredAt = new Date().toISOString();
          triggeredAlerts.push(alert);

          // Create notification
          notificationService.createNotification(
            userId,
            'price_alert',
            '🔔 가격 알림!',
            `${alert.productName}이(가) 목표 가격에 도달했습니다! ₩${alert.currentPrice.toLocaleString()}`,
            {
              productId: alert.productId,
              productName: alert.productName,
              productImage: alert.productImage,
              price: alert.currentPrice,
              targetPrice: alert.targetPrice,
            },
            `/products/${alert.productId}`
          );
        }
      });

      if (triggeredAlerts.length > 0) {
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
      }

      return triggeredAlerts;
    } catch (error) {
      console.error('Failed to check alerts:', error);
      return [];
    }
  }

  // ==================== PRICE HISTORY ====================

  /**
   * Record a price point
   */
  recordPrice(productId: string, price: number, source?: string): void {
    try {
      const history: PriceHistory = {
        productId,
        price,
        timestamp: new Date().toISOString(),
        source,
      };

      const stored = localStorage.getItem(PRICE_HISTORY_KEY);
      const allHistory: PriceHistory[] = stored ? JSON.parse(stored) : [];
      allHistory.push(history);

      // Keep only last 100 price points per product
      const productHistory = allHistory.filter((h) => h.productId === productId);
      if (productHistory.length > 100) {
        const toRemove = productHistory.slice(0, productHistory.length - 100);
        const filtered = allHistory.filter(
          (h) => !toRemove.some((r) => r.timestamp === h.timestamp && r.productId === h.productId)
        );
        localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(filtered));
      } else {
        localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(allHistory));
      }

      // Update current price in active alerts
      this.updateCurrentPriceInAlerts(productId, price);
    } catch (error) {
      console.error('Failed to record price:', error);
    }
  }

  /**
   * Update current price in all alerts for a product
   */
  private updateCurrentPriceInAlerts(productId: string, newPrice: number): void {
    try {
      const stored = localStorage.getItem(PRICE_ALERTS_KEY);
      if (!stored) return;

      const alerts: PriceAlert[] = JSON.parse(stored);
      let updated = false;

      alerts.forEach((alert) => {
        if (alert.productId === productId && alert.isActive) {
          alert.currentPrice = newPrice;
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
      }
    } catch (error) {
      console.error('Failed to update current price in alerts:', error);
    }
  }

  /**
   * Get price history for a product
   */
  getPriceHistory(productId: string, days: number = 30): PriceHistory[] {
    try {
      const stored = localStorage.getItem(PRICE_HISTORY_KEY);
      if (!stored) return [];

      const allHistory: PriceHistory[] = JSON.parse(stored);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return allHistory
        .filter(
          (h) => h.productId === productId && new Date(h.timestamp) >= cutoffDate
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get price history:', error);
      return [];
    }
  }

  /**
   * Get price tracking info for a product
   */
  getPriceTracking(
    productId: string,
    productName: string,
    productImage: string,
    currentPrice: number
  ): PriceTracking {
    try {
      const history = this.getPriceHistory(productId, 30);

      if (history.length === 0) {
        // No history, return current price as all stats
        return {
          productId,
          productName,
          productImage,
          currentPrice,
          lowestPrice: currentPrice,
          highestPrice: currentPrice,
          averagePrice: currentPrice,
          priceHistory: [],
          priceChange: 0,
          priceChangeAmount: 0,
          alertCount: this.getAlertCount(productId),
        };
      }

      const prices = history.map((h) => h.price);
      const lowestPrice = Math.min(...prices, currentPrice);
      const highestPrice = Math.max(...prices, currentPrice);
      const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

      // Calculate price change from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentHistory = history.filter((h) => new Date(h.timestamp) >= yesterday);
      const yesterdayPrice = recentHistory.length > 0 ? recentHistory[0].price : currentPrice;
      const priceChangeAmount = currentPrice - yesterdayPrice;
      const priceChange = yesterdayPrice > 0 ? (priceChangeAmount / yesterdayPrice) * 100 : 0;

      return {
        productId,
        productName,
        productImage,
        currentPrice,
        lowestPrice,
        highestPrice,
        averagePrice,
        priceHistory: history,
        priceChange,
        priceChangeAmount,
        alertCount: this.getAlertCount(productId),
      };
    } catch (error) {
      console.error('Failed to get price tracking:', error);
      return {
        productId,
        productName,
        productImage,
        currentPrice,
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        averagePrice: currentPrice,
        priceHistory: [],
        priceChange: 0,
        priceChangeAmount: 0,
        alertCount: 0,
      };
    }
  }

  /**
   * Get number of users tracking a product
   */
  getAlertCount(productId: string): number {
    try {
      const stored = localStorage.getItem(PRICE_ALERTS_KEY);
      if (!stored) return 0;

      const alerts: PriceAlert[] = JSON.parse(stored);
      return alerts.filter((alert) => alert.productId === productId && alert.isActive).length;
    } catch (error) {
      console.error('Failed to get alert count:', error);
      return 0;
    }
  }

  // ==================== STATS ====================

  /**
   * Get price alert stats for a user
   */
  getUserStats(userId: string): PriceAlertStats {
    try {
      const alerts = this.getUserAlerts(userId);
      const activeAlerts = alerts.filter((a) => a.isActive);
      const triggeredAlerts = alerts.filter((a) => a.notified);

      // Calculate total savings from triggered alerts
      const totalSavings = triggeredAlerts.reduce((sum, alert) => {
        const savings = alert.currentPrice - alert.targetPrice;
        return sum + Math.abs(savings); // Absolute value in case target was higher
      }, 0);

      return {
        totalAlerts: alerts.length,
        activeAlerts: activeAlerts.length,
        triggeredAlerts: triggeredAlerts.length,
        totalSavings,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalAlerts: 0,
        activeAlerts: 0,
        triggeredAlerts: 0,
        totalSavings: 0,
      };
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(PRICE_ALERTS_KEY);
    localStorage.removeItem(PRICE_HISTORY_KEY);
  }
}

// Export singleton instance
export const priceAlertService = new PriceAlertService();
