# Analytics & Monitoring Overview

Igosa 프로젝트의 완전한 분석 및 모니터링 시스템 개요입니다.

## 📚 시스템 구성

우리의 분석 시스템은 4개의 핵심 레이어로 구성됩니다:

```
┌─────────────────────────────────────────────┐
│         1. 데이터 수집 Layer                  │
│   (Event Tracking, Web Vitals, Errors)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         2. 분석 및 저장 Layer                 │
│      (PostHog, Sentry, Analytics DB)        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         3. 인사이트 생성 Layer                │
│   (Dashboards, Funnels, Experiments)        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         4. 의사결정 Layer                     │
│  (Alerts, Reports, Recommendations)         │
└─────────────────────────────────────────────┘
```

---

## 🎯 핵심 기능

### 1. 이벤트 추적 (Event Tracking)

**위치**: `src/lib/monitoring/posthog.tsx`

**추적하는 이벤트**:
- ✅ Search Performed (검색 수행)
- ✅ Product Viewed (상품 조회)
- ✅ Add to Cart (장바구니 추가 / 네고딜 참여)
- ✅ Checkout Started (결제 시작)
- ✅ Purchase Completed (구매 완료)

**사용 예시**:
```tsx
import { analytics } from '@/lib/monitoring/posthog';

// 검색 이벤트 추적
analytics.trackSearch('에어팟', 15, 'price');

// 상품 조회 추적
analytics.trackProductView('prod-123', '에어팟 프로', 359000);

// 구매 완료 추적
analytics.trackPurchase('order-456', 359000, items);
```

---

### 2. Dashboard 및 핵심 지표

**위치**: `docs/posthog-dashboard-config.md`

**4개 주요 대시보드**:

#### 📊 비즈니스 개요
- 매출 트렌드
- 주문 수
- 평균 주문 금액
- 전환율
- Top 제품

#### 👥 사용자 행동
- DAU/MAU
- 사용자 리텐션
- 세션 지속시간
- 인기 검색어
- 검색 성공률

#### 🎯 전환 최적화
- 전체 전환 퍼널
- 단계별 이탈률
- 상품별 전환율
- 장바구니 포기율

#### 💰 네고딜 분석
- 활성 딜 수
- 딜 참여율
- 인기 딜 Top 10
- 딜 완료율

**PostHog 설정 방법**:
```bash
# 1. PostHog 대시보드 로그인
# 2. Insights → New Dashboard 클릭
# 3. docs/posthog-dashboard-config.md 참고하여 Insight 추가
# 4. posthog-queries.ts의 쿼리 템플릿 활용
```

---

### 3. A/B 테스팅

**위치**: `src/lib/experiments/`

**사용 가능한 Hooks**:
```tsx
import { useExperiment, useIsVariant } from '@/lib/experiments/hooks';

// 기본 사용
const variant = useExperiment('my_experiment');

// Variant 확인
const isTestVariant = useIsVariant('my_experiment', 'test');

// 컴포넌트 렌더링
<ExperimentVariant experiment="button_color">
  <ExperimentVariant.Control>
    <BlueButton />
  </ExperimentVariant.Control>
  <ExperimentVariant.Test>
    <GreenButton />
  </ExperimentVariant.Test>
</ExperimentVariant>
```

**실험 생성 프로세스**:
1. PostHog에서 Feature Flag 생성
2. `src/lib/experiments/ab-testing.ts`의 `ACTIVE_EXPERIMENTS`에 추가
3. 코드에서 hooks 사용
4. Goal 추적
5. 결과 분석
6. Winner 롤아웃

**자세한 가이드**: `docs/ab-testing-guide.md`

---

### 4. 성능 모니터링

**위치**: `src/lib/monitoring/web-vitals.ts`

**추적 지표**:
- **LCP** (Largest Contentful Paint): < 2.5s 목표
- **FID** (First Input Delay): < 100ms 목표
- **CLS** (Cumulative Layout Shift): < 0.1 목표
- **INP** (Interaction to Next Paint): < 200ms 목표
- **TTFB**, **FCP**, 페이지 로드 시간

**자동 추적**:
```tsx
// src/app/layout.tsx에 이미 설정됨
import { WebVitals } from "./web-vitals";

<WebVitals />  // 자동으로 모든 성능 지표 추적
```

**커스텀 성능 추적**:
```tsx
import { trackPerformanceMetric } from '@/lib/monitoring/web-vitals';

// API 요청 시간 측정
const start = performance.now();
await fetchData();
const duration = performance.now() - start;

trackPerformanceMetric('api_fetch', duration, 'millisecond');
```

**자세한 가이드**: `docs/performance-monitoring.md`

---

## 📍 통합 Analytics Dashboard

