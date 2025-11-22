# 📊 모니터링 설정 가이드

**목적**: 에러 추적 및 사용자 행동 분석
**도구**: Sentry (에러), PostHog (Analytics)

---

## 🎯 모니터링 전략

### 1. Sentry - 에러 추적
- 런타임 에러 캡처
- 소스맵 지원 (정확한 에러 위치)
- 알림 (Slack, Email)
- Performance monitoring

### 2. PostHog - 사용자 행동 분석
- A/B 테스트 결과 추적
- 네고딜 참여 퍼널 분석
- 사용자 이벤트 추적
- Feature Flag 관리

---

## 🔴 Sentry 설정

### Step 1: Sentry 계정 생성 (2분)

1. **https://sentry.io** 접속
2. **Sign Up** (GitHub 계정 연동 가능)
3. Organization 생성

---

### Step 2: Next.js 프로젝트 생성 (3분)

1. **Create Project** 클릭
2. Platform 선택: **Next.js**
3. Project name: `igosa`
4. Alert settings: 기본값 유지
5. **Create Project** 클릭

---

### Step 3: DSN 복사 (1분)

프로젝트 생성 후 표시되는 정보:

```
Sentry DSN:
https://xxxxx@o123456.ingest.sentry.io/789012
```

→ 복사해두기

---

### Step 4: Sentry SDK 설치 (2분)

**이미 설치되어 있는지 확인**:
```bash
npm list @sentry/nextjs
```

**설치되어 있지 않다면**:
```bash
npx @sentry/wizard@latest -i nextjs
```

Wizard가 자동으로:
- SDK 설치
- `sentry.client.config.ts` 생성
- `sentry.server.config.ts` 생성
- `sentry.edge.config.ts` 생성
- `next.config.js` 수정

---

### Step 5: 환경변수 설정 (2분)

#### 로컬 (`.env.local`)
```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@o123456.ingest.sentry.io/789012"
SENTRY_AUTH_TOKEN="your-auth-token"
SENTRY_ORG="your-org"
SENTRY_PROJECT="igosa"
```

#### Vercel
```
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/789012
SENTRY_AUTH_TOKEN=your-auth-token
```

---

### Step 6: 테스트 에러 전송 (1분)

```typescript
// app/test-sentry/page.tsx
'use client';

import * as Sentry from '@sentry/nextjs';

export default function TestSentry() {
  return (
    <button onClick={() => {
      Sentry.captureException(new Error('Test error from igosa'));
    }}>
      Send Test Error to Sentry
    </button>
  );
}
```

**확인**:
1. http://localhost:3000/test-sentry 접속
2. 버튼 클릭
3. Sentry Dashboard에서 에러 확인

---

## 📈 PostHog 설정

### Step 1: PostHog 계정 생성 (2분)

1. **https://posthog.com** 접속
2. **Get started for free** 클릭
3. Email 가입 또는 GitHub 연동

---

### Step 2: 프로젝트 생성 (2분)

1. Organization 생성
2. Project 생성: `igosa`
3. Platform 선택: **Web**

---

### Step 3: Project API Key 복사 (1분)

```
Project API Key: phc_xxxxxxxxxxxxx
Host: https://app.posthog.com
```

---

### Step 4: PostHog SDK 설치 (2분)

**확인**:
```bash
npm list posthog-js
```

**설치**:
```bash
npm install posthog-js
```

---

### Step 5: PostHog 초기화 (3분)

**파일**: `src/lib/monitoring/posthog.ts` (이미 있음)

확인:
```typescript
import posthog from 'posthog-js';

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

export default posthog;
```

---

### Step 6: 환경변수 설정 (2분)

#### 로컬 (`.env.local`)
```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxxxxxxxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

#### Vercel
```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

### Step 7: 이벤트 테스트 (2분)

```typescript
// app/test-posthog/page.tsx
'use client';

import posthog from 'posthog-js';

export default function TestPostHog() {
  return (
    <button onClick={() => {
      posthog.capture('test_event', {
        property: 'value',
        source: 'test_page'
      });
      alert('Event sent to PostHog!');
    }}>
      Send Test Event
    </button>
  );
}
```

**확인**:
1. http://localhost:3000/test-posthog 접속
2. 버튼 클릭
3. PostHog Dashboard → Live Events에서 확인

---

## 🎯 네고딜 A/B 테스트 모니터링

### PostHog Funnel 설정

1. **PostHog Dashboard** → **Insights** → **New Insight**
2. **Funnel** 선택
3. 단계 추가:
   ```
   Step 1: negodeal_widget_viewed
   Step 2: negodeal_participate_clicked
   Step 3: negodeal_participate_completed
   ```
