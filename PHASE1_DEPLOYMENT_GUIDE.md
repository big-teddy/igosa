# 🚀 Phase 1 배포 가이드
**목적**: AI 협상 플랫폼 로컬 테스트 및 프로덕션 배포

---

## 📋 사전 준비 (5분)

### 1. Supabase 설정
```bash
# 1. Supabase Dashboard 접속
open https://supabase.com/dashboard

# 2. 프로젝트 선택 (또는 새로 생성)

# 3. SQL Editor에서 마이그레이션 실행
# supabase/migrations/20251204_create_negotiation_tables.sql 내용 복사 & 실행
```

### 2. 환경변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local

# 필수 환경변수 입력
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# 선택 (Redis)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# 선택 (Email - 현재 Mock 모드)
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@igosa.kr"

# Cron Secret (랜덤 생성)
CRON_SECRET="$(openssl rand -hex 32)"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🧪 로컬 테스트 (10분)

### Step 1: 개발 서버 실행
```bash
npm run dev
```

### Step 2: 테스트 판매자 생성
```sql
-- Supabase SQL Editor에서 실행
INSERT INTO seller_profiles (
  user_id,
  company_name,
  contact_email,
  auto_negotiate,
  min_margin_percent,
  min_volume,
  max_discount_percent,
  status,
  verified
) VALUES (
  'test-seller-uuid', -- TODO: 실제 user_id
  '테스트 판매자',
  'seller@test.com',
  true,
  15.0,
  50,
  30.0,
  'active',
  true
);
```

### Step 3: 테스트 수요 생성
```bash
# 100명의 사용자가 가격 알림 설정했다고 가정
# Redis에 수요 데이터 추가 (또는 실제 UI에서 설정)

# 또는 직접 API 호출
curl -X POST http://localhost:3000/api/price-tracking \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "TEST_PRODUCT_001",
    "targetPrice": 240000,
    "maxAcceptableDelta": 3000,
    "notificationChannels": ["push"]
  }'
```

### Step 4: 협상 트리거 테스트
```bash
# 수동 트리거
curl -X POST http://localhost:3000/api/negotiations/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "TEST_PRODUCT_001",
    "forceTrigger": true
  }'

# 응답 예시:
# {
#   "success": true,
#   "data": {
#     "negotiationId": "uuid",
#     "status": "in_progress",
#     "participants": 100,
#     "proposedPrice": 243000,
#     "estimatedSuccess": 0.85
#   }
# }
```

### Step 5: 협상 상태 확인
```bash
# 협상 ID로 상태 조회
curl http://localhost:3000/api/negotiations/{negotiationId}

# 타임라인 확인
# {
#   "timeline": [
#     {
#       "timestamp": "2025-12-04T10:00:00Z",
#       "type": "ai_proposal",
#       "message": "AI가 ₩243,000에 100개 제안"
#     }
#   ]
# }
```

### Step 6: 판매자 응답 시뮬레이션
```bash
# 판매자가 수락
curl -X POST http://localhost:3000/api/negotiations/{negotiationId}/seller-response \
  -H "Content-Type: application/json" \
  -d '{
    "response": "accepted"
  }'

# 콘솔에서 이메일/푸시 알림 로그 확인
# 📧 Email Preview:
# To: user@example.com
# Subject: 🎉 네고딜 성공! ...
```

---

## 🌐 프로덕션 배포 (30분)

### Step 1: Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod

# 환경변수 설정 (Vercel Dashboard)
# Settings → Environment Variables
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - CRON_SECRET
# - 기타 필요한 변수들
```

### Step 2: Cron Job 활성화
```bash
# vercel.json에 이미 설정됨
# {
#   "crons": [
#     {
#       "path": "/api/cron/trigger-negotiations",
#       "schedule": "0 * * * *"
#     }
#   ]
# }

# Vercel Dashboard에서 확인
# Settings → Cron Jobs → 활성화 확인
```

### Step 3: SendGrid 연동 (선택)
```bash
# 1. SendGrid 계정 생성
open https://sendgrid.com

# 2. API Key 생성
# Settings → API Keys → Create API Key

# 3. 환경변수 추가
# SENDGRID_API_KEY=SG.xxx
# EMAIL_FROM=noreply@igosa.kr

# 4. 도메인 인증 (선택)
# Settings → Sender Authentication
```

### Step 4: 모니터링 설정
```bash
# Vercel Analytics (자동 활성화)
# Vercel Dashboard → Analytics

# Sentry (선택)
# 1. Sentry 프로젝트 생성
# 2. DSN 복사
# 3. 환경변수 추가: SENTRY_DSN=https://...

