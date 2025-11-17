/**
 * AI 응답과 제품 데이터를 Rich Card로 변환하는 유틸리티
 * Updated: 2025-11-12 - 모든 타입 오류 수정 완료
 */

import { ProductRecommendationCard, TrustScore, ReasoningStep, ProductInfo, InfluencerSummary } from '@/types/rich-card';
import { Product } from '@/lib/data/mock-products';
import { UserProfile, SocialReview } from '@/lib/data/mock-social';
import { InfluencerReview } from '@/lib/data/mock-influencer';

/**
 * 신뢰 점수 계산
 * 친구 > 인플루언서 > 일반 리뷰 순으로 가중치 부여
 */
export function calculateTrustScore(
  friendReviews: SocialReview[],
  influencerReviews: InfluencerReview[],
  averageRating: number,
  totalReviews: number
): TrustScore {
  // 가중치 설정
  const friendWeight = friendReviews.length > 0 ? 0.5 : 0;
  const influencerWeight = influencerReviews.length > 0 ? 0.3 : 0;
  const generalWeight = 1 - friendWeight - influencerWeight;

  // 친구 점수 (평균 평점 기반, 0-100)
  const friendScore =
    friendReviews.length > 0
      ? (friendReviews.reduce((sum, r) => sum + r.rating, 0) / friendReviews.length) * 20
      : 0;

  // 인플루언서 점수 (추천률 기반, 0-100)
  const influencerScore =
    influencerReviews.length > 0
      ? influencerReviews.reduce((sum, r) => sum + (r.rating || 4) * 20, 0) / influencerReviews.length
      : 0;

  // 일반 점수 (평균 평점 기반, 0-100)
  const generalScore = averageRating * 20;

  // 전체 점수 계산
  const overall = Math.round(
    friendScore * friendWeight + influencerScore * influencerWeight + generalScore * generalWeight
  );

  return {
    overall,
    friendScore: Math.round(friendScore),
    influencerScore: Math.round(influencerScore),
    generalScore: Math.round(generalScore),
    breakdown: {
      friendWeight,
      influencerWeight,
      generalWeight,
    },
  };
}

/**
 * 추천 근거 체인 생성
 */
export function buildReasoningChain(
  friendReviews: SocialReview[],
  friendPurchases: UserProfile[],
  influencerReviews: InfluencerReview[],
  influencerSummary: InfluencerSummary | null,
  averageRating: number,
  mode: 'price' | 'recommend'
): ReasoningStep[] {
  const steps: ReasoningStep[] = [];
  let order = 1;

  // 모드별 첫 번째 근거
  if (mode === 'price') {
    steps.push({
      order: order++,
      type: 'general',
      title: '최저가 확인',
      description: '여러 쇼핑몰의 가격을 비교하여 가장 저렴한 구매처를 찾았습니다.',
      icon: '💰',
      weight: 0.3,
    });
  }

  // 친구 구매/리뷰 근거 (최우선)
  if (friendPurchases.length > 0 || friendReviews.length > 0) {
    const friendCount = friendPurchases.length;
    const hasReviews = friendReviews.length > 0;
    const avgFriendRating = hasReviews
      ? friendReviews.reduce((sum, r) => sum + r.rating, 0) / friendReviews.length
      : 0;

    steps.push({
      order: order++,
      type: 'friend',
      title: `친구 ${friendCount}명이 구매`,
      description: hasReviews
        ? `실제 지인들이 구매하고 평균 ${avgFriendRating.toFixed(1)}점으로 평가했습니다. 가장 신뢰할 수 있는 정보입니다.`
        : `실제 지인 ${friendCount}명이 이미 구매한 제품입니다. 가장 신뢰할 수 있는 선택입니다.`,
      icon: '👥',
      weight: 0.5,
    });
  }

  // 인플루언서 리뷰 근거
  if (influencerReviews.length > 0 && influencerSummary) {
    const topInfluencer = influencerReviews[0];
    steps.push({
      order: order++,
      type: 'influencer',
      title: `전문가 ${influencerSummary.recommendPercent}% 추천`,
      description: `${influencerReviews.length}명의 인플루언서가 리뷰했으며, ${topInfluencer.influencerName} 등 전문가들이 추천합니다.`,
      icon: '⭐',
      weight: 0.3,
    });
  }

  // 일반 평점 근거
  if (averageRating >= 4.0) {
    steps.push({
      order: order++,
      type: 'general',
      title: `높은 평점 ${averageRating.toFixed(1)}/5.0`,
      description: '많은 사용자들이 만족하는 제품입니다. 검증된 품질을 보장합니다.',
      icon: '⭐',
      weight: 0.2,
    });
  }

  // 인플루언서 장점이 있는 경우
  if (influencerSummary && influencerSummary.topPros.length > 0) {
    const topPro = influencerSummary.topPros[0];
    steps.push({
      order: order++,
      type: 'influencer',
      title: '핵심 장점',
      description: `전문가들이 평가한 주요 장점: ${topPro}`,
      icon: '✅',
      weight: 0.15,
    });
  }

  return steps;
}

