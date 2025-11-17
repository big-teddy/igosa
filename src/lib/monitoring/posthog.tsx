/**
 * PostHog Analytics Provider
 * 사용자 행동 분석 및 이벤트 추적
 */

'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (posthogKey && process.env.NODE_ENV === 'production') {
    posthog.init(posthogKey, {
      api_host: posthogHost,

      // Capture settings
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,

      // Privacy
      mask_all_text: false,
      mask_all_element_attributes: false,

      // Session recording
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
          email: true,
        },
      },

      // Autocapture
      autocapture: {
        dom_event_allowlist: ['click', 'submit', 'change'],
        url_allowlist: [],
        element_allowlist: ['button', 'a', 'form', 'input'],
      },

      // Performance
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
    });
  }
}

/**
 * Track page views automatically
 */
function PostHogPageView(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const url = window.origin + pathname + (window.location.search || '');

      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname]);

  return null;
}

/**
 * PostHog Provider Component
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}

/**
 * Analytics Event Tracking
 */

export const analytics = {
  // Track custom events
  track: (event: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
      return;
    }
    posthog.capture(event, properties);
  },

  // Identify user
  identify: (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits);
  },

  // Set user properties
  setUser: (properties: Record<string, any>) => {
    posthog.people.set(properties);
  },

  // Track search
  trackSearch: (query: string, results: number, mode?: 'price' | 'recommend') => {
    analytics.track('Search Performed', {
      query,
      results_count: results,
      search_mode: mode,
    });
  },

  // Track product view
  trackProductView: (productId: string, productName: string, price: number) => {
    analytics.track('Product Viewed', {
      product_id: productId,
      product_name: productName,
      price,
    });
  },

  // Track add to cart
  trackAddToCart: (product: { id: string; name: string; price: number; quantity: number }) => {
    analytics.track('Product Added to Cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: product.quantity,
      value: product.price * product.quantity,
    });
  },

  // Track checkout started
  trackCheckoutStarted: (items: any[], total: number) => {
    analytics.track('Checkout Started', {
      num_items: items.length,
      total_value: total,
      items,
    });
  },

  // Track purchase
  trackPurchase: (orderId: string, total: number, items: any[]) => {
    analytics.track('Purchase Completed', {
      order_id: orderId,
      total_value: total,
      num_items: items.length,
      items,
    });
  },

  // Track AI interaction
  trackAIChat: (messageCount: number, topic?: string) => {
    analytics.track('AI Chat Interaction', {
      message_count: messageCount,
      topic,
    });
  },

  // Track nego deal
  trackNegoDeal: (action: 'created' | 'joined' | 'completed', dealId: string) => {
    analytics.track('Nego Deal', {
      action,
      deal_id: dealId,
    });
  },

  // Track referral
  trackReferral: (action: 'invited' | 'signed_up', referralCode?: string) => {
    analytics.track('Referral', {
      action,
      referral_code: referralCode,
    });
  },

  // Feature flag
  isFeatureEnabled: (flag: string): boolean => {
    return posthog.isFeatureEnabled(flag) || false;
  },

  // A/B testing variant
  getFeatureFlag: (flag: string): string | boolean => {
    return posthog.getFeatureFlag(flag) || false;
  },
};

export default posthog;
