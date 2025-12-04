# 🚀 빠른 시작 가이드 (5분)
**시니어 개발자 관점: 최소한의 설정으로 빠르게 시작**

---

## Step 1: 환경 설정 (2분)

```bash
# 1. 빠른 설정 스크립트 실행
npm run quick:setup

# 출력 예시:
# ✅ .env.local 파일 생성 완료
# ⚠️  다음 환경변수를 설정해주세요:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 필수 환경변수 입력

`.env.local` 파일을 열고 다음 값을 입력:

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Redis (선택 - 없으면 Mock 사용)
REDIS_URL="redis://default:password@host:6379"
# 또는
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXX0ASQ..."
```

**Supabase 정보 찾기**:
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Settings → API
4. URL과 anon public key 복사

---

## Step 2: 개발 서버 실행 (1분)

```bash
# 개발 서버 시작
npm run dev

# 출력:
# ▲ Next.js 14.2.33
# - Local:        http://localhost:3000
# ✓ Ready in 2.3s
```

**브라우저에서 확인**:
```
http://localhost:3000
```

---

## Step 3: 빠른 테스트 (2분)

### 자동 테스트 (30초)
```bash
# 새 터미널 열기
npm run quick:test

# 출력:
# ✅ 홈페이지 로딩
# ✅ API 헬스 체크
# ✅ 정적 리소스 로딩
# 결과: 3/3 통과
```

### 수동 테스트 (1분 30초)

브라우저에서 다음 확인:

1. **홈페이지 로딩** ✅
   - http://localhost:3000 접속
   - 페이지가 정상적으로 표시되는지 확인

2. **제품 검색** ✅
   - 검색창에 "갤럭시 버즈" 입력
   - 검색 결과 표시 확인

3. **제품 상세** ✅
   - 검색 결과에서 제품 클릭
   - 제품 상세 페이지 로딩 확인

---

## 🎉 성공!

모든 테스트가 통과했다면 **배포 준비 완료**입니다!

### 다음 단계

**Option A: 즉시 배포** (권장)
```bash
# Vercel에 배포
vercel --prod
```

**Option B: 더 많은 테스트**
```bash
# 통합 테스트 실행 (10분)
npm run test:integration

# E2E 테스트 실행 (20분)
npm run test:e2e:ui
```

**Option C: 수동 테스트 계속**
```bash
# 체크리스트 열기
open MANUAL_TEST_CHECKLIST.md
```

---

## 🐛 문제 해결

### "Cannot connect to Supabase"
```bash
# 1. URL 확인 (마지막 슬래시 제거)
# ✅ https://xxxxx.supabase.co
# ❌ https://xxxxx.supabase.co/

# 2. Anon Key 확인
# Supabase Dashboard → Settings → API → anon public
```

### "Port 3000 already in use"
```bash
# 포트 변경
PORT=3001 npm run dev
```

### "Redis connection failed"
```bash
# Mock 클라이언트 사용 (개발용)
# .env.local에서 REDIS_URL 주석 처리
```

---

## 📊 시간 소요

| 단계 | 예상 시간 | 실제 시간 |
|------|----------|----------|
| 환경 설정 | 2분 | ⏱️ |
| 서버 실행 | 1분 | ⏱️ |
| 빠른 테스트 | 2분 | ⏱️ |
| **총계** | **5분** | ⏱️ |

---

**시니어 개발자 조언**:
> "5분 안에 실행되지 않으면 뭔가 잘못된 것입니다. 환경변수를 다시 확인하세요."
