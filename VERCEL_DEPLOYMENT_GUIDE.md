# Vercel 수동 배포 가이드

## 🚨 현재 상황
- GitHub 푸시 완료 ✅
- Vercel 자동 배포 미작동 ❌
- 수동 배포 필요

## 🔧 해결 방법

### 옵션 1: Vercel CLI 배포 (권장)

#### 1단계: Vercel 로그인
```bash
vercel login
```
- 이메일 입력
- 이메일로 받은 확인 링크 클릭

#### 2단계: 프로덕션 배포
```bash
cd /Users/sunghyunkim/igosa-1
vercel --prod
```

**예상 시간**: 2-3분

---

### 옵션 2: Vercel Dashboard에서 수동 배포

#### 1단계: Dashboard 접속
```
https://vercel.com/dashboard
```

#### 2단계: 프로젝트 선택
- igosa 프로젝트 클릭

#### 3단계: Deployments 탭
- "Redeploy" 버튼 클릭
- 또는 "Deploy" → "Import Git Repository"

#### 4단계: 배포 확인
- Building → Deploying → Ready
- 약 2-3분 소요

---

### 옵션 3: GitHub 연동 재설정

#### 1단계: Vercel Settings
```
프로젝트 → Settings → Git
```

#### 2단계: 연동 해제 후 재연결
1. "Disconnect" 클릭
2. "Connect Git Repository" 클릭
3. GitHub 선택
4. big-teddy/igosa 선택
5. Production Branch: main 설정

#### 3단계: 자동 배포 활성화
- Auto Deploy: ✅ Enabled
- Production Branch: main

---

## 🎯 배포 후 확인사항

### 1. 배포 성공 확인
```bash
# 프로덕션 URL 접속
curl https://your-project.vercel.app

# 또는 브라우저에서
open https://your-project.vercel.app
```

### 2. API 엔드포인트 테스트
```bash
# 헬스체크 (있다면)
curl https://your-project.vercel.app/api/health

# 협상 트리거 (테스트용)
curl -X POST https://your-project.vercel.app/api/negotiations/trigger \
  -H "Content-Type: application/json" \
  -d '{"productId": "TEST_001", "forceTrigger": true}'
```

### 3. Cron Job 확인
```
Vercel Dashboard → Settings → Cron Jobs
→ /api/cron/trigger-negotiations 활성화 확인
```

---

## 📋 환경변수 확인 (중요!)

배포 전 필수 환경변수 설정:

```
Vercel Dashboard → Settings → Environment Variables
```

### 필수 변수
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
CRON_SECRET=your-random-secret
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### 선택 변수
```bash
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@igosa.kr

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
```

---

## 🐛 문제 해결

### 빌드 실패 시
```bash
# 로컬에서 빌드 테스트
npm run build

# 성공하면 Vercel에서도 성공해야 함
```

### 환경변수 누락 시
```
Error: Missing environment variable
→ Vercel Dashboard에서 변수 추가
→ Redeploy
```

### ioredis 에러 시
```
이미 해결됨 ✅
runtime = 'nodejs' 설정 완료
```

---

## ✅ 빠른 실행 체크리스트

- [ ] `vercel login` 실행
- [ ] `vercel --prod` 실행
- [ ] 배포 완료 대기 (2-3분)
- [ ] 프로덕션 URL 접속 확인
- [ ] 환경변수 설정 확인
- [ ] Cron Job 활성화 확인

---

## 🚀 즉시 실행

**가장 빠른 방법**:
```bash
# 1. 로그인
vercel login

# 2. 배포
cd /Users/sunghyunkim/igosa-1
vercel --prod

# 3. 완료!
```

**예상 시간**: 5분 이내

---

**작성**: 2025-12-04  
**상태**: 수동 배포 준비 완료
