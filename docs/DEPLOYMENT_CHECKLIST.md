# ✅ 배포 체크리스트 (Quick Reference)

**예상 소요 시간**: 45분
**난이도**: 중급

---

## 🎯 배포 전 최종 확인

### 코드 준비 상태
- [x] TypeScript 컴파일 에러 없음
- [x] 프로덕션 빌드 성공
- [x] Critical 보안 이슈 해결
- [x] DB 인덱스 SQL 준비 완료
- [x] Rate limiting 구현 완료
- [x] 트랜잭션 처리 구현 완료
- [x] 문서화 완료

---

## 📋 Step-by-Step 체크리스트

### □ Step 1: Supabase DB 인덱스 (10분)

#### 작업
1. [ ] Supabase Dashboard → SQL Editor 접속
2. [ ] `supabase/migrations/20250119_add_performance_indexes.sql` 복사
3. [ ] SQL Editor에 붙여넣기 → Run
4. [ ] 14개 인덱스 생성 확인:
   ```sql
   SELECT COUNT(*) FROM pg_indexes
   WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
   ```
   **예상 결과**: 14개 ✅

5. [ ] 성능 테스트:
   ```sql
   EXPLAIN (ANALYZE, BUFFERS)
   SELECT * FROM price_tracking
   WHERE user_id = 'test' AND status = 'active'
   LIMIT 10;
   ```
   **예상**: `Index Scan using idx_...` ✅

#### 문제 해결
- 인덱스 생성 실패 → CONCURRENTLY 제거 후 재시도
- 권한 에러 → Supabase Dashboard Owner 계정 사용

---

### □ Step 2: Upstash Redis (15분)

#### 작업
1. [ ] https://upstash.com/ 가입/로그인
2. [ ] Create Database 클릭
3. [ ] 설정:
   - Name: `igosa-production`
   - Region: **Asia Pacific (Seoul)** ⚠️
   - Type: Regional
   - Eviction: noeviction
4. [ ] Create 클릭
5. [ ] REST API 탭에서 정보 복사:
   ```
   UPSTASH_REDIS_REST_URL=https://...upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXX0ASQ...
   ```
6. [ ] 연결 테스트 (CLI 버튼):
   ```
   PING  → PONG ✅
   ```

#### 문제 해결
- Region이 Seoul이 아님 → 데이터베이스 삭제 후 재생성
- Token 복사 실패 → REST API 탭 (TCP 탭 아님!)

---

### □ Step 3: Vercel 환경변수 (10분)

#### 작업
1. [ ] https://vercel.com 프로젝트 접속
2. [ ] Settings → Environment Variables
3. [ ] 기존 변수 확인:
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] `OPENAI_API_KEY`

4. [ ] 신규 변수 추가 (필수):
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=AXX0ASQ...
   ```
   - [x] Production
   - [x] Preview
   - [x] Development (선택)

5. [ ] 선택사항 변수 추가:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```

6. [ ] Save 클릭

#### 문제 해결
- 변수 저장 안 됨 → 각 Environment 체크박스 확인
- Token 형식 에러 → 따옴표 없이 입력

---

### □ Step 4: 배포 (5분)

#### 방법 A: Git Push (권장)
```bash
git add .
git commit -m "feat: Production optimizations"
git push origin main
```

#### 방법 B: 수동 배포
- Vercel Dashboard → Deployments → Redeploy

#### 대기
- [ ] 빌드 시작 확인
- [ ] 빌드 로그 에러 없음
- [ ] Status: Ready ✅
- [ ] 소요 시간: 2-3분

#### 문제 해결
- 빌드 실패 → 로그 확인 → 환경변수 재확인
- Timeout → Vercel Pro 플랜 확인

---

### □ Step 5: 검증 (10분)

#### A. 웹사이트 접속
- [ ] https://YOUR_DOMAIN.vercel.app 접속
- [ ] 홈페이지 로딩 (<2초)
- [ ] 제품 검색 작동
- [ ] AI 채팅 작동

#### B. Rate Limiting 테스트
```bash
# 12번 연속 호출 (11번째부터 429 예상)
for i in {1..12}; do
  curl -X POST https://YOUR_DOMAIN/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"hi"}]}'
  echo "\n$i"
done
```

**예상 결과**:
- 1-10번: HTTP 200 ✅
- 11-12번: HTTP 429 ✅

#### C. DB 성능 확인
Supabase SQL Editor:
```sql
-- 실제 쿼리 성능 측정
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM price_tracking
WHERE user_id = (SELECT user_id FROM price_tracking LIMIT 1)
  AND status = 'active'
ORDER BY updated_at DESC
LIMIT 10;
```

**예상 결과**:
- Index Scan 사용 확인 ✅
- Execution Time < 10ms ✅

#### D. Upstash 연결 확인
- [ ] Upstash Console → Database → Metrics
- [ ] Requests/sec > 0 확인 ✅
- [ ] Latency < 20ms 확인 ✅

#### E. Sentry 확인 (설정한 경우)
- [ ] https://sentry.io 접속
- [ ] 프로젝트 선택
- [ ] 심각한 에러 없음 ✅

---

## 🎉 배포 완료

### 즉시 확인 (5분)
- [ ] 웹사이트 정상 작동
- [ ] Rate limiting 작동
- [ ] 에러 없음

### 1시간 내
- [ ] Vercel Analytics 트래픽 확인
- [ ] Upstash Dashboard 요청 확인
- [ ] Sentry 에러율 <1%

### 24시간 내
- [ ] 평균 응답 시간 <200ms (P95)
- [ ] DB 인덱스 hit rate >80%
- [ ] 사용자 피드백 긍정적

---

## 📊 성공 지표

| 지표 | 목표 | 확인 방법 |
|------|------|-----------|
| **응답 시간 (P95)** | <200ms | Vercel Analytics |
| **에러율** | <1% | Sentry Dashboard |
| **DB 쿼리 속도** | <10ms | EXPLAIN ANALYZE |
| **Rate Limit 작동** | 11번째 요청 차단 | curl 테스트 |
| **Upstash 지연** | <20ms | Upstash Metrics |

---

## ❌ 문제 발생 시

### 즉시 롤백
```bash
# Vercel Dashboard → Deployments
# 이전 배포 → "..." → "Promote to Production"
```

### 일반적인 문제

#### 1. 빌드 실패
**원인**: 환경변수 누락
**해결**: Vercel Environment Variables 재확인

#### 2. Rate Limiting 안 됨
**원인**: Upstash 연결 실패
**해결**: URL/Token 재확인, Region 확인

#### 3. DB 느림
**원인**: 인덱스 미적용
**해결**: Step 1 재실행, ANALYZE 실행

#### 4. 429 Too Many
**원인**: Rate limit 너무 엄격
**해결**: `src/lib/security/rate-limit.ts`에서 limit 조정

---

## 📞 긴급 연락처

- **Vercel 지원**: vercel.com/support
- **Supabase 지원**: supabase.com/support
- **Upstash 지원**: upstash.com/docs

---

## 📄 관련 문서

- **상세 가이드**: `docs/DEPLOYMENT_GUIDE.md`
- **구현 요약**: `docs/IMPLEMENTATION_SUMMARY.md`
- **권장사항**: `docs/SENIOR_DEVELOPER_RECOMMENDATIONS.md`
- **DB 마이그레이션**: `supabase/migrations/20250119_add_performance_indexes.sql`

---

**작성**: 2025-01-19
**버전**: 1.0
**다음 리뷰**: 배포 후 24시간

