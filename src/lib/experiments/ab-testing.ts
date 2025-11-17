/**
 * A/B Testing Framework
 *
 * PostHog의 Feature Flags를 활용한 A/B 테스트 프레임워크
 */

import posthog from '@/lib/monitoring/posthog';

/**
 * Experiment variant type
 */
export type Variant = 'control' | 'test' | string;

/**
 * Experiment configuration
 */
export interface Experiment {
  key: string;
  name: string;
  description: string;
  variants: {
    control: ExperimentVariant;
    test: ExperimentVariant;
    [key: string]: ExperimentVariant;
  };
  targetMetric: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Experiment variant configuration
 */
export interface ExperimentVariant {
  name: string;
  description: string;
  weight?: number; // 0-100, defaults to 50/50 split
}

/**
 * Experiment result
 */
export interface ExperimentResult {
  variant: Variant;
  experimentKey: string;
  isParticipant: boolean;
}

/**
 * A/B Testing Service
 */
class ABTestingService {
  /**
   * Get the variant for a given experiment
   */
  getVariant(experimentKey: string, defaultVariant: Variant = 'control'): Variant {
    if (typeof window === 'undefined') {
      return defaultVariant;
    }

    try {
      const variant = posthog.getFeatureFlag(experimentKey);
      return (variant as Variant) || defaultVariant;
    } catch (error) {
      console.error(`Error getting variant for ${experimentKey}:`, error);
      return defaultVariant;
    }
  }

  /**
   * Check if user is in a specific variant
   */
  isVariant(experimentKey: string, variantName: Variant): boolean {
    return this.getVariant(experimentKey) === variantName;
  }

  /**
   * Track experiment exposure
   */
  trackExposure(experimentKey: string, variant: Variant, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    try {
      posthog.capture('$experiment_started', {
        experiment_key: experimentKey,
        variant,
        ...properties,
      });
    } catch (error) {
      console.error(`Error tracking exposure for ${experimentKey}:`, error);
    }
  }

  /**
   * Track experiment goal completion
   */
  trackGoal(experimentKey: string, goalName: string, value?: number, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    const variant = this.getVariant(experimentKey);

    try {
      posthog.capture('experiment_goal_completed', {
        experiment_key: experimentKey,
        variant,
        goal_name: goalName,
        goal_value: value,
        ...properties,
      });
    } catch (error) {
      console.error(`Error tracking goal for ${experimentKey}:`, error);
    }
  }

  /**
   * Override variant (for testing purposes)
   */
  overrideVariant(experimentKey: string, variant: Variant) {
    if (typeof window === 'undefined') return;

    try {
      posthog.featureFlags.override({
        [experimentKey]: variant,
      });
    } catch (error) {
      console.error(`Error overriding variant for ${experimentKey}:`, error);
    }
  }

  /**
   * Clear all variant overrides
   */
  clearOverrides() {
    if (typeof window === 'undefined') return;

    try {
      posthog.featureFlags.override(false);
    } catch (error) {
      console.error('Error clearing overrides:', error);
    }
  }

  /**
   * Get all active feature flags
   */
  getAllFlags(): Record<string, string | boolean> {
    if (typeof window === 'undefined') return {};

    try {
      // TODO: PostHog SDK doesn't expose getFeatureFlags() in browser
      // Return empty object for now
      return {};
    } catch (error) {
      console.error('Error getting all flags:', error);
      return {};
    }
  }

  /**
   * Check if user is enrolled in experiment
   */
  isEnrolled(experimentKey: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      return posthog.isFeatureEnabled(experimentKey) !== undefined;
    } catch (error) {
      console.error(`Error checking enrollment for ${experimentKey}:`, error);
      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const abTesting = new ABTestingService();

/**
 * Active experiments configuration
 */
export const ACTIVE_EXPERIMENTS: Record<string, Experiment> = {
  // Example: Search result sorting
  search_result_sorting: {
    key: 'search_result_sorting',
    name: '검색 결과 정렬 방식',
    description: '가격순 vs 추천순 기본 정렬 테스트',
    variants: {
      control: {
        name: 'Price Sort',
        description: '가격 낮은 순으로 기본 정렬',
        weight: 50,
      },
      test: {
        name: 'Recommend Sort',
        description: 'AI 추천순으로 기본 정렬',
        weight: 50,
      },
    },
    targetMetric: 'Product Viewed',
  },

  // Example: CTA button color
  cta_button_color: {
    key: 'cta_button_color',
    name: 'CTA 버튼 색상',
    description: '네고딜 참여 버튼 색상 테스트',
    variants: {
      control: {
        name: 'Blue Button',
        description: '기본 파란색 버튼',
        weight: 50,
      },
      test: {
        name: 'Green Button',
        description: '초록색 버튼',
        weight: 50,
      },
    },
    targetMetric: 'Add to Cart',
  },

  // Example: Product card layout
  product_card_layout: {
    key: 'product_card_layout',
    name: '상품 카드 레이아웃',
    description: '상품 카드 디자인 A vs B',
    variants: {
      control: {
        name: 'Vertical Layout',
        description: '세로형 카드 레이아웃',
        weight: 50,
      },
      test: {
        name: 'Horizontal Layout',
        description: '가로형 카드 레이아웃',
        weight: 50,
      },
    },
    targetMetric: 'Add to Cart',
  },

  // Example: Checkout form fields
  checkout_form_simplification: {
    key: 'checkout_form_simplification',
    name: '체크아웃 폼 간소화',
    description: '필수 필드만 vs 모든 필드',
    variants: {
      control: {
        name: 'Full Form',
        description: '모든 필드 표시',
        weight: 50,
      },
      test: {
        name: 'Simplified Form',
        description: '필수 필드만 표시',
        weight: 50,
      },
    },
    targetMetric: 'Purchase Completed',
  },

  // Example: Discount badge prominence
  discount_badge_style: {
    key: 'discount_badge_style',
    name: '할인 뱃지 스타일',
    description: '할인율 표시 방식 테스트',
    variants: {
      control: {
        name: 'Standard Badge',
        description: '기본 뱃지 스타일',
        weight: 50,
      },
      test: {
        name: 'Prominent Badge',
        description: '강조된 뱃지 스타일 (큰 글씨, 애니메이션)',
        weight: 50,
      },
    },
    targetMetric: 'Add to Cart',
  },
};

/**
 * Helper function to run multivariate tests (A/B/C/...)
 */
export function getMultivariateVariant(
  experimentKey: string,
  variants: string[],
  defaultVariant?: string
): string {
  const variant = abTesting.getVariant(experimentKey, defaultVariant);

  // Validate variant is in the list
  if (variants.includes(variant)) {
    return variant;
  }

  return defaultVariant || variants[0];
}

/**
 * Helper to check if experiment is active
 */
export function isExperimentActive(experimentKey: string): boolean {
  const experiment = ACTIVE_EXPERIMENTS[experimentKey];
  if (!experiment) return false;

  const now = new Date();

  if (experiment.startDate && now < experiment.startDate) {
    return false;
  }

  if (experiment.endDate && now > experiment.endDate) {
    return false;
  }

  return true;
}
