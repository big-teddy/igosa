# 📊 A/B 테스트 & 단계적 롤아웃 계획

**날짜**: 2025-01-20
**기능**: 네고딜 통합 (Unified NegoDeal)
**방식**: Feature Flag 기반 점진적 배포

---

## 🎯 목표

### 비즈니스 목표
- **전환율 향상**: 5% → 12% (목표: +140%)
- **사용자 이해도**: 50% → 85%
- **이탈률 감소**: 45% → 25% (목표: -44%)
- **참여자 수 증가**: +200%

### 기술 목표
- 안전한 점진적 배포
- 실시간 성능 모니터링
- 빠른 롤백 가능성 유지
- 데이터 기반 의사결정

---

## 📅 롤아웃 타임라인

### Week 1: 준비 단계 (현재)
**기간**: 1월 20일 - 1월 26일
**상태**: ✅ 완료

**완료 항목**:
- [x] 통합 NegoDealWidget 구현
- [x] Feature Flag 시스템 구축
- [x] 프로덕션 배포 완료
- [x] 모니터링 설정 (Sentry)
- [x] 테스트 가이드 작성

**다음 단계**: Week 2 (10% 롤아웃) 시작

---

### Week 2: 10% 롤아웃 (A/B 테스트 시작)
**기간**: 1월 27일 - 2월 2일
**목표**: 소규모 사용자 그룹으로 검증

#### 설정
```bash
# Vercel Environment Variables
NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL="true"
NEXT_PUBLIC_ENABLE_NEW_NAVIGATION="true"
NEXT_PUBLIC_ROLLOUT_PERCENT="10"  # 10% 사용자
```

#### 구현
```typescript
// src/app/(main)/products/[id]/page.tsx
import { isFeatureEnabledForUser } from '@/lib/feature-flags';
import { getCurrentUserId } from '@/lib/auth';

export default async function ProductPage({ params }: Props) {
  const userId = await getCurrentUserId();
  const showUnifiedNegoDeal = isFeatureEnabledForUser(
    userId || 'anonymous',
    'unified_negodeal',
    10  // 10% 롤아웃
  );

  return (
    <div>
      {showUnifiedNegoDeal ? (
        <NegoDealWidget {...props} />
      ) : (
        <SetTargetPriceWidget {...props} />
      )}
    </div>
  );
}
```

#### 모니터링 지표
**일일 체크 (매일 오전 10시)**:
```
✅ 전환율 (Conversion Rate)
  - 기존: 5%
  - 새 버전: ?%
  - 목표: > 6%

✅ 이탈률 (Bounce Rate)
  - 기존: 45%
  - 새 버전: ?%
  - 목표: < 40%

✅ 참여 완료율
  - 기존: 75%
  - 새 버전: ?%
  - 목표: > 80%

✅ 에러율
  - 목표: < 1%
  - 임계값: 2% (롤백)

✅ 페이지 로딩 시간
  - 목표: < 2초
  - 임계값: 3초 (조사)
```

#### Week 2 체크포인트 (2월 2일)
**진행 조건** (모두 충족 시 Week 3 진행):
- [ ] 에러율 < 1%
- [ ] 전환율 개선 확인 (최소 +10%)
- [ ] 사용자 피드백 긍정적 (> 70%)
- [ ] 치명적 버그 없음

**롤백 조건** (하나라도 해당 시):
- 에러율 > 2%
- 전환율 하락
- 치명적 버그 발견
- 서비스 중단 발생

---

### Week 3: 30% 롤아웃 (확대)
**기간**: 2월 3일 - 2월 9일
**목표**: 초기 성과 검증 후 확대

#### 설정
```bash
NEXT_PUBLIC_ROLLOUT_PERCENT="30"  # 30%로 확대
```

#### 추가 모니터링
```
✅ 세그먼트 분석
  - 신규 사용자 vs 기존 사용자
  - 모바일 vs 데스크톱
  - 제품 카테고리별

✅ 코호트 분석
  - 10% 그룹 리텐션
  - 30% 그룹 신규 참여율

✅ 정성적 피드백
  - 고객 지원 티켓 분석
  - 사용자 인터뷰 (10명)
```

#### Week 3 체크포인트 (2월 9일)
**진행 조건**:
- [ ] Week 2 지표 유지
- [ ] 30% 그룹도 동일 성과
- [ ] 인프라 안정성 확인
- [ ] 피드백 기반 개선 완료

---

