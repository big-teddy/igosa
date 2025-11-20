/**
 * NegoDeal A/B Test Analytics Events
 *
 * 네고딜 통합 기능의 A/B 테스트 추적을 위한 이벤트
 */

import { analytics } from '@/lib/monitoring/posthog';

export interface NegoDealEventData {
  product_id: string;
  variant: 'unified' | 'legacy';
  rollout_percent?: number;
  user_id?: string;
}

export interface NegoDealParticipationData extends NegoDealEventData {
  target_price: number;
  ai_recommended_price?: number;
  is_ai_recommended: boolean;
  participant_count?: number;
  success_probability?: number;
}

export interface NegoDealCompletionData extends NegoDealParticipationData {
  time_to_complete_ms: number;
  custom_price_used: boolean;
}

/**
 * A/B Test Variant 할당 추적
 */
export function trackVariantAssignment(data: NegoDealEventData) {
  analytics.track('negodeal_variant_assigned', {
    experiment_name: 'unified_negodeal_rollout',
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 네고딜 위젯 노출 추적
 */
export function trackNegoDealWidgetViewed(data: NegoDealEventData & {
  ai_recommended_price?: number;
  participant_count?: number;
  current_price?: number;
  min_price?: number;
}) {
  analytics.track('negodeal_widget_viewed', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 네고딜 참여 버튼 클릭 추적
 */
export function trackNegoDealParticipateClicked(data: NegoDealParticipationData) {
  analytics.track('negodeal_participate_clicked', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 네고딜 참여 완료 추적
 */
export function trackNegoDealParticipateCompleted(data: NegoDealCompletionData) {
  analytics.track('negodeal_participate_completed', {
    ...data,
    timestamp: new Date().toISOString(),
  });

  // 전환 이벤트 (추가 추적)
  analytics.track('conversion_negodeal', {
    product_id: data.product_id,
    variant: data.variant,
    value: data.target_price,
  });
}

/**
 * 커스텀 가격 설정 추적
 */
export function trackNegoDealCustomPriceSet(data: {
  product_id: string;
  variant: 'unified' | 'legacy';
  ai_recommended_price: number;
  custom_price: number;
  price_diff: number;
  price_diff_percent: number;
}) {
  analytics.track('negodeal_custom_price_set', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 네고딜 참여 취소 추적
 */
export function trackNegoDealParticipationCanceled(data: NegoDealEventData & {
  reason?: string;
  stage?: 'widget' | 'modal' | 'confirmation';
}) {
  analytics.track('negodeal_participation_canceled', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 실시간 업데이트 수신 추적
 */
export function trackNegoDealRealtimeUpdate(data: {
  product_id: string;
  variant: 'unified' | 'legacy';
  participant_count_before: number;
  participant_count_after: number;
  update_count: number;
}) {
  analytics.track('negodeal_realtime_update', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 에러 발생 추적
 */
export function trackNegoDealError(data: {
  product_id: string;
  variant: 'unified' | 'legacy';
  error_type: 'network' | 'validation' | 'api' | 'unknown';
  error_message: string;
  stage?: string;
}) {
  analytics.track('negodeal_error', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 페이지 이탈 추적 (참여하지 않고 떠남)
 */
export function trackNegoDealBounce(data: NegoDealEventData & {
  time_on_page_ms: number;
  scrolled_to_widget: boolean;
}) {
  analytics.track('negodeal_bounce', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}
