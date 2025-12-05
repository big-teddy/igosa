# 이거사 개발자 가이드

## 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Supabase 계정
- OpenAI API 키

### 설치

```bash
git clone https://github.com/big-teddy/igosa.git
cd igosa
npm install
```

### 환경 변수 설정

`.env.local` 파일 생성:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Sentry (선택)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# PostHog (선택)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

---

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── (main)/         # 메인 레이아웃 페이지
│   ├── api/            # API 라우트
│   └── layout.tsx      # 루트 레이아웃
├── components/         # React 컴포넌트
│   ├── ui/            # 기본 UI 컴포넌트
│   ├── negotiations/  # 협상 관련
│   ├── notifications/ # 알림 관련
│   └── layout/        # 레이아웃
├── lib/               # 유틸리티 & 서비스
│   ├── services/      # 비즈니스 로직
│   ├── supabase/      # DB 클라이언트
│   ├── monitoring/    # Sentry, PostHog
│   └── ai/            # AI 엔진
├── hooks/             # React 훅
└── types/             # TypeScript 타입
```

---

## 주요 기능

### 1. AI 협상 엔진
- 위치: `src/lib/ai/negotiation-engine.ts`
- LangGraph 기반 워크플로우
- 수요 분석 → 최적가 계산 → 제안 생성

### 2. 네고딜
- 서비스: `src/lib/services/nego-deal-service.ts`
- 공동구매 가격 자동 조정

### 3. 실시간 업데이트
- Supabase Realtime 사용
- 훅: `src/hooks/useNegotiation.ts`

---

## 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e
```

---

## 배포

```bash
# Vercel 배포
vercel --prod
```

---

## 문의
이슈: https://github.com/big-teddy/igosa/issues