# PostHog (선택)
# 1. PostHog 프로젝트 생성
# 2. API Key 복사
# 3. 환경변수 추가: NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

---

## ✅ 검증 체크리스트

### 로컬 테스트
- [ ] 개발 서버 정상 실행
- [ ] 협상 트리거 API 작동
- [ ] AI 워크플로우 실행 확인
- [ ] 이메일 로그 출력 확인
- [ ] 푸시 알림 로그 출력 확인
- [ ] DB에 협상 세션 저장 확인
- [ ] 타임라인 이벤트 기록 확인

### 프로덕션 배포
- [ ] Vercel 배포 성공
- [ ] 환경변수 설정 완료
- [ ] Cron Job 활성화
- [ ] HTTPS 작동 확인
- [ ] API 엔드포인트 접근 가능
- [ ] 에러 로깅 작동 확인

### 실제 협상 테스트
- [ ] 실제 사용자 50명+ 참여
- [ ] 협상 자동 트리거
- [ ] 판매자 이메일 수신
- [ ] 판매자 응답 처리
- [ ] 사용자 알림 발송
- [ ] 48시간 구매 윈도우 작동

---

## 🐛 문제 해결

### 문제 1: Supabase 연결 실패
```bash
# 증상: "Failed to connect to Supabase"

# 해결:
# 1. .env.local 확인
# 2. NEXT_PUBLIC_SUPABASE_URL 정확한지 확인
# 3. NEXT_PUBLIC_SUPABASE_ANON_KEY 정확한지 확인
# 4. Supabase 프로젝트 활성화 상태 확인
```

### 문제 2: Redis 연결 실패
```bash
# 증상: "Redis connection failed"

# 해결:
# 1. Redis는 선택사항 (없어도 작동)
# 2. Mock Redis 사용 중인지 확인
# 3. Upstash Redis 사용 시 URL/Token 확인
```

### 문제 3: 이메일 전송 안됨
```bash
# 증상: 이메일이 실제로 전송되지 않음

# 해결:
# 1. 현재 Mock 모드 (콘솔 출력만)
# 2. SendGrid 연동 필요
# 3. SENDGRID_API_KEY 설정
# 4. email-service.ts의 TODO 주석 해제
```

### 문제 4: Cron Job 실행 안됨
```bash
# 증상: 자동 협상 트리거 안됨

# 해결:
# 1. Vercel Dashboard → Cron Jobs 확인
# 2. CRON_SECRET 환경변수 설정 확인
# 3. 로그 확인: Vercel Dashboard → Logs
# 4. 수동 테스트: curl https://your-app.vercel.app/api/cron/trigger-negotiations
```

---

## 📊 성능 모니터링

### 주요 지표
```typescript
// 협상 성공률
const successRate = successfulNegotiations / totalNegotiations;
// 목표: 40%+

// 평균 응답 시간
const avgResponseTime = totalResponseTime / totalNegotiations;
// 목표: 24시간 이하

// 사용자 전환율
const conversionRate = purchases / participants;
// 목표: 20%+

// 이메일 오픈율
const emailOpenRate = emailsOpened / emailsSent;
// 목표: 30%+
```

### 대시보드 쿼리
```sql
-- 협상 통계
SELECT 
  status,
  COUNT(*) as count,
  AVG(final_price - ai_proposed_price) as avg_price_diff,
  AVG(EXTRACT(EPOCH FROM (completed_at - triggered_at))/3600) as avg_hours
FROM negotiations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status;

-- 판매자 성과
SELECT 
  sp.company_name,
  sp.total_negotiations,
  sp.successful_negotiations,
  ROUND(sp.successful_negotiations::DECIMAL / sp.total_negotiations * 100, 2) as success_rate
FROM seller_profiles sp
WHERE sp.status = 'active'
ORDER BY success_rate DESC;
```

---

## 🎯 다음 단계

### 즉시 (오늘)
1. ✅ 로컬 테스트 완료
2. ✅ Supabase 마이그레이션
3. ✅ 테스트 판매자 생성
4. ✅ 협상 1건 테스트

### 1주일 내
1. ⚠️ Vercel 프로덕션 배포
2. ⚠️ SendGrid 연동
3. ⚠️ 베타 사용자 초대
4. ⚠️ 실제 협상 성사

### 1개월 내
1. 📊 Week 5-6: 소셜 네고딜
2. 📊 Week 7: 실시간 타임라인
3. 📊 Week 8: 통합 테스트
4. 📊 공식 론칭

---

**작성**: 2025-12-04  
**버전**: 1.0  
**상태**: Phase 1 배포 준비 완료
