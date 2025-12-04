/**
 * AI Negotiation Engine
 * LangGraph 기반 협상 워크플로우
 */

import { StateGraph, END } from "@langchain/langgraph";
import { NegotiationService } from '../services/negotiation-service';
import { getDemandAggregation } from '../services/demand-aggregation-service';
import { EmailService } from '../services/email-service';
import type {
    NegotiationWorkflowState,
    SellerProfile,
    DemandCurvePoint,
    OptimizationResult,
} from '@/types/negotiation';
import { logger } from '@/lib/logger';

export class AINegotiationEngine {
    private workflow: any; // LangGraph compiled workflow

    constructor() {
        this.workflow = this.buildWorkflow();
    }

    /**
     * LangGraph 워크플로우 구축
     */
    private buildWorkflow() {
        const workflow = new StateGraph<NegotiationWorkflowState>({
            channels: {
                productId: null,
                demandData: null,
                sellerProfile: null,
                currentPrice: null,
                minPrice: null,
                proposedPrice: null,
                proposedVolume: null,
                estimatedMargin: null,
                estimatedRevenue: null,
                status: null,
                reasoning: null,
                errors: null,
                negotiationId: null,
                success: null,
            }
        });

        // 노드 정의
        workflow.addNode("analyze_demand", this.analyzeDemand.bind(this) as any);
        workflow.addNode("calculate_optimal_price", this.calculateOptimalPrice.bind(this) as any);
        workflow.addNode("check_seller_constraints", this.checkSellerConstraints.bind(this) as any);
        workflow.addNode("generate_proposal", this.generateProposal.bind(this) as any);
        workflow.addNode("send_to_seller", this.sendToSeller.bind(this) as any);

        // 엣지 정의
        (workflow.addEdge as any)("analyze_demand", "calculate_optimal_price");
        (workflow.addEdge as any)("calculate_optimal_price", "check_seller_constraints");

        // 조건부 엣지: 제약 조건 통과 여부
        (workflow.addConditionalEdges as any)(
            "check_seller_constraints",
            (state: NegotiationWorkflowState) => {
                return state.status === 'failed' ? 'end' : 'continue';
            },
            {
                continue: "generate_proposal",
                end: END,
            }
        );

        (workflow.addEdge as any)("generate_proposal", "send_to_seller");
        (workflow.addEdge as any)("send_to_seller", END);

        // 시작점 설정
        (workflow.setEntryPoint as any)("analyze_demand");

        return workflow.compile();
    }

    /**
     * 협상 실행
     */
    async execute(productId: string): Promise<{
        success: boolean;
        negotiationId?: string;
        proposedPrice?: number;
        proposedVolume?: number;
        reasoning: string[];
        errors: string[];
    }> {
        try {
            logger.info('Starting AI negotiation', { productId });

            // 초기 상태 설정
            const demandData = await getDemandAggregation(productId);
            const sellerProfile = await NegotiationService.getSellerForProduct(productId);

            if (!sellerProfile) {
                return {
                    success: false,
                    reasoning: [],
                    errors: ['판매자 프로필을 찾을 수 없습니다'],
                };
            }

            const initialState: NegotiationWorkflowState = {
                productId,
                demandData: {
                    totalUsers: demandData.totalUsers,
                    avgTargetPrice: demandData.avgTargetPrice,
                    peakDemandPrice: demandData.peakDemandPrice,
                    priceDistribution: demandData.priceTiers.map((t: any) => ({
                        price: t.price,
                        count: t.userCount,
                    })),
                },
                sellerProfile,
                currentPrice: demandData.avgTargetPrice * 1.2, // 가정: 현재가는 평균 희망가의 120%
                minPrice: Math.min(...demandData.priceTiers.map((t: any) => t.price)),
                status: 'analyzing',
                reasoning: [],
                errors: [],
                success: false,
            };

            // 워크플로우 실행
            const result = await this.workflow.invoke(initialState);

            logger.info('AI negotiation completed', {
                productId,
                success: result.success,
                negotiationId: result.negotiationId,
            });

            return {
                success: result.success,
                negotiationId: result.negotiationId,
                proposedPrice: result.proposedPrice,
                proposedVolume: result.proposedVolume,
                reasoning: result.reasoning,
                errors: result.errors,
            };

        } catch (error) {
            logger.error('AI negotiation failed', error as Error);
            return {
                success: false,
                reasoning: [],
                errors: [(error as Error).message],
            };
        }
    }

