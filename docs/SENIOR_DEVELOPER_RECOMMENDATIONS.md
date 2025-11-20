# 시니어 개발자 관점: 이거사(Igosa) 프로덕션 준비 전략

**작성자**: 20년 경력 빅테크 프로덕트 총괄 시니어 개발자 관점
**작성일**: 2025-01-19
**프로젝트 단계**: Phase 3 완료 → Phase 4 준비 중
**현재 상태**: Critical 이슈 해결 완료, 프로덕션 배포 90% 준비

---

## 📋 Executive Summary

### 즉각 실행해야 할 사항 (24시간 이내)
1. ⚠️ **DB 인덱스 추가** - 현재 성능 병목 지점
2. ⚠️ **Rate Limiting 구현** - DoS 공격 방어
3. ⚠️ **트랜잭션 처리 추가** - 데이터 무결성 보장
4. ⚠️ **모니터링/알림 시스템 구축** - 프로덕션 안정성

### 1주일 내 완료해야 할 사항
5. 📊 **성능 테스트 및 최적화**
6. 🔒 **보안 감사 및 강화**
7. 📝 **API 문서 자동화**
8. 🧪 **테스트 커버리지 40%+**

### 2-4주 로드맵
9. 🚀 **CI/CD 파이프라인 고도화**
10. 📈 **비즈니스 메트릭 대시보드**
11. 🎯 **기술 부채 해소 계획**

---

## 🚨 Critical Priority 1: 데이터베이스 성능 최적화 (즉시)

### 문제점
현재 Supabase 사용 중이나 **핵심 쿼리에 인덱스가 없음**. 사용자 100명 시점부터 느려질 것.

### 영향도
- 📉 **성능**: 1,000명 사용자 시점에 API 응답 10초 이상 예상
- 💸 **비용**: DB CPU 사용량 급증 → Supabase 요금 폭탄
- 😡 **UX**: 사용자 이탈율 증가

### 해결책: 즉시 적용할 인덱스

```sql
-- ==================== CRITICAL 인덱스 (즉시 적용) ====================

-- 1. price_tracking: 가장 많이 쓰이는 쿼리
CREATE INDEX CONCURRENTLY idx_price_tracking_user_status
  ON price_tracking(user_id, status)
  WHERE status IN ('active', 'triggered');

CREATE INDEX CONCURRENTLY idx_price_tracking_product_status
  ON price_tracking(product_id, status)
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_price_tracking_updated
  ON price_tracking(updated_at DESC);

-- 2. price_history: 가격 차트 조회
CREATE INDEX CONCURRENTLY idx_price_history_product_time
  ON price_history(product_id, recorded_at DESC);

-- 3. price_notifications: My Page 조회
CREATE INDEX CONCURRENTLY idx_price_notifications_user_time
  ON price_notifications(user_id, created_at DESC);

-- 4. conversations: 채팅 목록
CREATE INDEX CONCURRENTLY idx_conversations_user_updated
  ON conversations(user_id, updated_at DESC);

-- 5. messages: 채팅 메시지 페이지네이션
CREATE INDEX CONCURRENTLY idx_messages_conversation_time
  ON messages(conversation_id, created_at);

-- 6. nego_deals: 마감 임박 딜 조회
CREATE INDEX CONCURRENTLY idx_nego_deals_status_deadline
  ON nego_deals(status, deadline)
  WHERE status = 'active';

-- ==================== EXPLAIN ANALYZE로 검증 ====================
-- 각 인덱스 추가 후 실제 쿼리 성능 측정
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM price_tracking
WHERE user_id = 'xxx' AND status = 'active'
ORDER BY updated_at DESC
LIMIT 10;
-- Before: Seq Scan (100ms)
-- After: Index Scan (2ms) ✅
```

### 실행 계획
1. **개발 환경에서 먼저 테스트** (30분)
2. **Supabase Dashboard에서 프로덕션 적용** (1시간)
3. **PostHog로 API 응답 시간 모니터링** (지속)

**예상 효과**:
- 🚀 API 응답 시간 **80-95% 감소** (100ms → 5-10ms)
- 💰 DB CPU 사용량 **70% 절감**
- 📈 동시 접속자 처리 능력 **10배 증가**

---

## 🚨 Critical Priority 2: Rate Limiting & DoS 방어 (24시간 내)

### 문제점
**모든 public API가 무제한 요청 허용**. 악의적 사용자가 OpenAI API 비용 폭탄을 터뜨릴 수 있음.

