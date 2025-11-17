# Architecture Documentation

## 시스템 아키텍처 개선 (2025-01-17)

### 개요

이 문서는 시니어 개발자 수준의 코드 품질과 구조를 위해 수행한 전체 시스템 리팩토링을 설명합니다.

---

## 1. 에러 처리 시스템 (Error Handling)

### 위치
- `src/lib/errors/api-error.ts`

### 주요 기능

#### 1.1 중앙화된 에러 클래스
```typescript
// 모든 API 에러의 기본 클래스
class APIError extends Error

// 사전 정의된 에러 타입들
BadRequestError        // 400
UnauthorizedError      // 401
ForbiddenError         // 403
NotFoundError          // 404
ValidationError        // 422
ConflictError          // 409
RateLimitError         // 429
DatabaseError          // 500
RedisError             // 500
ExternalServiceError   // 502
```

#### 1.2 전역 에러 핸들러
```typescript
handleAPIError(error: unknown): NextResponse
```
- 모든 에러 타입을 일관된 형식으로 변환
- Sentry에 자동 로깅 (5xx 에러)
- Production/Development 환경별 메시지 제어
- Database 에러 코드 자동 매핑 (23505 → Conflict 등)

#### 1.3 에러 래퍼
```typescript
withErrorHandling(handler): handler
```
- Try-catch 보일러플레이트 제거
- 자동 에러 처리 및 로깅
- API 라우트에 데코레이터 패턴 적용

### 사용 예시
```typescript
export const POST = withErrorHandling(async (request) => {
  // 에러 발생 시 자동으로 처리됨
  if (!data) {
    throw new NotFoundError('Product', productId);
  }
  return success(data);
});
```

---

## 2. API 응답 표준화 (Response Standardization)

### 위치
- `src/lib/api/response.ts`

### 주요 함수

```typescript
success<T>(data: T, meta?: Record<string, unknown>): NextResponse     // 200
created<T>(data: T, meta?: Record<string, unknown>): NextResponse     // 201
noContent(): NextResponse                                              // 204
paginated<T>(data: T[], pagination, meta?): NextResponse               // 200 with pagination
```

### 응답 형식

#### 성공 응답
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-17T10:30:00.000Z",
    "requestId": "..."
  }
}
```

#### 페이지네이션 응답
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  },
  "meta": { ... }
}
```

#### 에러 응답
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "email": ["Invalid email format"]
      }
    },
    "timestamp": "2025-01-17T10:30:00.000Z"
  }
}
```

---

## 3. 입력 검증 시스템 (Input Validation)

### 위치
- `src/lib/api/validation.ts`

### 주요 기능

#### 3.1 Zod 기반 검증
```typescript
validateBody<T>(schema: ZodSchema<T>, body: unknown): Promise<T>
validateQuery<T>(schema: ZodSchema<T>, params: URLSearchParams): T
```

#### 3.2 공통 스키마
```typescript
CommonSchemas.uuid          // UUID 검증
CommonSchemas.email         // 이메일 검증
CommonSchemas.url           // URL 검증
CommonSchemas.positiveInt   // 양수 정수
CommonSchemas.price         // 가격 (0 이상)
CommonSchemas.pagination    // 페이지네이션 파라미터
CommonSchemas.timestamp     // ISO 8601 타임스탬프
```

#### 3.3 XSS 방지
```typescript
sanitizeString(input: string): string
sanitizeStringArray(input: unknown): string[]
```

### 사용 예시
```typescript
const schema = z.object({
  email: CommonSchemas.email,
  price: CommonSchemas.price,
  tags: z.array(z.string()).max(10),
});

