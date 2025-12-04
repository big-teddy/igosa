/**
 * Negotiation Service
 * 협상 관련 비즈니스 로직
 */

import { createClient } from '@/lib/supabase/server';
import { getDemandAggregation } from '@/lib/services/demand-aggregation-service';
import type {
    Negotiation,
    NegotiationEvent,
    NegotiationStatus,
    SellerProfile,
    TriggerNegotiationRequest,
} from '@/types/negotiation';

// 협상 트리거 임계값
const NEGOTIATION_THRESHOLDS = {
    MIN_PARTICIPANTS: 50,      // 최소 참여자 수
    MIN_DEMAND_CONCENTRATION: 0.3, // 최소 수요 집중도 (30%)
    MAX_PRICE_VARIANCE: 0.2,   // 최대 가격 분산 (20%)
};

export class NegotiationService {
    /**
     * 협상 트리거 가능 여부 확인
     */
    static async canTriggerNegotiation(productId: string): Promise<{
        canTrigger: boolean;
        reason: string;
        metrics: {
            participants: number;
            concentration: number;
            variance: number;
        };
    }> {
        const demandData = await getDemandAggregation(productId);

        // 1. 최소 참여자 수 확인
        if (demandData.totalUsers < NEGOTIATION_THRESHOLDS.MIN_PARTICIPANTS) {
            return {
                canTrigger: false,
                reason: `참여자 수 부족 (${demandData.totalUsers}/${NEGOTIATION_THRESHOLDS.MIN_PARTICIPANTS})`,
                metrics: {
                    participants: demandData.totalUsers,
                    concentration: 0,
                    variance: 0,
                },
            };
        }

        // 2. 수요 집중도 확인 (피크 가격대에 얼마나 집중되어 있는지)
        const peakTier = demandData.priceTiers.find(
            t => t.price === demandData.peakDemandPrice
        );
        const concentration = peakTier
            ? peakTier.userCount / demandData.totalUsers
            : 0;

        if (concentration < NEGOTIATION_THRESHOLDS.MIN_DEMAND_CONCENTRATION) {
            return {
                canTrigger: false,
                reason: `수요 분산됨 (집중도 ${(concentration * 100).toFixed(1)}%)`,
                metrics: {
                    participants: demandData.totalUsers,
                    concentration,
                    variance: 0,
                },
            };
        }

        // 3. 가격 분산 확인
        const prices = demandData.priceTiers.map(t => t.price);
        const avgPrice = demandData.avgTargetPrice;
        const variance = Math.sqrt(
            prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
        ) / avgPrice;

        if (variance > NEGOTIATION_THRESHOLDS.MAX_PRICE_VARIANCE) {
            return {
                canTrigger: false,
                reason: `가격 분산 과다 (${(variance * 100).toFixed(1)}%)`,
                metrics: {
                    participants: demandData.totalUsers,
                    concentration,
                    variance,
                },
            };
        }

        return {
            canTrigger: true,
            reason: '협상 트리거 조건 충족',
            metrics: {
                participants: demandData.totalUsers,
                concentration,
                variance,
            },
        };
    }

    /**
     * 협상 생성
     */
    static async createNegotiation(
        productId: string,
        demandData: any
    ): Promise<Negotiation> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('negotiations')
            .insert({
                product_id: productId,
                status: 'triggered',
                total_participants: demandData.totalUsers,
                target_price: demandData.peakDemandPrice,
                avg_target_price: demandData.avgTargetPrice,
                peak_demand_price: demandData.peakDemandPrice,
                triggered_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48시간
            })
            .select()
            .single();

        if (error) throw error;