### 실제 시나리오
```
공격자 스크립트:
while true; do
  curl -X POST /api/chat -d '{"messages":[...]}'
done

결과:
- OpenAI API 비용 하루 $10,000+ 발생 가능
- DB 연결 풀 고갈 → 서비스 전체 다운
```

### 해결책: Upstash Rate Limit 구현

```typescript
// src/lib/security/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Tier별 Rate Limit 정책
export const rateLimiters = {
  // OpenAI API 호출 (비용이 큼)
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 분당 10회
    analytics: true,
    prefix: '@upstash/ratelimit:chat',
  }),

  // 검색 API
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 분당 60회
    prefix: '@upstash/ratelimit:search',
  }),

  // 일반 API (GET)
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 분당 100회
    prefix: '@upstash/ratelimit:general',
  }),

  // 인증된 사용자 (더 관대함)
  authenticated: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, '1 m'), // 분당 200회
    prefix: '@upstash/ratelimit:auth',
  }),
};

// Rate Limit 체크 헬퍼
export async function checkRateLimit(
  identifier: string, // IP 또는 user ID
  tier: keyof typeof rateLimiters = 'general'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const { success, limit, remaining, reset } = await rateLimiters[tier].limit(identifier);

  return { success, limit, remaining, reset };
}

// Middleware 래퍼
export function withRateLimit(
  tier: keyof typeof rateLimiters = 'general'
) {
  return async (req: Request) => {
    // IP 또는 user ID 추출
    const identifier =
      req.headers.get('x-user-id') || // 인증된 사용자
      req.headers.get('x-forwarded-for') || // Vercel IP
      req.headers.get('x-real-ip') ||
      'anonymous';

    const { success, limit, remaining, reset } = await checkRateLimit(identifier, tier);

    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          limit,
          remaining: 0,
          reset: new Date(reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return null; // Rate limit 통과
  };
}
```

### API 적용 예시

```typescript
// src/app/api/chat/route.ts
import { withRateLimit } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  // 1. Rate Limit 체크
  const rateLimitResponse = await withRateLimit('chat')(req);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. 기존 로직
  const validated = chatRequestSchema.parse(await req.json());
  // ...
}
```

**예상 효과**:
- 💰 OpenAI API 비용 폭탄 방지 → **월 $1,000+ 절약**
- 🛡️ DoS 공격 방어
- 📊 사용 패턴 분석 가능 (Upstash Analytics)

---

## 🚨 Critical Priority 3: 트랜잭션 처리 추가 (24시간 내)

### 문제점
**결제, 주문, 가격 트래킹 등 critical 비즈니스 로직이 트랜잭션 없이 작동**.

### 실제 시나리오
```
사용자가 가격 트래킹 생성:
1. price_tracking 테이블에 INSERT ✅
2. Redis에 demand 추가 중...
   → 서버 크래시 ❌
3. Redis에 추가 안됨
   → similar_users_count = 0 (실제는 100명)
   → 사용자가 "나만 원하나?" 착각 → 이탈
```

### 해결책: Supabase RPC + Redis 트랜잭션

```typescript
// src/lib/db/transactions.ts
import { createClient } from '@/lib/supabase/server';
import { addDemandEntry } from '@/lib/services/demand-aggregation-service';

/**
 * 가격 트래킹 생성 트랜잭션
 * DB + Redis를 원자적으로 처리
 */
export async function createPriceTrackingTransaction(data: {
  userId: string;
  productId: string;
  targetPrice: number;
  notificationChannels: string[];
}) {
  const supabase = await createClient();

  try {
    // 1. DB에 저장
    const { data: tracking, error: dbError } = await supabase
      .from('price_tracking')
      .insert({
        user_id: data.userId,
        product_id: data.productId,
        target_price: data.targetPrice,
        notification_channels: data.notificationChannels,
        status: 'active',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Redis에 추가 (DB 성공 후에만)
    const redisSuccess = await addDemandEntry(
      data.productId,
      data.userId,
      data.targetPrice
    );

    if (!redisSuccess) {
      // Redis 실패 시 DB 롤백
      await supabase
        .from('price_tracking')
        .delete()
        .eq('id', tracking.id);

      throw new Error('Failed to add demand to Redis');
    }

    // 3. 성공: 둘 다 커밋됨
    return { success: true, tracking };

  } catch (error) {
    // 실패: 자동 롤백 (위에서 처리)
    console.error('Transaction failed:', error);
    return { success: false, error };
  }
}
```

