# 🔴 Upstash Redis 설정 가이드

**목적**: Rate Limiting 및 분산 캐싱
**예상 소요 시간**: 10분

---

## 📋 Upstash Redis란?

- **Serverless Redis**: 사용한 만큼만 과금
- **Global Edge Network**: 낮은 지연 시간
- **REST API**: HTTP 기반으로 Vercel Edge Functions와 호환
- **무료 티어**: 월 10,000 요청 무료

**사용 목적**:
1. Rate Limiting (API 호출 제한)
2. 분산 캐싱 (제품 가격 데이터)
3. 세션 관리

---

## 🚀 설정 단계

### Step 1: Upstash 계정 생성 (2분)

1. **https://upstash.com** 접속
2. **Sign Up** 클릭
   - GitHub 계정으로 로그인 가능
   - 또는 이메일로 가입

---

### Step 2: Redis Database 생성 (3분)

1. Dashboard에서 **Create Database** 클릭

2. 설정:
   ```
   Name: igosa-production

   Region: Asia Pacific (Seoul) ⚠️ 중요!
   (가장 낮은 지연 시간을 위해 Seoul 선택)

   Type: Regional
   (무료 티어 사용 가능)

   Eviction: noeviction
   (Rate limiting 데이터 보존)
   ```

3. **Create** 버튼 클릭

---

### Step 3: REST API 정보 복사 (2분)

데이터베이스가 생성되면:

1. **REST API** 탭 클릭

2. 아래 정보 복사:
   ```
   UPSTASH_REDIS_REST_URL: https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN: AXX0ASQ...
   ```

3. 안전한 곳에 저장 (다음 단계에서 사용)

---

### Step 4: 환경변수 설정 (3분)

#### 4-1. 로컬 개발 환경

`.env.local` 파일에 추가:
```bash
# Upstash Redis (REST API)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXX0ASQ..."
```

#### 4-2. Vercel 프로덕션 환경

**Vercel Dashboard** → **Environment Variables**에 추가:

```
Name: UPSTASH_REDIS_REST_URL
Value: https://your-redis.upstash.io
Environments: ✅ Production, ✅ Preview, ✅ Development

Name: UPSTASH_REDIS_REST_TOKEN
Value: AXX0ASQ...
Environments: ✅ Production, ✅ Preview, ✅ Development
```

---

## 🧪 연결 테스트

### 테스트 스크립트

프로젝트 루트에서 실행:

```javascript
// test-redis.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function testRedis() {
  try {
    // SET 테스트
    await redis.set('test-key', 'Hello from igosa!');
    console.log('✅ SET 성공');

    // GET 테스트
    const value = await redis.get('test-key');
    console.log('✅ GET 성공:', value);

    // DEL 테스트
    await redis.del('test-key');
    console.log('✅ DEL 성공');

    console.log('\n🎉 Upstash Redis 연결 성공!');
  } catch (error) {
    console.error('❌ 연결 실패:', error);
  }
}

testRedis();
```

**실행**:
```bash
node test-redis.js
```

**예상 결과**:
```
✅ SET 성공
✅ GET 성공: Hello from igosa!
✅ DEL 성공

🎉 Upstash Redis 연결 성공!
```

---

## 💰 비용 계산

### 무료 티어 (Free)
- **요청**: 10,000 요청/월
- **저장 용량**: 256MB
- **최대 데이터 크기**: 1MB
- **동시 연결**: 100개

**예상 사용량** (igosa):
- Rate limiting: ~5,000 요청/월
- 캐싱: ~3,000 요청/월
- **총**: ~8,000 요청/월 → **무료 티어 충분** ✅

### Pro 티어 (필요 시)
- $0.2 per 100,000 요청
- 저장 용량: 1GB
- 최대 데이터 크기: 10MB

---

## 🔧 Rate Limiting 구현

Upstash Redis를 사용한 Rate Limiting 예제:

```typescript
// src/lib/rate-limit.ts
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter 생성
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10초당 10회
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// 사용 예시
export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  return {
    success,
    limit,
    reset,
    remaining,
  };
}
```

**API Route에서 사용**:
```typescript
// src/app/api/price-tracking/route.ts
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';

  // Rate limit 체크
  const { success, limit, remaining } = await checkRateLimit(ip);

  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  }

  // 정상 처리...
}
```

---

## 📊 모니터링

### Upstash Dashboard

https://console.upstash.com/redis/[your-database-id]

**확인 가능한 지표**:
- 요청 수 (Requests)
- 저장 용량 (Storage)
- 명령어 통계 (Commands)
- 지연 시간 (Latency)

---

## 🚨 문제 해결

### Issue 1: 연결 실패
**에러**: `Connection refused`

**해결**:
1. REST API URL이 올바른지 확인
2. Token이 정확한지 확인
3. 방화벽 설정 확인

---

### Issue 2: Rate Limit 너무 엄격
**증상**: 사용자가 자주 차단됨

**해결**:
```typescript
// Rate limit 조정
Ratelimit.slidingWindow(20, '10 s') // 10초당 20회로 증가
```

---

### Issue 3: 무료 티어 초과
**해결**:
1. Pro 티어로 업그레이드 ($0.2/100K 요청)
2. 또는 캐싱 전략 최적화

---

## ✅ 설정 완료 체크리스트

- [ ] Upstash 계정 생성
- [ ] Redis Database 생성 (Seoul region)
- [ ] REST API URL & Token 복사
- [ ] 로컬 `.env.local`에 환경변수 추가
- [ ] Vercel에 환경변수 추가
- [ ] 연결 테스트 성공
- [ ] Rate limiting 코드 구현 (선택)

---

## 📚 참고 문서

- **Upstash 공식 문서**: https://docs.upstash.com/redis
- **Rate Limiting 가이드**: https://docs.upstash.com/redis/sdks/ratelimit/overview
- **Vercel Integration**: https://vercel.com/integrations/upstash

---

**작성**: 2025-01-20
**프로젝트**: igosa-production
**Region**: Asia Pacific (Seoul)
