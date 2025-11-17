export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  seller: string;
  purchaseDate: string; // ISO 8601 date string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  quantity: number;
  category?: string;
  userId: string;
  searchMode?: 'price' | 'recommend'; // Which mode was used to find this product
  referralSource?: 'friend' | 'influencer' | 'ai' | 'search'; // How they found it
}

export interface PurchaseStats {
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  categoryCounts: Record<string, number>;
  recentPurchases: PurchaseItem[];
}

export interface PurchaseFilters {
  status?: PurchaseItem['status'];
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  searchMode?: 'price' | 'recommend';
}