    /**
     * Step 1: 수요 분석
     */
    private async analyzeDemand(
        state: NegotiationWorkflowState
    ): Promise<Partial<NegotiationWorkflowState>> {
        logger.debug('Analyzing demand', { productId: state.productId });

        const { demandData } = state;
        const reasoning = [...state.reasoning];

        // 수요 분석
        reasoning.push(
            `📊 수요 분석: 총 ${demandData.totalUsers}명 참여`
        );
        reasoning.push(
            `💰 평균 희망가: ₩${demandData.avgTargetPrice.toLocaleString()}`
        );
        reasoning.push(
            `🎯 피크 수요 가격: ₩${demandData.peakDemandPrice.toLocaleString()}`
        );

        // 수요 집중도 계산
        const peakTier = demandData.priceDistribution.find(
            p => p.price === demandData.peakDemandPrice
        );
        const concentration = peakTier
            ? (peakTier.count / demandData.totalUsers) * 100
            : 0;

        reasoning.push(
            `📈 수요 집중도: ${concentration.toFixed(1)}% (피크 가격대)`
        );

        return {
            status: 'calculating',
            reasoning,
        };
    }

    /**
     * Step 2: 최적 가격 계산
     */
    private async calculateOptimalPrice(
        state: NegotiationWorkflowState
    ): Promise<Partial<NegotiationWorkflowState>> {
        logger.debug('Calculating optimal price', { productId: state.productId });

        const { demandData, sellerProfile, currentPrice } = state;
        const reasoning = [...state.reasoning];

        // 1. 수요 곡선 구축
        const demandCurve = this.buildDemandCurve(demandData.priceDistribution);

        // 2. 판매자 최소 가격 계산
        const minAcceptablePrice = this.calculateMinAcceptablePrice(
            demandData.avgTargetPrice,
            sellerProfile!
        );

        reasoning.push(
            `🏪 판매자 최소 가격: ₩${minAcceptablePrice.toLocaleString()} (마진 ${sellerProfile!.minMarginPercent}%)`
        );

        // 3. 수익 최적화
        const optimization = this.optimizeRevenue(
            demandCurve,
            minAcceptablePrice,
            currentPrice
        );

        reasoning.push(
            `🤖 AI 최적 가격: ₩${optimization.optimalPrice.toLocaleString()}`
        );
        reasoning.push(
            `📦 예상 판매량: ${optimization.expectedVolume}개`
        );
        reasoning.push(
            `💵 예상 수익: ₩${optimization.expectedRevenue.toLocaleString()}`
        );
        reasoning.push(
            `📊 예상 마진: ${optimization.margin.toFixed(1)}%`
        );
        reasoning.push(
            `🎲 신뢰도: ${(optimization.confidence * 100).toFixed(0)}%`
        );

        return {
            status: 'checking',
            proposedPrice: optimization.optimalPrice,
            proposedVolume: optimization.expectedVolume,
            estimatedMargin: optimization.margin,
            estimatedRevenue: optimization.expectedRevenue,
            reasoning,
        };
    }

    /**
     * Step 3: 판매자 제약 조건 확인
     */
    private async checkSellerConstraints(
        state: NegotiationWorkflowState
    ): Promise<Partial<NegotiationWorkflowState>> {
        logger.debug('Checking seller constraints', { productId: state.productId });

        const { sellerProfile, proposedPrice, proposedVolume, estimatedMargin } = state;
        const reasoning = [...state.reasoning];
        const errors = [...state.errors];

        // 1. 최소 수량 확인
        if (proposedVolume! < sellerProfile!.minVolume) {
            errors.push(
                `최소 수량 미달: ${proposedVolume} < ${sellerProfile!.minVolume}`
            );
            reasoning.push(
                `❌ 최소 수량 미달 (${proposedVolume}개 < ${sellerProfile!.minVolume}개)`
            );

            return {
                status: 'failed',
                reasoning,
                errors,
                success: false,
            };
        }

        // 2. 최소 마진 확인
        if (estimatedMargin! < sellerProfile!.minMarginPercent) {
            errors.push(
                `최소 마진 미달: ${estimatedMargin}% < ${sellerProfile!.minMarginPercent}%`
            );
            reasoning.push(
                `❌ 최소 마진 미달 (${estimatedMargin!.toFixed(1)}% < ${sellerProfile!.minMarginPercent}%)`
            );

            return {
                status: 'failed',
                reasoning,
                errors,
                success: false,
            };
        }

        // 3. 최대 할인율 확인
        const discountPercent = ((state.currentPrice - proposedPrice!) / state.currentPrice) * 100;
        if (discountPercent > sellerProfile!.maxDiscountPercent) {
            errors.push(
                `최대 할인율 초과: ${discountPercent}% > ${sellerProfile!.maxDiscountPercent}%`
            );
            reasoning.push(
                `❌ 최대 할인율 초과 (${discountPercent.toFixed(1)}% > ${sellerProfile!.maxDiscountPercent}%)`
            );

            return {
                status: 'failed',
                reasoning,
                errors,
                success: false,
            };
        }

        reasoning.push(
            `✅ 판매자 제약 조건 모두 충족`
        );
        reasoning.push(
            `   - 수량: ${proposedVolume}개 ≥ ${sellerProfile!.minVolume}개`
        );
        reasoning.push(
            `   - 마진: ${estimatedMargin!.toFixed(1)}% ≥ ${sellerProfile!.minMarginPercent}%`
        );
        reasoning.push(
            `   - 할인: ${discountPercent.toFixed(1)}% ≤ ${sellerProfile!.maxDiscountPercent}%`
        );

        return {
            status: 'proposing',
            reasoning,
        };
    }

