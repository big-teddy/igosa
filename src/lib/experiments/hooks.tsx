/**
 * A/B Testing React Hooks
 *
 * React hooks for easy A/B testing integration
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePostHog } from 'posthog-js/react';
import { abTesting, type Variant, type Experiment, ACTIVE_EXPERIMENTS } from './ab-testing';

/**
 * Hook to get experiment variant
 *
 * @example
 * const variant = useExperiment('search_result_sorting');
 * if (variant === 'test') {
 *   // Show recommend sort
 * } else {
 *   // Show price sort
 * }
 */
export function useExperiment(
  experimentKey: string,
  defaultVariant: Variant = 'control'
): Variant {
  const posthog = usePostHog();
  const [variant, setVariant] = useState<Variant>(defaultVariant);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    if (!posthog) return;

    // Get variant from PostHog
    const experimentVariant = abTesting.getVariant(experimentKey, defaultVariant);
    setVariant(experimentVariant);

    // Track exposure once
    if (!hasTracked && experimentVariant) {
      abTesting.trackExposure(experimentKey, experimentVariant);
      setHasTracked(true);
    }
  }, [posthog, experimentKey, defaultVariant, hasTracked]);

  return variant;
}

/**
 * Hook to check if user is in a specific variant
 *
 * @example
 * const isTestVariant = useIsVariant('cta_button_color', 'test');
 * return <Button className={isTestVariant ? 'bg-green-600' : 'bg-blue-600'} />;
 */
export function useIsVariant(experimentKey: string, variantName: Variant): boolean {
  const variant = useExperiment(experimentKey);
  return variant === variantName;
}

/**
 * Hook to get experiment configuration
 */
export function useExperimentConfig(experimentKey: string): Experiment | null {
  return useMemo(() => {
    return ACTIVE_EXPERIMENTS[experimentKey] || null;
  }, [experimentKey]);
}

/**
 * Hook for multivariate testing
 *
 * @example
 * const layout = useMultivariateExperiment('homepage_layout', ['grid', 'list', 'masonry']);
 * // layout will be one of: 'grid', 'list', or 'masonry'
 */
export function useMultivariateExperiment(
  experimentKey: string,
  variants: string[],
  defaultVariant?: string
): string {
  const posthog = usePostHog();
  const [variant, setVariant] = useState<string>(defaultVariant || variants[0]);

  useEffect(() => {
    if (!posthog) return;

    const experimentVariant = abTesting.getVariant(experimentKey);

    // Validate variant is in the list
    if (variants.includes(experimentVariant)) {
      setVariant(experimentVariant);
    } else if (defaultVariant) {
      setVariant(defaultVariant);
    } else {
      setVariant(variants[0]);
    }

    // Track exposure
    abTesting.trackExposure(experimentKey, variant);
  }, [posthog, experimentKey, variants, defaultVariant, variant]);

  return variant;
}

/**
 * Hook to track experiment goal
 *
 * @example
 * const trackGoal = useExperimentGoal('checkout_form_simplification');
 *
 * const handlePurchase = () => {
 *   // ... purchase logic
 *   trackGoal('purchase_completed', orderTotal);
 * };
 */
export function useExperimentGoal(experimentKey: string) {
  return useMemo(() => {
    return (goalName: string, value?: number, properties?: Record<string, any>) => {
      abTesting.trackGoal(experimentKey, goalName, value, properties);
    };
  }, [experimentKey]);
}

/**
 * Hook for conditional rendering based on experiment
 *
 * @example
 * function SearchResults() {
 *   return useExperimentRender('search_result_sorting', {
 *     control: <PriceSortedResults />,
 *     test: <RecommendSortedResults />
 *   });
 * }
 */
export function useExperimentRender<T = React.ReactNode>(
  experimentKey: string,
  variants: Record<Variant, T>,
  fallback?: T
): T {
  const variant = useExperiment(experimentKey);

  if (variants[variant]) {
    return variants[variant];
  }

  if (fallback !== undefined) {
    return fallback;
  }

  // Default to control if variant not found
  return variants.control;
}

/**
 * Hook to check if user is enrolled in experiment
 */
export function useIsEnrolled(experimentKey: string): boolean {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    setIsEnrolled(abTesting.isEnrolled(experimentKey));
  }, [posthog, experimentKey]);

  return isEnrolled;
}

/**
 * Hook to get all active experiments for debugging
 */
export function useAllExperiments(): Record<string, Variant> {
  const [experiments, setExperiments] = useState<Record<string, Variant>>({});
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    const flags = abTesting.getAllFlags();
    setExperiments(flags as Record<string, Variant>);
  }, [posthog]);

  return experiments;
}

/**
 * Component for experiment-based conditional rendering
 *
 * @example
 * <ExperimentVariant experiment="cta_button_color">
 *   <ExperimentVariant.Control>
 *     <Button className="bg-blue-600">Join Deal</Button>
 *   </ExperimentVariant.Control>
 *   <ExperimentVariant.Test>
 *     <Button className="bg-green-600">Join Deal</Button>
 *   </ExperimentVariant.Test>
 * </ExperimentVariant>
 */
export function ExperimentVariant({
  experiment,
  children,
}: {
  experiment: string;
  children: React.ReactNode;
}) {
  const variant = useExperiment(experiment);

  // Find matching variant component
  const childrenArray = Array.isArray(children) ? children : [children];

  for (const child of childrenArray) {
    if (!child || typeof child !== 'object' || !('type' in child)) continue;

    const childType = (child as any).type;

    if (childType?.displayName === `ExperimentVariant.${variant}`) {
      return child;
    }
  }

  // Fallback to control if no match
  for (const child of childrenArray) {
    if (!child || typeof child !== 'object' || !('type' in child)) continue;

    const childType = (child as any).type;

    if (childType?.displayName === 'ExperimentVariant.control') {
      return child;
    }
  }

  return null;
}

// Variant components
ExperimentVariant.Control = function Control({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};
ExperimentVariant.Control.displayName = 'ExperimentVariant.control';

ExperimentVariant.Test = function Test({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};
ExperimentVariant.Test.displayName = 'ExperimentVariant.test';

ExperimentVariant.Variant = function CustomVariant({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return <>{children}</>;
};
ExperimentVariant.Variant.displayName = 'ExperimentVariant.custom';
