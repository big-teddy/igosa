/**
 * Search and Filter Types
 * 상품 및 네고딜 검색/필터링 시스템
 */

export type SortOption =
  | 'relevance'      // 관련도순
  | 'price-asc'      // 가격 낮은순
  | 'price-desc'     // 가격 높은순
  | 'popularity'     // 인기순
  | 'newest'         // 최신순
  | 'discount'       // 할인율순
  | 'deadline';      // 마감임박순

export type ProductCategory =
  | 'all'
  | 'electronics'    // 전자기기
  | 'fashion'        // 패션/의류
  | 'beauty'         // 뷰티/화장품
  | 'home'           // 홈/리빙
  | 'sports'         // 스포츠/레저
  | 'food'           // 식품/건강
  | 'books'          // 도서/문구
  | 'toys'           // 완구/취미
  | 'other';         // 기타

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  all: '전체',
  electronics: '전자기기',
  fashion: '패션/의류',
  beauty: '뷰티/화장품',
  home: '홈/리빙',
  sports: '스포츠/레저',
  food: '식품/건강',
  books: '도서/문구',
  toys: '완구/취미',
  other: '기타',
};

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: '관련도순',
  'price-asc': '가격 낮은순',
  'price-desc': '가격 높은순',
  popularity: '인기순',
  newest: '최신순',
  discount: '할인율순',
  deadline: '마감임박순',
};

export interface PriceRange {
  min: number;
  max: number;
}

export interface SearchFilters {
  query?: string;
  categories?: ProductCategory[];
  priceRange?: PriceRange;
  brands?: string[];
  minDiscount?: number; // 최소 할인율 (%)
  inStock?: boolean;    // 재고 있는 상품만
  hasNegoDeal?: boolean; // 네고딜 진행중인 상품만
}

export interface SearchOptions {
  filters: SearchFilters;
  sort: SortOption;
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  image: string;
  category: ProductCategory;
  brand?: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  popularity: number; // 조회수, 좋아요 등 기반
  hasNegoDeal: boolean;
  createdAt: string;
}

export interface NegoDealSearchResult {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  originalPrice: number;
  discountRate: number;
  currentParticipants: number;
  targetParticipants: number;
  progress: number;
  deadline: string;
  category: ProductCategory;
  isActive: boolean;
  createdAt: string;
}

// Predefined price ranges
export const PRICE_RANGES: { label: string; range: PriceRange }[] = [
  { label: '전체', range: { min: 0, max: Infinity } },
  { label: '1만원 미만', range: { min: 0, max: 10000 } },
  { label: '1만원 - 5만원', range: { min: 10000, max: 50000 } },
  { label: '5만원 - 10만원', range: { min: 50000, max: 100000 } },
  { label: '10만원 - 30만원', range: { min: 100000, max: 300000 } },
  { label: '30만원 이상', range: { min: 300000, max: Infinity } },
];

// Discount options
export const DISCOUNT_OPTIONS = [
  { label: '전체', value: 0 },
  { label: '10% 이상', value: 10 },
  { label: '20% 이상', value: 20 },
  { label: '30% 이상', value: 30 },
  { label: '50% 이상', value: 50 },
];

// ===== 홈페이지 AI 대화 관련 타입 =====

export type SearchMode = 'price' | 'recommend';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SearchMessage {
  type: 'user-query' | 'ai-response' | 'rich-cards' | 'products';
  content?: string;
  timestamp: string;
  cards?: any[]; // ProductRecommendationCard type from rich-card.ts
  products?: ProductResult[];
}

export interface ProductResult {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  rating?: number;
  reviewCount?: number;
}

export interface ErrorState {
  message: string;
  suggestions: string[];
}

export interface ProductKeywordMapping {
  keywords: string[];
  searchTerm: string;
}
