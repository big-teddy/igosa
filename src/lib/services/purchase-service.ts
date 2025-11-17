import { PurchaseItem, PurchaseStats, PurchaseFilters } from '@/types/purchase';

const STORAGE_KEY = 'igosa-purchase-history';

/**
 * Purchase History Service
 * Manages purchase data with localStorage persistence
 */
class PurchaseService {
  /**
   * Get all purchases for a user
   */
  getPurchases(userId: string): PurchaseItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const allPurchases: PurchaseItem[] = JSON.parse(stored);
      return allPurchases.filter((p) => p.userId === userId);
    } catch (error) {
      console.error('Failed to load purchases:', error);
      return [];
    }
  }

  /**
   * Get filtered purchases
   */
  getFilteredPurchases(userId: string, filters: PurchaseFilters): PurchaseItem[] {
    let purchases = this.getPurchases(userId);

    if (filters.status) {
      purchases = purchases.filter((p) => p.status === filters.status);
    }

    if (filters.dateFrom) {
      purchases = purchases.filter((p) => p.purchaseDate >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      purchases = purchases.filter((p) => p.purchaseDate <= filters.dateTo!);
    }

    if (filters.minPrice !== undefined) {
      purchases = purchases.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      purchases = purchases.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.category) {
      purchases = purchases.filter((p) => p.category === filters.category);
    }

    if (filters.searchMode) {
      purchases = purchases.filter((p) => p.searchMode === filters.searchMode);
    }

    return purchases;
  }

  /**
   * Add a new purchase
   */
  addPurchase(purchase: Omit<PurchaseItem, 'id' | 'purchaseDate'>): PurchaseItem {
    try {
      const newPurchase: PurchaseItem = {
        ...purchase,
        id: this.generateId(),
        purchaseDate: new Date().toISOString(),
      };

      const stored = localStorage.getItem(STORAGE_KEY);
      const allPurchases: PurchaseItem[] = stored ? JSON.parse(stored) : [];
      allPurchases.push(newPurchase);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPurchases));
      return newPurchase;
    } catch (error) {
      console.error('Failed to add purchase:', error);
      throw error;
    }
  }

  /**
   * Update purchase status
   */
  updatePurchaseStatus(purchaseId: string, status: PurchaseItem['status']): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const allPurchases: PurchaseItem[] = JSON.parse(stored);
      const purchase = allPurchases.find((p) => p.id === purchaseId);

      if (purchase) {
        purchase.status = status;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allPurchases));
      }
    } catch (error) {
      console.error('Failed to update purchase status:', error);
      throw error;
    }
  }

  /**
   * Delete a purchase
   */
  deletePurchase(purchaseId: string): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const allPurchases: PurchaseItem[] = JSON.parse(stored);
      const filtered = allPurchases.filter((p) => p.id !== purchaseId);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete purchase:', error);
      throw error;
    }
  }

  /**
   * Get purchase statistics
   */
  getStats(userId: string): PurchaseStats {
    const purchases = this.getPurchases(userId);

    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    // Category counts
    const categoryCounts: Record<string, number> = {};
    purchases.forEach((p) => {
      if (p.category) {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      }
    });

    // Recent purchases (last 5)
    const recentPurchases = purchases
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 5);

    return {
      totalPurchases,
      totalSpent,
      averageOrderValue,
      categoryCounts,
      recentPurchases,
    };
  }

  /**
   * Get purchase by ID
   */
  getPurchaseById(purchaseId: string): PurchaseItem | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const allPurchases: PurchaseItem[] = JSON.parse(stored);
      return allPurchases.find((p) => p.id === purchaseId) || null;
    } catch (error) {
      console.error('Failed to get purchase:', error);
      return null;
    }
  }

  /**
   * Clear all purchases for a user (for testing)
   */
  clearPurchases(userId: string): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const allPurchases: PurchaseItem[] = JSON.parse(stored);
      const filtered = allPurchases.filter((p) => p.userId !== userId);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to clear purchases:', error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const purchaseService = new PurchaseService();