### Week 4: 50% 롤아웃 (과반 전환)
**기간**: 2월 10일 - 2월 16일
**목표**: 메이저 전환 준비

#### 설정
```bash
NEXT_PUBLIC_ROLLOUT_PERCENT="50"  # 50%
```

#### 집중 모니터링
```
✅ 인프라 부하 테스트
  - API 응답 시간 < 500ms
  - DB 쿼리 성능 유지
  - Redis 캐시 효율 확인

✅ 비용 분석
  - Supabase 사용량
  - Upstash Redis 사용량
  - Vercel 함수 실행 시간

✅ 경쟁 비교
  - 기존(50%) vs 새(50%)
  - 통계적 유의성 확인
```

#### Week 4 체크포인트 (2월 16일)
**전체 전환 조건**:
- [ ] 전환율 목표 달성 (> 10%)
- [ ] 이탈률 목표 달성 (< 30%)
- [ ] 인프라 안정성 입증
- [ ] 비용 증가 < 20%

---

### Week 5: 100% 전환 (전체 활성화)
**기간**: 2월 17일 - 2월 23일
**목표**: 전체 사용자 전환

#### 설정
```bash
NEXT_PUBLIC_ROLLOUT_PERCENT="100"  # 전체 활성화
```

#### 최종 검증
```
✅ 전체 전환 확인
  - 모든 사용자 새 UI 경험
  - 레거시 UI 접근 없음

✅ 성과 측정
  - 전환율 최종 확인
  - ROI 계산
  - 사용자 만족도 조사

✅ 문서화
  - 성과 보고서 작성
  - 배운 점 정리
  - 개선 사항 기록
```

---

### Week 6: 레거시 코드 정리
**기간**: 2월 24일 - 3월 2일
**목표**: 기술 부채 제거

#### 삭제 대상
```bash
# 안전하게 제거 가능
❌ src/app/(main)/nego-deals/*  (NegoDeal 1.0)
❌ src/components/nego-deals/*  (구 UI)
❌ src/components/price-tracking/SetTargetPriceWidget.tsx
❌ Feature Flag 관련 코드 (완전 전환 후)

# 유지
✅ src/components/negodeal/NegoDealWidget.tsx
✅ src/lib/feature-flags.ts (다른 기능용)
✅ API 엔드포인트 (/api/price-tracking/*)
✅ 데이터베이스 테이블 (price_tracking)
```

#### 최종 정리
- [ ] 레거시 코드 삭제
- [ ] 의존성 정리 (package.json)
- [ ] 문서 업데이트
- [ ] 번들 크기 최적화
- [ ] 최종 성과 보고서

---

## 📈 측정 지표 (KPI)

### Primary Metrics (주요 지표)

#### 1. 전환율 (Conversion Rate)
**정의**: 제품 페이지 방문 → 네고딜 참여 비율

```sql
-- 측정 쿼리
SELECT
  COUNT(DISTINCT CASE WHEN participated THEN user_id END) * 100.0 /
  COUNT(DISTINCT user_id) AS conversion_rate
FROM product_views
WHERE viewed_at >= NOW() - INTERVAL '7 days'
  AND variant = 'new'  -- A/B 테스트 그룹
GROUP BY variant;
```

**목표**:
- Baseline: 5%
- Week 2: > 6% (+20%)
- Week 4: > 10% (+100%)
- Final: > 12% (+140%)

---

#### 2. 참여 완료율 (Completion Rate)
**정의**: 참여 시작 → 참여 완료 비율

```sql
SELECT
  COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 /
  COUNT(*) AS completion_rate
FROM price_tracking
WHERE created_at >= NOW() - INTERVAL '7 days';
```

**목표**:
- Baseline: 75%
- Target: > 85%

---

#### 3. 이탈률 (Bounce Rate)
**정의**: 1페이지만 보고 떠나는 비율

**측정**: PostHog / GA4
**목표**:
- Baseline: 45%
- Target: < 25% (-44%)

---

#### 4. 평균 체류 시간 (Avg. Session Duration)
**정의**: 제품 페이지 평균 체류 시간

**목표**:
- Baseline: 45초
- Target: > 60초 (+33%)

---

### Secondary Metrics (보조 지표)

#### 5. 에러율 (Error Rate)
```javascript
// Sentry 측정
const errorRate = (errorCount / totalRequests) * 100;

// 목표
errorRate < 1%
```

**롤백 임계값**: > 2%

---

#### 6. 페이지 로딩 시간 (Page Load Time)
**측정**: Vercel Analytics / Lighthouse