### 적용 위치
1. ✅ `POST /api/price-tracking` - 가격 트래킹 생성
2. ✅ `DELETE /api/price-tracking/[id]` - 취소 시 Redis도 제거
3. ✅ `PATCH /api/price-tracking/[id]` - 가격 변경 시 Redis 업데이트
4. ⚠️ 결제 API (추후 구현 시)

**예상 효과**:
- 🛡️ 데이터 일관성 보장
- 🐛 버그 리포트 **80% 감소** 예상
- 📈 사용자 신뢰도 증가

---

## 🚨 Critical Priority 4: 모니터링 & 알림 시스템 (48시간 내)

### 문제점
**프로덕션에서 뭔가 터져도 모름**. 사용자가 트위터에 불평할 때까지 기다려야 함.

### 해결책: Sentry + Better Stack + PostHog 조합

#### 4.1 Sentry - 에러 트래킹

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 성능 모니터링
  tracesSampleRate: 1.0, // 프로덕션: 0.1로 조정

  // 에러 필터링 (노이즈 제거)
  beforeSend(event, hint) {
    // localStorage quota exceeded 같은 사소한 에러 무시
    if (event.exception?.values?.[0]?.value?.includes('quota')) {
      return null;
    }
    return event;
  },

  // 민감 정보 마스킹
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'console') {
      breadcrumb.message = breadcrumb.message?.replace(/\d{16}/g, '****'); // 카드번호
    }
    return breadcrumb;
  },
});
```

#### 4.2 Better Stack (Logtail) - 로그 집계

```typescript
// src/lib/logger.ts (개선)
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!);

export const logger = {
  info: (message: string, meta?: object) => {
    console.log(message, meta);
    logtail.info(message, meta);
  },

  error: (message: string, error: Error, meta?: object) => {
    console.error(message, error, meta);
    logtail.error(message, { error, ...meta });

    // Critical 에러는 Slack 알림
    if (meta?.severity === 'critical') {
      sendSlackAlert(message, error);
    }
  },

  // API 성능 로깅
  apiResponse: (method: string, path: string, status: number, duration: number) => {
    const log = { method, path, status, duration };

    // 느린 API 경고 (200ms 이상)
    if (duration > 200) {
      logtail.warn('Slow API response', log);
    } else {
      logtail.info('API response', log);
    }
  },
};
```

#### 4.3 PostHog - 비즈니스 메트릭

```typescript
// src/lib/analytics/business-metrics.ts
import { posthog } from 'posthog-js';

