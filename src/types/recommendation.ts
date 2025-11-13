/**
 * Recommendation Types
 * AI 기반 상품 추천 시스템
 */

export type RecommendationType =
  | 'collaborative' // 협업 필터링 (다른 사용자의 구매 패턴 기반)
  | 'content_based' // 콘텐츠 기반 (상품 속성 유사도)
  | 'popularity' // 인기도 기반
  | 'personalized' // 개인화 추천 (복합)
  | 'similar_products' // 유사 상품
  | 'frequently_bought_together'; // 함께 구매한 상품

export interface ProductRecommendation {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  score: number; // 추천 점수 (0-1)
  reason: string; // 추천 이유
  type: RecommendationType;
}

export interface DealRecommendation {
  dealId: string;
  dealName: string;
  productImage: string;
  targetPrice: number;
  originalPrice: number;
  discountRate: number;
  currentParticipants: number;
  targetParticipants: number;
  score: number;
  reason: string;
  type: RecommendationType;
}

export interface UserPreference {
  userId: string;
  categories: string[]; // 관심 카테고리
  brands: string[]; // 관심 브랜드
  priceRange: {
    min: number;
    max: number;
  };
  keywords: string[]; // 검색/조회한 키워드
  viewedProducts: string[]; // 최근 조회한 상품
  purchasedProducts: string[]; // 구매한 상품
  likedProducts: string[]; // 찜한 상품
  joinedDeals: string[]; // 참여한 딜
  updatedAt: string;
}

export interface RecommendationRequest {
  userId?: string;
  productId?: string; // 특정 상품과 유사한 상품 추천
  dealId?: string; // 특정 딜과 유사한 딜 추천
  category?: string; // 카테고리별 추천
  type?: RecommendationType; // 추천 알고리즘
  limit?: number; // 결과 개수
  excludeIds?: string[]; // 제외할 상품/딜 ID
}

export interface RecommendationResponse {
  products: ProductRecommendation[];
  deals: DealRecommendation[];
  type: RecommendationType;
  generatedAt: string;
}

export interface RecommendationStats {
  totalRecommendations: number;
  totalClicks: number;
  totalPurchases: number;
  clickThroughRate: number;
  conversionRate: number;
  averageScore: number;
}

// Interaction types for tracking user behavior
export type InteractionType =
  | 'view' // 상품 조회
  | 'like' // 찜하기
  | 'cart' // 장바구니 추가
  | 'purchase' // 구매
  | 'search' // 검색
  | 'share' // 공유
  | 'click'; // 클릭

export interface UserInteraction {
  id: string;
  userId: string;
  type: InteractionType;
  productId?: string;
  dealId?: string;
  category?: string;
  brand?: string;
  keyword?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
