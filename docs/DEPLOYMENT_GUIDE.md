# 배포 가이드 (Deployment Guide)

**날짜**: 2025-01-19
**상태**: 코드 준비 완료 → 인프라 설정 필요
**예상 소요 시간**: 45분

---

## 📋 사전 준비 사항

### 필수 계정
- ✅ Supabase 프로젝트 (이미 있음)
- ⚠️ Upstash 계정 (신규 생성 필요)
- ✅ Vercel 프로젝트 (배포 환경)
- ○ Sentry 계정 (선택사항)

---

## 🚀 배포 절차 (Step-by-Step)

### Step 1: Supabase DB 인덱스 적용 (10분)

#### 1-1. Supabase Dashboard 접속
```
https://app.supabase.com/project/YOUR_PROJECT_ID
```

#### 1-2. SQL Editor 열기
- 좌측 메뉴에서 **SQL Editor** 클릭
- **New query** 버튼 클릭

#### 1-3. 인덱스 SQL 실행
- `supabase/migrations/20250119_add_performance_indexes.sql` 파일 내용 복사
- SQL Editor에 붙여넣기
- **Run** 버튼 클릭 (⌘ + Enter)

#### 1-4. 인덱스 생성 확인
아래 SQL로 인덱스가 제대로 생성되었는지 확인:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**예상 결과**: 14개 인덱스가 표시되어야 함
- `idx_price_tracking_user_status`
- `idx_price_tracking_product_status`
- `idx_price_tracking_updated`
- `idx_price_tracking_status`
- `idx_price_history_product_time`
- `idx_price_history_product_recorded`
- `idx_price_notifications_user_time`
- `idx_price_notifications_user_read`
- `idx_conversations_user_updated`
- `idx_conversations_user_id_updated`
- `idx_messages_conversation_time`
- `idx_messages_conversation_created_desc`
- `idx_price_alerts_user_status`
- `idx_price_alerts_product`

#### 1-5. 인덱스 성능 테스트
```sql
-- 인덱스가 실제로 사용되는지 확인
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM price_tracking
WHERE user_id = 'test-user' AND status = 'active'
ORDER BY updated_at DESC
LIMIT 10;
```

**성공 지표**:
- `Index Scan using idx_price_tracking_user_status` 표시됨
- Execution Time < 10ms ✅

---

### Step 2: Upstash Redis 설정 (15분)

#### 2-1. Upstash 계정 생성
1. https://upstash.com/ 접속
2. **Sign Up** (GitHub 계정으로 로그인 가능)

#### 2-2. Redis Database 생성
1. Dashboard에서 **Create Database** 클릭
2. 설정:
   - **Name**: `igosa-production` (또는 원하는 이름)
   - **Region**: **Asia Pacific (Seoul)** ⚠️ 중요: 지연 시간 최소화
   - **Type**: **Regional** (무료 시작 가능)
   - **Eviction**: **noeviction** (Rate limiting 데이터 보존)

3. **Create** 클릭

#### 2-3. REST API 정보 복사
1. 생성된 데이터베이스 클릭
2. **REST API** 탭 클릭
3. 다음 정보 복사:
   ```
   UPSTASH_REDIS_REST_URL=https://xxxxxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXX0ASQxxxxxxxxxxxxxx
   ```

#### 2-4. 연결 테스트 (선택사항)
**Details** 탭에서 **CLI** 버튼 클릭하여 웹 CLI로 테스트:
```redis
PING
# 응답: PONG ✅

SET test "hello"
GET test
# 응답: "hello" ✅

DEL test
```

---

### Step 3: Vercel 환경변수 설정 (10분)

#### 3-1. Vercel Dashboard 접속
```
https://vercel.com/YOUR_USERNAME/igosa
```

#### 3-2. Settings → Environment Variables
1. **Settings** 탭 클릭
2. 좌측 메뉴에서 **Environment Variables** 클릭

#### 3-3. 필수 환경변수 확인 및 추가