**위치**: `/analytics` (http://localhost:3000/analytics)

**기능**:
- 📊 핵심 지표 한눈에 보기
- 📈 전환 퍼널 시각화
- ⚡ 성능 모니터링 현황
- 🧪 A/B 테스트 결과
- 👥 사용자 분석

**접근 방법**:
```
브라우저에서 /analytics 페이지 방문
```

---

## 🔔 알림 및 모니터링

### Critical Alerts (즉시 대응 필요)

1. **전환율 급락**
   - 조건: 전환율 < 2%
   - 알림: Slack + Email
   - 대응: 퍼널 분석 후 긴급 개선

2. **매출 급락**
   - 조건: 일일 매출 < 7일 평균의 70%
   - 알림: Slack + Email
   - 대응: 시스템 점검 및 원인 파악

3. **높은 장바구니 포기율**
   - 조건: 포기율 > 80%
   - 알림: Email
   - 대응: 체크아웃 프로세스 점검

4. **검색 실패 급증**
   - 조건: 검색 성공률 < 60%
   - 알림: Slack
   - 대응: 키워드 매칭 개선

### Warning Alerts (주의 필요)

1. **DAU 감소**
   - 조건: DAU < 전주 대비 80%
   - 알림: Email
   - 대응: 사용자 재참여 캠페인

2. **성능 저하**
   - 조건: LCP > 4s, CLS > 0.25
   - 알림: Email
   - 대응: 성능 최적화 작업

---

## 📊 주간/월간 리포트

### 주간 리포트 (매주 월요일 오전 9시)

**포함 내용**:
1. 핵심 지표 요약
   - 매출, 주문 수, 전환율, DAU
   - 전주 대비 증감율

2. Top 10 인사이트
   - 인기 상품
   - 검색어
   - 성과 좋은 네고딜

3. 성능 현황
   - Core Web Vitals 평균
   - 문제 페이지 목록

4. A/B 테스트 업데이트
   - 진행 중 실험
   - 완료된 실험 결과

### 월간 리포트 (매월 1일)

**포함 내용**:
1. 비즈니스 성과
   - 월간 매출, 성장률
   - 고객 획득 비용 (CAC)
   - 고객 생애 가치 (LTV)

2. 사용자 분석
   - 코호트 리텐션
   - 사용자 세그먼트 분석
   - 이탈 사용자 분석

3. 제품 인사이트
   - 베스트/워스트 제품
   - 카테고리별 성과
   - 네고딜 성과

4. 기술 현황
   - 성능 개선 이력
   - A/B 테스트 결과 요약
   - 시스템 안정성

---

## 🛠 실무 워크플로우

### 1. 일일 체크 (5분)
```
1. /analytics 대시보드 확인
2. 핵심 지표 변화 확인
   - 어제 대비 매출, 주문, 전환율
3. 알림 확인 및 대응
```

### 2. 주간 리뷰 (30분)
```
1. PostHog 주간 리포트 검토
2. 전환 퍼널 분석
   - 이탈률 높은 단계 파악
   - 개선 방안 도출
3. 성능 모니터링
   - 느린 페이지 파악
   - 최적화 작업 계획
4. A/B 테스트 체크
   - 통계적 유의성 확인
   - Winner 결정
```

### 3. 월간 분석 (2시간)
```
1. 비즈니스 성과 분석
   - 목표 대비 달성률
   - 성장 동인 파악
2. 사용자 행동 패턴 분석
   - 코호트 분석
   - 세그먼트별 전환율
3. 제품 포트폴리오 분석
   - 성과 좋은/나쁜 제품 파악
   - 재고/가격 전략 조정
4. 다음 달 실험 계획
   - A/B 테스트 아이디어
   - 최적화 우선순위
```

---

## 📖 추가 리소스

### 문서
- [PostHog Dashboard 설정](./posthog-dashboard-config.md)
- [A/B 테스팅 가이드](./ab-testing-guide.md)
- [성능 모니터링 가이드](./performance-monitoring.md)

### 코드
- 이벤트 추적: `src/lib/monitoring/posthog.tsx`
- A/B 테스팅: `src/lib/experiments/`
- 성능 모니터링: `src/lib/monitoring/web-vitals.ts`
- 대시보드: `src/app/(main)/analytics/page.tsx`

### 외부 링크
- [PostHog 공식 문서](https://posthog.com/docs)
- [Web Vitals 가이드](https://web.dev/vitals/)
- [A/B Testing Best Practices](https://www.optimizely.com/optimization-glossary/ab-testing/)

---

## ✅ 체크리스트

### 초기 설정 (한 번만)
- [ ] PostHog 프로젝트 생성
- [ ] Sentry 프로젝트 생성
- [ ] 환경 변수 설정 (.env.local)
- [ ] PostHog 대시보드 생성 (4개)
- [ ] 알림 채널 설정 (Slack, Email)

### 일일
- [ ] /analytics 대시보드 확인
- [ ] 알림 확인 및 대응

### 주간
- [ ] 주간 리포트 검토
- [ ] 퍼널 분석
- [ ] A/B 테스트 체크

### 월간
- [ ] 월간 리포트 분석
- [ ] 다음 달 실험 계획
- [ ] 성능 최적화 작업

---

## 🎯 Success Metrics

**우리의 분석 시스템이 성공한다면**:
- ✅ 모든 핵심 비즈니스 지표를 실시간으로 확인 가능
- ✅ 데이터 기반 의사결정이 일상화
- ✅ A/B 테스트를 통한 지속적 개선
- ✅ 성능 문제를 사전에 감지하고 대응
- ✅ 사용자 이탈 포인트를 정확히 파악하고 개선

---

**마지막 업데이트**: 2025-11-17
**유지보수**: 매주 화요일 문서 업데이트
