# 이거사 (Igosa) - AI Shopping Assistant

> 한국 최초의 AI 네이티브 쇼핑 에이전트 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange)]()

---

## 프로젝트 개요

**이거사**는 AI 기술을 활용하여 한국 이커머스 시장에 혁신을 가져오는 쇼핑 에이전트입니다. 다나와의 수동 가격 비교를 넘어, 자연어 대화로 제품 발견부터 구매 결정까지 전 과정을 지원합니다.

### 핵심 차별화 요소

1. **대화형 AI 검색** - 자연어로 원하는 제품 표현
2. **실시간 멀티플랫폼 가격 비교** - 쿠팡, 네이버, 11번가 동시 검색
3. **AI 네고딜 (공동구매)** - 같은 제품 원하는 사용자 자동 그룹핑
4. **설명 가능한 추천** - 모든 추천에 근거 제시

---

## 기술 스택

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

### AI/ML
- **Primary LLM**: GPT-5 또는 Solar Pro 2
- **Speed LLM**: Gemini 2.5 Flash-Lite
- **Complex LLM**: Claude Sonnet 4.5
- **Embeddings**: Voyage-multilingual-2

---

## Quick Start

### Prerequisites
```bash
node >= 20.0.0
npm >= 10.0.0
```

### 1. 환경변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일에 필요한 API 키들을 입력하세요.

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 프로젝트 구조

```
igosa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 페이지
│   │   ├── (main)/            # 메인 앱 페이지
│   │   │   ├── chat/         # AI 챗봇 인터페이스
│   │   │   ├── products/     # 제품 상세/비교
│   │   │   ├── nego-deals/   # 공동구매
│   │   │   └── profile/      # 사용자 프로필
│   │   ├── api/              # API Routes
│   │   │   ├── chat/        # AI 대화 엔드포인트
│   │   │   ├── products/    # 제품 검색/비교
│   │   │   └── nego-deals/  # 공동구매 관리
│   │   └── layout.tsx        # Root layout
│   │
│   ├── components/            # React Components
│   │   ├── chat/             # 챗봇 UI
│   │   ├── products/         # 제품 카드/리스트
│   │   ├── nego-deals/       # 공동구매 UI
│   │   └── ui/              # 공통 UI (shadcn)
│   │
│   └── lib/                  # Utility Libraries
│       ├── ai/              # AI/LLM 관련
│       │   ├── agents/     # LangGraph agents
│       │   ├── prompts/    # Prompt templates
│       │   └── rag/        # RAG pipeline
│       ├── api/            # External API clients
│       ├── db/             # Database utilities
│       └── utils/          # 공통 유틸리티
│
├── docs/                     # 프로젝트 문서
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
├── prisma/                   # Database Schema
├── public/                   # Static Assets
└── tests/                    # Test Files
```

---

## 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# 타입 체크
npm run type-check
```

---

## 개발 문서

### 📚 핵심 문서 (최신 업데이트)

**배포 관련** (2025-01-19 업데이트)
- 🚀 [Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md) - **45분 빠른 배포 가이드**
- 📖 [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - 상세 배포 가이드 (트러블슈팅 포함)
- ✅ [Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md) - 구현 완료 요약
- 👨‍💼 [Senior Developer Recommendations](./docs/SENIOR_DEVELOPER_RECOMMENDATIONS.md) - 프로덕션 권장사항

**설계 문서**
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

## 다음 단계

### 즉시 개발 시작 가능한 항목들:

1. **기본 UI 컴포넌트 구축** (shadcn/ui)
2. **채팅 인터페이스 구현**
3. **제품 검색 API 연동** (Coupang, Naver)
4. **AI 챗봇 로직 구현** (LangChain)
5. **데이터베이스 스키마 구축** (Prisma)

---

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ in Seoul, Korea**