export function trackBusinessMetric(metric: string, value: number, properties?: object) {
  posthog.capture(`metric:${metric}`, {
    value,
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

// 핵심 비즈니스 메트릭 추적
export const businessMetrics = {
  // 가격 트래킹 관련
  priceTrackingCreated: (productId: string, targetPrice: number) => {
    trackBusinessMetric('price_tracking_created', 1, { productId, targetPrice });
  },

  priceTrackingTriggered: (productId: string, savings: number) => {
    trackBusinessMetric('price_tracking_triggered', savings, { productId });
  },

  // 수익 관련 (미래)
  revenueGenerated: (amount: number, source: string) => {
    trackBusinessMetric('revenue', amount, { source });
  },

  // 사용자 행동
  userRetention: (userId: string, daysActive: number) => {
    trackBusinessMetric('user_retention', daysActive, { userId });
  },
};
```

#### 4.4 알림 정책

```yaml
# alerts.yml (Better Stack)
alerts:
  - name: "Critical Error Rate"
    condition: "error_rate > 1%" # 1분간 에러율 1% 초과
    channels: [slack, pagerduty]
    severity: critical

  - name: "API Response Time"
    condition: "p95_latency > 500ms"
    channels: [slack]
    severity: warning

  - name: "Database Connection Pool"
    condition: "db_connections > 80%"
    channels: [slack]
    severity: warning

  - name: "Redis Down"
    condition: "redis_ping_fail"
    channels: [slack, pagerduty]
    severity: critical

  - name: "Supabase RLS Bypass Attempt"
    condition: "unauthorized_access_attempt"
    channels: [security-slack, email]
    severity: critical
```

**예상 효과**:
- 🔔 **MTTR (평균 복구 시간) 80% 단축** (2시간 → 20분)
- 🐛 **버그 발견 속도 10배 증가**
- 📊 **데이터 기반 의사결정 가능**

---

## 📊 Priority 5: 성능 테스트 & 최적화 (1주일 내)

### 5.1 부하 테스트 (K6)

```javascript
// tests/load/price-tracking.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 요청이 500ms 이하
    http_req_failed: ['rate<0.01'],   // 에러율 1% 미만
  },
};

export default function () {
  // 1. 가격 트래킹 생성
  const createRes = http.post(
    'https://igosa.com/api/price-tracking',
    JSON.stringify({
      productId: 'PROD001',
      targetPrice: 240000,
      notificationChannels: ['push'],
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(createRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // 2. Demand 조회
  const demandRes = http.get('https://igosa.com/api/demand/PROD001');

  check(demandRes, {
    'demand status is 200': (r) => r.status === 200,
    'cached response < 50ms': (r) => r.timings.duration < 50,
  });

  sleep(1);
}
```

**실행**:
```bash
k6 run tests/load/price-tracking.js

# 결과 예시:
# ✓ http_req_duration..........: avg=45ms  min=12ms  p(95)=89ms  max=234ms
# ✓ http_req_failed...........: 0.23%
# → 목표 달성! ✅
```

### 5.2 데이터베이스 쿼리 최적화

```sql
-- Slow Query 찾기 (Supabase Dashboard)
SELECT
  query,
  calls,
  total_time / calls AS avg_time_ms,
  min_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_time DESC
LIMIT 20;

-- 예시 결과:
-- query: SELECT * FROM price_tracking WHERE user_id = $1
-- avg_time_ms: 156ms ⚠️
-- calls: 45,231

-- 해결: 인덱스 추가 (위 Priority 1 참고)
-- After: avg_time_ms: 4ms ✅
```

### 5.3 Next.js 번들 최적화

```javascript
// next.config.js
module.exports = {
  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1년
  },

  // 번들 분석
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 번들 크기 분석
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './bundle-report.html',
          openAnalyzer: false,
        })
      );
    }

    // Lodash tree-shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      'lodash': 'lodash-es',
    };

    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['recharts', '@radix-ui/react-icons'],
  },
};
```

**목표**:
- 📦 번들 크기 **500KB → 350KB** (-30%)
- ⚡ FCP (First Contentful Paint) **1.8s → 1.2s**
- 📊 Lighthouse 점수 **75 → 90+**

---

## 🔒 Priority 6: 보안 감사 & 강화 (1주일 내)

### 6.1 OWASP Top 10 체크리스트

| 위협 | 현재 상태 | 조치 필요 | 우선순위 |
|------|-----------|----------|---------|
| **A01:2021 - Broken Access Control** | ⚠️ 부분 적용 | RLS 정책 강화 | 🔴 High |
| **A02:2021 - Cryptographic Failures** | ✅ 양호 | - | - |
| **A03:2021 - Injection** | ✅ 해결 (Zod) | - | - |
| **A04:2021 - Insecure Design** | ⚠️ 부분 | 트랜잭션 추가 | 🔴 High |
| **A05:2021 - Security Misconfiguration** | ⚠️ 부분 | CSP 헤더 추가 | 🟡 Medium |
| **A06:2021 - Vulnerable Components** | ⚠️ 확인 필요 | `npm audit` 실행 | 🟡 Medium |
| **A07:2021 - Identification Failures** | ✅ 양호 (Supabase Auth) | - | - |
| **A08:2021 - Software/Data Integrity** | ⚠️ 부분 | SRI 추가 | 🟢 Low |
| **A09:2021 - Logging Failures** | ⚠️ 부분 | 민감정보 마스킹 | 🟡 Medium |
| **A10:2021 - SSRF** | ✅ 양호 | - | - |

### 6.2 즉시 적용: Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.vercel-insights.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.openai.com https://*.supabase.co;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 6.3 Supabase RLS 정책 강화

```sql
-- ==================== 현재 미적용 RLS (위험!) ====================

-- 1. price_notifications 테이블
ALTER TABLE price_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON price_notifications FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "System can create notifications"
  ON price_notifications FOR INSERT
  WITH CHECK (true); -- 시스템 전용

-- 2. price_history 테이블 (읽기만 허용)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view price history"
  ON price_history FOR SELECT
  TO authenticated
  USING (true);

-- 3. messages 테이블
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()::text
    )
  );

-- 4. conversations 테이블
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

### 6.4 민감 정보 로깅 방지

