# A/B Testing Guide

Igosa의 A/B 테스팅 프레임워크 사용 가이드입니다.

## 📚 목차

1. [개요](#개요)
2. [PostHog에서 실험 설정](#posthog에서-실험-설정)
3. [코드에서 실험 사용](#코드에서-실험-사용)
4. [실험 분석](#실험-분석)
5. [베스트 프랙티스](#베스트-프랙티스)
6. [예제](#예제)

---

## 개요

우리는 PostHog의 Feature Flags와 Experiments 기능을 활용하여 A/B 테스트를 진행합니다.

### 주요 기능
- ✅ **간단한 통합**: React hooks를 통한 쉬운 사용
- ✅ **자동 추적**: 실험 노출 및 전환 자동 트래킹
- ✅ **멀티배리언트**: A/B/C/... 테스트 지원
- ✅ **실시간 분석**: PostHog 대시보드에서 실시간 결과 확인
- ✅ **타입 안전성**: TypeScript로 작성된 타입 안전한 API

---

## PostHog에서 실험 설정

### 1. Feature Flag 생성

1. PostHog 대시보드 로그인
2. **Feature Flags** 메뉴 클릭
3. **New Feature Flag** 클릭
4. 다음 정보 입력:
   - **Key**: `search_result_sorting` (코드에서 사용할 키)
   - **Name**: 검색 결과 정렬 방식
   - **Description**: 가격순 vs 추천순 기본 정렬 테스트
   - **Type**: Multivariate flag (A/B 테스트용)

### 2. Variants 설정

- **Control** (50%):
  - Key: `control`
  - Name: Price Sort
  - Description: 가격 낮은 순으로 기본 정렬

- **Test** (50%):
  - Key: `test`
  - Name: Recommend Sort
  - Description: AI 추천순으로 기본 정렬

### 3. Rollout 설정

- **Rollout percentage**: 100% (모든 사용자)
- 또는 특정 조건 설정 가능:
  - 특정 국가만
  - 신규 사용자만
  - 특정 플랫폼만 (모바일/데스크톱)

### 4. Experiment 생성 (선택사항)

Feature Flag를 Experiment로 전환:
1. Feature Flag 상세 페이지에서 **Create Experiment** 클릭
2. **Goal metric** 설정: `Product Viewed` 이벤트
3. **Secondary metrics** 추가:
   - Add to Cart
   - Checkout Started
4. **Minimum sample size** 설정: 1000명
5. Save

---

## 코드에서 실험 사용

### 기본 사용법

```tsx
import { useExperiment } from '@/lib/experiments/hooks';

function SearchResults() {
  const variant = useExperiment('search_result_sorting');

  if (variant === 'test') {
    // AI 추천순 정렬
    return <RecommendSortedResults />;
  }

  // 가격순 정렬 (control)
  return <PriceSortedResults />;
}
```

### Hook 기반 조건 렌더링

```tsx
import { useIsVariant } from '@/lib/experiments/hooks';

function CTAButton() {
  const isGreenButton = useIsVariant('cta_button_color', 'test');

  return (
    <Button
      className={isGreenButton ? 'bg-green-600' : 'bg-blue-600'}
    >
      네고딜 참여하기
    </Button>
  );
}
```

### 컴포넌트 기반 렌더링

```tsx
import { ExperimentVariant } from '@/lib/experiments/hooks';

function ProductCard() {
  return (
    <ExperimentVariant experiment="product_card_layout">
      <ExperimentVariant.Control>
        <VerticalProductCard />
      </ExperimentVariant.Control>
      <ExperimentVariant.Test>
        <HorizontalProductCard />
      </ExperimentVariant.Test>
    </ExperimentVariant>
  );
}
```

### 멀티배리언트 테스트 (A/B/C)

```tsx
import { useMultivariateExperiment } from '@/lib/experiments/hooks';

function Homepage() {
  const layout = useMultivariateExperiment(
    'homepage_layout',
    ['grid', 'list', 'masonry']
  );

  switch (layout) {
    case 'grid':
      return <GridLayout />;
    case 'list':
      return <ListLayout />;
    case 'masonry':
      return <MasonryLayout />;
    default:
      return <GridLayout />;
  }
}
```

### Goal 트래킹

```tsx
import { useExperimentGoal } from '@/lib/experiments/hooks';

function CheckoutPage() {
  const trackGoal = useExperimentGoal('checkout_form_simplification');

  const handlePurchase = async (orderTotal: number) => {
    // ... 구매 로직

    // Goal 달성 추적
    trackGoal('purchase_completed', orderTotal, {
      order_id: orderId,
      items_count: items.length,
    });
  };

  return (
    <CheckoutForm onSubmit={handlePurchase} />
  );
}
```

### 서비스 레이어에서 사용

```tsx
import { abTesting } from '@/lib/experiments/ab-testing';

export function searchProducts(query: string) {
  const variant = abTesting.getVariant('search_result_sorting');

  if (variant === 'test') {
    // AI 추천 정렬
    return sortByRecommendation(products);
  }

  // 가격 정렬
  return sortByPrice(products);
}
```

---

## 실험 분석

### PostHog에서 결과 확인

1. **Experiments** 메뉴 클릭
2. 실험 선택
3. 확인 가능한 지표:
   - **Conversion rate** by variant
   - **Statistical significance**
   - **Probability of being best**
   - **Trend over time**
   - **Secondary metrics**

### 통계적 유의성 판단

PostHog는 자동으로 다음을 계산합니다:
- **P-value**: < 0.05면 통계적으로 유의미
- **Confidence interval**: 95% 신뢰구간
- **Sample size**: 최소 샘플 사이즈 도달 여부

### 결과 해석

```
Control: 5.2% conversion (520 / 10,000 users)
Test: 6.8% conversion (680 / 10,000 users)
Relative uplift: +30.8%
P-value: 0.002 (통계적으로 유의미)
Probability Test is best: 99.8%
```

👍 **결정**: Test variant가 통계적으로 유의미하게 우수하므로, Test를 100% 롤아웃

---

## 베스트 프랙티스

### 1. 명확한 가설 설정

❌ **나쁜 예**: "버튼 색상을 바꿔보자"
✅ **좋은 예**: "초록색 버튼이 파란색보다 CTR을 15% 향상시킬 것이다"

### 2. 하나씩 테스트

❌ **나쁜 예**: 버튼 색상 + 문구 + 위치를 동시에 변경
✅ **좋은 예**: 버튼 색상만 변경하고 테스트

### 3. 충분한 샘플 사이즈

- 최소 100 conversions per variant
- 최소 1주일 이상 실행 (요일별 차이 고려)
- PostHog의 샘플 사이즈 계산기 활용

### 4. 명확한 Primary Metric

각 실험은 하나의 주요 지표를 가져야 합니다:
- 검색 관련 → Product Viewed
- 장바구니 관련 → Add to Cart
- 결제 관련 → Purchase Completed

### 5. 실험 문서화

`src/lib/experiments/ab-testing.ts`의 `ACTIVE_EXPERIMENTS`에 모든 실험을 문서화:

```ts
export const ACTIVE_EXPERIMENTS = {
  my_experiment: {
    key: 'my_experiment',
    name: '실험 이름',
    description: '실험 설명 및 가설',
    variants: { ... },
    targetMetric: 'Primary Metric',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-29'),
  },
};
```

---

## 예제

### 예제 1: 검색 결과 정렬 A/B 테스트

**가설**: AI 추천순 정렬이 가격순보다 상품 조회율을 20% 증가시킬 것이다.

**구현**:

```tsx
// src/app/(main)/page.tsx
import { useExperiment } from '@/lib/experiments/hooks';

export default function SearchPage() {
  const sortVariant = useExperiment('search_result_sorting');

  const handleSearch = (query: string) => {
    const products = searchProducts(query);

    // Variant에 따라 정렬
    if (sortVariant === 'test') {
      return sortByRecommendation(products);
    }

    return sortByPrice(products);
  };

  return <SearchInterface onSearch={handleSearch} />;
}
```

**측정 지표**:
- Primary: Product Viewed (상품 조회 수)
- Secondary: Add to Cart (장바구니 추가율)

---

### 예제 2: CTA 버튼 색상 테스트

**가설**: 초록색 버튼이 파란색보다 네고딜 참여율을 10% 향상시킬 것이다.

**구현**:

```tsx
// src/app/(main)/nego-deals/[id]/page.tsx
import { useIsVariant } from '@/lib/experiments/hooks';

export default function NegoDealPage() {
  const isGreenButton = useIsVariant('cta_button_color', 'test');

  return (
    <Button
      className={cn(
        'w-full text-lg font-bold',
        isGreenButton
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-blue-600 hover:bg-blue-700'
      )}
      onClick={handleJoinDeal}
    >
      <ShoppingBag className="mr-2" />
      네고딜 참여하기
    </Button>
  );
}
```

**측정 지표**:
- Primary: Add to Cart (네고딜 참여)
- Secondary: Purchase Completed

---

### 예제 3: 체크아웃 폼 간소화

**가설**: 필수 필드만 표시하면 결제 완료율이 25% 증가할 것이다.

**구현**:

```tsx
// src/app/(main)/checkout/page.tsx
import { useExperiment, useExperimentGoal } from '@/lib/experiments/hooks';

export default function CheckoutPage() {
  const formVariant = useExperiment('checkout_form_simplification');
  const trackGoal = useExperimentGoal('checkout_form_simplification');

  const handleSubmit = async (data: CheckoutData) => {
    // 결제 처리
    const result = await processPayment(data);

    if (result.success) {
      // Goal 달성 추적
      trackGoal('purchase_completed', result.total, {
        form_variant: formVariant,
        field_count: Object.keys(data).length,
      });
    }
  };

  if (formVariant === 'test') {
    return <SimplifiedCheckoutForm onSubmit={handleSubmit} />;
  }

  return <FullCheckoutForm onSubmit={handleSubmit} />;
}
```

**측정 지표**:
- Primary: Purchase Completed (구매 완료율)
- Secondary: Checkout Started to Purchase (결제 이탈률)

---

## 디버깅

### 로컬에서 특정 Variant 테스트

브라우저 콘솔에서:

```js
// Test variant로 강제 설정
posthog.featureFlags.override({
  'search_result_sorting': 'test'
});

// 페이지 새로고침

// Override 해제
posthog.featureFlags.override(false);
```

### 현재 활성화된 모든 실험 확인

```tsx
import { useAllExperiments } from '@/lib/experiments/hooks';

function DebugPanel() {
  const experiments = useAllExperiments();

  return (
    <div>
      <h3>Active Experiments</h3>
      <pre>{JSON.stringify(experiments, null, 2)}</pre>
    </div>
  );
}
```

---

## 실험 종료 후

### Winner 결정 후

1. PostHog에서 실험 종료
2. Winner variant를 100% 롤아웃
3. 코드에서 실험 분기 제거 (기술 부채 방지)

```tsx
// Before (실험 중)
const variant = useExperiment('search_result_sorting');
if (variant === 'test') {
  return <RecommendSort />;
}
return <PriceSort />;

// After (실험 종료, Test가 승리)
return <RecommendSort />; // 실험 코드 제거
```

4. `ACTIVE_EXPERIMENTS`에서 제거
5. PostHog Feature Flag 아카이브

---

## 추가 자료

- [PostHog Experiments 공식 문서](https://posthog.com/docs/experiments)
- [A/B 테스트 통계 기초](https://www.optimizely.com/optimization-glossary/ab-testing/)
- [샘플 사이즈 계산기](https://www.optimizely.com/sample-size-calculator/)