**목표**:
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s

---

#### 7. API 응답 시간 (API Response Time)
```sql
-- Supabase 측정
SELECT
  AVG(response_time_ms) AS avg_response,
  P95(response_time_ms) AS p95_response
FROM api_logs
WHERE endpoint = '/api/price-tracking'
  AND timestamp >= NOW() - INTERVAL '1 hour';
```

**목표**:
- 평균: < 200ms
- P95: < 500ms

---

#### 8. 사용자 만족도 (User Satisfaction)
**측정 방법**:
- 인앱 설문 (참여 후 표시)
- Net Promoter Score (NPS)
- 고객 지원 티켓 분석

**질문**:
1. "네고딜 참여가 쉬웠나요?" (1-5)
2. "추천 가격이 합리적이었나요?" (1-5)
3. "친구에게 추천하시겠어요?" (NPS)

**목표**:
- 평균 만족도: > 4.0
- NPS: > 50

---

## 🎨 A/B 테스트 설계

### 실험 그룹 구성

#### Control Group (기존 UI)
**비율**: 50% (Week 4까지)
**특징**:
- SetTargetPriceWidget 사용
- "공동구매" + "가격 알림" 메뉴
- 기존 플로우 유지

#### Treatment Group (새 UI)
**비율**: 10% → 30% → 50% → 100%
**특징**:
- NegoDealWidget 사용
- "네고딜" 단일 메뉴
- AI 추천 가격 강조

---

### 사용자 할당 (User Assignment)

#### 일관성 보장
```typescript
// src/lib/feature-flags.ts
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function isFeatureEnabledForUser(
  userId: string,
  flag: FeatureFlag,
  rolloutPercent: number = 100
): boolean {
  const hash = simpleHash(userId + flag);
  const userPercent = hash % 100;
  return userPercent < rolloutPercent;
}
```

**특징**:
- ✅ 동일 사용자는 항상 같은 그룹
- ✅ 로그인/로그아웃 영향 없음
- ✅ 익명 사용자도 일관성 유지

---

### 통계적 유의성 (Statistical Significance)

#### 최소 샘플 크기 계산
```python
# 파라미터
baseline_rate = 0.05  # 5% 전환율
expected_lift = 0.50  # 50% 개선 (7.5% 목표)
confidence_level = 0.95  # 95% 신뢰도
power = 0.80  # 80% 검정력

# 결과 (Z-test 기반)
min_sample_size = 3,842명 (각 그룹)
total_sample = 7,684명

# 예상 기간 (일일 방문자 1,000명 기준)
- 10% 롤아웃: 약 8일 (100명/일 * 40일)
- 50% 롤아웃: 약 8일 (500명/일 * 8일)
```

#### 유의성 검정
```javascript
// 간단한 Z-test
function calculateSignificance(controlRate, treatmentRate, n1, n2) {
  const p = (n1 * controlRate + n2 * treatmentRate) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));
  const z = (treatmentRate - controlRate) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));

  return {
    zScore: z,
    pValue: pValue,
    significant: pValue < 0.05  // 95% 신뢰도
  };
}
```

**판단 기준**:
- p-value < 0.05: 통계적으로 유의미
- p-value > 0.05: 추가 데이터 필요 또는 효과 없음

---

## 🔧 구현 코드

### 1. 제품 상세 페이지에 A/B 테스트 적용

```typescript
// src/app/(main)/products/[id]/page.tsx
import { isFeatureEnabledForUser } from '@/lib/feature-flags';
import { NegoDealWidget } from '@/components/negodeal/NegoDealWidget';
import { SetTargetPriceWidget } from '@/components/price-tracking/SetTargetPriceWidget';
import { createClient } from '@/lib/supabase/server';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 롤아웃 비율 (환경변수로 제어)
  const rolloutPercent = parseInt(
    process.env.NEXT_PUBLIC_ROLLOUT_PERCENT || '100',
    10
  );

  // 사용자 ID 또는 익명 세션 ID
  const userId = user?.id || `anon-${params.id}`;  // 제품 ID 기반 일관성

  // A/B 테스트 그룹 결정
  const showUnifiedNegoDeal = isFeatureEnabledForUser(
    userId,
    'unified_negodeal',
    rolloutPercent
  );

  // Analytics 이벤트
  if (typeof window !== 'undefined') {
    window.analytics?.track('product_viewed', {
      product_id: params.id,
      variant: showUnifiedNegoDeal ? 'unified' : 'legacy',
      rollout_percent: rolloutPercent,
    });
  }

  // ... 제품 데이터 로딩 ...

  return (
    <div>
      {/* ... 다른 컴포넌트 ... */}

      {showUnifiedNegoDeal ? (
        <NegoDealWidget
          productId={product.id}
          productName={product.name}
          currentPrice={currentPrice}
          minPrice={minPrice}
          avgPrice={avgPrice}
        />
      ) : (
        <SetTargetPriceWidget
          productId={product.id}
          productName={product.name}
          currentPrice={currentPrice}
          minPrice={minPrice}
          avgPrice={avgPrice}
        />
      )}
    </div>
  );
}
```

