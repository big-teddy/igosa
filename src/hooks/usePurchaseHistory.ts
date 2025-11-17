'use client';

import { useState, useEffect, useCallback } from 'react';
import { PurchaseItem, PurchaseStats, PurchaseFilters } from '@/types/purchase';
import { purchaseService } from '@/lib/services/purchase-service';

export function usePurchaseHistory(userId: string) {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load purchases on mount and when userId changes
  const loadPurchases = useCallback(() => {
    setIsLoading(true);
    try {
      const userPurchases = purchaseService.getPurchases(userId);
      setPurchases(userPurchases);

      const userStats = purchaseService.getStats(userId);
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load purchase history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // Add a new purchase
  const addPurchase = useCallback(
    async (purchase: Omit<PurchaseItem, 'id' | 'purchaseDate' | 'userId'>) => {
      try {
        const newPurchase = purchaseService.addPurchase({
          ...purchase,
          userId,
        });
        loadPurchases(); // Reload data
        return newPurchase;
      } catch (error) {
        console.error('Failed to add purchase:', error);
        throw error;
      }
    },
    [userId, loadPurchases]
  );

  // Update purchase status
  const updateStatus = useCallback(
    async (purchaseId: string, status: PurchaseItem['status']) => {
      try {
        purchaseService.updatePurchaseStatus(purchaseId, status);
        loadPurchases(); // Reload data
      } catch (error) {
        console.error('Failed to update purchase status:', error);
        throw error;
      }
    },
    [loadPurchases]
  );

  // Delete a purchase
  const deletePurchase = useCallback(
    async (purchaseId: string) => {
      try {
        purchaseService.deletePurchase(purchaseId);
        loadPurchases(); // Reload data
      } catch (error) {
        console.error('Failed to delete purchase:', error);
        throw error;
      }
    },
    [loadPurchases]
  );

  // Get filtered purchases
  const getFiltered = useCallback(
    (filters: PurchaseFilters) => {
      return purchaseService.getFilteredPurchases(userId, filters);
    },
    [userId]
  );

  // Clear all purchases (for testing)
  const clearAll = useCallback(
    async () => {
      try {
        purchaseService.clearPurchases(userId);
        loadPurchases(); // Reload data
      } catch (error) {
        console.error('Failed to clear purchases:', error);
        throw error;
      }
    },
    [userId, loadPurchases]
  );

  return {
    purchases,
    stats,
    isLoading,
    addPurchase,
    updateStatus,
    deletePurchase,
    getFiltered,
    clearAll,
    refresh: loadPurchases,
  };
}