const validated = await validateBody(schema, body);
// ValidationError 자동 throw (422)
```

---

## 4. 인증 미들웨어 (Authentication)

### 위치
- `src/lib/api/auth.ts`

### 주요 함수

```typescript
requireAuth(request): Promise<AuthenticatedUser>      // 인증 필수
getOptionalAuth(request): Promise<AuthenticatedUser | null>  // 선택적 인증
requireRole(request, role): Promise<AuthenticatedUser>  // 역할 기반 인증
requireApiKey(request): void                           // API 키 검증
```

### 사용 예시
```typescript
export const POST = withErrorHandling(async (request) => {
  const user = await requireAuth(request);
  // user.id, user.email 사용 가능

  // 또는 역할 체크
  const admin = await requireRole(request, 'admin');
});
```

---

## 5. 구조화된 로깅 (Structured Logging)

### 위치
- `src/lib/logger/index.ts`

### 주요 기능

#### 5.1 로그 레벨
- `DEBUG` - 개발 환경에서만 출력
- `INFO` - 일반 정보
- `WARN` - 경고 (Sentry에 전송)
- `ERROR` - 에러 (Sentry에 전송)

#### 5.2 메서드
```typescript
logger.debug(message, context)
logger.info(message, context)
logger.warn(message, context)
logger.error(message, error, context)

// 전용 메서드
logger.apiRequest(method, path, context)
logger.apiResponse(method, path, status, duration)
logger.dbQuery(query, duration, context)
logger.externalApi(service, endpoint, duration, status)

// 성능 측정
await logger.measure('operation-name', async () => {
  // 측정할 코드
});
```

#### 5.3 출력 형식

**개발 환경** (Pretty Print)
```
[2025-01-17T10:30:00.000Z] [INFO] User login successful
  Context: {
    "userId": "123",
    "email": "user@example.com"
  }
```

**프로덕션 환경** (JSON)
```json
{
  "timestamp": "2025-01-17T10:30:00.000Z",
  "level": "info",
  "message": "User login successful",
  "userId": "123",
  "email": "user@example.com"
}
```

### 사용 예시
```typescript
logger.info('Creating price tracking', {
  userId: user.id,
  productId,
  targetPrice,
});

logger.error('Database query failed', error, {
  query: 'SELECT * FROM users',
  userId: user.id,
});
```

---

## 6. Rate Limiting

### 위치
- `src/lib/api/rate-limit.ts`

### 설정

```typescript
RateLimitConfig.anonymous      // 10 req/min (익명 사용자)
RateLimitConfig.authenticated  // 100 req/min (인증 사용자)
RateLimitConfig.expensive      // 5 req/min (무거운 작업)
RateLimitConfig.write          // 30 req/min (쓰기 작업)
```

### 사용 방법

#### 방법 1: 직접 호출
```typescript
export const POST = withErrorHandling(async (request) => {
  const user = await requireAuth(request);

  await rateLimit(request, {
    config: RateLimitConfig.write,
    userId: user.id,
  });

  // 비즈니스 로직
});
```

#### 방법 2: 데코레이터
```typescript
export const POST = withRateLimit(
  RateLimitConfig.authenticated,
  async (req) => {
    const user = await getOptionalAuth(req);
    return user?.id;
  }
)(
  withErrorHandling(async (request) => {
    // 비즈니스 로직
  })
);
```

### 폴백
- Redis 사용 불가 시 자동으로 in-memory 폴백
- Rate limit 실패 시 요청 허용 (fail-open)

---

## 7. Redis 개선사항

### 위치
- `src/lib/redis/client.ts`

### 개선 내용

1. **구조화된 로깅**
   - 연결 성공/실패 로깅
   - 재시도 로깅
   - 에러 상세 로깅

2. **에러 처리**
   - Railway/Upstash 초기화 실패 시 RedisError throw
   - 연결 에러 이벤트 핸들링
   - Mock 클라이언트 폴백

3. **모니터링**
   - 연결 상태 이벤트 로깅
   - 재시도 횟수 및 지연 시간 추적

---

## 8. API 라우트 개선 예시

### Before (Old Pattern)
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 비즈니스 로직...

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

### After (New Pattern)
```typescript
const CreateSchema = z.object({
  productId: z.string().min(1),
  targetPrice: CommonSchemas.price,
});

