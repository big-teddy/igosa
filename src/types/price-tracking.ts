/**
 * Price Tracking 2.0 Types
 *
 * 네고딜 2.0의 핵심 기능: 사용자 희망 가격 추적
 */

/**
 * 가격 추적 상태
 */
export type PriceTrackingStatus =
  | 'active'      // 활성 (가격 모니터링 중)
  | 'triggered'   // 목표 가격 도달
  | 'paused'      // 일시 중지
  | 'expired'     // 만료됨
  | 'cancelled';  // 사용자 취소

/**
 * 알림 채널
 */
export type NotificationChannel =
  | 'push'        // Push 알림
  | 'email'       // 이메일
  | 'kakao'       // 카카오톡
  | 'sms';        // SMS

/**
 * 가격 추적 레코드
 */
export interface PriceTracking {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage?: string;

  // 가격 정보
  targetPrice: number;                    // 희망 가격
  currentPrice: number;                   // 현재 가격
  maxAcceptableDelta: number;             // 허용 오차 (예: ±3000원)

  // 알림 설정
  notificationChannels: NotificationChannel[];
  notifyOnThreshold: boolean;             // 가격 도달 시 알림
  notifyOnNegotiation: boolean;           // 협상 성사 시 알림

  // 자동 구매 (Phase 3)
  autoPurchase: boolean;
  autoPurchaseMaxPrice?: number;

  // 메타데이터
  status: PriceTrackingStatus;
  createdAt: Date;
  expiresAt?: Date;
  lastCheckedAt?: Date;
  triggeredAt?: Date;

  // 통계 (선택)
  estimatedProbability?: number;          // 30일 내 달성 확률 (0-1)
  similarUsersCount?: number;             // 동일 가격 설정 사용자 수
}

/**
 * 가격 추적 생성 요청
 */
export interface CreatePriceTrackingRequest {
  productId: string;
  targetPrice: number;
  maxAcceptableDelta?: number;
  notificationChannels?: NotificationChannel[];
  autoPurchase?: boolean;
  expiresAt?: string;  // ISO 8601 format
}

/**
 * 가격 추적 생성 응답
 */
export interface CreatePriceTrackingResponse {
  trackingId: string;
  status: PriceTrackingStatus;
  currentPrice: number;
  targetPrice: number;
  estimatedProbability?: number;
  similarUsersCount?: number;
  createdAt: string;
}

/**
 * 가격 이력 데이터 포인트
 */
export interface PriceHistoryPoint {
  date: string;  // ISO 8601 date
  platform: 'coupang' | 'naver' | '11st' | 'gmarket';
  price: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  shippingMethod?: string;
}

/**
 * 가격 이력 조회 응답
 */
export interface PriceHistoryResponse {
  productId: string;
  productName: string;
  period: '7d' | '30d' | '90d' | '1y';
  dataPoints: PriceHistoryPoint[];
  statistics: {
    currentPrice: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    volatility: number;  // 가격 변동성 (0-1)
  };
  predictions?: {
    next7dLow: number;
    confidence: number;
  };
}

/**
 * 수요 집계 데이터 (실시간)
 */
export interface DemandAggregation {
  productId: string;
  productName: string;
  timestamp: Date;

  // 가격대별 수요
  priceTiers: Array<{
    price: number;
    userCount: number;
    percentage: number;  // 전체 대비 %
  }>;

  // 통계
  totalUsers: number;
  peakDemandPrice: number;       // 가장 수요 많은 가격
  avgTargetPrice: number;         // 평균 희망 가격
  medianTargetPrice: number;      // 중앙값
  priceRange: {
    min: number;
    max: number;
  };
}

/**
 * 판매자 인사이트 (간소화 버전)
 */
export interface SellerInsight {
  productId: string;
  productName: string;
  currentPrice: number;

  // 수요 정보
  demand: DemandAggregation;

  // 경쟁사 분석
  competitorPrices: Array<{
    platform: string;
    price: number;
    salesVelocity?: number;  // 일 판매량
  }>;

  // AI 추천 (Phase 2+)
  aiRecommendation?: {
    optimalPrice: number;
    expectedConversion: number;  // 예상 전환율
    projectedRevenue: number;
    reasoning: string;
  };
}

/**
 * 가격 알림 이벤트
 */
export interface PriceAlertEvent {
  trackingId: string;
  userId: string;
  productId: string;
  productName: string;

  // 가격 정보
  targetPrice: number;
  currentPrice: number;
  priceDropAmount: number;
  priceDropPercentage: number;

  // 메타
  triggeredAt: Date;
  expiresAt: Date;  // 알림 유효기간 (예: 24시간)

  // CTA
  purchaseUrl?: string;
  deepLink?: string;
}