        return this.mapToNegotiation(data);
    }

    /**
     * 협상 이벤트 로그
     */
    static async logEvent(
        negotiationId: string,
        eventType: string,
        message: string,
        eventData: Record<string, any> = {},
        impact: 'positive' | 'neutral' | 'negative' = 'neutral'
    ): Promise<void> {
        const supabase = await createClient();

        await supabase.from('negotiation_events').insert({
            negotiation_id: negotiationId,
            event_type: eventType,
            message,
            event_data: eventData,
            impact,
        });
    }

    /**
     * 협상 상태 업데이트
     */
    static async updateNegotiationStatus(
        negotiationId: string,
        status: NegotiationStatus,
        updates: Partial<Negotiation> = {}
    ): Promise<void> {
        const supabase = await createClient();

        await supabase
            .from('negotiations')
            .update({
                status,
                ...this.mapToDatabase(updates),
            })
            .eq('id', negotiationId);
    }

    /**
     * 협상 조회
     */
    static async getNegotiation(negotiationId: string): Promise<Negotiation | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('negotiations')
            .select('*')
            .eq('id', negotiationId)
            .single();

        if (error || !data) return null;

        return this.mapToNegotiation(data);
    }

    /**
     * 협상 타임라인 조회
     */
    static async getNegotiationTimeline(
        negotiationId: string
    ): Promise<NegotiationEvent[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('negotiation_events')
            .select('*')
            .eq('negotiation_id', negotiationId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map(this.mapToNegotiationEvent);
    }

    /**
     * 제품의 활성 협상 조회
     */
    static async getActiveNegotiation(productId: string): Promise<Negotiation | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('negotiations')
            .select('*')
            .eq('product_id', productId)
            .in('status', ['triggered', 'in_progress'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;

        return this.mapToNegotiation(data);
    }

    /**
     * 판매자 프로필 조회
     */
    static async getSellerProfile(userId: string): Promise<SellerProfile | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        return this.mapToSellerProfile(data);
    }

    /**
     * 제품의 판매자 조회 (간단한 예시 - 실제로는 제품-판매자 매핑 필요)
     */
    static async getSellerForProduct(productId: string): Promise<SellerProfile | null> {
        // TODO: 실제 제품-판매자 매핑 로직 구현
        // 현재는 Mock으로 첫 번째 활성 판매자 반환
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('status', 'active')
            .limit(1)
            .single();

        if (error || !data) return null;

        return this.mapToSellerProfile(data);
    }

    /**
     * 협상 성공 처리
     */
    static async completeNegotiation(
        negotiationId: string,
        finalPrice: number,
        finalVolume: number
    ): Promise<void> {
        const supabase = await createClient();

        await supabase
            .from('negotiations')
            .update({
                status: 'completed',
                final_price: finalPrice,
                final_volume: finalVolume,
                completed_at: new Date().toISOString(),
            })
            .eq('id', negotiationId);

        await this.logEvent(
            negotiationId,
            'deal_closed',
            `협상 성공! 최종 가격 ₩${finalPrice.toLocaleString()}, ${finalVolume}개 확정`,
            { finalPrice, finalVolume },
            'positive'
        );
    }

    /**
     * 협상 실패 처리
     */
    static async failNegotiation(
        negotiationId: string,
        reason: string
    ): Promise<void> {
        const supabase = await createClient();

        await supabase
            .from('negotiations')
            .update({
                status: 'rejected',
                seller_reasoning: reason,
                completed_at: new Date().toISOString(),
            })
            .eq('id', negotiationId);

        await this.logEvent(
            negotiationId,
            'deal_rejected',
            `협상 실패: ${reason}`,
            { reason },
            'negative'
        );
    }

    // Helper methods

    private static mapToNegotiation(data: any): Negotiation {
        return {
            id: data.id,
            productId: data.product_id,
            status: data.status,
            totalParticipants: data.total_participants,
            targetPrice: parseFloat(data.target_price),
            avgTargetPrice: parseFloat(data.avg_target_price),
            peakDemandPrice: data.peak_demand_price ? parseFloat(data.peak_demand_price) : undefined,
            aiProposedPrice: data.ai_proposed_price ? parseFloat(data.ai_proposed_price) : undefined,
            aiProposedVolume: data.ai_proposed_volume,
            aiReasoning: data.ai_reasoning,
            aiConfidenceScore: data.ai_confidence_score ? parseFloat(data.ai_confidence_score) : undefined,
            sellerId: data.seller_id,
            sellerResponse: data.seller_response,
            sellerCounterPrice: data.seller_counter_price ? parseFloat(data.seller_counter_price) : undefined,
            sellerReasoning: data.seller_reasoning,
            sellerRespondedAt: data.seller_responded_at ? new Date(data.seller_responded_at) : undefined,
            finalPrice: data.final_price ? parseFloat(data.final_price) : undefined,
            finalVolume: data.final_volume,
            successRate: data.success_rate ? parseFloat(data.success_rate) : undefined,
            actualConversions: data.actual_conversions,
            triggeredAt: data.triggered_at ? new Date(data.triggered_at) : undefined,
            proposalSentAt: data.proposal_sent_at ? new Date(data.proposal_sent_at) : undefined,
            completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
            expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private static mapToNegotiationEvent(data: any): NegotiationEvent {
        return {
            id: data.id,
            negotiationId: data.negotiation_id,
            eventType: data.event_type,
            eventData: data.event_data,
            message: data.message,
            impact: data.impact,
            createdAt: new Date(data.created_at),
        };
    }

    private static mapToSellerProfile(data: any): SellerProfile {
        return {
            id: data.id,
            userId: data.user_id,
            companyName: data.company_name,
            businessNumber: data.business_number,
            contactEmail: data.contact_email,
            contactPhone: data.contact_phone,
            websiteUrl: data.website_url,
            autoNegotiate: data.auto_negotiate,
            minMarginPercent: parseFloat(data.min_margin_percent),
            minVolume: data.min_volume,
            maxDiscountPercent: parseFloat(data.max_discount_percent),
            autoAcceptConfig: data.auto_accept_config,
            totalNegotiations: data.total_negotiations,
            successfulNegotiations: data.successful_negotiations,
            totalRevenue: parseFloat(data.total_revenue),
            avgResponseTimeHours: data.avg_response_time_hours ? parseFloat(data.avg_response_time_hours) : undefined,
            status: data.status,
            verified: data.verified,
            verificationDate: data.verification_date ? new Date(data.verification_date) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private static mapToDatabase(negotiation: Partial<Negotiation>): any {
        const mapped: any = {};

        if (negotiation.status) mapped.status = negotiation.status;
        if (negotiation.aiProposedPrice) mapped.ai_proposed_price = negotiation.aiProposedPrice;
        if (negotiation.aiProposedVolume) mapped.ai_proposed_volume = negotiation.aiProposedVolume;
        if (negotiation.aiReasoning) mapped.ai_reasoning = negotiation.aiReasoning;
        if (negotiation.aiConfidenceScore) mapped.ai_confidence_score = negotiation.aiConfidenceScore;
        if (negotiation.sellerId) mapped.seller_id = negotiation.sellerId;
        if (negotiation.sellerResponse) mapped.seller_response = negotiation.sellerResponse;
        if (negotiation.sellerCounterPrice) mapped.seller_counter_price = negotiation.sellerCounterPrice;
        if (negotiation.sellerReasoning) mapped.seller_reasoning = negotiation.sellerReasoning;
        if (negotiation.finalPrice) mapped.final_price = negotiation.finalPrice;
        if (negotiation.finalVolume) mapped.final_volume = negotiation.finalVolume;
        if (negotiation.proposalSentAt) mapped.proposal_sent_at = negotiation.proposalSentAt.toISOString();
        if (negotiation.completedAt) mapped.completed_at = negotiation.completedAt.toISOString();

        return mapped;
    }
}