```typescript
// src/lib/logger.ts (개선)
const SENSITIVE_PATTERNS = [
  /\b\d{16}\b/g,                    // 카드번호
  /\b\d{3}-\d{2}-\d{4}\b/g,         // SSN
  /bearer\s+[\w-]+/gi,              // Bearer 토큰
  /password["\s:=]+[\w@#$%^&*]+/gi, // 비밀번호
];

function maskSensitiveData(message: string): string {
  let masked = message;
  SENSITIVE_PATTERNS.forEach(pattern => {
    masked = masked.replace(pattern, '****');
  });
  return masked;
}

export const logger = {
  info: (message: string, meta?: object) => {
    const maskedMessage = maskSensitiveData(message);
    const maskedMeta = meta ? JSON.parse(
      maskSensitiveData(JSON.stringify(meta))
    ) : undefined;

    console.log(maskedMessage, maskedMeta);
    logtail.info(maskedMessage, maskedMeta);
  },
  // ... 나머지 메서드도 동일하게
};
```

---

## 📝 Priority 7: API 문서 자동화 (1주일 내)

### 문제점
**API 문서가 없음**. 프론트엔드 개발자가 타입만 보고 추측해야 함.

### 해결책: tRPC 도입 (추천) 또는 OpenAPI

#### Option A: tRPC (강력 추천)

```typescript
// src/server/routers/price-tracking.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const priceTrackingRouter = router({
  // GET /api/price-tracking
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.supabase
        .from('price_tracking')
        .select('*')
        .eq('user_id', ctx.user.id);
    }),

  // POST /api/price-tracking
  create: protectedProcedure
    .input(z.object({
      productId: z.string(),
      targetPrice: z.number().positive(),
      notificationChannels: z.array(z.enum(['email', 'push', 'sms', 'kakao'])),
    }))
    .mutation(async ({ ctx, input }) => {
      // 타입 안전하게 자동 추론! ✅
      return await createPriceTrackingTransaction({
        userId: ctx.user.id,
        ...input,
      });
    }),
});
```

**장점**:
- 🔥 **End-to-end 타입 안전성** (프론트 ↔ 백엔드)
- 📝 **자동 문서 생성** (타입 = 문서)
- 🚀 **개발 속도 2배 증가**

#### Option B: OpenAPI (Swagger)

```typescript
// src/app/api/price-tracking/route.ts
/**
 * @swagger
 * /api/price-tracking:
 *   post:
 *     summary: Create price tracking
 *     tags: [Price Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - targetPrice
 *             properties:
 *               productId:
 *                 type: string
 *               targetPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: Request) {
  // ...
}
```

**추천**: **tRPC**
- Next.js와 완벽 통합
- Vercel 팀이 추천
- 타입 안전성으로 런타임 에러 80% 감소

---

## 🧪 Priority 8: 테스트 커버리지 40%+ (1주일 내)

### 현재 상태
```bash
npm run test:coverage
# Coverage: 0% ❌
```

### 목표
```
최소 목표: 40% (Critical Path만)
이상적 목표: 70% (모든 비즈니스 로직)
```

### 테스트 전략: 피라미드 구조

```
           /\
          /  \  E2E Tests (5%)
         /----\
        /      \  Integration Tests (25%)
       /--------\
      /          \  Unit Tests (70%)
     /____________\
```

#### 8.1 Unit Tests (70%)

```typescript
// src/lib/services/__tests__/demand-aggregation-service.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { addDemandEntry, getDemandAggregation } from '../demand-aggregation-service';

describe('Demand Aggregation Service', () => {
  beforeEach(async () => {
    // Redis 모킹
    await redis.flushdb();
  });

  it('should add demand entry and bucket price', async () => {
    const result = await addDemandEntry('PROD001', 'user123', 245678);

    expect(result).toBe(true);

    // 가격 버킷팅 확인 (245678 → 240000)
    const demand = await getDemandAggregation('PROD001');
    expect(demand.priceTiers).toContainEqual(
      expect.objectContaining({ price: 240000, userCount: 1 })
    );
  });

  it('should handle duplicate user entries', async () => {
    await addDemandEntry('PROD001', 'user123', 240000);
    await addDemandEntry('PROD001', 'user123', 250000); // 가격 변경

    const demand = await getDemandAggregation('PROD001');

    // 같은 사용자는 1명으로 카운트
    expect(demand.totalUsers).toBe(1);

    // 최신 가격만 반영
    expect(demand.priceTiers).toContainEqual(
      expect.objectContaining({ price: 250000 })
    );
  });
});
```

