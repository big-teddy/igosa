/**
 * A/B Testing Examples
 *
 * 실제 A/B 테스트 사용 예제 모음
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useExperiment,
  useIsVariant,
  ExperimentVariant,
  useExperimentGoal,
  useAllExperiments,
} from '@/lib/experiments/hooks';

/**
 * Example 1: CTA Button Color Test
 *
 * PostHog Feature Flag: 'cta_button_color'
 * Variants: control (blue), test (green)
 * Goal: Increase Add to Cart rate
 */
export function CTAButtonExample() {
  const isGreenButton = useIsVariant('cta_button_color', 'test');
  const trackGoal = useExperimentGoal('cta_button_color');

  const handleClick = () => {
    // Track when user clicks the CTA button
    trackGoal('button_clicked');

    // Then handle the actual action
    console.log('User clicked CTA button');
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className={cn(
        'w-full text-lg font-bold transition-colors',
        isGreenButton
          ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
          : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
      )}
    >
      <ShoppingBag className="mr-2 h-5 w-5" />
      네고딜 참여하기
    </Button>
  );
}

/**
 * Example 2: Product Card Layout Test
 *
 * PostHog Feature Flag: 'product_card_layout'
 * Variants: control (vertical), test (horizontal)
 * Goal: Increase Product Click Through Rate
 */
export function ProductCardExample({ product }: { product: any }) {
  return (
    <ExperimentVariant experiment="product_card_layout">
      <ExperimentVariant.Control>
        <VerticalProductCard product={product} />
      </ExperimentVariant.Control>
      <ExperimentVariant.Test>
        <HorizontalProductCard product={product} />
      </ExperimentVariant.Test>
    </ExperimentVariant>
  );
}

function VerticalProductCard({ product }: { product: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted" />
      <div className="p-4">
        <h3 className="font-bold line-clamp-2">{product?.name || 'Product Name'}</h3>
        <p className="text-2xl font-bold text-primary mt-2">
          ₩{product?.price?.toLocaleString() || '0'}
        </p>
      </div>
    </Card>
  );
}

function HorizontalProductCard({ product }: { product: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-32 h-32 bg-muted flex-shrink-0" />
        <div className="p-4 flex-1">
          <h3 className="font-bold line-clamp-2">{product?.name || 'Product Name'}</h3>
          <p className="text-xl font-bold text-primary mt-1">
            ₩{product?.price?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Example 3: Search Result Sorting Test
 *
 * PostHog Feature Flag: 'search_result_sorting'
 * Variants: control (price), test (recommend)
 * Goal: Increase Product Views
 */
export function SearchResultsExample({ products }: { products: any[] }) {
  const variant = useExperiment('search_result_sorting');

  const sortedProducts = variant === 'test'
    ? [...products].sort((a, b) => (b.recommend_score || 0) - (a.recommend_score || 0))
    : [...products].sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{sortedProducts.length}개 상품</span>
        <span>
          정렬: {variant === 'test' ? 'AI 추천순' : '낮은 가격순'}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedProducts.map((product, idx) => (
          <ProductCardExample key={idx} product={product} />
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Discount Badge Style Test
 *
 * PostHog Feature Flag: 'discount_badge_style'
 * Variants: control (standard), test (prominent)
 * Goal: Increase Add to Cart
 */
export function DiscountBadgeExample({ discountRate }: { discountRate: number }) {
  const isProminent = useIsVariant('discount_badge_style', 'test');

  if (isProminent) {
    return (
      <div className="relative">
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <span className="text-2xl font-extrabold">{discountRate}%</span>
            <span className="text-sm ml-1">OFF</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 text-sm font-semibold rounded">
      {discountRate}% 할인
    </div>
  );
}

/**
 * Example 5: Checkout Form Simplification Test
 *
 * PostHog Feature Flag: 'checkout_form_simplification'
 * Variants: control (full), test (simplified)
 * Goal: Increase Purchase Completion Rate
 */
export function CheckoutFormExample() {
  const variant = useExperiment('checkout_form_simplification');
  const trackGoal = useExperimentGoal('checkout_form_simplification');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Track form submission
    trackGoal('form_submitted');

    // Track if purchase completes
    setTimeout(() => {
      trackGoal('purchase_completed', 359000);
    }, 1000);
  };

  if (variant === 'test') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="font-bold text-lg">간소화된 주문 정보</h3>
        <input
          type="text"
          placeholder="이름 *"
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="email"
          placeholder="이메일 *"
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="tel"
          placeholder="휴대폰 번호 *"
          className="w-full p-3 border rounded"
          required
        />
        <Button type="submit" className="w-full" size="lg">
          결제하기
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-lg">주문자 정보</h3>
      <input
        type="text"
        placeholder="이름 *"
        className="w-full p-3 border rounded"
        required
      />
      <input
        type="email"
        placeholder="이메일 *"
        className="w-full p-3 border rounded"
        required
      />
      <input
        type="tel"
        placeholder="휴대폰 번호 *"
        className="w-full p-3 border rounded"
        required
      />
      <input
        type="text"
        placeholder="회사명 (선택)"
        className="w-full p-3 border rounded"
      />
      <input
        type="text"
        placeholder="부서 (선택)"
        className="w-full p-3 border rounded"
      />
      <textarea
        placeholder="배송 메모 (선택)"
        className="w-full p-3 border rounded"
        rows={3}
      />
      <Button type="submit" className="w-full" size="lg">
        결제하기
      </Button>
    </form>
  );
}

/**
 * Debug Component: Show all active experiments
 *
 * Use this component during development to see which experiments
 * are active and what variant the user is in.
 */
export function ExperimentDebugPanel() {
  const experiments = useAllExperiments();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🧪 Active Experiments</h3>
      {Object.keys(experiments).length === 0 ? (
        <p className="text-xs text-gray-400">No active experiments</p>
      ) : (
        <div className="space-y-1 text-xs">
          {Object.entries(experiments).map(([key, variant]) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="text-gray-400">{key}:</span>
              <span className="font-mono text-green-400">{String(variant)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).posthog) {
              (window as any).posthog.featureFlags.override(false);
              window.location.reload();
            }
          }}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Clear Overrides & Reload
        </button>
      </div>
    </div>
  );
}