---

### 2. Analytics 추적 이벤트

```typescript
// src/lib/analytics.ts
export const trackNegoDealEvent = {
  // 위젯 노출
  widgetViewed: (data: {
    product_id: string;
    variant: 'unified' | 'legacy';
    ai_recommended_price?: number;
    participant_count?: number;
  }) => {
    if (typeof window !== 'undefined') {
      window.analytics?.track('negodeal_widget_viewed', data);
      window.posthog?.capture('negodeal_widget_viewed', data);
    }
  },

  // 참여 클릭
  participateClicked: (data: {
    product_id: string;
    variant: 'unified' | 'legacy';
    target_price: number;
    is_ai_recommended: boolean;
  }) => {
    if (typeof window !== 'undefined') {
      window.analytics?.track('negodeal_participate_clicked', data);
      window.posthog?.capture('negodeal_participate_clicked', data);
    }
  },

  // 참여 완료
  participateCompleted: (data: {
    product_id: string;
    variant: 'unified' | 'legacy';
    target_price: number;
    success_probability: number;
    time_to_complete_ms: number;
  }) => {
    if (typeof window !== 'undefined') {
      window.analytics?.track('negodeal_participate_completed', data);
      window.posthog?.capture('negodeal_participate_completed', data);
    }
  },

  // 커스텀 가격 설정
  customPriceSet: (data: {
    product_id: string;
    variant: 'unified' | 'legacy';
    original_price: number;
    custom_price: number;
  }) => {
    if (typeof window !== 'undefined') {
      window.analytics?.track('negodeal_custom_price_set', data);
      window.posthog?.capture('negodeal_custom_price_set', data);
    }
  },
};
```

---

### 3. 서버사이드 A/B 테스트 로깅

```typescript
// src/lib/ab-test-logger.ts
import { createClient } from '@/lib/supabase/server';

export async function logABTestAssignment(
  userId: string,
  experimentName: string,
  variant: string,
  rolloutPercent: number
) {
  const supabase = await createClient();

  await supabase
    .from('ab_test_assignments')
    .upsert({
      user_id: userId,
      experiment_name: experimentName,
      variant: variant,
      rollout_percent: rolloutPercent,
      assigned_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,experiment_name',
    });
}
```

**DB 스키마 추가 필요**:
```sql
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  experiment_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  rollout_percent INTEGER NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, experiment_name)
);

CREATE INDEX idx_ab_test_user ON ab_test_assignments(user_id);
CREATE INDEX idx_ab_test_experiment ON ab_test_assignments(experiment_name);
```

---

## 📊 모니터링 대시보드

### Vercel Analytics Query
```typescript
// 전환율 비교
const conversionRateQuery = `
  SELECT
    variant,
    COUNT(DISTINCT user_id) AS total_users,
    COUNT(DISTINCT CASE WHEN event = 'participate_completed' THEN user_id END) AS converted_users,
    COUNT(DISTINCT CASE WHEN event = 'participate_completed' THEN user_id END) * 100.0 / COUNT(DISTINCT user_id) AS conversion_rate
  FROM analytics_events
  WHERE event IN ('widget_viewed', 'participate_completed')
    AND timestamp >= NOW() - INTERVAL '7 days'
  GROUP BY variant;
`;
```

### PostHog Funnel
```javascript
// PostHog Insight 설정
{
  "insight": "funnels",
  "events": [
    { "id": "negodeal_widget_viewed", "name": "위젯 노출" },
    { "id": "negodeal_participate_clicked", "name": "참여 클릭" },
    { "id": "negodeal_participate_completed", "name": "참여 완료" }
  ],
  "breakdown": "variant",  // unified vs legacy
  "date_from": "-7d"
}
```

### Sentry Performance
```javascript
// 트랜잭션 모니터링
Sentry.startTransaction({
  op: 'negodeal.participate',
  name: 'NegoDeal Participation Flow',
  tags: {
    variant: 'unified',  // or 'legacy'
    rollout_percent: 10,
  },
});
```