##### ✅ 기존 변수 확인 (이미 있어야 함)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

##### ⚠️ 신규 추가 필요 (Upstash Redis)
```bash
# Upstash Redis (필수)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX0ASQxxxxxxxxxxxxx
```

##### ○ 선택사항 (권장)
```bash
# Sentry (에러 모니터링)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxx  # Source maps 업로드용

# Supabase Service Role (관리자 권한)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### 3-4. 환경변수 적용 범위 설정
각 환경변수 추가 시:
- ✅ **Production** 체크
- ✅ **Preview** 체크
- ✅ **Development** 체크 (선택사항)

#### 3-5. 환경변수 저장
**Add** 또는 **Save** 버튼 클릭

---

### Step 4: 배포 실행 (5분)

#### 4-1. Git Push로 자동 배포 (권장)
```bash
# 로컬에서 커밋 및 푸시
git add .
git commit -m "feat: Add production optimizations (indexes, rate limiting, transactions)"
git push origin main
```

Vercel이 자동으로:
1. 빌드 시작
2. 환경변수 적용
3. 배포 완료 (2-3분 소요)

#### 4-2. 수동 배포 (선택사항)
Vercel Dashboard에서:
1. **Deployments** 탭
2. **Redeploy** 버튼 클릭

---

### Step 5: 배포 검증 (10분)

#### 5-1. 배포 상태 확인
Vercel Dashboard → **Deployments** 탭에서:
- ✅ Status: **Ready**
- ✅ Build Time: ~2-3분
- ✅ Build Logs: 에러 없음

#### 5-2. 기능 테스트

##### A. Rate Limiting 테스트
```bash
# Chat API 연속 호출 (10회 제한)
for i in {1..12}; do
  curl -X POST https://YOUR_DOMAIN.vercel.app/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"안녕"}]}'
  echo "\n--- Request $i ---"
  sleep 0.5
done

# 11-12번째 요청에서 HTTP 429 응답 확인 ✅
```

##### B. DB 인덱스 성능 확인
Supabase SQL Editor에서:
```sql
-- 실제 사용자 데이터로 쿼리 성능 측정
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM price_tracking
WHERE user_id = 'real-user-id' AND status = 'active'
ORDER BY updated_at DESC
LIMIT 10;

-- Execution Time < 10ms 확인 ✅
```

##### C. 웹사이트 접속 테스트
1. https://YOUR_DOMAIN.vercel.app 접속
2. 주요 페이지 로딩 확인:
   - ✅ 홈페이지
   - ✅ 제품 검색
   - ✅ AI 채팅
   - ✅ My Page (로그인 후)

##### D. 에러 모니터링 확인 (Sentry 설정한 경우)
1. https://sentry.io 접속
2. 프로젝트 선택
3. **Issues** 탭에서 실시간 에러 확인

---

## 🧪 부하 테스트 (선택사항, 1시간)

### Artillery를 사용한 부하 테스트

#### 설치
```bash
npm install -g artillery
```

#### 테스트 시나리오 작성
`load-test.yml`:
```yaml
config:
  target: "https://YOUR_DOMAIN.vercel.app"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 users/sec
      name: "Warm up"
    - duration: 120
      arrivalRate: 50  # 50 users/sec
      name: "Peak load"
  http:
    timeout: 30

scenarios:
  - name: "Search products"
    flow:
      - get:
          url: "/api/products?q=노트북"
      - think: 2

  - name: "Chat with AI"
    flow:
      - post:
          url: "/api/chat"
          json:
            messages:
              - role: "user"
                content: "추천해줘"
      - think: 3
