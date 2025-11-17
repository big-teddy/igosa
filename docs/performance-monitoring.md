# Performance Monitoring Guide

Igosa의 성능 모니터링 시스템 가이드입니다.

## 📊 개요

우리는 Google의 Core Web Vitals와 커스텀 성능 지표를 추적하여 사용자 경험을 지속적으로 개선합니다.

### 모니터링 지표

1. **Core Web Vitals** (Google 권장 지표)
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
   - INP (Interaction to Next Paint)

2. **추가 성능 지표**
   - FCP (First Contentful Paint)
   - TTFB (Time to First Byte)
   - 페이지 로드 시간
   - 리소스 로딩 시간

3. **사용자 경험 지표**
   - Long Tasks (>50ms)
   - JavaScript 에러
   - 페이지별 성능 프로파일

---

## 🎯 Core Web Vitals 기준

### LCP (Largest Contentful Paint)
**측정**: 가장 큰 콘텐츠가 화면에 렌더링되는 시간

- ✅ **Good**: < 2.5초
- ⚠️ **Needs Improvement**: 2.5 - 4초
- ❌ **Poor**: > 4초

**개선 방법**:
- 이미지 최적화 (WebP, lazy loading)
- 서버 응답 시간 단축
- CSS/JS 번들 크기 줄이기
- CDN 사용

### FID (First Input Delay)
**측정**: 사용자가 첫 인터랙션을 시작한 후 브라우저가 응답하는 시간

- ✅ **Good**: < 100ms
- ⚠️ **Needs Improvement**: 100 - 300ms
- ❌ **Poor**: > 300ms

**개선 방법**:
- 메인 스레드 작업 분할
- Code splitting
- Web Workers 사용
- 불필요한 JavaScript 제거

### CLS (Cumulative Layout Shift)
**측정**: 예상치 못한 레이아웃 이동 점수

- ✅ **Good**: < 0.1
- ⚠️ **Needs Improvement**: 0.1 - 0.25
- ❌ **Poor**: > 0.25

**개선 방법**:
- 이미지/동영상에 width/height 속성 지정
- 폰트 로딩 최적화 (font-display: swap)
- 동적 콘텐츠 위에 충분한 공간 확보
- transform 애니메이션 사용

### INP (Interaction to Next Paint)
**측정**: 사용자 인터랙션 후 화면 업데이트까지의 시간

- ✅ **Good**: < 200ms
- ⚠️ **Needs Improvement**: 200 - 500ms
- ❌ **Poor**: > 500ms

**개선 방법**:
- Event handler 최적화
- 렌더링 차단 스크립트 제거
- React 렌더링 최적화 (useMemo, useCallback)

---

## 🔧 구현

### 자동 추적

Web Vitals는 자동으로 추적됩니다:

```tsx
// src/app/layout.tsx
import { WebVitals } from "./web-vitals";

export default function RootLayout({ children }) {
  return (
    <PostHogProvider>
      <WebVitals />  {/* 자동으로 모든 Web Vitals 추적 */}
      {children}
    </PostHogProvider>
  );
}
```

### 커스텀 성능 지표 추적

```tsx
import { trackPerformanceMetric } from '@/lib/monitoring/web-vitals';

// API 요청 시간 추적
const startTime = performance.now();
await fetchData();
const duration = performance.now() - startTime;

trackPerformanceMetric('api_fetch_duration', duration, 'millisecond', {
  endpoint: '/api/products',
});
```

### 페이지별 성능 추적

```tsx
import { getPerformanceSummary } from '@/lib/monitoring/web-vitals';

useEffect(() => {
  // 페이지 로드 완료 후 성능 요약 확인
  const summary = getPerformanceSummary();
  console.log('Page performance:', summary);
}, []);
```

---

## 📈 PostHog에서 확인

### 1. Web Vitals Dashboard 생성

**Insights 추가**:

1. **LCP Trend**
   ```
   Event: $web_vitals
   Filter: metric_name = "LCP"
   Math: Average of metric_value
   Breakdown: metric_rating
   ```

2. **FID Distribution**
   ```
   Event: $web_vitals
   Filter: metric_name = "FID"
   Math: Percentiles (p50, p75, p95)
   ```

3. **CLS by Page**
   ```
   Event: $web_vitals
   Filter: metric_name = "CLS"
   Math: Average of metric_value
   Breakdown: page_path
   ```

4. **Performance Score Card**
   ```
   Show % of pageviews with:
   - Good LCP (< 2.5s)
   - Good FID (< 100ms)
   - Good CLS (< 0.1)
   ```

### 2. 성능 알림 설정

**Critical Alerts**:
- LCP > 4s on 10% of pageviews
- FID > 300ms on 5% of interactions
- CLS > 0.25 on 10% of pageviews