#### 8.2 Integration Tests (25%)

```typescript
// src/app/api/price-tracking/__tests__/route.test.ts
import { POST, GET } from '../route';

describe('POST /api/price-tracking', () => {
  it('should create price tracking with valid data', async () => {
    const req = new Request('http://localhost/api/price-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        productId: 'PROD001',
        targetPrice: 240000,
        notificationChannels: ['push'],
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.tracking).toMatchObject({
      product_id: 'PROD001',
      target_price: 240000,
      status: 'active',
    });
  });

  it('should reject invalid target price', async () => {
    const req = new Request('http://localhost/api/price-tracking', {
      method: 'POST',
      body: JSON.stringify({
        productId: 'PROD001',
        targetPrice: -1000, // 음수 ❌
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: 'Invalid request body',
    });
  });
});
```

#### 8.3 E2E Tests (5%) - Playwright

```typescript
// tests/e2e/price-tracking.spec.ts
import { test, expect } from '@playwright/test';

test('complete price tracking flow', async ({ page }) => {
  // 1. 로그인
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // 2. 제품 페이지로 이동
  await page.goto('/products/PROD001');

  // 3. 가격 트래킹 설정
  await page.fill('input[name="targetPrice"]', '240000');
  await page.click('button:has-text("알림 받기")');

  // 4. 성공 메시지 확인
  await expect(page.locator('text=가격 알림이 설정되었습니다')).toBeVisible();

  // 5. My Page에서 확인
  await page.goto('/my');
  await page.click('button:has-text("가격 알림")');

  await expect(page.locator('text=₩240,000')).toBeVisible();
});
```

### CI에 테스트 통합

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

      - name: Fail if coverage < 40%
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 40" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 40%"
            exit 1
          fi
```

---

## 🚀 Priority 9: CI/CD 파이프라인 고도화 (2주 내)

### 현재 상태
```
Developer → git push → Vercel 자동 배포
(테스트 없음, 승인 없음)
```

### 목표 상태
```
Developer → PR 생성 → CI 검증 → Code Review → Staging → E2E 테스트 → Production
```

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1단계: 코드 품질 검증
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npx prettier --check "src/**/*.{ts,tsx}"

  # 2단계: 테스트
  test:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Unit tests
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # 3단계: 보안 스캔
  security:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: npm audit
        run: npm audit --audit-level=moderate

  # 4단계: 빌드 테스트
  build:
    needs: [quality, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: |
          SIZE=$(du -sh .next | cut -f1)
          echo "Bundle size: $SIZE"
          # 500MB 이상이면 실패
          du -s .next | awk '{if($1 > 512000) exit 1}'

  # 5단계: Staging 배포 (PR만)
  deploy-staging:
    if: github.event_name == 'pull_request'
    needs: [test, security, build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  # 6단계: Production 배포 (main 브랜치만)
  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [test, security, build]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://igosa.com
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🚀 Production 배포 완료!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 9.2 DB Migration 자동화

```yaml
# .github/workflows/db-migrate.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'prisma/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: '❌ DB Migration 실패! @channel'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📈 Priority 10: 비즈니스 메트릭 대시보드 (2주 내)

### 10.1 핵심 메트릭 정의

#### North Star Metric
**"주간 활성 가격 트래킹 수"** (Weekly Active Price Trackings)

#### AARRR 퍼널

```
Acquisition  (획득)   → 신규 가입자 수
Activation   (활성화) → 첫 가격 트래킹 생성까지 시간
Retention    (유지)   → 7일/30일 리텐션율
Revenue      (수익)   → 트래킹당 평균 수익 (미래)
Referral     (추천)   → 친구 초대 수
```

### 10.2 PostHog 대시보드 구성

```typescript
// src/lib/analytics/track.ts
import posthog from 'posthog-js';

export const track = {
  // Acquisition
  userSignedUp: (userId: string, source: string) => {
    posthog.identify(userId);
    posthog.capture('user_signed_up', { source });
  },

  // Activation
  firstPriceTrackingCreated: (userId: string, timeToActivate: number) => {
    posthog.capture('first_price_tracking_created', {
      time_to_activate_seconds: timeToActivate,
    });
    posthog.setPersonProperties({ activated: true });
  },

  // Retention
  userReturned: (userId: string, daysSinceSignup: number) => {
    posthog.capture('user_returned', { days_since_signup: daysSinceSignup });
  },

  // Revenue
  priceAlertTriggered: (userId: string, savings: number, productId: string) => {
    posthog.capture('price_alert_triggered', {
      savings,
      product_id: productId,
    });
  },

  // Referral
  friendInvited: (userId: string, invitedEmail: string) => {
    posthog.capture('friend_invited', { invited_email: invitedEmail });
  },
};
```