4. **Breakdown by**: `variant` (unified vs legacy)
5. **Save** → 이름: "NegoDeal Conversion Funnel"

---

### Sentry Performance Monitoring

1. **Sentry Dashboard** → **Performance**
2. **Transactions** 확인:
   - `/api/price-tracking` (POST)
   - `/api/demand/[productId]` (GET)
3. **Alerts** 설정:
   - Response time > 1s
   - Error rate > 5%

---

## 📧 알림 설정

### Sentry 알림

1. **Settings** → **Alerts**
2. **Create Alert Rule**
3. 조건:
   ```
   IF an event is seen
   AND matches {level: error}
   THEN send a notification to Slack/Email
   ```

### PostHog 알림

1. **Insights** → 생성한 Funnel 열기
2. **Alerts** 탭
3. 조건:
   ```
   IF conversion rate drops below 10%
   THEN send email notification
   ```

---

## 📊 대시보드 구성

### Sentry Dashboard

**추천 위젯**:
- Error frequency (last 24h)
- Top errors by count
- Affected users
- Release health

---

### PostHog Dashboard

**추천 Insights**:

1. **네고딜 참여 Funnel**
   - widget_viewed → clicked → completed

2. **Variant 비교**
   - Breakdown by: variant (unified vs legacy)

3. **커스텀 가격 사용률**
   - Event: `negodeal_custom_price_set`
   - % of total participations

4. **평균 참여 시간**
   - Event: `negodeal_participate_completed`
   - Property: `time_to_complete_ms`

5. **성공 확률 분포**
   - Event: `negodeal_participate_completed`
   - Property: `success_probability`

---

## 💰 비용 추정

### Sentry

**무료 티어**:
- 5,000 errors/월
- 10,000 performance transactions/월
- 1명 팀원

**예상 사용량** (igosa):
- ~2,000 errors/월 (개발 초기)
- ~5,000 transactions/월
- **무료 티어 충분** ✅

**Team 플랜** (필요 시):
- $26/월
- 50,000 errors
- 100,000 transactions

---

### PostHog

**무료 티어**:
- 1,000,000 events/월
- Unlimited users
- 모든 기능 포함

**예상 사용량** (igosa):
- ~100,000 events/월 (네고딜 관련)
- **무료 티어 충분** ✅

**Scale 플랜** (필요 시):
- $0.00031 per event (100만 이벤트 초과분)

---

## 🧪 테스트 체크리스트

### Sentry
- [ ] SDK 설치 완료
- [ ] 환경변수 설정 완료
- [ ] 테스트 에러 전송 성공
- [ ] Sentry Dashboard에서 확인
- [ ] 소스맵 업로드 확인

### PostHog
- [ ] SDK 설치 완료
- [ ] 환경변수 설정 완료
- [ ] 테스트 이벤트 전송 성공
- [ ] PostHog Dashboard에서 확인
- [ ] Funnel 생성 완료

---

## 🚨 문제 해결

### Issue 1: Sentry에 에러가 전송되지 않음

**해결**:
1. `NEXT_PUBLIC_SENTRY_DSN` 확인
2. 네트워크 탭에서 Sentry API 호출 확인
3. Ad blocker 비활성화

---

### Issue 2: PostHog 이벤트가 보이지 않음

**해결**:
1. `NEXT_PUBLIC_POSTHOG_KEY` 확인
2. 브라우저 콘솔에서 PostHog 디버그 로그 확인
3. Live Events에서 실시간 확인 (5초 지연 있음)

---

### Issue 3: 소스맵이 업로드되지 않음

**해결**:
```bash
# Sentry Auth Token 설정
SENTRY_AUTH_TOKEN="your-token"

# 빌드 시 소스맵 업로드
npm run build
```

---

## ✅ 설정 완료 체크리스트

**Sentry**:
- [ ] 계정 생성
- [ ] 프로젝트 생성
- [ ] SDK 설치
- [ ] 환경변수 설정 (로컬 + Vercel)
- [ ] 테스트 에러 전송 성공

**PostHog**:
- [ ] 계정 생성
- [ ] 프로젝트 생성
- [ ] SDK 설치
- [ ] 환경변수 설정 (로컬 + Vercel)
- [ ] 테스트 이벤트 전송 성공
- [ ] 네고딜 Funnel 생성

**알림**:
- [ ] Sentry 알림 설정 (Slack/Email)
- [ ] PostHog 알림 설정 (선택)

---

## 📚 참고 문서

- **Sentry Next.js**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **PostHog Next.js**: https://posthog.com/docs/libraries/next-js
- **네고딜 Analytics 가이드**: `src/lib/analytics/negodeal-events.ts`

---

**작성**: 2025-01-20
**프로젝트**: igosa-production
**도구**: Sentry + PostHog