    /**
     * Step 4: 제안서 생성
     */
    private async generateProposal(
        state: NegotiationWorkflowState
    ): Promise<Partial<NegotiationWorkflowState>> {
        logger.debug('Generating proposal', { productId: state.productId });

        const reasoning = [...state.reasoning];

        // 협상 세션 생성
        const negotiation = await NegotiationService.createNegotiation(
            state.productId,
            state.demandData
        );

        // AI 제안 정보 업데이트
        await NegotiationService.updateNegotiationStatus(
            negotiation.id,
            'in_progress',
            {
                aiProposedPrice: state.proposedPrice,
                aiProposedVolume: state.proposedVolume,
                aiReasoning: {
                    demandAnalysis: reasoning.slice(0, 4).join('\n'),
                    priceOptimization: reasoning.slice(4, 9).join('\n'),
                    sellerConstraints: reasoning.slice(9).join('\n'),
                    recommendation: `₩${state.proposedPrice!.toLocaleString()}에 ${state.proposedVolume}개 제안`,
                    confidenceFactors: [
                        `수요 집중도 높음`,
                        `판매자 마진 충족`,
                        `예상 수익 최적화`,
                    ],
                },
                aiConfidenceScore: 0.85,
                sellerId: state.sellerProfile!.userId,
            }
        );

        // 이벤트 로그
        await NegotiationService.logEvent(
            negotiation.id,
            'ai_proposal',
            `AI가 ₩${state.proposedPrice!.toLocaleString()}에 ${state.proposedVolume}개 제안`,
            {
                proposedPrice: state.proposedPrice,
                proposedVolume: state.proposedVolume,
                estimatedMargin: state.estimatedMargin,
                estimatedRevenue: state.estimatedRevenue,
            },
            'neutral'
        );

        reasoning.push(
            `📝 제안서 생성 완료 (협상 ID: ${negotiation.id})`
        );

        return {
            negotiationId: negotiation.id,
            reasoning,
        };
    }

    /**
   * Step 5: 판매자에게 전송
   */
    private async sendToSeller(
        state: NegotiationWorkflowState
    ): Promise<Partial<NegotiationWorkflowState>> {
        logger.debug('Sending to seller', {
            productId: state.productId,
            negotiationId: state.negotiationId,
        });

        const reasoning = [...state.reasoning];
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48시간 후

        // 실제 이메일 전송
        const emailSent = await EmailService.sendNegotiationProposal(
            state.sellerProfile!.contactEmail,
            {
                negotiationId: state.negotiationId!,
                productName: `Product ${state.productId}`, // TODO: 실제 제품명
                proposedPrice: state.proposedPrice!,
                proposedVolume: state.proposedVolume!,
                currentPrice: state.currentPrice,
                estimatedRevenue: state.estimatedRevenue!,
                estimatedMargin: state.estimatedMargin!,
                expiresAt,
                reasoning: state.reasoning,
            }
        );

        if (emailSent) {
            logger.info('Proposal email sent successfully', {
                sellerId: state.sellerProfile!.userId,
                sellerEmail: state.sellerProfile!.contactEmail,
                negotiationId: state.negotiationId,
            });
        } else {
            logger.warn('Failed to send proposal email', {
                sellerId: state.sellerProfile!.userId,
                sellerEmail: state.sellerProfile!.contactEmail,
            });
        }

        // 제안 전송 시간 기록
        await NegotiationService.updateNegotiationStatus(
            state.negotiationId!,
            'in_progress',
            {
                proposalSentAt: new Date(),
            }
        );

        // 이벤트 로그
        await NegotiationService.logEvent(
            state.negotiationId!,
            'seller_response',
            `판매자에게 제안 전송 (${state.sellerProfile!.contactEmail})`,
            {
                sellerEmail: state.sellerProfile!.contactEmail,
                emailSent,
                expiresAt: expiresAt.toISOString(),
            },
            emailSent ? 'positive' : 'neutral'
        );

        reasoning.push(
            `📧 판매자에게 제안 이메일 전송 ${emailSent ? '성공' : '실패'}`
        );
        reasoning.push(
            `⏰ ${expiresAt.toLocaleString('ko-KR')}까지 응답 대기`
        );

        return {
            status: 'waiting',
            reasoning,
            success: true,
        };
    }