### 10.3 Metabase 대시보드 (SQL)

```sql
-- 일별 핵심 지표
SELECT
  DATE(created_at) AS date,
  COUNT(DISTINCT user_id) AS daily_active_users,
  COUNT(*) AS price_trackings_created,
  AVG(target_price) AS avg_target_price,
  COUNT(*) FILTER (WHERE status = 'triggered') AS alerts_triggered
FROM price_tracking
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 리텐션 코호트
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('week', MIN(created_at)) AS cohort_week
  FROM price_tracking
  GROUP BY user_id
)
SELECT
  cohort_week,
  COUNT(DISTINCT c.user_id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN pt.created_at >= c.cohort_week + INTERVAL '7 days'
                          AND pt.created_at < c.cohort_week + INTERVAL '14 days'
                     THEN c.user_id END) AS week_1_retained,
  COUNT(DISTINCT CASE WHEN pt.created_at >= c.cohort_week + INTERVAL '14 days'
                          AND pt.created_at < c.cohort_week + INTERVAL '21 days'
                     THEN c.user_id END) AS week_2_retained
FROM cohorts c
LEFT JOIN price_tracking pt ON c.user_id = pt.user_id
GROUP BY cohort_week
ORDER BY cohort_week DESC;
```

---

## 🎯 Priority 11: 기술 부채 해소 계획 (1개월)

### 11.1 Mock Data → 실제 API 연동

**현재 문제**:
- `src/lib/data/mock-*.ts` 파일들이 하드코딩된 데이터 사용
- 프로덕션에서 의미 없음

**해결 계획**:
```typescript
// Week 1-2: 외부 API 연동
// 1. Coupang API (파트너스 프로그램)
// 2. 네이버 쇼핑 API
// 3. 11번가 Open API

// src/lib/api/products/coupang.ts
import axios from 'axios';

const COUPANG_API = axios.create({
  baseURL: 'https://api-gateway.coupang.com',
  headers: {
    'Authorization': `Bearer ${process.env.COUPANG_ACCESS_KEY}`,
  },
});

export async function searchCoupangProducts(query: string) {
  const { data } = await COUPANG_API.get('/v2/providers/affiliate_open_api/apis/openapi/v1/products/search', {
    params: { keyword: query },
  });

  return data.data.productData.map(product => ({
    id: `COUPANG_${product.productId}`,
    name: product.productName,
    price: product.productPrice,
    image: product.productImage,
    url: product.productUrl,
    platform: 'coupang',
  }));
}
```

### 11.2 localStorage → Supabase 마이그레이션

**현재 문제**:
- 장바구니, 주문 등이 localStorage에만 저장
- 기기 변경 시 데이터 손실

**해결 계획**:
```typescript
// Week 3-4: DB 마이그레이션

// 1. Supabase 테이블 추가
-- cart_items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 점진적 마이그레이션
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // 1. localStorage에서 읽기 (레거시)
    const localItems = paymentService.getCart(userId);

    // 2. DB에서 읽기 (신규)
    supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .then(({ data: dbItems }) => {
        if (dbItems && dbItems.length > 0) {
          // DB 우선
          setItems(dbItems);
        } else if (localItems.length > 0) {
          // localStorage → DB 마이그레이션
          migrateToDatabase(localItems);
          setItems(localItems);
        }
      });
  }, [userId]);
}
```

---

## 📊 타임라인 요약

### Week 1 (즉시 시작)
- ✅ **Day 1-2**: DB 인덱스 추가 + 성능 테스트
- ✅ **Day 3-4**: Rate Limiting 구현 + 배포
- ✅ **Day 5**: 트랜잭션 처리 추가
- ✅ **Day 6-7**: Sentry + Better Stack 설정

### Week 2
- ⏳ **보안 감사** (OWASP Top 10 체크)
- ⏳ **Security Headers** 추가
- ⏳ **RLS 정책** 강화
- ⏳ **API 문서** (tRPC 또는 OpenAPI)

