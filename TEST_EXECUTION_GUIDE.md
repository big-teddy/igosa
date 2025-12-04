# 테스트 실행 가이드
**시니어 개발자 관점: 실용적인 테스트 전략**

---

## 🎯 테스트 우선순위

### Priority 1: 수동 테스트 (30분) ⚡ **지금 바로 실행**
- 가장 빠르고 확실한 검증 방법
- 실제 사용자 경험 확인
- 버그 즉시 발견 가능

### Priority 2: API 통합 테스트 (1시간)
- 비즈니스 로직 검증
- DB 연동 확인
- 성능 측정

### Priority 3: E2E 테스트 (2시간)
- 전체 플로우 자동화
- 회귀 테스트용
- CI/CD 통합

---

## 🚀 빠른 시작 (5분)

### 1. 로컬 환경 설정
```bash
# 1. 환경변수 복사
cp .env.example .env.local

# 2. 필수 환경변수 입력 (.env.local 파일 편집)
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - REDIS_URL 또는 UPSTASH_REDIS_REST_URL

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

### 2. 첫 번째 테스트 (2분)
```bash
# 브라우저에서 http://localhost:3000 접속
# 1. 홈페이지 로딩 확인 ✅
# 2. 제품 검색 "갤럭시 버즈" ✅
# 3. 검색 결과 표시 확인 ✅
```

**성공**: 3가지 모두 작동 → 기본 설정 완료  
**실패**: 에러 메시지 확인 → 환경변수 재확인

---

## 📋 수동 테스트 실행 (30분)

### 체크리스트 사용
```bash
# 1. 체크리스트 파일 열기
open MANUAL_TEST_CHECKLIST.md

# 2. 순서대로 테스트 실행
# Critical Path 1: 사용자 인증 (5분)
# Critical Path 2: 제품 검색 (5분)
# Critical Path 3: 가격 알림 설정 (10분)
# Critical Path 4: 수요 집계 (5분)
# Critical Path 5: AI 채팅 (5분, 선택)
```

### 결과 기록
체크리스트 하단 표에 기록:
```markdown
| 날짜 | 테스터 | Critical Path | 결과 | 비고 |
|------|--------|--------------|------|------|
| 2025-12-04 | 김성현 | Path 1: 인증 | ✅ | 정상 |
| 2025-12-04 | 김성현 | Path 2: 검색 | ❌ | Mock 데이터 없음 |
```

---

## 🧪 API 통합 테스트 실행 (1시간)

### 사전 준비
```bash
# 1. 테스트 환경변수 설정
# .env.test 파일 생성
cat > .env.test << EOF
NEXT_PUBLIC_SUPABASE_URL=your-test-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# 2. 테스트 DB 준비 (Supabase)
# - 별도 테스트 프로젝트 생성 (권장)
# - 또는 개발 DB 사용 (주의: 데이터 삭제됨)
```

### 테스트 실행
```bash
# 1. 개발 서버 실행 (별도 터미널)
npm run dev

# 2. 통합 테스트 실행
npm run test:integration

# 예상 출력:
# PASS tests/integration/api/price-tracking.test.ts
#   Price Tracking API Integration
#     POST /api/price-tracking
#       ✓ 가격 알림을 생성할 수 있다 (245ms)
#       ✓ 중복 가격 알림 생성 시 에러 반환 (89ms)
#       ✓ 인증 없이 요청 시 401 에러 (45ms)
#     ...
# 
# Test Suites: 1 passed, 1 total
# Tests:       12 passed, 12 total
# Time:        8.234s
```

### 실패 시 디버깅
```bash
# 1. 상세 로그 확인
npm run test:integration -- --verbose

# 2. 특정 테스트만 실행
npm run test:integration -- -t "가격 알림을 생성"

# 3. DB 상태 확인
# Supabase Dashboard → Table Editor → price_tracking
```

---

## 🎭 E2E 테스트 실행 (2시간)

### Playwright 설정
```bash
# 1. Playwright 설치 (최초 1회)
npx playwright install

# 2. 브라우저 다운로드 확인
npx playwright install chromium firefox webkit
```

### 테스트 실행
```bash
# 1. 개발 서버 실행 (별도 터미널)
npm run dev

# 2. E2E 테스트 실행 (헤드리스)
npm run test:e2e

# 3. UI 모드로 실행 (디버깅용)
npm run test:e2e:ui

# 4. 특정 브라우저만 테스트
npx playwright test --project=chromium
```

### 테스트 결과 확인
```bash
# 1. HTML 리포트 생성
npx playwright show-report

# 2. 스크린샷 확인
open test-results/

