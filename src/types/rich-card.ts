/**
 * Rich Card 시스템 타입 정의
 * 다층 신뢰 소스 기반 추천을 위한 구조화된 데이터 타입
 */

// 신뢰 레벨 정의
export type TrustLevel = 'friend' | 'influencer' | 'general';

// 친구 구매/리뷰 정보
export interface FriendReview {
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  purchaseDate?: string;
  relationship?: 'friend' | 'family' | 'colleague';
}

// 인플루언서 리뷰 정보
export interface InfluencerReview {
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  platform: 'youtube' | 'instagram' | 'blog' | 'tiktok';
  followers: number;
  isVerified: boolean;
  rating?: number;
  summary: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

// 인플루언서 리뷰 요약 통계
export interface InfluencerSummary {
  totalReviews: number;
  recommendPercent: number;
  topPros: string[];
  topCons: string[];
}

// 일반 리뷰 요약
export interface GeneralReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  topKeywords: string[];
}

// 제품 가격 정보
export interface ProductPrice {
  platform: string;
  price: number;
  shipping: number;
  total: number;
  url: string;
  inStock: boolean;
}

// 제품 정보
export interface ProductInfo {
  id: string;
  name: string;
  brand: string;
  image: string;
  description: string;
  category: string;
  basePrice: number;
  lowestPrice: ProductPrice;
  allPrices: ProductPrice[];
}

// 신뢰 점수
export interface TrustScore {
  overall: number; // 0-100
  friendScore: number; // 친구 기반 점수
  influencerScore: number; // 인플루언서 기반 점수
  generalScore: number; // 일반 리뷰 기반 점수
  breakdown: {
    friendWeight: number; // 가중치
    influencerWeight: number;
    generalWeight: number;
  };
}

// 추천 근거 단계
export interface ReasoningStep {
  order: number;
  type: TrustLevel;
  title: string;
  description: string;
  icon: string;
  weight: number; // 이 근거의 중요도 (0-1)
}

// Rich Card 전체 데이터 구조
export interface ProductRecommendationCard {
  id: string;
  product: ProductInfo;
  trustScore: TrustScore;
  friendReviews: FriendReview[];
  influencerReviews: InfluencerReview[];
  influencerSummary?: InfluencerSummary;
  generalReviewSummary: GeneralReviewSummary;
  reasoningChain: ReasoningStep[];
  recommendationText: string; // AI의 자연어 추천 텍스트
  mode: 'price' | 'recommend';
}

// AI 응답 메시지 타입 확장
export interface EnrichedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  richCards?: ProductRecommendationCard[]; // 구조화된 카드 데이터
  timestamp: Date;
}
