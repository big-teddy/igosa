# 🚂 Railway Redis 설정 가이드

**목적**: Rate Limiting 및 분산 캐싱
**비용**: $5/월 (512MB Redis)
**예상 소요 시간**: 10분

---

## 📋 Railway Redis란?

- **전통적인 Redis**: TCP 연결 기반
- **Railway 플랫폼**: 쉬운 배포 및 관리
- **비용 효율적**: $5/월로 512MB + 무제한 요청
- **서버 사이드**: Next.js API Routes와 완벽 호환

**사용 목적**:
1. Rate Limiting (API 호출 제한)
2. 분산 캐싱 (제품 가격 데이터)
3. 세션 관리

---

## 🚀 설정 단계

### Step 1: Railway 계정 생성 (2분)

1. **https://railway.app** 접속
2. **Sign Up** 클릭
   - GitHub 계정으로 로그인 (추천)
   - 또는 이메일로 가입

---

### Step 2: Redis 서비스 생성 (3분)

1. Dashboard에서 **New Project** 클릭

2. **Deploy Redis** 선택

3. 프로젝트 이름 설정:
   ```
   Name: igosa-redis
   ```

4. **Deploy** 버튼 클릭

5. 배포 완료 대기 (~30초)

---

### Step 3: 연결 정보 복사 (2분)

Redis 서비스가 생성되면:

1. **Variables** 탭 클릭

2. 아래 정보 복사:
   ```
   REDIS_URL: redis://default:password@container.railway.app:6379
   ```

   또는 개별적으로:
   ```
   REDIS_HOST: container.railway.app
   REDIS_PORT: 6379
   REDIS_PASSWORD: xxxxxxxxxxxxx
   ```

3. 안전한 곳에 저장 (다음 단계에서 사용)

---

### Step 4: 환경변수 설정 (3분)

#### 4-1. 로컬 개발 환경

`.env.local` 파일에 추가:
```bash
# Railway Redis (TCP)
REDIS_URL="redis://default:password@container.railway.app:6379"

# 또는 개별적으로
REDIS_HOST="container.railway.app"
REDIS_PORT="6379"
REDIS_PASSWORD="xxxxxxxxxxxxx"
```

#### 4-2. Vercel 프로덕션 환경

**Vercel Dashboard** → **Environment Variables**에 추가:

```
Name: REDIS_URL
Value: redis://default:password@container.railway.app:6379
Environments: ✅ Production, ✅ Preview, ✅ Development
```

---

## 📦 Redis 클라이언트 설치

Railway Redis는 TCP 기반이므로 `ioredis` 사용:

```bash
npm install ioredis
npm install -D @types/ioredis
```

---

## 🧪 연결 테스트

### Redis 클라이언트 생성

`src/lib/redis.ts` 파일 생성:

```typescript
import Redis from 'ioredis';

// Railway Redis 연결
const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Railway Redis 연결 성공');
});

redis.on('error', (err) => {
  console.error('❌ Railway Redis 연결 실패:', err);
});

export default redis;
```

---

### 테스트 스크립트

프로젝트 루트에서 실행:

```javascript
// test-redis.js
import redis from './src/lib/redis';

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

    console.log('\n🎉 Railway Redis 연결 성공!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 연결 실패:', error);
    process.exit(1);
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
✅ Railway Redis 연결 성공
✅ SET 성공
✅ GET 성공: Hello from igosa!
✅ DEL 성공

🎉 Railway Redis 연결 성공!
```

---

## 🔧 Rate Limiting 구현

Railway Redis를 사용한 Rate Limiting:

```typescript
// src/lib/rate-limit.ts
import redis from './redis';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 10 // 10초
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - window;

  try {
    // Sliding window algorithm
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);

    if (count >= limit) {
      // Rate limit exceeded
      const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const reset = windowStart + window + (oldestEntry[1] ? parseInt(oldestEntry[1]) : 0);

      return {
        success: false,
        limit,
        remaining: 0,
        reset,
      };
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, window);

    return {
      success: true,
      limit,
      remaining: limit - count - 1,
      reset: now + window,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open: allow request if Redis is down
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + window,
    };
  }
}
```

