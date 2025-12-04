/**
 * Negotiation Types
 * AI 협상 엔진 관련 타입 정의
 */

export interface Negotiation {
    id: string;
    productId: string;
    status: NegotiationStatus;

    // 수요 정보
    totalParticipants: number;
    targetPrice: number;
    avgTargetPrice: number;
    peakDemandPrice?: number;

    // AI 제안
    aiProposedPrice?: number;
    aiProposedVolume?: number;
    aiReasoning?: AIReasoning;
    aiConfidenceScore?: number;

    // 판매자 응답
    sellerId?: string;
    sellerResponse?: SellerResponse;
    sellerCounterPrice?: number;
    sellerReasoning?: string;
    sellerRespondedAt?: Date;

    // 최종 결과
    finalPrice?: number;
    finalVolume?: number;
    successRate?: number;
    actualConversions?: number;

    // 타임스탬프
    triggeredAt?: Date;
    proposalSentAt?: Date;
    completedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type NegotiationStatus =
    | 'pending'
    | 'triggered'
    | 'in_progress'
    | 'accepted'
    | 'rejected'
    | 'expired'
    | 'completed';

export type SellerResponse = 'accepted' | 'rejected' | 'counter';

export interface AIReasoning {
    demandAnalysis: string;
    priceOptimization: string;
    sellerConstraints: string;
    recommendation: string;
    confidenceFactors: string[];
}

export interface NegotiationEvent {
    id: string;
    negotiationId: string;
    eventType: NegotiationEventType;
    eventData: Record<string, any>;
    message: string;
    impact: 'positive' | 'neutral' | 'negative';
    createdAt: Date;
}

export type NegotiationEventType =
    | 'demand_milestone'
    | 'ai_analysis'
    | 'ai_proposal'
    | 'seller_response'
    | 'deal_accepted'
    | 'deal_rejected'
    | 'deal_expired'
    | 'user_notified'
    | 'counter_offer';

export interface SellerProfile {
    id: string;
    userId: string;

    // 기본 정보
    companyName: string;
    businessNumber?: string;
    contactEmail: string;
    contactPhone?: string;
    websiteUrl?: string;

    // 협상 설정
    autoNegotiate: boolean;
    minMarginPercent: number;
    minVolume: number;
    maxDiscountPercent: number;

    // AI 자동 수락 조건
    autoAcceptConfig: AutoAcceptConfig;

    // 통계
    totalNegotiations: number;
    successfulNegotiations: number;
    totalRevenue: number;
    avgResponseTimeHours?: number;

    // 상태
    status: SellerStatus;
    verified: boolean;
    verificationDate?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export type SellerStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export interface AutoAcceptConfig {
    enabled: boolean;
    minVolume: number;
    minMargin: number;
    minPrice: number;
}

export interface SocialInvitation {
    id: string;

    // 초대자/피초대자
    inviterId: string;
    inviteeEmail?: string;
    inviteeId?: string;

    // 연결된 네고딜
    negotiationId?: string;
    productId?: string;

    // 공유 채널
    shareChannel: ShareChannel;
    shareUrl?: string;

    // 상태
    status: InvitationStatus;

    // 인센티브
    inviterReward: number;
    inviteeReward: number;
    rewardClaimed: boolean;
    rewardClaimedAt?: Date;

    // 타임스탬프
    sentAt: Date;
    acceptedAt?: Date;
    expiresAt: Date;
    createdAt: Date;
}

export type ShareChannel = 'kakao' | 'link' | 'email' | 'sms';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

// API Request/Response Types

export interface TriggerNegotiationRequest {
    productId: string;
    forceTrigger?: boolean; // 임계값 무시하고 강제 트리거
}

export interface TriggerNegotiationResponse {
    success: boolean;
    data: {
        negotiationId: string;
        status: NegotiationStatus;
        participants: number;
        proposedPrice: number;
        estimatedSuccess: number;
    };
}

export interface SellerResponseRequest {
    response: SellerResponse;
    counterPrice?: number;
    reasoning?: string;
}

export interface SellerResponseResponse {
    success: boolean;
    data: {
        status: NegotiationStatus;
        finalPrice?: number;
        notificationsSent: number;
    };
}

export interface CreateInvitationRequest {
    emails?: string[];
    negotiationId?: string;
    productId?: string;
    shareChannel: ShareChannel;
    message?: string;
}

export interface CreateInvitationResponse {
    success: boolean;
    data: {
        invitationsSent: number;
        reward: number;
        shareUrl: string;
    };
}

export interface ShareUrlResponse {
    success: boolean;
    data: {
        shareUrl: string;
        kakaoShareData?: {
            title: string;
            description: string;
            imageUrl: string;
            buttonText: string;
        };
    };
}

// Negotiation Workflow State

export interface NegotiationWorkflowState {
    productId: string;
    demandData: {
        totalUsers: number;
        avgTargetPrice: number;
        peakDemandPrice: number;
        priceDistribution: Array<{ price: number; count: number }>;
    };
    sellerProfile?: SellerProfile;
    currentPrice: number;
    minPrice: number;

    // AI 계산 결과
    proposedPrice?: number;
    proposedVolume?: number;
    estimatedMargin?: number;
    estimatedRevenue?: number;

    // 워크플로우 상태
    status: 'analyzing' | 'calculating' | 'checking' | 'proposing' | 'waiting' | 'completed' | 'failed';
    reasoning: string[];
    errors: string[];

    // 결과
    negotiationId?: string;
    success: boolean;
}

// Helper Types

export interface DemandCurvePoint {
    price: number;
    quantity: number;
    revenue: number;
}

export interface OptimizationResult {
    optimalPrice: number;
    expectedVolume: number;
    expectedRevenue: number;
    margin: number;
    confidence: number;
}

export interface SellerConstraints {
    minPrice: number;
    minVolume: number;
    minMargin: number;
    maxDiscount: number;
}

export interface MarketData {
    competitorPrices: number[];
    avgMarketPrice: number;
    priceVolatility: number;
    seasonalityFactor: number;
}
