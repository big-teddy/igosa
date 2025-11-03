# 이거사 (Igosa) - AI Shopping Assistant

> 한국 최초의 AI 네이티브 쇼핑 에이전트 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange)]()

---

## 🚀 프로젝트 개요

**이거사**는 AI 기술을 활용하여 한국 이커머스 시장에 혁신을 가져오는 쇼핑 에이전트입니다. 다나와의 수동 가격 비교를 넘어, 자연어 대화로 제품 발견부터 구매 결정까지 전 과정을 지원합니다.

### 핵심 차별화 요소

1. **🤖 대화형 AI 검색**
   - 자연어로 원하는 제품 표현 ("편한 러닝화 추천해줘")
   - 다중 턴 대화로 요구사항 정제
   - 한국어 존댓말(해요체) 완벽 지원

2. **💰 실시간 멀티플랫폼 가격 비교**
   - 쿠팡, 네이버, 11번가 동시 검색
   - 배송비 포함 총액 비교
   - 가격 변동 추적 및 알림

3. **🤝 AI 네고딜 (공동구매)**
   - 같은 제품 원하는 사용자 자동 그룹핑
   - AI가 판매자에게 협상 이메일 발송
   - 목표 달성 시 자동 할인 적용

4. **📊 설명 가능한 추천**
   - 모든 추천에 근거 제시
   - 리뷰, 스펙, 전문가 의견 출처 명시
   - 투명한 의사결정 지원

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js 20 (Edge Runtime)
- **Database**: Supabase (PostgreSQL)
- **Vector DB**: Weaviate Cloud
- **Cache**: Redis (Upstash)
- **Search**: Typesense (optional)

### AI/ML
- **Primary LLM**: GPT-5 또는 Solar Pro 2 (80%)
- **Speed LLM**: Gemini 2.5 Flash-Lite (15%)
- **Complex LLM**: Claude Sonnet 4.5 (5%)
- **Embeddings**: Voyage-multilingual-2
- **Framework**: LangChain / LlamaIndex
- **Monitoring**: LangSmith

### Infrastructure
- **Hosting**: Vercel (Edge Functions)
- **CDN**: Vercel Edge Network
- **DNS**: Cloudflare
- **Analytics**: PostHog
- **Monitoring**: Sentry + Axiom

### External APIs
- **E-commerce**: Coupang Partners, Naver Shopping API
- **Payment**: Kakao Pay, Naver Pay, Toss
- **Messaging**: KakaoTalk Channel API
- **Email**: SendGrid

---

## 📦 Quick Start

### Prerequisites
```bash
node >= 20.0.0
npm >= 10.0.0
```

### 1. Clone Repository
```bash
git clone https://github.com/your-org/igosa.git
cd igosa
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

`.env.local` 파일에 다음 키들을 입력:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# AI Models
OPENAI_API_KEY="sk-..."
UPSTAGE_API_KEY="up-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="AIza..."
VOYAGE_API_KEY="pa-..."

# Vector Database
WEAVIATE_URL="https://..."
WEAVIATE_API_KEY="..."

# E-commerce APIs
COUPANG_ACCESS_KEY="..."
COUPANG_SECRET_KEY="..."
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."

# Payment
KAKAO_PAY_CID="..."
KAKAO_PAY_SECRET="..."
NAVER_PAY_CLIENT_ID="..."
TOSS_CLIENT_KEY="..."

# Monitoring
LANGSMITH_API_KEY="..."
SENTRY_DSN="..."
AXIOM_TOKEN="..."
POSTHOG_KEY="..."
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
igosa/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (main)/            # 메인 앱 페이지
│   │   ├── chat/         # AI 챗봇 인터페이스
│   │   ├── products/     # 제품 상세/비교
│   │   ├── nego-deals/   # 공동구매
│   │   └── profile/      # 사용자 프로필
│   ├── api/              # API Routes
│   │   ├── chat/        # AI 대화 엔드포인트
│   │   ├── products/    # 제품 검색/비교
│   │   ├── nego/        # 공동구매 관리
│   │   └── webhooks/    # 외부 웹훅
│   └── layout.tsx        # Root layout
│
├── components/            # React Components
│   ├── chat/             # 챗봇 UI
│   ├── products/         # 제품 카드/리스트
│   ├── nego-deals/       # 공동구매 UI
│   └── ui/              # 공통 UI (shadcn)
│
├── lib/                  # Utility Libraries
│   ├── ai/              # AI/LLM 관련
│   │   ├── agents/     # LangGraph agents
│   │   ├── prompts/    # Prompt templates
│   │   ├── rag/        # RAG pipeline
│   │   └── cache.ts    # Semantic caching
│   ├── api/            # External API clients
│   │   ├── coupang.ts
│   │   ├── naver.ts
│   │   └── kakao.ts
│   ├── db/             # Database utilities
│   │   └── prisma.ts
│   └── utils/          # 공통 유틸리티
│
├── prisma/              # Database Schema
│   ├── schema.prisma
│   └── seed.ts
│
├── public/              # Static Assets
│
├── docs/                # Documentation
│   ├── 01_PRD_Product_Requirements.md
│   ├── 02_Tech_Spec_Architecture.md
│   ├── 03_API_Integration_Guide.md
│   ├── 04_AI_Implementation.md
│   ├── 05_Frontend_Guide.md
│   ├── 06_DevOps_Infrastructure.md
│   ├── 07_Development_Timeline.md
│   ├── 08_Testing_QA.md
│   └── 09_Legal_Compliance.md
│
├── tests/              # Test Files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example        # Environment template
├── .env.local         # Local environment (gitignored)
├── next.config.js     # Next.js config
├── tailwind.config.ts # Tailwind config
├── tsconfig.json      # TypeScript config
└── package.json       # Dependencies
```

