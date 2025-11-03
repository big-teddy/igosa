import { Product } from './mock-products';
import { NegoDeal } from './mock-nego-deals';

// Wishlist (찜한 제품)
export function getWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  const wishlist = localStorage.getItem('wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

export function addToWishlist(productId: string): void {
  const wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }
}

export function removeFromWishlist(productId: string): void {
  const wishlist = getWishlist();
  const filtered = wishlist.filter(id => id !== productId);
  localStorage.setItem('wishlist', JSON.stringify(filtered));
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().includes(productId);
}

export function toggleWishlist(productId: string): boolean {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  } else {
    addToWishlist(productId);
    return true;
  }
}

// Recently Viewed (최근 본 제품)
interface RecentlyViewedItem {
  productId: string;
  timestamp: number;
}

export function getRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return [];
  const recent = localStorage.getItem('recentlyViewed');
  if (!recent) return [];

  const items: RecentlyViewedItem[] = JSON.parse(recent);
  // Sort by timestamp descending
  items.sort((a, b) => b.timestamp - a.timestamp);
  return items.map(item => item.productId);
}

export function addToRecentlyViewed(productId: string): void {
  const recent = localStorage.getItem('recentlyViewed');
  let items: RecentlyViewedItem[] = recent ? JSON.parse(recent) : [];

  // Remove if already exists
  items = items.filter(item => item.productId !== productId);

  // Add to beginning
  items.unshift({ productId, timestamp: Date.now() });

  // Keep only last 20 items
  items = items.slice(0, 20);

  localStorage.setItem('recentlyViewed', JSON.stringify(items));
}

// Participated Nego Deals (참여한 네고딜)
export interface ParticipatedDeal {
  dealId: string;
  participatedAt: number;
  orderId?: string;
}

export function getParticipatedDeals(): ParticipatedDeal[] {
  if (typeof window === 'undefined') return [];
  const participated = localStorage.getItem('participatedDeals');
  return participated ? JSON.parse(participated) : [];
}

export function addParticipatedDeal(dealId: string, orderId?: string): void {
  const participated = getParticipatedDeals();

  // Check if already participated
  const exists = participated.find(p => p.dealId === dealId);
  if (!exists) {
    participated.push({
      dealId,
      participatedAt: Date.now(),
      orderId,
    });
    localStorage.setItem('participatedDeals', JSON.stringify(participated));
  }
}

export function isParticipatedInDeal(dealId: string): boolean {
  return getParticipatedDeals().some(p => p.dealId === dealId);
}
