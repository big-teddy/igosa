/**
 * 네고딜 통합 위젯 (Unified NegoDeal Widget)
 *
 * 네고딜 1.0 (수동 그룹 구매) + 2.0 (AI 가격 협상) 통합
 *
 * 핵심 컨셉:
 * - AI가 자동으로 같은 제품 원하는 사용자들을 그룹핑
 * - 실시간 참여자 수, 진행률, 성공 확률 표시
 * - 단일 CTA: "네고딜 참여하기"
 * - 사용자는 클릭만, AI가 나머지 처리
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Check,
  TrendingDown,
  Users,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import type { CreatePriceTrackingRequest, CreatePriceTrackingResponse, DemandAggregation } from '@/types/price-tracking';
import {
  trackNegoDealWidgetViewed,
  trackNegoDealParticipateClicked,
  trackNegoDealParticipateCompleted,
  trackNegoDealCustomPriceSet,
  trackNegoDealError,
} from '@/lib/analytics/negodeal-events';

interface NegoDealWidgetProps {
  productId: string;
  productName: string;
  currentPrice: number;
  minPrice: number;  // 최근 30일 최저가
  avgPrice: number;  // 평균 가격
}

export function NegoDealWidget({
  productId,
  productName,
  currentPrice,
  minPrice,
  avgPrice,
}: NegoDealWidgetProps) {
  // State
  const [targetPrice, setTargetPrice] = useState(minPrice);
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participationId, setParticipationId] = useState<string | null>(null);
  const [demandData, setDemandData] = useState<DemandAggregation | null>(null);
  const [showCustomPrice, setShowCustomPrice] = useState(false);

  // 가격 범위: 현재가의 -30% ~ -5%
  const priceMin = Math.floor(currentPrice * 0.7);
  const priceMax = Math.floor(currentPrice * 0.95);

  // AI 추천 가격 계산 (수요가 가장 많은 가격대)
  const getRecommendedPrice = (): number => {
    if (demandData && demandData.peakDemandPrice > 0) {
      return demandData.peakDemandPrice;
    }
    // 기본값: 최저가와 평균가의 중간
    return Math.floor((minPrice + avgPrice) / 2);
  };

  const recommendedPrice = getRecommendedPrice();

  // 절감액 계산
  const savings = currentPrice - targetPrice;
  const savingsPercent = ((savings / currentPrice) * 100).toFixed(1);

  // 진행률 계산 (목표 2000명 기준)
  const TARGET_PARTICIPANTS = 2000;
  const progressPercent = demandData
    ? Math.min((demandData.totalUsers / TARGET_PARTICIPANTS) * 100, 100)
    : 0;

  // 성공 확률 계산
  const calculateSuccessProbability = (target: number, participants: number): number => {
    // 참여자가 많을수록 확률 증가
    const participantBonus = Math.min(participants / TARGET_PARTICIPANTS, 1) * 0.3;

    // 가격이 합리적일수록 확률 증가
    let priceScore = 0;
    if (target >= avgPrice) priceScore = 0.7;
    else if (target >= minPrice) priceScore = 0.5;
    else priceScore = 0.3;

    return Math.min((priceScore + participantBonus) * 100, 95);
  };

  const successProbability = demandData
    ? calculateSuccessProbability(targetPrice, demandData.totalUsers)
    : 50;

  // 마감 시간 계산 (24시간 후)
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 24);
  const hoursRemaining = Math.floor((deadline.getTime() - Date.now()) / (1000 * 60 * 60));

  // Load demand data & Track widget view
  useEffect(() => {
    loadDemandData();

    // Analytics: 위젯 노출 추적
    trackNegoDealWidgetViewed({
      product_id: productId,
      variant: 'unified',
      ai_recommended_price: recommendedPrice,
      participant_count: demandData?.totalUsers || 0,
      current_price: currentPrice,
      min_price: minPrice,
    });

    // 10초마다 실시간 업데이트
    const interval = setInterval(loadDemandData, 10000);
    return () => clearInterval(interval);
  }, [productId]);

  const loadDemandData = async () => {
    try {
      const response = await fetch(`/api/demand/${productId}`);
      if (response.ok) {
        const data: DemandAggregation = await response.json();
        setDemandData(data);
      }
    } catch (error) {
      console.error('Failed to load demand data:', error);
    }
  };

  const handleParticipate = async (price?: number) => {
    const finalPrice = price || recommendedPrice;
    const startTime = Date.now();
    const isAiRecommended = !price || price === recommendedPrice;
    setLoading(true);

    // Analytics: 참여 버튼 클릭
    trackNegoDealParticipateClicked({
      product_id: productId,
      variant: 'unified',
      target_price: finalPrice,
      ai_recommended_price: recommendedPrice,
      is_ai_recommended: isAiRecommended,
      participant_count: demandData?.totalUsers || 0,
      success_probability: successProbability,
    });

    try {
      const request: CreatePriceTrackingRequest = {
        productId,
        targetPrice: finalPrice,
        maxAcceptableDelta: 3000,
        notificationChannels: ['push'],
      };

      const response = await fetch('/api/price-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to participate in NegoDeal');
      }

      const data: CreatePriceTrackingResponse = await response.json();

      setParticipationId(data.trackingId);
      setIsParticipating(true);

      // Analytics: 참여 완료
      const timeToComplete = Date.now() - startTime;
      trackNegoDealParticipateCompleted({
        product_id: productId,
        variant: 'unified',
        target_price: finalPrice,
        ai_recommended_price: recommendedPrice,
        is_ai_recommended: isAiRecommended,
        participant_count: data.similarUsersCount || 0,
        success_probability: successProbability,
        time_to_complete_ms: timeToComplete,
        custom_price_used: price !== undefined && price !== recommendedPrice,
      });

      toast.success('🎉 네고딜 참여 완료!', {
        description: `₩${finalPrice.toLocaleString()}에 ${data.similarUsersCount || 0}명과 함께 협상합니다`,
      });

      // 참여자 수가 많으면 추가 메시지
      if (data.similarUsersCount && data.similarUsersCount > 100) {
        setTimeout(() => {
          toast.info(`🔥 ${data.similarUsersCount}명 참여 중!`, {
            description: 'AI가 판매자와 적극 협상 중입니다...',
          });
        }, 1500);
      }

      await loadDemandData();
    } catch (error: any) {
      console.error('Error participating:', error);

      // Analytics: 에러 추적
      trackNegoDealError({
        product_id: productId,
        variant: 'unified',
        error_type: error.message?.includes('network') ? 'network' : 'api',
        error_message: error.message || 'Unknown error',
        stage: 'participation',
      });

      toast.error('네고딜 참여 실패', {
        description: error.message || '다시 시도해주세요',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!participationId) {
      setIsParticipating(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/price-tracking/${participationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel participation');
      }

      setIsParticipating(false);
      setParticipationId(null);
      toast.success('네고딜 참여가 취소되었습니다');

      await loadDemandData();
    } catch (error: any) {
      console.error('Error canceling:', error);
      toast.error('취소 실패', {
        description: error.message || '다시 시도해주세요',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/30 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-xl">AI 네고딜</span>
          <Badge variant="secondary" className="ml-auto">
            실시간
          </Badge>
        </CardTitle>
        <CardDescription className="text-base">
          {demandData && demandData.totalUsers > 0 ? (
            <>
              <Users className="inline h-4 w-4 mr-1" />
              <span className="font-bold text-primary">{demandData.totalUsers}명</span>이 함께 협상 중이에요!
            </>
          ) : (
            '같은 제품 원하는 사람들과 함께 협상해요'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* 가격 정보 */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg text-sm">
          <div>
            <p className="text-muted-foreground mb-1 text-xs">현재 가격</p>
            <p className="font-bold text-lg">₩{currentPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs">최저가</p>
            <p className="font-bold text-lg text-green-600">₩{minPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs">평균가</p>
            <p className="font-bold text-lg text-blue-600">₩{avgPrice.toLocaleString()}</p>
          </div>
        </div>

        {/* AI 추천 가격 */}
        {!isParticipating && (
          <div className="p-5 bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/40 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <p className="font-bold text-lg">AI 추천 가격</p>
                </div>
                <p className="text-3xl font-black text-primary mb-2">
                  ₩{recommendedPrice.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {demandData && demandData.totalUsers > 0
                    ? `가장 많은 사람들이 원하는 가격이에요`
                    : `최적의 협상 가격이에요`
                  }
                </p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="text-lg px-3 py-1 mb-2">
                  {((currentPrice - recommendedPrice) / currentPrice * 100).toFixed(0)}% 할인
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {(currentPrice - recommendedPrice).toLocaleString()}원 절약
                </p>
              </div>
            </div>

            {/* 진행률 */}
            {demandData && demandData.totalUsers > 0 && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">참여 진행률</span>
                  <span className="font-bold">
                    {demandData.totalUsers}/{TARGET_PARTICIPANTS}명 ({progressPercent.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>
            )}

            {/* 성공 확률 & 마감 시간 */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">성공 확률</p>
                <p className="text-xl font-bold text-green-600">
                  {successProbability.toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">남은 시간</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {hoursRemaining}시간
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA 버튼 */}
        {isParticipating ? (
          <div className="space-y-3">
            <div className="p-5 bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Check className="h-6 w-6 text-green-600" />
                <span className="font-bold text-green-700 dark:text-green-400 text-lg">
                  네고딜 참여 중
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                ₩{targetPrice.toLocaleString()} 이하로 협상 성공하면 바로 알려드릴게요
              </p>
              {demandData && (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-bold">{demandData.totalUsers}명</span>
                    <span className="text-muted-foreground">과 함께 협상 중</span>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                '참여 취소'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Primary CTA: AI 추천가 */}
            <Button
              onClick={() => handleParticipate(recommendedPrice)}
              size="lg"
              className="w-full h-14 text-lg font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  참여 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  ₩{recommendedPrice.toLocaleString()}에 네고딜 참여
                </>
              )}
            </Button>

            {/* Secondary: 사용자 정의 가격 */}
            <div className="border-t pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={() => setShowCustomPrice(!showCustomPrice)}
              >
                {showCustomPrice ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    다른 가격 접기
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    다른 가격으로 참여
                  </>
                )}
              </Button>

              {showCustomPrice && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">내가 원하는 가격</label>
                    <Input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Number(e.target.value))}
                      className="w-32 text-right font-bold"
                      min={priceMin}
                      max={priceMax}
                    />
                  </div>

                  <Slider
                    value={[targetPrice]}
                    onValueChange={([value]) => {
                      setTargetPrice(value);
                      // Analytics: 커스텀 가격 설정
                      if (value !== recommendedPrice) {
                        trackNegoDealCustomPriceSet({
                          product_id: productId,
                          variant: 'unified',
                          ai_recommended_price: recommendedPrice,
                          custom_price: value,
                          price_diff: value - recommendedPrice,
                          price_diff_percent: ((value - recommendedPrice) / recommendedPrice) * 100,
                        });
                      }
                    }}
                    min={priceMin}
                    max={priceMax}
                    step={1000}
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₩{priceMin.toLocaleString()}</span>
                    <span>₩{priceMax.toLocaleString()}</span>
                  </div>

                  {/* 절감 정보 */}
                  {savings > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-900 dark:text-green-100">
                            예상 절감액
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            ₩{savings.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="px-2 py-1">
                          {savingsPercent}% 할인
                        </Badge>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleParticipate(targetPrice)}
                    className="w-full"
                    disabled={loading}
                  >
                    ₩{targetPrice.toLocaleString()}에 참여하기
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 수요 정보 (상세) */}
        {demandData && demandData.totalUsers > 0 && !isParticipating && (
          <div className="pt-4 border-t space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                💡 다른 사람들이 원하는 가격
              </p>
              {demandData.avgTargetPrice > 0 && (
                <p className="text-lg font-bold">
                  평균 ₩{demandData.avgTargetPrice.toLocaleString()}
                </p>
              )}
            </div>

            {/* 수요 분포 (간단히) */}
            <div className="text-xs text-center text-muted-foreground">
              참여할수록 성공 확률이 높아져요!
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="pt-4 border-t">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              네고딜은 어떻게 작동하나요? ▼
            </summary>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p>원하는 가격에 참여하면 AI가 자동으로 같은 가격 원하는 사람들을 그룹핑해요</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p>참여자가 많아질수록 AI가 판매자와 더 강력하게 협상해요</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <p>협상 성공하면 바로 알림! 24시간 내 할인가로 구매하세요</p>
              </div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