/**
 * Product를 ProductInfo로 변환
 */
export function productToProductInfo(product: Product): ProductInfo {
  const lowestPrice = product.prices.reduce((min, curr) => (curr.total < min.total ? curr : min), product.prices[0]);

  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    image: product.imageUrl,
    description: product.description,
    category: product.category,
    basePrice: product.price,
    lowestPrice: {
      platform: lowestPrice.platform,
      price: lowestPrice.price,
      shipping: lowestPrice.shipping,
      total: lowestPrice.total,
      url: lowestPrice.url,
      inStock: lowestPrice.inStock,
    },
    allPrices: product.prices.map((p) => ({
      platform: p.platform,
      price: p.price,
      shipping: p.shipping,
      total: p.total,
      url: p.url,
      inStock: p.inStock,
    })),
  };
}

/**
 * 제품 데이터와 리뷰를 Rich Card로 변환
 */
export function buildProductRecommendationCard(
  product: Product,
  friendPurchases: UserProfile[],
  friendReviews: SocialReview[],
  influencerReviews: InfluencerReview[],
  influencerSummary: InfluencerSummary | null,
  mode: 'price' | 'recommend',
  aiRecommendationText?: string
): ProductRecommendationCard {
  // 제품 정보 변환
  const productInfo = productToProductInfo(product);

  // 신뢰 점수 계산
  const trustScore = calculateTrustScore(friendReviews, influencerReviews, product.rating, product.reviewCount);

  // 추천 근거 체인 생성
  const reasoningChain = buildReasoningChain(
    friendReviews,
    friendPurchases,
    influencerReviews,
    influencerSummary,
    product.rating,
    mode
  );

  // 일반 리뷰 요약
  const generalReviewSummary = {
    averageRating: product.rating,
    totalReviews: product.reviewCount,
    ratingDistribution: {
      5: Math.round(product.reviewCount * 0.6),
      4: Math.round(product.reviewCount * 0.25),
      3: Math.round(product.reviewCount * 0.1),
      2: Math.round(product.reviewCount * 0.03),
      1: Math.round(product.reviewCount * 0.02),
    },
    topKeywords: ['만족', '추천', '좋음'], // 실제로는 리뷰 분석 필요
  };

  // AI 추천 텍스트 생성 (없으면 기본값)
  const recommendationText =
    aiRecommendationText ||
    (mode === 'price'
      ? `${product.name}의 최저가는 ${productInfo.lowestPrice.platform}에서 ₩${productInfo.lowestPrice.total.toLocaleString()}입니다.`
      : `${product.name}는 ${
          friendReviews.length > 0
            ? `친구 ${friendReviews.length}명이 추천하고`
            : influencerReviews.length > 0
            ? `전문가 ${influencerReviews.length}명이 추천하는`
            : '높은 평점을 받은'
        } 제품입니다.`);

  return {
    id: `card-${product.id}-${Date.now()}`,
    product: productInfo,
    trustScore,
    friendReviews: friendReviews.map((r) => ({
      userId: r.userId,
      userName: r.userName,
      userAvatar: r.userAvatar,
      rating: r.rating,
      content: r.content,
      purchaseDate: r.timestamp,
    })),
    influencerReviews: influencerReviews.map((r) => ({
      influencerId: r.influencerId,
      influencerName: r.influencerName,
      influencerAvatar: r.influencerAvatar,
      platform: r.platform as 'youtube' | 'instagram' | 'blog' | 'tiktok',
      followers: r.influencerFollowers,
      isVerified: false, // mock data doesn't have this field
      rating: r.rating,
      summary: r.summary,
      videoUrl: r.contentUrl,
      thumbnailUrl: r.thumbnail,
    })),
    influencerSummary: influencerSummary
      ? {
          totalReviews: influencerSummary.totalReviews,
          recommendPercent: influencerSummary.recommendPercent,
          topPros: influencerSummary.topPros,
          topCons: influencerSummary.topCons,
        }
      : undefined,
    generalReviewSummary,
    reasoningChain,
    recommendationText,
    mode,
  };
}

/**
 * 여러 제품을 Rich Card 배열로 변환
 */
export function buildProductCards(
  products: Product[],
  userId: string,
  mode: 'price' | 'recommend',
  getFriendPurchases: (userId: string, productId: string) => UserProfile[],
  getSocialReviews: (productId: string) => SocialReview[],
  getInfluencerReviews: (productId: string) => InfluencerReview[],
  getInfluencerSummary: (productId: string) => InfluencerSummary | null
): ProductRecommendationCard[] {
  return products.map((product) => {
    const friendPurchases = getFriendPurchases(userId, product.id);
    const friendReviews = getSocialReviews(product.id);
    const influencerReviews = getInfluencerReviews(product.id);
    const influencerSummary = getInfluencerSummary(product.id);

    return buildProductRecommendationCard(
      product,
      friendPurchases,
      friendReviews,
      influencerReviews,
      influencerSummary,
      mode
    );
  });
}