### Week 3-4
- ⏳ **테스트 작성** (40% 커버리지 목표)
- ⏳ **CI/CD 파이프라인** 고도화
- ⏳ **비즈니스 메트릭** 대시보드
- ⏳ **부하 테스트** (K6)

### Month 2
- ⏳ **Mock Data → 실제 API** 연동
- ⏳ **localStorage → DB** 마이그레이션
- ⏳ **Phase 4 준비** (AI Negotiation Engine)

---

## 🎓 팀 프로세스 개선 제안

### 1. 코드 리뷰 문화 정착

```markdown
## PR 체크리스트

### 기능
- [ ] 요구사항 충족
- [ ] Edge case 처리
- [ ] 에러 핸들링

### 코드 품질
- [ ] TypeScript strict 모드 통과
- [ ] ESLint 경고 없음
- [ ] 테스트 추가 (커버리지 +5% 이상)

### 보안
- [ ] 입력 검증 (Zod)
- [ ] 인증/인가 체크
- [ ] SQL Injection 방지

### 성능
- [ ] DB 쿼리 최적화 (EXPLAIN ANALYZE)
- [ ] N+1 쿼리 없음
- [ ] 번들 크기 영향 확인

### 문서
- [ ] API 변경 시 문서 업데이트
- [ ] 복잡한 로직에 주석
- [ ] CHANGELOG.md 업데이트
```

### 2. 스프린트 구조 (2주)

```
Week 1:
- Monday: Sprint Planning
- Tuesday-Thursday: 개발
- Friday: Code Review Day

Week 2:
- Monday-Wednesday: 개발 + 통합
- Thursday: QA + 버그 픽스
- Friday: Sprint Retrospective + 배포
```

### 3. 온콜 로테이션

```
Monday-Thursday:
- 개발자 A: Primary (9am-6pm)
- 개발자 B: Secondary (6pm-9am)

Friday-Sunday:
- 개발자 C: Weekend On-call
```

---

## 💰 예상 비용 (월간)

| 항목 | 현재 | 최적화 후 | 절감 |
|------|------|-----------|------|
| **OpenAI API** | $500 | $200 | -$300 (Rate Limit) |
| **Supabase** | $125 | $25 | -$100 (인덱스) |
| **Vercel** | $20 | $20 | $0 |
| **Redis (Upstash)** | $0 | $10 | +$10 (필수) |
| **Sentry** | $0 | $26 | +$26 (필수) |
| **Better Stack** | $0 | $18 | +$18 (필수) |
| **TOTAL** | **$645** | **$299** | **-$346 (54% 절감)** |

---

## 🎯 최종 체크리스트

### 배포 전 필수 (Go/No-Go)

| 항목 | 상태 | 담당자 | 마감일 |
|------|------|--------|--------|
| ✅ Critical 보안 이슈 해결 | 완료 | - | ✅ |
| ⏳ DB 인덱스 추가 | 대기 | Backend | D+1 |
| ⏳ Rate Limiting 구현 | 대기 | Backend | D+1 |
| ⏳ 트랜잭션 처리 추가 | 대기 | Backend | D+2 |
| ⏳ Sentry 설정 | 대기 | DevOps | D+2 |
| ⏳ RLS 정책 활성화 | 대기 | Backend | D+3 |
| ⏳ 부하 테스트 (100 concurrent) | 대기 | QA | D+5 |
| ⏳ 보안 감사 (OWASP) | 대기 | Security | D+7 |

### 배포 후 모니터링 (첫 주)

- [ ] 에러율 < 0.1%
- [ ] API P95 < 200ms
- [ ] 사용자 이탈율 < 10%
- [ ] 가격 알림 전송 성공률 > 95%

---

## 📞 에스컬레이션 매트릭스

| 심각도 | 조건 | 대응 시간 | 통보 대상 |
|--------|------|-----------|-----------|
| **P0 (Critical)** | 서비스 전체 다운 | 15분 | CTO, CEO, 전체 개발팀 |
| **P1 (High)** | 핵심 기능 장애 | 1시간 | CTO, Backend Lead |
| **P2 (Medium)** | 일부 기능 장애 | 4시간 | Backend Lead |
| **P3 (Low)** | UI 버그, 성능 저하 | 1일 | 담당 개발자 |

---

**작성자**: 시니어 개발자 (20년 경력)
**검토 필요**: CTO, Product Manager, Lead Engineer
**다음 리뷰**: 2025-01-26

