export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  createdAt: string;
  triggeredAt?: string;
  isActive: boolean;
  notified: boolean;
}

export interface PriceHistory {
  productId: string;
  price: number;
  timestamp: string;
  source?: string; // e.g., "쿠팡", "네이버", "11번가"
}

export interface PriceTracking {
  productId: string;
  productName: string;
  productImage: string;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  priceHistory: PriceHistory[];
  priceChange: number; // Percentage change from yesterday
  priceChangeAmount: number; // Absolute change from yesterday
  alertCount: number; // Number of users tracking this product
}

export interface PriceAlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggeredAlerts: number;
  totalSavings: number; // Total amount saved from price drops
}