export const POST = withErrorHandling(async (request) => {
  // 인증 (자동 에러 처리)
  const user = await requireAuth(request);

  // Rate limiting
  await rateLimit(request, {
    config: RateLimitConfig.write,
    userId: user.id,
  });

  // 검증 (자동 ValidationError)
  const body = await request.json();
  const validated = await validateBody(CreateSchema, body);

  // 로깅
  logger.info('Creating resource', {
    userId: user.id,
    productId: validated.productId,
  });

  // 비즈니스 로직
  const result = await createResource(validated);

  // 표준화된 응답
  return created(result, {
    userId: user.id,
  });
});
```

---

## 9. 개선 효과

### 9.1 코드 품질
- ✅ **일관성**: 모든 API가 동일한 패턴 사용
- ✅ **가독성**: 비즈니스 로직에 집중 가능
- ✅ **유지보수성**: 공통 로직 중앙화

### 9.2 에러 처리
- ✅ **완전성**: 모든 에러 케이스 커버
- ✅ **추적성**: Sentry 자동 통합
- ✅ **명확성**: 구조화된 에러 메시지

### 9.3 보안
- ✅ **입력 검증**: Zod 기반 강력한 검증
- ✅ **XSS 방지**: 자동 sanitization
- ✅ **Rate Limiting**: DDoS 방어
- ✅ **인증/인가**: 표준화된 미들웨어

### 9.4 관찰성 (Observability)
- ✅ **구조화된 로그**: JSON 형식으로 검색/분석 가능
- ✅ **성능 측정**: duration 자동 추적
- ✅ **컨텍스트 추적**: userId, requestId 등

### 9.5 개발 경험 (DX)
- ✅ **타입 안전성**: TypeScript + Zod
- ✅ **재사용성**: 공통 유틸리티
- ✅ **문서화**: 자체 문서화된 코드

---

## 10. 마이그레이션 가이드

### 기존 API 라우트 업그레이드

1. **에러 처리 추가**
   ```typescript
   // Before
   export async function GET(request) { ... }

   // After
   export const GET = withErrorHandling(async (request) => { ... });
   ```

2. **인증 추가**
   ```typescript
   // Before
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

   // After
   const user = await requireAuth(request);
   ```

3. **검증 추가**
   ```typescript
   // Before
   const body = await request.json();
   if (!body.email || !body.price) { ... }

   // After
   const schema = z.object({
     email: CommonSchemas.email,
     price: CommonSchemas.price,
   });
   const validated = await validateBody(schema, body);
   ```

4. **응답 표준화**
   ```typescript
   // Before
   return NextResponse.json({ data: result }, { status: 200 });

   // After
   return success(result);
   ```

5. **로깅 추가**
   ```typescript
   // Before
   console.log('Creating user');

   // After
   logger.info('Creating user', { email: user.email });
   ```

---

## 11. 베스트 프랙티스

### 11.1 API 라우트 작성
1. 항상 `withErrorHandling` 사용
2. `requireAuth` 로 인증 체크
3. Zod 스키마로 입력 검증
4. `logger`로 주요 동작 로깅
5. 표준 응답 헬퍼 사용

### 11.2 에러 처리
1. 특정 에러는 명시적 클래스 사용 (`NotFoundError` 등)
2. Database 에러는 `DatabaseError`로 wrapping
3. External API 에러는 `ExternalServiceError` 사용
4. 에러 발생 시 충분한 컨텍스트 제공

### 11.3 로깅
1. INFO: 주요 비즈니스 이벤트
2. WARN: 복구 가능한 에러, 성능 저하
3. ERROR: 복구 불가능한 에러
4. DEBUG: 개발 디버깅 정보
5. 항상 userId, requestId 등 컨텍스트 포함

### 11.4 보안
1. 모든 사용자 입력 검증
2. Rate limiting 적용
3. 민감 정보 로그에서 제외
4. API 키는 환경 변수로 관리

---

## 12. 참고 파일

### 유틸리티
- `src/lib/errors/api-error.ts` - 에러 처리
- `src/lib/api/response.ts` - 응답 헬퍼
- `src/lib/api/validation.ts` - 입력 검증
- `src/lib/api/auth.ts` - 인증 미들웨어
- `src/lib/api/rate-limit.ts` - Rate limiting
- `src/lib/logger/index.ts` - 로깅

### 예시
- `src/app/api/price-tracking/route.improved.ts` - 개선된 API 예시

### 문서
- `docs/ARCHITECTURE.md` - 이 문서
- `docs/negodeal-migration-plan.md` - 마이그레이션 계획

---

**마지막 업데이트**: 2025-01-17
**작성자**: Senior Development Team