```

#### 테스트 실행
```bash
artillery run load-test.yml
```

#### 성공 지표
- ✅ Response time (P95) < 200ms
- ✅ Error rate < 1%
- ✅ Rate limit 정상 작동 (429 응답)

---

## 📊 모니터링 설정

### 1. Vercel Analytics
- Vercel Dashboard → **Analytics** 탭
- 실시간 트래픽 확인

### 2. Supabase Monitoring
- Supabase Dashboard → **Database** → **Indexes**
- Index hit rate 확인 (목표: >95%)

### 3. Upstash Redis Dashboard
- https://console.upstash.com
- **Metrics** 탭에서:
  - Requests/sec
  - Latency (목표: <10ms)
  - Hit rate

### 4. Sentry (설정한 경우)
- https://sentry.io
- **Performance** 탭에서 트랜잭션 성능 확인

---

## ❌ 트러블슈팅

### 문제 1: 빌드 실패 (Environment Variables)
**증상**:
```
Invalid environment variables:
NEXT_PUBLIC_SUPABASE_ANON_KEY: Too small
```

**해결**:
1. Vercel Dashboard → Settings → Environment Variables
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값 확인
3. Supabase Dashboard에서 정확한 값 복사 후 재설정

---

### 문제 2: Rate Limiting 작동 안 함
**증상**:
- 10회 이상 요청해도 429 에러 안 나옴

**원인**:
- Upstash Redis 환경변수 누락

**해결**:
1. Vercel Environment Variables 확인:
   ```bash
   UPSTASH_REDIS_REST_URL  # 있는지 확인
   UPSTASH_REDIS_REST_TOKEN  # 있는지 확인
   ```
2. 없으면 추가 후 재배포
3. Upstash Console에서 연결 테스트

---

### 문제 3: DB 쿼리 느림 (여전히 100ms+)
**증상**:
- 인덱스 추가했는데도 쿼리 느림

**원인**:
1. 인덱스가 실제로 안 만들어짐
2. 쿼리가 인덱스를 사용 안 함

**해결**:
```sql
-- 1. 인덱스 존재 확인
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- 2. ANALYZE 실행 (통계 업데이트)
ANALYZE price_tracking;
ANALYZE price_history;
ANALYZE price_notifications;
ANALYZE conversations;
ANALYZE messages;

-- 3. EXPLAIN으로 실제 사용 확인
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM price_tracking
WHERE user_id = 'test' AND status = 'active';

-- "Index Scan using idx_..." 표시되어야 함 ✅
```

---

### 문제 4: Upstash 연결 에러
**증상**:
```
Error: Failed to connect to Upstash Redis
```

**해결**:
1. URL 형식 확인:
   ```bash
   # ✅ 올바른 형식
   UPSTASH_REDIS_REST_URL=https://xxxxxx.upstash.io

   # ❌ 잘못된 형식
   UPSTASH_REDIS_REST_URL=redis://xxxxxx.upstash.io  # REST API 아님!
   ```

2. Token 형식 확인:
   ```bash
   # ✅ 올바른 형식 (시작: AXX, AYX)
   UPSTASH_REDIS_REST_TOKEN=AXX0ASQxxxxx

   # ❌ 잘못된 형식
   UPSTASH_REDIS_REST_TOKEN=password  # 이건 TCP 비밀번호!
   ```

3. Region 확인:
   - Asia Pacific (Seoul) 선택 확인
   - Global Database는 지연 시간 높음

---

### 문제 5: Sentry Source Maps 업로드 실패
**증상**:
```
Error: Sentry CLI not found
```

**해결**:
```bash
# 1. Sentry CLI 설치
npm install @sentry/cli --save-dev

# 2. Auth Token 설정
# Vercel Environment Variables 추가:
SENTRY_AUTH_TOKEN=sntrys_xxxxx