# 3. 비디오 녹화 확인 (실패 시)
open test-results/critical-user-flows-*/video.webm
```

---

## 📊 성능 테스트 (30분)

### Lighthouse 테스트
```bash
# 1. 프로덕션 빌드
npm run build
npm start

# 2. Lighthouse 실행
npx lighthouse http://localhost:3000 \
  --output html \
  --output-path ./lighthouse-report.html

# 3. 리포트 확인
open lighthouse-report.html
```

**목표 점수**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### 부하 테스트 (선택)
```bash
# K6 설치
brew install k6

# 부하 테스트 실행
k6 run tests/load/price-tracking.js

# 예상 출력:
# ✓ status is 200
# ✓ response time < 200ms
# 
# http_req_duration..........: avg=45ms  p(95)=89ms
# http_req_failed............: 0.23%
```

---

## 🐛 디버깅 가이드

### 일반적인 문제

#### 1. "Cannot connect to Supabase"
```bash
# 해결:
# 1. .env.local 파일 확인
cat .env.local | grep SUPABASE

# 2. URL 형식 확인
# ✅ https://xxxxx.supabase.co
# ❌ https://xxxxx.supabase.co/ (마지막 슬래시 제거)

# 3. Anon Key 확인
# Supabase Dashboard → Settings → API → anon public
```

#### 2. "Redis connection failed"
```bash
# 해결:
# 1. Railway Redis 사용 시
echo $REDIS_URL
# redis://default:password@host:6379

# 2. Upstash Redis 사용 시
echo $UPSTASH_REDIS_REST_URL
# https://xxxxx.upstash.io

# 3. Mock 클라이언트 사용 (개발용)
# 환경변수 없으면 자동으로 Mock 사용
```

#### 3. "Test timeout"
```bash
# 해결:
# 1. 타임아웃 증가
npm run test:e2e -- --timeout=60000

# 2. 느린 API 확인
# 개발자 도구 → Network → Slow 3G 해제

# 3. DB 인덱스 확인
# Supabase → SQL Editor
SELECT * FROM pg_indexes WHERE tablename = 'price_tracking';
```

---

## ✅ 테스트 완료 기준

### Minimum (배포 가능)
- [ ] 수동 테스트 Critical Path 1-3 통과 (인증, 검색, 알림)
- [ ] API 통합 테스트 80% 이상 통과
- [ ] 치명적 버그 0건
- [ ] 페이지 로딩 < 3초

### Recommended (권장)
- [ ] 수동 테스트 모든 Path 통과
- [ ] API 통합 테스트 100% 통과
- [ ] E2E 테스트 주요 플로우 통과
- [ ] Lighthouse 점수 90+

### Ideal (이상적)
- [ ] 모든 테스트 100% 통과
- [ ] 성능 테스트 통과
- [ ] 부하 테스트 통과 (100명 동시 접속)
- [ ] 크로스 브라우저 테스트 (Chrome, Firefox, Safari)

---

## 📝 테스트 결과 보고

### 템플릿
```markdown
# 테스트 결과 보고서
**날짜**: 2025-12-04
**테스터**: 김성현
**환경**: macOS, Chrome 120

## 수동 테스트
- Critical Path 1 (인증): ✅ 통과
- Critical Path 2 (검색): ⚠️ Mock 데이터 사용 중
- Critical Path 3 (알림): ✅ 통과
- Critical Path 4 (수요): ✅ 통과
- Critical Path 5 (AI): ❌ OpenAI API 키 없음

## API 통합 테스트
- 실행: 12/12 통과 (100%)
- 평균 응답 시간: 45ms
- 실패: 0건

## E2E 테스트
- 실행: 8/10 통과 (80%)
- 실패: AI 채팅 (API 키), 결제 (미구현)

## 성능
- Lighthouse 점수: 92
- 페이지 로딩: 1.8s (목표: 3s) ✅

## 발견된 이슈
1. Mock 데이터만 사용 중 (실제 API 미연동)
2. OpenAI API 키 설정 필요
3. 결제 기능 미구현

## 권장사항
- 즉시 배포 가능 (Mock 데이터로)
- 실제 API 연동 후 재테스트 필요
```

---

## 🚀 다음 단계

### 테스트 통과 시
1. ✅ 베타 배포 준비
2. ✅ 환경변수 프로덕션 설정
3. ✅ Vercel Preview 배포
4. ✅ 베타 사용자 초대 (50명)

### 테스트 실패 시
1. ❌ 버그 수정
2. ❌ 재테스트
3. ❌ 통과 후 배포

---

**시니어 개발자 조언**: 
> "100% 완벽한 테스트는 없습니다. Critical Path만 통과하면 배포하고, 실제 사용자 피드백으로 개선하세요."