    // ===== Helper Methods =====

    /**
     * 수요 곡선 구축
     */
    private buildDemandCurve(
        priceDistribution: Array<{ price: number; count: number }>
    ): DemandCurvePoint[] {
        return priceDistribution
            .sort((a, b) => a.price - b.price)
            .map(point => ({
                price: point.price,
                quantity: point.count,
                revenue: point.price * point.count,
            }));
    }

    /**
     * 판매자 최소 수용 가격 계산
     */
    private calculateMinAcceptablePrice(
        avgTargetPrice: number,
        sellerProfile: SellerProfile
    ): number {
        // 간단한 계산: 평균 희망가 + 최소 마진
        const minPrice = avgTargetPrice * (1 + sellerProfile.minMarginPercent / 100);
        return Math.round(minPrice / 1000) * 1000; // 1000원 단위로 반올림
    }

    /**
     * 수익 최적화
     */
    private optimizeRevenue(
        demandCurve: DemandCurvePoint[],
        minPrice: number,
        currentPrice: number
    ): OptimizationResult {
        let maxRevenue = 0;
        let optimalPoint: DemandCurvePoint | null = null;

        // 최소 가격 이상인 포인트들만 고려
        const validPoints = demandCurve.filter(p => p.price >= minPrice);

        for (const point of validPoints) {
            // 해당 가격 이상을 원하는 모든 사용자의 누적 수량
            const cumulativeQuantity = demandCurve
                .filter(p => p.price >= point.price)
                .reduce((sum, p) => sum + p.quantity, 0);

            const revenue = point.price * cumulativeQuantity;

            if (revenue > maxRevenue) {
                maxRevenue = revenue;
                optimalPoint = {
                    price: point.price,
                    quantity: cumulativeQuantity,
                    revenue,
                };
            }
        }

        if (!optimalPoint) {
            // 폴백: 최소 가격 사용
            optimalPoint = {
                price: minPrice,
                quantity: demandCurve[0]?.quantity || 0,
                revenue: minPrice * (demandCurve[0]?.quantity || 0),
            };
        }

        // 마진 계산 (간단한 예시: 원가 = 가격의 70%)
        const cost = optimalPoint.price * 0.7;
        const margin = ((optimalPoint.price - cost) / optimalPoint.price) * 100;

        // 신뢰도 계산
        const discount = ((currentPrice - optimalPoint.price) / currentPrice) * 100;
        const confidence = this.calculateConfidence(
            optimalPoint.quantity,
            discount,
            margin
        );

        return {
            optimalPrice: optimalPoint.price,
            expectedVolume: optimalPoint.quantity,
            expectedRevenue: optimalPoint.revenue,
            margin,
            confidence,
        };
    }

    /**
     * 신뢰도 계산
     */
    private calculateConfidence(
        volume: number,
        discountPercent: number,
        margin: number
    ): number {
        // 수량이 많을수록 신뢰도 증가 (최대 0.4)
        const volumeScore = Math.min(volume / 200, 1) * 0.4;

        // 할인율이 적절할수록 신뢰도 증가 (10-20% 할인이 최적)
        const discountScore = discountPercent >= 10 && discountPercent <= 20
            ? 0.3
            : Math.max(0, 0.3 - Math.abs(discountPercent - 15) * 0.02);

        // 마진이 충분할수록 신뢰도 증가 (최대 0.3)
        const marginScore = Math.min(margin / 30, 1) * 0.3;

        return Math.min(volumeScore + discountScore + marginScore, 0.99);
    }
}

// Singleton instance
let engineInstance: AINegotiationEngine | null = null;

export function getAINegotiationEngine(): AINegotiationEngine {
    if (!engineInstance) {
        engineInstance = new AINegotiationEngine();
    }
    return engineInstance;
}