---

### API Route에서 사용

```typescript
// src/app/api/price-tracking/route.ts
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';

  // Rate limit 체크 (10초당 10회)
  const { success, limit, remaining, reset } = await checkRateLimit(ip, 10, 10);

  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  // 정상 처리...
  return Response.json({ success: true });
}
```

---

## 💰 비용 계산

### Railway Redis 요금제

**Hobby Plan** (추천):
- **월 $5**
- 512MB RAM
- 무제한 요청
- 무제한 연결
- 자동 백업 포함

**예상 사용량** (igosa):
- Rate limiting: ~8,000 요청/월
- 캐싱: ~3,000 요청/월
- **총**: ~11,000 요청/월

**비용**: **$5/월** (고정) ✅

---

## 📊 모니터링

### Railway Dashboard

https://railway.app/project/[your-project-id]

**확인 가능한 지표**:
- CPU 사용량
- 메모리 사용량
- 네트워크 트래픽
- 연결 수

**알림 설정**:
- CPU > 80%
- 메모리 > 90%
- 연결 실패

---

## 🚨 문제 해결

### Issue 1: 연결 실패
**에러**: `Connection refused`

**해결**:
1. REDIS_URL이 올바른지 확인
2. Railway 서비스가 실행 중인지 확인
3. 방화벽 설정 확인 (Railway는 자동으로 허용)

---

### Issue 2: 메모리 부족
**증상**: `OOM command not allowed when used memory > 'maxmemory'`

**해결**:
1. Railway Dashboard에서 플랜 업그레이드
2. 또는 캐싱 전략 최적화 (TTL 단축)

---

### Issue 3: Rate Limit 너무 엄격
**증상**: 사용자가 자주 차단됨

**해결**:
```typescript
// Rate limit 조정
await checkRateLimit(ip, 20, 10); // 10초당 20회로 증가
```

---

## 🔄 Vercel과 Railway 연결

Railway는 Vercel과 자동으로 연결됩니다:

1. **Vercel Dashboard** → **Integrations**
2. **Railway** 검색 및 설치
3. 환경변수 자동 동기화

**또는 수동으로**:
```bash
# Vercel CLI 사용
vercel env add REDIS_URL production
# Railway의 REDIS_URL 붙여넣기
```

---

## ✅ 설정 완료 체크리스트

- [ ] Railway 계정 생성
- [ ] Redis 서비스 배포
- [ ] REDIS_URL 복사
- [ ] 로컬 `.env.local`에 환경변수 추가
- [ ] Vercel에 환경변수 추가
- [ ] `ioredis` 패키지 설치
- [ ] `src/lib/redis.ts` 생성
- [ ] 연결 테스트 성공
- [ ] Rate limiting 코드 구현

---

## 📚 참고 문서

- **Railway 공식 문서**: https://docs.railway.app/databases/redis
- **ioredis 문서**: https://github.com/redis/ioredis
- **Rate Limiting 패턴**: https://redis.io/docs/manual/patterns/rate-limiting/

---

## 🆚 Railway vs Upstash 선택 가이드

**Railway Redis를 선택하세요**:
- ✅ 서버 사이드 API Routes만 사용
- ✅ 비용 예측 가능성 중요 ($5 고정)
- ✅ 전통적인 Redis 기능 필요
- ✅ 높은 처리량 필요

**Upstash Redis를 선택하세요**:
- ✅ Vercel Edge Functions 사용
- ✅ 무료 티어로 시작 (10K 요청/월)
- ✅ Serverless 아키텍처 선호
- ✅ Global 분산 필요

---

**작성**: 2025-01-22
**프로젝트**: igosa-production
**비용**: $5/월 (고정)