**Warning Alerts**:
- Average LCP > 3s
- Average page load time > 5s
- Long tasks detected > 100 times/day

---

## 🎨 페이지별 최적화 전략

### Homepage
**목표**: LCP < 2s, FID < 75ms

**최적화**:
- Hero 이미지 우선 로드 (priority prop)
- Critical CSS inline
- 검색 인터페이스 hydration 최적화

```tsx
// src/app/page.tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  priority  // LCP 개선
  width={1200}
  height={600}
/>
```

### Product Pages
**목표**: LCP < 2.5s, CLS < 0.1

**최적화**:
- 이미지 lazy loading
- 리뷰 섹션 defer loading
- 정확한 이미지 dimensions 설정

```tsx
// src/app/products/[id]/page.tsx
<Image
  src={product.image}
  alt={product.name}
  width={800}  // CLS 방지
  height={800}
  loading="lazy"
/>
```

### Checkout Pages
**목표**: FID < 50ms, INP < 150ms

**최적화**:
- Form validation debouncing
- Payment SDK lazy loading
- 불필요한 re-rendering 방지

```tsx
import { useMemo, useCallback } from 'react';

const CheckoutPage = () => {
  const memoizedCart = useMemo(() => calculateCart(items), [items]);

  const handleSubmit = useCallback((data) => {
    // ... 최적화된 핸들러
  }, [/* deps */]);

  return <CheckoutForm onSubmit={handleSubmit} />;
};
```

---

## 🐛 성능 이슈 디버깅

### Chrome DevTools

1. **Lighthouse 실행**
   ```
   DevTools → Lighthouse → Performance 분석
   ```

2. **Performance 프로파일링**
   ```
   DevTools → Performance → Record
   ```

3. **Coverage 분석**
   ```
   DevTools → Coverage → 사용하지 않는 코드 찾기
   ```

### PostHog Performance 분석

```typescript
// 개발 환경에서 성능 요약 로깅
if (process.env.NODE_ENV === 'development') {
  const summary = getPerformanceSummary();
  console.table(summary);
}
```

### Long Tasks 모니터링

```typescript
// Long tasks는 자동으로 추적됨
// PostHog에서 확인:
// Event: long_task_detected
// Filter: task_duration > 100
```

---

## 📊 성능 대시보드 예시

### Business Impact Dashboard

**지표**:
- Conversion Rate by LCP score
- Bounce Rate by Page Load Time
- Revenue by Performance Score

**인사이트**:
```
LCP < 2.5s:
  - Conversion: 5.8%
  - Bounce: 25%

LCP > 4s:
  - Conversion: 3.2% ⚠️ (-45%)
  - Bounce: 48% ⚠️ (+92%)
```

### Technical Performance Dashboard

**지표**:
- Core Web Vitals Trends (30 days)
- Performance by Page
- Performance by Device
- Performance by Connection Speed

---

## 🚀 성능 개선 체크리스트

### 이미지 최적화
- [ ] Next.js Image 컴포넌트 사용
- [ ] WebP 포맷 사용
- [ ] Lazy loading 적용
- [ ] 적절한 sizes 속성 설정
- [ ] Priority prop for LCP images

### JavaScript 최적화
- [ ] Code splitting 적용
- [ ] Dynamic imports 사용
- [ ] Tree shaking 활성화
- [ ] Bundle 크기 모니터링

### CSS 최적화
- [ ] Critical CSS inline
- [ ] Unused CSS 제거
- [ ] CSS-in-JS 최적화

### 폰트 최적화
- [ ] font-display: swap 사용
- [ ] Subset 폰트 사용
- [ ] Preload critical fonts

### 캐싱 전략
- [ ] Static generation 최대한 활용
- [ ] ISR (Incremental Static Regeneration)
- [ ] API route caching
- [ ] CDN 활용

---

## 📝 성능 모니터링 보고서

### 주간 리포트 (자동화)

**포함 내용**:
1. Core Web Vitals 평균값
2. 주요 페이지별 성능
3. 성능 저하 페이지 목록
4. 개선 권장 사항

**생성 방법**:
PostHog → Insights → Weekly Report 설정

---

## 🔗 추가 자료

- [Web Vitals 공식 문서](https://web.dev/vitals/)
- [Next.js 성능 최적화](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Core Web Vitals Chrome Extension](https://chrome.google.com/webstore/detail/web-vitals)

---

## ✅ 성공 기준

**우리의 성능 목표**:
- ✅ 75% 이상의 페이지뷰가 Good LCP
- ✅ 95% 이상의 인터랙션이 Good FID
- ✅ 75% 이상의 페이지뷰가 Good CLS
- ✅ 평균 페이지 로드 시간 < 3초
- ✅ Long tasks < 10개/세션