---

## 🚨 롤백 절차

### 자동 롤백 트리거

**조건** (하나라도 충족 시 자동 롤백):
1. 에러율 > 2% (5분 연속)
2. API 응답 시간 > 5초 (P95)
3. 페이지 로딩 실패율 > 5%

**구현** (Vercel Monitoring Webhook):
```typescript
// api/monitoring/rollback-check.ts
export async function POST(req: Request) {
  const { metric, value } = await req.json();

  const thresholds = {
    error_rate: 2.0,
    api_response_p95: 5000,
    page_load_failure: 5.0,
  };

  if (value > thresholds[metric]) {
    // 롤백: 환경변수 변경
    await updateVercelEnv('NEXT_PUBLIC_ROLLOUT_PERCENT', '0');

    // 알림
    await sendSlackAlert({
      message: `🚨 Auto-rollback triggered: ${metric} = ${value}`,
      severity: 'critical',
    });

    // Sentry 기록
    Sentry.captureMessage('Auto-rollback executed', {
      level: 'warning',
      tags: { metric, value },
    });
  }
}
```

---

### 수동 롤백 절차

**Step 1: 환경변수 변경**
```bash
# Vercel Dashboard 또는 CLI
vercel env rm NEXT_PUBLIC_ROLLOUT_PERCENT production
vercel env add NEXT_PUBLIC_ROLLOUT_PERCENT production
# 입력: 0  (또는 이전 안정 버전 비율)
```

**Step 2: 즉시 재배포**
```bash
git commit --allow-empty -m "Rollback: Disable unified negodeal"
git push origin main
```

**Step 3: 검증**
- 5분 후 에러율 확인
- 사용자 영향 최소화 확인
- Slack/이메일로 팀 알림

**Step 4: 사후 분석**
- 원인 파악 (Sentry 로그, 사용자 피드백)
- 수정 계획 수립
- 재배포 일정 결정

---

## ✅ 성공 기준

### Week 2 (10% 롤아웃)
- [ ] 에러율 < 1%
- [ ] 전환율 > 6% (+20%)
- [ ] 사용자 불만 < 5%
- [ ] 페이지 로딩 < 2초

### Week 4 (50% 롤아웃)
- [ ] 전환율 > 10% (+100%)
- [ ] 이탈률 < 30% (-33%)
- [ ] 통계적 유의성 확보 (p < 0.05)
- [ ] 인프라 안정성 입증

### Week 5 (100% 전환)
- [ ] 전환율 > 12% (+140%)
- [ ] 이탈률 < 25% (-44%)
- [ ] 사용자 만족도 > 4.0
- [ ] NPS > 50

---

## 📝 주간 리포트 템플릿

```markdown
# Week N 롤아웃 리포트

**기간**: YYYY-MM-DD ~ YYYY-MM-DD
**롤아웃 비율**: XX%

## 📊 주요 지표
| 지표 | Control | Treatment | 변화율 | 목표 달성 |
|------|---------|-----------|--------|-----------|
| 전환율 | 5.0% | X.X% | +X% | ✅/❌ |
| 이탈률 | 45% | X.X% | -X% | ✅/❌ |
| 완료율 | 75% | X.X% | +X% | ✅/❌ |
| 에러율 | - | 0.X% | - | ✅/❌ |

## 🎯 인사이트
- [주요 발견 사항 1]
- [주요 발견 사항 2]
- [개선 필요 사항]

## 🚨 이슈
- [Issue #1]: [설명] → [해결 방법]
- [Issue #2]: [설명] → [진행 중]

## 📈 다음 단계
- [ ] [Action 1]
- [ ] [Action 2]
- [ ] Week N+1 롤아웃 진행 여부: ✅ Yes / ❌ No

**작성자**: _______
**검토자**: _______
**다음 리뷰**: YYYY-MM-DD
```

---

## 🔗 관련 문서

- [프로덕션 테스트 가이드](./PRODUCTION_TESTING_GUIDE.md)
- [네고딜 통합 완료 보고서](./NEGODEAL_INTEGRATION_COMPLETE.md)
- [Feature Flags 가이드](./FEATURE_FLAGS.md)
- [모니터링 설정](./MONITORING_SETUP.md)

---

**작성**: 2025-01-20
**버전**: 1.0
**다음 업데이트**: Week 2 종료 후 (2월 2일)