# 3. Sentry 설정 확인
# sentry.properties 파일 확인
```

---

## 📝 배포 후 체크리스트

### 즉시 확인 (5분 이내)
- [ ] 웹사이트 접속 정상 (https://YOUR_DOMAIN.vercel.app)
- [ ] 홈페이지 로딩 (<2초)
- [ ] 제품 검색 작동
- [ ] AI 채팅 작동
- [ ] Rate limiting 테스트 (11번째 요청에서 429)

### 1시간 내 확인
- [ ] Sentry에 에러 없음 (또는 예상된 에러만)
- [ ] Upstash Dashboard에서 요청 들어오는지 확인
- [ ] Vercel Analytics에서 트래픽 확인
- [ ] Supabase Database Stats에서 인덱스 hit rate >80%

### 24시간 내 확인
- [ ] 실제 사용자 피드백 수집
- [ ] 평균 응답 시간 <200ms (P95)
- [ ] 에러율 <0.5%
- [ ] Rate limit false positive 없음 (정상 사용자 차단 안 됨)

### 1주일 내 확인
- [ ] OpenAI API 비용 모니터링 (목표: <$200/week)
- [ ] Supabase DB CPU 사용률 (목표: <30%)
- [ ] Upstash Redis 비용 (예상: $0-10/week)
- [ ] 사용자 불만 없음

---

## 💰 예상 비용 (월간)

| 서비스 | 티어 | 예상 비용 | 비고 |
|--------|------|----------|------|
| **Vercel** | Pro | $20 | 대역폭 포함 |
| **Supabase** | Pro | $25 | 인덱스로 최적화 |
| **Upstash Redis** | Pay-as-you-go | $0-10 | 트래픽에 따라 |
| **OpenAI API** | Pay-as-you-go | $150-200 | Rate limit로 제어 |
| **Sentry** | Team (선택) | $26 | 에러 트래킹 |
| **PostHog** | Free (선택) | $0 | 100만 이벤트까지 |
| **총합** | | **$195-281** | Sentry 제외 시 $195 |

**이전 예상 비용**: $625/월
**절감액**: **$344-430/월 (55-69%)** 🎉

---

## 🚨 긴급 롤백 절차

만약 배포 후 심각한 문제가 발생하면:

### 1. Vercel 즉시 롤백 (1분)
```bash
# Vercel Dashboard → Deployments
# 이전 배포 버전 옆 "..." → "Promote to Production"
```

### 2. 인덱스 롤백 (5분)
Supabase SQL Editor:
```sql
-- 인덱스 제거 (CONCURRENTLY로 안전하게)
DROP INDEX CONCURRENTLY IF EXISTS idx_price_tracking_user_status;
DROP INDEX CONCURRENTLY IF EXISTS idx_price_tracking_product_status;
-- ... (나머지 12개도 동일)

-- 또는 스크립트 사용
-- supabase/migrations/20250119_add_performance_indexes.sql 하단 참고
```

### 3. 환경변수 비활성화 (2분)
Vercel Environment Variables:
- `UPSTASH_REDIS_REST_URL` 제거 → Fallback to in-memory
- 재배포

### 4. 문제 보고
- Sentry 로그 캡처
- Vercel 빌드 로그 저장
- GitHub Issue 생성

---

## 📞 지원 및 문의

- **Vercel 지원**: https://vercel.com/support
- **Supabase 지원**: https://supabase.com/dashboard/support
- **Upstash 지원**: https://upstash.com/docs/common/help/support

---

## 🎉 배포 완료 후

축하합니다! 🎊

다음 단계를 진행하세요:

### Week 1 (우선순위 5-7)
- [ ] Security Headers 추가 (CSP, HSTS)
- [ ] RLS 정책 강화
- [ ] API 문서 작성 (tRPC 또는 OpenAPI)
- [ ] 테스트 커버리지 40%+ 달성

### Week 2-4 (우선순위 8-11)
- [ ] CI/CD 파이프라인 개선
- [ ] 비즈니스 메트릭 대시보드
- [ ] Technical debt 해결
- [ ] Mock 데이터 → 실제 API 전환

상세 내용: `docs/SENIOR_DEVELOPER_RECOMMENDATIONS.md` 참고

---

**작성**: 2025-01-19
**마지막 업데이트**: 2025-01-19
**다음 리뷰**: 배포 후 24시간