---

## 🎯 주요 기능

### 1. AI 대화형 검색

**사용자 입력:**
```
편한 러닝화 추천해줘
```

**AI 응답:**
```
편안한 착용감을 중시하는 러닝화를 찾고 계시네요. 
쿠셔닝과 발 편안함에 초점을 맞춰 추천드릴게요.

🏃 추천 제품 Top 3:

1. 나이키 에어 줌 페가수스 40
   💰 ₩149,000 (쿠팡 최저가)
   ⭐ 4.7/5.0 (1,234개 리뷰)
   ✨ 추천 이유: 리뷰 89%가 "편하다" 평가, 
                Zoom Air 쿠셔닝 기술
   📦 무료배송 | 🚀 로켓배송

2. 아디다스 울트라부스트 23
   💰 ₩169,000 (네이버 최저가)
   ⭐ 4.8/5.0 (892개 리뷰)
   ✨ 추천 이유: Boost 폼 쿠셔닝, 양말처럼 편한 착용감
   📦 무료배송 | 🚚 2일 배송

3. 호카 본디 8
   💰 ₩189,000 (11번가)
   ⭐ 4.9/5.0 (456개 리뷰)
   ✨ 추천 이유: 최대 쿠셔닝, 장거리 러닝에 최적
   📦 무료배송 | 🚚 3일 배송

더 자세한 정보가 필요하시거나 다른 조건이 있으시면 말씀해 주세요!
```

### 2. 실시간 가격 비교

| 플랫폼 | 제품가 | 배송비 | 총액 | 배송 |
|--------|--------|--------|------|------|
| 🏆 쿠팡 | ₩149,000 | 무료 | **₩149,000** | 로켓배송 (내일 도착) |
| 네이버 | ₩152,000 | 무료 | ₩152,000 | 2일 배송 |
| 11번가 | ₩147,000 | ₩2,500 | ₩149,500 | 3일 배송 |

### 3. AI 네고딜 (공동구매)

```
📢 나이키 페가수스 40 공동구매 진행 중!

현재 참여: 7명 / 목표: 10명
할인율: 15% (₩22,350 절약)
예상 최종가: ₩126,650

⏰ 마감: 48시간 남음

[참여하기] 버튼 클릭 시:
- 목표 달성 시 자동 할인 적용
- 미달성 시 일반가 구매 또는 취소 가능
```

---

## 📚 개발 문서

상세한 개발 가이드는 `/docs` 폴더에서 확인하세요:

1. [Product Requirements Document](./docs/01_PRD_Product_Requirements.md) - 제품 요구사항
2. [Technical Architecture](./docs/02_Tech_Spec_Architecture.md) - 시스템 아키텍처
3. [API Integration Guide](./docs/03_API_Integration_Guide.md) - API 연동 가이드
4. [AI Implementation](./docs/04_AI_Implementation.md) - AI/LLM 구현
5. [Frontend Guide](./docs/05_Frontend_Guide.md) - UI/UX 구현
6. [DevOps & Infrastructure](./docs/06_DevOps_Infrastructure.md) - 배포 및 인프라
7. [Development Timeline](./docs/07_Development_Timeline.md) - 개발 일정
8. [Testing & QA](./docs/08_Testing_QA.md) - 테스팅 가이드
9. [Legal & Compliance](./docs/09_Legal_Compliance.md) - 법률 준수

---

## 🧪 Testing

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Test Coverage
npm run test:coverage

# AI Quality Tests
npm run test:ai
```

---

## 🚀 Deployment

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경변수 설정
Vercel Dashboard에서 Environment Variables 추가

---

## 📊 Monitoring

- **Application**: Vercel Analytics
- **Errors**: Sentry
- **Logs**: Axiom
- **AI Performance**: LangSmith
- **User Analytics**: PostHog

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Product**: [Your Name]
- **Engineering**: [Team]
- **AI/ML**: [Team]
- **Design**: [Team]

---

## 📧 Contact

- **Website**: [https://igosa.kr](https://igosa.kr)
- **Email**: contact@igosa.kr
- **Discord**: [Join Community](https://discord.gg/igosa)
- **Twitter**: [@igosa_kr](https://twitter.com/igosa_kr)

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- Upstage for Solar Pro 2
- Anthropic for Claude
- Google for Gemini
- Vercel for hosting platform
- All open-source contributors

---

**Made with ❤️ in Seoul, Korea**

[⬆ Back to Top](#이거사-igosa---ai-shopping-assistant)
