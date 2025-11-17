# 이거사 네고딜 2.0: AI 협상 마켓플레이스 개발 문서

**문서 버전:** 1.0  
**작성일:** 2025-01-20  
**작성자:** Product & Engineering Leadership  
**대상 독자:** AI/ML Engineers, Backend Engineers, Product Managers  
**기밀 등급:** Internal - Confidential

---

## Executive Summary

### 전략적 배경
Google의 2025년 1월 검색 패러다임 전환(AI Mode 전면화)과 Perplexity의 Price Tracking 기능 출시는 **커머스가 검색이 아닌 AI 협상 중심으로 재편**되고 있음을 시사합니다. 구글은 연간 검색 광고 매출($1750억, 전체의 55%)의 점진적 감소를 감내하면서 AI 커머스 시장 진출을 선택했습니다.

### 비즈니스 임팩트
- **기존 모델:** 4-5% 제휴 수수료 → 월 ₩4-5억 수익 (500K MAU 시)
- **네고딜 2.0 모델:** 0.3-0.5% 거래 수수료 + 판매자 SaaS → **월 ₩12-18억 수익 잠재력**
- **시장 타이밍:** AI 협상 거래 본격화 예상 시점 2026 H2~2027 H1
- **경쟁 우위:** 국내 최초 AI-to-AI 협상 플랫폼 (12-18개월 First Mover Advantage)

### 개발 우선순위
이 문서는 3-phase 접근법을 제시합니다:
1. **Phase 1 (Q1-Q2 2025):** Price Tracking 2.0 + 수요 집계 인프라
2. **Phase 2 (Q3-Q4 2025):** AI 협상 엔진 MVP + 판매자 플랫폼
3. **Phase 3 (2026+):** 완전한 AI 마켓플레이스 + 카테고리 확장

---

## Table of Contents
1. [Product Vision & Objectives](#1-product-vision--objectives)
2. [User Stories & Use Cases](#2-user-stories--use-cases)
3. [Technical Architecture](#3-technical-architecture)
4. [API Specifications](#4-api-specifications)
5. [Data Models](#5-data-models)
6. [Development Roadmap](#6-development-roadmap)
7. [Success Metrics](#7-success-metrics)
8. [Risk Assessment](#8-risk-assessment)

---

## 1. Product Vision & Objectives

### 1.1 Product Vision
> "이거사는 단순 가격 비교를 넘어, 수백만 사용자의 구매력을 AI가 자동으로 집계하여 판매자 AI와 협상함으로써, 소비자는 최저가를 얻고 판매자는 대량 판매를 달성하는 **한국 최초 AI 협상 마켓플레이스**가 된다."

### 1.2 Core Objectives

**Business Objectives:**
- 2025 Q4까지 월 GMV ₩100억 달성 (AI 협상 거래 ₩30억 포함)
- 판매자 플랫폼 수익: 월 ₩200M (1,000개 판매자 × ₩200K)
- AI 협상 수수료 수익: 월 ₩150M (₩30B GMV × 0.5%)

**Product Objectives:**
- Price Tracking 기능 DAU 60% 이상 (현재 20% 대비 3배)
- AI 협상 성사율 40%+ (제안 대비)
- 판매자 플랫폼 채택률 30% (Top 1000 전자제품 셀러 기준)

**Technical Objectives:**
- AI 협상 응답 시간 \u003c500ms (P95)
- 수요 집계 정확도 95%+
- 동시 협상 처리 능력 10,000+ negotiations/min

### 1.3 Success Criteria

**Phase 1 성공 조건 (2025 Q2):**
- ✅ 50,000+ 사용자가 희망 가격 설정
- ✅ 1,000+ 제품에 대해 유의미한 수요 집계 (제품당 100+ 사용자)
- ✅ 판매자 피드백: 80%가 "AI 협상에 참여 의향 있음"

**Phase 2 성공 조건 (2025 Q4):**
- ✅ 100+ 판매자가 AI 협상 활성화
- ✅ 첫 1,000건 AI 협상 거래 성사
- ✅ 협상 평균 절감액 8-12%

**Phase 3 성공 조건 (2026 H1):**
- ✅ 월 10,000+ AI 협상 거래
- ✅ 전자제품 → 여행/보험 카테고리 확장
- ✅ AI 협상이 전체 GMV의 30% 차지

---

## 2. User Stories & Use Cases

### 2.1 Primary User Personas

#### Persona 1: 가성비 중시 MZ세대 (Min-ji, 28세)
**현재 Pain Points:**
- 5개 쇼핑몰 돌아다니며 가격 비교하는 시간 낭비
- 구매 후 더 저렴한 가격 발견 시 후회
- 정기 구매 제품(화장품, 건강기능식품) 가격 변동 추적 불가

**네고딜 2.0 Value Proposition:**
- "35,000원에 사고 싶어요" 설정하면 AI가 자동 협상
- 정기 구매 제품 최저가 시점 자동 알림
- 친구들과 함께 협상하면 더 큰 할인 (소셜 네고딜)

#### Persona 2: 중소형 전자제품 판매자 (대표 박성훈, 45세)
**현재 Pain Points:**
- 쿠팡/네이버에서 광고비 지불해도 가격 경쟁에서 밀림
- 재고 소진을 위해 할인하고 싶지만 플랫폼 수수료 부담
- 잠재 고객 수요를 미리 알 수 없어 재고 계획 어려움

**네고딜 2.0 Value Proposition:**
- AI가 실시간 수요(예: 1,500명이 35,000원 희망) 알려줌
- 재고와 마진 고려해 최적 협상 가격 AI가 제안
- 대량 판매로 단가 낮춰도 총 수익 증가

#### Persona 3: 바쁜 X세대 직장인 (이지혜, 42세)
**현재 Pain Points:**
- 반복 구매 제품(고양이 사료 24,000원) 가격 매번 확인 귀찮음
- 여행 상품 가격 변동 심해서 예약 타이밍 놓침
- 자동차 보험 갱신 때마다 여러 보험사 비교 번거로움

**네고딜 2.0 Value Proposition:**
- 반복 구매 제품 자동 최저가 구매
- 여행 AI가 11월 홍콩 최저가 시점 자동 협상
- 보험 AI 에이전트가 3개 보험사 동시 협상

### 2.2 Core Use Cases

#### Use Case 1: 가격 추적 및 희망 가격 설정
```
GIVEN: 사용자가 "갤럭시 버즈3 Pro" 제품 페이지 진입
WHEN: 현재 가격 ₩259,000, 최근 30일 최저가 ₩235,000
THEN: 
  - AI 제안: "₩240,000에 구매하시겠어요? 이 가격 되면 알려드릴게요"
  - 사용자 클릭 시 희망 가격 설정 완료
  - 백그라운드에서 수요 집계 시작
  
RESULT:
  - 24시간 내 1,847명이 ₩240,000 설정
  - AI가 판매자에게 "1,847개 수요 있음, ₩242,000에 판매 의향?" 제안
  - 판매자 수락 시 1,847명에게 동시 알림 발송
```

#### Use Case 2: AI-to-AI 자동 협상
```
ACTOR: 구매자 AI Agent (Igosa)
ACTOR: 판매자 AI Agent (Seller Dashboard)

STEP 1: 수요 집계 완료
  - Product: 버즈3 Pro
  - ₩240,000: 1,847명
  - ₩245,000: 892명
  - ₩250,000: 534명
  - Total Demand: 3,273명

STEP 2: 구매자 AI → 판매자 AI 제안
  POST /api/v2/negotiate
  {
    "product_id": "12345",
    "buyer_agent": "igosa",
    "proposal": {
      "tier_1": {"price": 240000, "quantity": 1847},
      "tier_2": {"price": 245000, "quantity": 892},
      "tier_3": {"price": 250000, "quantity": 534}
    },
    "valid_until": "2025-01-25T23:59:59Z"
  }

STEP 3: 판매자 AI 자동 분석
  - 현재 재고: 5,000개
  - 원가: ₩180,000
  - 목표 마진: 15%
  - 계산 결과: Tier 1 수락 시 총 이익 ₩110.8M

STEP 4: 판매자 AI 역제안
  PATCH /api/v2/negotiate/{id}
  {
    "counter_proposal": {
      "tier_1": {"price": 242000, "quantity": 1847}, // +2K 제안
      "tier_2": {"price": 245000, "quantity": 892},
      "tier_3": {"price": 249000, "quantity": 534}  // -1K 양보
    }
  }

STEP 5: 구매자 AI 자동 수락 (임계값 내)
  - 사용자 설정: ₩240K 이하 희망, 최대 +3K 허용
  - ₩242K는 허용 범위 내
  - 자동 수락 후 1,847명에게 알림

STEP 6: 거래 체결
  - 48시간 구매 윈도우 오픈
  - 1,612명 실구매 (87% 전환율)
  - 총 GMV: ₩390M
  - 이거사 수수료 (0.5%): ₩1.95M
```

#### Use Case 3: 반복 구매 자동화
```
GIVEN: 사용자가 매달 "로얄캐닌 고양이 사료 10kg" 구매
WHEN: AI가 구매 패턴 인식 (3개월간 매월 15일±3일 구매)
THEN:
  - AI 자동 가격 추적 활성화
  - 현재 가격 ₩82,000, 최근 90일 최저가 ₩74,000
  - ₩76,000 이하로 떨어지면 자동 알림 + 원클릭 구매 제안
  
ADVANCED:
  - 사용자 승인 시 "자동 구매" 모드 활성화
  - AI가 ₩76,000 이하 달성 시 자동 주문
  - 구매 후 SMS 확인만 받음 (귀찮니즘 해결)
```

---

## 3. Technical Architecture

### 3.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  [Web App] [iOS App] [Android App] [KakaoTalk Mini-App]        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  - Authentication (JWT)                                          │
│  - Rate Limiting (Redis)                                         │
│  - Request Routing                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Price Service │    │ Negotiation   │    │ User Service  │
│               │    │ Engine        │    │               │
│ - Tracking    │    │ - AI Agent    │    │ - Profiles    │
│ - Alerts      │    │ - Matching    │    │ - Preferences │
│ - History     │    │ - Settlement  │    │ - History     │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
        ┌──────────────────────────────────────────┐
        │          Data & AI Layer                 │
        │  ┌────────────┐  ┌─────────────┐        │
        │  │ PostgreSQL │  │   Pinecone  │        │
        │  │ (Primary)  │  │ (Embeddings)│        │
        │  └────────────┘  └─────────────┘        │
        │  ┌────────────┐  ┌─────────────┐        │
        │  │Redis Cache │  │  ClickHouse │        │
        │  │            │  │  (Analytics)│        │
        │  └────────────┘  └─────────────┘        │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │          AI/ML Services                  │
        │  - Solar Pro 2 (Korean NLU)             │
        │  - Gemini 2.0 Flash (Speed)             │
        │  - Claude 3.5 Sonnet (Complex)          │
        │  - LangGraph (Orchestration)            │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │      External Integrations               │
        │  - Coupang Partners API                  │
        │  - Naver Shopping API                    │
        │  - Kakao Pay / Naver Pay                 │
        │  - SMS/Push Notification Services        │
        └──────────────────────────────────────────┘
```

### 3.2 Core Microservices

#### 3.2.1 Price Tracking Service

**Responsibilities:**
- 멀티 플랫폼 가격 크롤링 (Coupang, Naver, 11st, Gmarket)
- 가격 이력 저장 및 분석
- 사용자별 희망 가격 관리
- 가격 도달 시 알림 트리거

**Tech Stack:**
- Language: Python 3.11+
- Framework: FastAPI
- Database: TimescaleDB (시계열 데이터 최적화)
- Cache: Redis (실시간 가격 조회)
- Queue: RabbitMQ (비동기 크롤링 작업)

**Key Endpoints:**
```python
POST   /api/v2/price-tracking/enable
GET    /api/v2/price-tracking/history/{product_id}
POST   /api/v2/price-tracking/set-target-price
DELETE /api/v2/price-tracking/disable/{tracking_id}
GET    /api/v2/price-tracking/alerts
```

**Performance Requirements:**
- 가격 업데이트 주기: 주요 제품 1시간, 일반 제품 6시간
- 알림 지연 시간: \u003c30초 (가격 도달 → 사용자 알림)
- 동시 추적 가능 제품: 100,000+
- API 응답 시간: P95 \u003c200ms

#### 3.2.2 Negotiation Engine Service

**Responsibilities:**
- 수요 집계 (Demand Aggregation)
- AI Agent 간 협상 오케스트레이션
- 협상 매칭 알고리즘
- 거래 체결 및 정산

**Tech Stack:**
- Language: Go 1.21+ (고성능 동시성)
- Framework: gRPC (마이크로서비스 간 통신)
- Database: PostgreSQL (거래 데이터)
- AI Orchestration: LangGraph + Redis
- Message Broker: Apache Kafka (협상 이벤트 스트리밍)

**AI Agent Architecture:**

```python
# LangGraph 기반 Negotiation Agent 구조

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from typing import TypedDict, Annotated, Sequence
import operator

class NegotiationState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    product_id: str
    demand_tiers: dict  # {price: quantity}
    seller_constraints: dict
    current_proposal: dict
    negotiation_history: list
    final_deal: dict | None

# Agent Nodes
def demand_aggregator_node(state: NegotiationState):
    """수요를 가격대별로 집계"""
    pass

def buyer_agent_node(state: NegotiationState):
    """구매자 AI 에이전트 - 제안 생성"""
    pass

def seller_agent_node(state: NegotiationState):
    """판매자 AI 에이전트 - 역제안 생성"""
    pass

def deal_validator_node(state: NegotiationState):
    """거래 유효성 검증 (재고, 가격, 조건)"""
    pass

def settlement_node(state: NegotiationState):
    """거래 체결 및 사용자 알림"""
    pass

# Graph Construction
workflow = StateGraph(NegotiationState)

workflow.add_node("demand_aggregator", demand_aggregator_node)
workflow.add_node("buyer_agent", buyer_agent_node)
workflow.add_node("seller_agent", seller_agent_node)
workflow.add_node("validator", deal_validator_node)
workflow.add_node("settlement", settlement_node)

# Conditional Edge: 협상 계속 vs 종료
def should_continue_negotiation(state: NegotiationState):
    if state["final_deal"] is not None:
        return "settlement"
    if len(state["negotiation_history"]) >= 5:  # Max 5 rounds
        return END
    return "seller_agent"

workflow.add_edge("demand_aggregator", "buyer_agent")
workflow.add_edge("buyer_agent", "seller_agent")
workflow.add_conditional_edges(
    "seller_agent",
    should_continue_negotiation,
    {
        "settlement": "settlement",
        "seller_agent": "seller_agent",
        END: END
    }
)

workflow.set_entry_point("demand_aggregator")
app = workflow.compile()
```

**Performance Requirements:**
- 협상 처리 시간: \u003c500ms per round
- 동시 협상 처리: 10,000+ concurrent negotiations
- 거래 체결 성공률: 40%+ (phase 2 목표)
- AI 에이전트 정확도: 95%+ (가격 계산, 재고 확인)

#### 3.2.3 Seller Platform Service

**Responsibilities:**
- 판매자 대시보드 (수요 인사이트)
- AI 협상 설정 인터페이스
- 재고/가격 관리
- 거래 분석 리포팅

**Tech Stack:**
- Language: TypeScript
- Framework: Next.js 14 (App Router)
- Backend: tRPC + Prisma ORM
- Database: PostgreSQL
- Real-time: WebSocket (협상 진행 상황)

**Key Features:**
1. **수요 히트맵 대시보드**
   - 실시간으로 제품별 수요량 시각화
   - 가격대별 수요 분포 차트
   - 경쟁사 가격 비교

2. **AI 협상 설정**
   - 최소 판매 가격 설정
   - 재고 수량 연동
   - 자동 협상 규칙 (예: "재고 30% 이상이면 5% 추가 할인 허용")

3. **거래 성과 분석**
   - AI 협상 vs 일반 판매 전환율 비교
   - 평균 할인율 vs 판매량 상관관계
   - ROI 계산 (광고비 절감 효과)

### 3.3 Data Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Ingestion Layer                           │
│  [Price Crawler] [User Actions] [Negotiation Events]      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │ Apache Kafka │
                  │ (Stream)     │
                  └──────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ClickHouse   │  │ PostgreSQL   │  │ Redis Cache  │
│ (Analytics)  │  │ (Transact)   │  │ (Real-time)  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                ┌──────────────────┐
                │ AI Training      │
                │ Pipeline         │
                │ (Nightly Batch)  │
                └──────────────────┘
```

### 3.4 Security & Compliance

**PIPA (개인정보보호법) 준수:**
- 희망 가격 데이터 암호화 (AES-256)
- 수요 집계 시 개인 식별 정보 제거 (Anonymization)
- 사용자 동의 없이 제3자(판매자)에게 개인정보 미전달

**금융 거래 보안:**
- PCI DSS Level 1 준수 (결제 정보 처리)
- 2FA 필수 (₩100K+ 거래)
- Fraud Detection AI (이상 거래 패턴 감지)

**AI 거래 검증:**
- 할루시네이션 방지: 모든 가격 계산 Rule-based 검증
- 거래 체결 전 사람 승인 옵션 (Phase 1-2)
- Audit Trail: 모든 AI 결정 로그 1년 보관

---

## 4. API Specifications

### 4.1 Price Tracking API

#### 4.1.1 희망 가격 설정

**Endpoint:** `POST /api/v2/price-tracking/set-target-price`

**Request:**
```json
{
  "product_id": "coupang_12345678",
  "target_price": 240000,
  "max_acceptable_delta": 3000,  // 최대 +3K까지 허용
  "notification_channels": ["push", "kakao"],
  "auto_purchase": false,  // Phase 3 기능
  "expires_at": "2025-03-31T23:59:59Z"  // Optional
}
```

**Response:**
```json
{
  "tracking_id": "pt_9a8b7c6d5e4f",
  "status": "active",
  "current_price": 259000,
  "target_price": 240000,
  "estimated_probability": 0.68,  // 30일 내 달성 확률
  "similar_users_count": 1847,  // 동일 가격 설정 사용자 수
  "created_at": "2025-01-20T10:30:00Z"
}
```

#### 4.1.2 가격 이력 조회

**Endpoint:** `GET /api/v2/price-tracking/history/{product_id}`

**Query Parameters:**
- `period`: `7d`, `30d`, `90d`, `1y` (default: `30d`)
- `platforms`: `coupang,naver,11st` (쉼표 구분)
- `include_predictions`: `true` / `false`

**Response:**
```json
{
  "product_id": "coupang_12345678",
  "product_name": "갤럭시 버즈3 Pro",
  "period": "30d",
  "data_points": [
    {
      "date": "2025-01-01",
      "platform": "coupang",
      "price": 259000,
      "stock_status": "in_stock",
      "shipping": "rocket_delivery"
    },
    {
      "date": "2025-01-05",
      "platform": "coupang",
      "price": 249000,
      "stock_status": "low_stock",
      "shipping": "rocket_delivery"
    }
  ],
  "statistics": {
    "current_price": 259000,
    "avg_price": 254000,
    "min_price": 235000,
    "max_price": 269000,
    "volatility": 0.12  // 가격 변동성
  },
  "predictions": {
    "next_7d_low": 245000,
    "confidence": 0.73
  }
}
```

### 4.2 Negotiation Engine API

#### 4.2.1 협상 시작 (판매자 → 시스템)

**Endpoint:** `POST /api/v2/negotiate/activate`

**Request (판매자 설정):**
```json
{
  "product_id": "prod_12345",
  "seller_id": "seller_789",
  "base_price": 259000,
  "min_price": 235000,
  "inventory": {
    "available": 5000,
    "reserved": 200,
    "restock_date": "2025-02-01"
  },
  "negotiation_rules": {
    "min_quantity": 100,  // 최소 100개 이상만 협상
    "max_discount_percent": 10,
    "auto_accept_threshold": {
      "quantity": 1500,
      "price": 240000
    }
  },
  "expires_at": "2025-02-28T23:59:59Z"
}
```

**Response:**
```json
{
  "negotiation_id": "neg_abc123",
  "status": "active",
  "demand_snapshot": {
    "total_interested_users": 3273,
    "price_tiers": [
      {"price": 240000, "users": 1847},
      {"price": 245000, "users": 892},
      {"price": 250000, "users": 534}
    ]
  },
  "ai_recommendation": {
    "optimal_price": 242000,
    "expected_conversion": 0.87,
    "projected_revenue": 389764000,
    "reasoning": "재고 5000개 대비 수요 3273명. ₩242K 제시 시 1847명 중 87% 전환 예상."
  }
}
```

#### 4.2.2 AI 협상 진행 (WebSocket)

**Connection:** `wss://api.igosa.kr/v2/negotiate/stream`

**Message Types:**

```typescript
// 1. 초기 연결 (판매자 대시보드)
{
  "type": "subscribe",
  "negotiation_id": "neg_abc123",
  "auth_token": "jwt_token_here"
}

// 2. 실시간 수요 업데이트
{
  "type": "demand_update",
  "negotiation_id": "neg_abc123",
  "timestamp": "2025-01-20T14:30:00Z",
  "demand": {
    "240000": 1923,  // +76 users
    "245000": 901,
    "250000": 548
  }
}

// 3. AI 제안
{
  "type": "ai_proposal",
  "from": "buyer_agent",
  "proposal": {
    "tier_1": {"price": 240000, "quantity": 1923},
    "tier_2": {"price": 245000, "quantity": 901},
    "valid_for": "24h"
  },
  "ai_reasoning": {
    "model": "claude-3.5-sonnet",
    "confidence": 0.91,
    "factors": [
      "경쟁사 최저가 ₩238K",
      "사용자 예산 분포 중앙값 ₩242K",
      "과거 협상 성사율 데이터"
    ]
  }
}

// 4. 거래 체결
{
  "type": "deal_finalized",
  "negotiation_id": "neg_abc123",
  "final_terms": {
    "price": 242000,
    "quantity": 1612,  // 87% conversion
    "total_gmv": 390104000,
    "commission": 1950520,  // 0.5%
    "estimated_shipping_date": "2025-01-22"
  },
  "next_steps": [
    "재고 1612개 예약 완료",
    "구매자 48시간 결제 윈도우 시작",
    "결제 완료 시 자동 출고 지시"
  ]
}
```

#### 4.2.3 수요 인사이트 조회 (판매자용)

**Endpoint:** `GET /api/v2/negotiate/demand-insights`

**Query Parameters:**
- `product_id`: (required)
- `timeframe`: `realtime`, `24h`, `7d`, `30d`

**Response:**
```json
{
  "product_id": "prod_12345",
  "timeframe": "7d",
  "insights": {
    "peak_demand_price": 245000,
    "peak_demand_users": 2134,
    "price_elasticity": -1.8,  // 가격 탄력성
    "competitor_analysis": [
      {
        "competitor": "coupang_seller_xyz",
        "price": 238000,
        "sales_velocity": 45  // per day
      }
    ],
    "optimal_strategy": {
      "recommended_action": "accept_tier_1",
      "reasoning": "₩240K 제시하면 고속 재고 소진 + 마진율 12% 유지",
      "risk_assessment": "low"
    }
  },
  "historical_negotiations": {
    "avg_discount": 0.08,
    "avg_quantity": 1234,
    "success_rate": 0.76
  }
}
```

### 4.3 Seller Dashboard API

#### 4.3.1 판매자 프로필 설정

**Endpoint:** `PUT /api/v2/seller/profile`

**Request:**
```json
{
  "seller_id": "seller_789",
  "business_info": {
    "business_registration": "123-45-67890",
    "company_name": "테크트렌드 주식회사",
    "ceo_name": "박성훈",
    "category": ["electronics", "mobile_accessories"]
  },
  "negotiation_preferences": {
    "auto_negotiation": true,
    "min_profit_margin": 0.12,
    "max_discount_limit": 0.15,
    "preferred_notification": ["email", "sms", "dashboard"]
  },
  "inventory_api": {
    "type": "webhook",  // or "polling"
    "endpoint": "https://seller.example.com/inventory-webhook",
    "auth_header": "Bearer seller_api_key_xyz"
  }
}
```

#### 4.3.2 데이터 피딩 API (머신 커스터머용)

**Endpoint:** `POST /api/v2/seller/datafeed`

**Request:**
```json
{
  "seller_id": "seller_789",
  "products": [
    {
      "sku": "PROD-001",
      "name": "갤럭시 버즈3 Pro 그라파이트",
      "gtin": "8801234567890",  // 글로벌 표준 바코드
      "category": "mobile_accessories/earbuds",
      "price": 259000,
      "inventory": {
        "available": 5000,
        "warehouse": "Seoul_DC_01",
        "restock_schedule": "weekly"
      },
      "specifications": {
        "brand": "Samsung",
        "color": "Graphite",
        "connectivity": "Bluetooth 5.3",
        "battery_life": "30h",
        "anc": true
      },
      "media": {
        "images": [
          "https://cdn.seller.com/img1.jpg",
          "https://cdn.seller.com/img2.jpg"
        ],
        "videos": ["https://cdn.seller.com/demo.mp4"]
      },
      "return_rate": 0.03,  // 3% 반품률
      "avg_rating": 4.6,
      "review_count": 1234,
      "shipping": {
        "methods": ["rocket", "standard"],
        "free_threshold": 50000
      },
      "promotions": {
        "active": true,
        "type": "lunar_new_year_sale",
        "discount": 0.05,
        "valid_until": "2025-02-10"
      }
    }
  ]
}
```

**Response:**
```json
{
  "processed": 1,
  "success": 1,
  "failed": 0,
  "results": [
    {
      "sku": "PROD-001",
      "status": "indexed",
      "ai_optimized": true,
      "seo_score": 87,
      "recommendations": [
        "상세 설명에 '가성비' 키워드 추가 권장",
        "경쟁사 대비 5% 비쌈 - 가격 조정 고려"
      ]
    }
  ]
}
```

---

## 5. Data Models

### 5.1 Core Database Schema

#### 5.1.1 PriceTracking Table (PostgreSQL)

```sql
CREATE TABLE price_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(500),
    
    -- 가격 설정
    target_price DECIMAL(10, 2) NOT NULL,
    max_acceptable_delta DECIMAL(10, 2) DEFAULT 0,
    current_price DECIMAL(10, 2),
    
    -- 알림 설정
    notification_channels TEXT[] DEFAULT ARRAY['push'],
    notify_on_threshold BOOLEAN DEFAULT true,
    notify_on_negotiation BOOLEAN DEFAULT true,
    
    -- 자동 구매 (Phase 3)
    auto_purchase BOOLEAN DEFAULT false,
    auto_purchase_max_price DECIMAL(10, 2),
    
    -- 메타데이터
    status VARCHAR(20) DEFAULT 'active',  -- active, paused, expired, triggered
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    last_checked_at TIMESTAMP,
    triggered_at TIMESTAMP,
    
    -- 인덱스 최적화
    INDEX idx_user_status (user_id, status),
    INDEX idx_product_target (product_id, target_price),
    INDEX idx_expires (expires_at) WHERE status = 'active'
);

-- Partitioning by month for scalability
CREATE TABLE price_tracking_2025_01 PARTITION OF price_tracking
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### 5.1.2 Negotiations Table

```sql
CREATE TABLE negotiations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) NOT NULL,
    seller_id UUID NOT NULL REFERENCES sellers(id),
    
    -- 협상 기본 정보
    status VARCHAR(30) DEFAULT 'active',  
    -- active, buyer_proposed, seller_countered, accepted, rejected, expired
    
    -- 수요 집계
    demand_snapshot JSONB NOT NULL,
    -- {
    --   "total_users": 3273,
    --   "tiers": [
    --     {"price": 240000, "users": 1847},
    --     {"price": 245000, "users": 892}
    --   ]
    -- }
    
    -- 판매자 제약 조건
    seller_constraints JSONB NOT NULL,
    -- {
    --   "min_price": 235000,
    --   "min_quantity": 100,
    --   "inventory": 5000,
    --   "max_discount_percent": 10
    -- }
    
    -- 협상 히스토리
    negotiation_rounds JSONB[] DEFAULT ARRAY[]::JSONB[],
    -- [
    --   {
    --     "round": 1,
    --     "from": "buyer_agent",
    --     "proposal": {...},
    --     "timestamp": "2025-01-20T14:00:00Z"
    --   }
    -- ]
    
    -- 최종 거래
    final_deal JSONB,
    -- {
    --   "price": 242000,
    --   "quantity": 1612,
    --   "total_gmv": 390104000
    -- }
    
    -- 타임스탬프
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    finalized_at TIMESTAMP,
    
    -- AI 메타데이터
    ai_model_used VARCHAR(50),  -- claude-3.5-sonnet, gpt-5, etc.
    ai_confidence DECIMAL(3, 2),
    
    INDEX idx_seller_status (seller_id, status),
    INDEX idx_product_active (product_id) WHERE status = 'active',
    INDEX idx_expires (expires_at) WHERE status IN ('active', 'buyer_proposed')
);
```

#### 5.1.3 DemandAggregation Table (Real-time Cache)

```sql
-- Redis Sorted Set 구조 (캐시)
-- Key: demand:{product_id}
-- Score: target_price (가격)
-- Member: user_id

-- 예시:
ZADD demand:prod_12345 240000 user_001
ZADD demand:prod_12345 240000 user_002
ZADD demand:prod_12345 245000 user_003

-- 가격대별 집계 조회:
ZCOUNT demand:prod_12345 240000 240000  -- ₩240K 설정 사용자 수
ZRANGEBYSCORE demand:prod_12345 235000 250000 WITHSCORES  -- ₩235-250K 범위

-- PostgreSQL Materialized View (분석용, 1시간마다 Refresh)
CREATE MATERIALIZED VIEW demand_aggregation_hourly AS
SELECT 
    product_id,
    DATE_TRUNC('hour', created_at) as hour,
    target_price,
    COUNT(DISTINCT user_id) as user_count,
    AVG(max_acceptable_delta) as avg_flexibility
FROM price_tracking
WHERE status = 'active'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY product_id, hour, target_price
WITH DATA;

CREATE UNIQUE INDEX ON demand_aggregation_hourly (product_id, hour, target_price);
REFRESH MATERIALIZED VIEW CONCURRENTLY demand_aggregation_hourly;
```

#### 5.1.4 SellerDataFeed Table

```sql
CREATE TABLE seller_datafeed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id),
    
    -- 제품 정보 (구조화)
    sku VARCHAR(100) NOT NULL,
    gtin VARCHAR(14),  -- 국제 표준 상품 번호
    product_name VARCHAR(500) NOT NULL,
    category VARCHAR(200),
    
    -- 가격 및 재고
    price DECIMAL(10, 2) NOT NULL,
    inventory_available INT DEFAULT 0,
    inventory_reserved INT DEFAULT 0,
    warehouse_location VARCHAR(100),
    restock_schedule VARCHAR(50),
    
    -- 품질 지표
    return_rate DECIMAL(5, 4),  -- 0.0000 ~ 1.0000
    avg_rating DECIMAL(3, 2),
    review_count INT DEFAULT 0,
    
    -- 배송 정보
    shipping_methods TEXT[],
    free_shipping_threshold DECIMAL(10, 2),
    avg_delivery_days INT,
    
    -- 프로모션
    active_promotion JSONB,
    -- {
    --   "type": "lunar_new_year_sale",
    --   "discount": 0.05,
    --   "valid_until": "2025-02-10"
    -- }
    
    -- AI 최적화 메타데이터
    ai_indexed BOOLEAN DEFAULT false,
    seo_score INT,  -- 0-100
    last_optimized_at TIMESTAMP,
    
    -- 상세 스펙 (JSONB - 카테고리별 상이)
    specifications JSONB,
    media JSONB,  -- images, videos
    
    -- 타임스탬프
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE (seller_id, sku),
    INDEX idx_seller_category (seller_id, category),
    INDEX idx_price_inventory (price, inventory_available),
    INDEX idx_ai_indexed (ai_indexed, last_optimized_at)
);

-- Trigger for updated_at
CREATE TRIGGER update_seller_datafeed_updated_at
    BEFORE UPDATE ON seller_datafeed
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Time-Series Data (ClickHouse - Analytics)

```sql
-- 가격 이력 (고성능 조회를 위한 컬럼 스토어)
CREATE TABLE price_history (
    timestamp DateTime,
    product_id String,
    platform String,
    price Decimal(10, 2),
    stock_status Enum8('in_stock' = 1, 'low_stock' = 2, 'out_of_stock' = 3),
    shipping_method String,
    
    -- 메타데이터
    crawled_at DateTime DEFAULT now(),
    data_source Enum8('api' = 1, 'crawler' = 2, 'seller_feed' = 3)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (product_id, platform, timestamp)
TTL timestamp + INTERVAL 2 YEAR;  -- 2년 후 자동 삭제

-- 협상 이벤트 스트림
CREATE TABLE negotiation_events (
    timestamp DateTime,
    negotiation_id UUID,
    event_type Enum8(
        'created' = 1, 
        'buyer_proposed' = 2, 
        'seller_countered' = 3,
        'accepted' = 4,
        'rejected' = 5,
        'expired' = 6
    ),
    
    -- 협상 상태 스냅샷
    demand_total_users UInt32,
    proposed_price Decimal(10, 2),
    proposed_quantity UInt32,
    
    -- AI 메타데이터
    ai_model String,
    ai_confidence Decimal(3, 2),
    processing_time_ms UInt16,
    
    -- 분석용 차원
    product_category String,
    seller_tier Enum8('platinum' = 1, 'gold' = 2, 'silver' = 3, 'bronze' = 4),
    
    event_timestamp DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, negotiation_id)
TTL timestamp + INTERVAL 1 YEAR;
```

### 5.3 Vector Embeddings (Pinecone)

```python
# Product Embeddings Structure
{
    "index_name": "igosa-products-v2",
    "dimension": 1536,  # text-embedding-3-large
    "metric": "cosine",
    "metadata_config": {
        "indexed": [
            "category",
            "price_range",  # "0-50K", "50-100K", etc.
            "brand",
            "avg_rating",
            "platform"
        ]
    }
}

# Example Vector
{
    "id": "prod_12345",
    "values": [0.1234, -0.5678, ...],  # 1536-dim
    "metadata": {
        "product_name": "갤럭시 버즈3 Pro",
        "category": "mobile_accessories/earbuds",
        "price": 259000,
        "price_range": "200-300K",
        "brand": "Samsung",
        "avg_rating": 4.6,
        "platform": "coupang",
        "embedding_model": "text-embedding-3-large",
        "embedded_at": "2025-01-20T10:00:00Z"
    }
}

# Semantic Search Query
query_vector = embed_text("가성비 좋은 무선 이어폰 추천")
results = index.query(
    vector=query_vector,
    top_k=20,
    include_metadata=True,
    filter={
        "category": {"$eq": "mobile_accessories/earbuds"},
        "price_range": {"$in": ["100-200K", "200-300K"]},
        "avg_rating": {"$gte": 4.0}
    }
)
```

---

## 6. Development Roadmap

### 6.1 Phase 1: Foundation (Q1-Q2 2025, 3개월)

**목표:** Price Tracking 2.0 + 수요 집계 인프라 구축

**Sprint 1-2 (Weeks 1-4): Price Tracking 고도화**

**개발 항목:**
1. ✅ 희망 가격 설정 UI/UX
   - 제품 페이지에 "가격 알림 받기" CTA 추가
   - 슬라이더로 목표 가격 설정 (현재가 ±20% 범위)
   - "유연성" 설정: ±₩0, ±₩3K, ±₩5K
   
2. ✅ 가격 이력 대시보드 개선
   - 90일 이력 그래프 (vs 기존 30일)
   - 가격 변동 예측 AI 추가 (Prophet 모델)
   - "이 가격 달성 확률" 표시

3. ✅ 알림 시스템 고도화
   - 카카오톡 알림톡 연동
   - Push 알림 (Firebase)
   - SMS 백업 (중요 거래)

**Sprint 3-4 (Weeks 5-8): 수요 집계 시스템**

**개발 항목:**
1. ✅ Real-time Demand Aggregation
   - Redis Sorted Set 기반 실시간 집계
   - 제품당 가격대별 사용자 수 추적
   - 1시간마다 PostgreSQL에 스냅샷 저장

2. ✅ 판매자 인사이트 대시보드 (Phase 1 버전)
   - 제품별 수요 히트맵
   - "1,847명이 ₩240K에 사고 싶어 해요" 표시
   - 경쟁사 가격 비교

3. ✅ A/B 테스팅 인프라
   - 20% 사용자에게만 네고딜 노출
   - 전환율, 체류시간, 재방문율 측정

**Sprint 5-6 (Weeks 9-12): 데이터 피딩 플랫폼 MVP**

**개발 항목:**
1. ✅ Seller Datafeed API
   - RESTful API 구축 (위 4.3.2 스펙 참조)
   - JSON 스키마 검증
   - Swagger/OpenAPI 문서 자동 생성

2. ✅ 데이터 품질 검증
   - 필수 필드 체크 (재고, 가격, GTIN)
   - 이상값 감지 (가격 급등락 알림)
   - AI 품질 점수 (0-100점)

3. ✅ 판매자 온보딩 플로우
   - 셀프 회원가입 + 사업자등록증 인증
   - API 키 발급
   - 샘플 코드 제공 (Python, Node.js)

**Phase 1 Exit Criteria:**
- ✅ 50,000+ 사용자가 희망 가격 설정
- ✅ 1,000+ 제품에 유의미한 수요 집계 (제품당 100+ 사용자)
- ✅ 100+ 판매자가 데이터 피딩 API 연동
- ✅ Price Tracking DAU 40% → 60% 증가

---

### 6.2 Phase 2: AI Negotiation Engine (Q3-Q4 2025, 6개월)

**목표:** AI-to-AI 협상 엔진 MVP + 첫 거래 성사

**Sprint 7-10 (Weeks 13-20): LangGraph 기반 협상 엔진**

**개발 항목:**
1. ✅ Multi-Agent 아키텍처 구축
   ```
   Buyer Agent (이거사 AI)
      ├─ Demand Aggregator Node
      ├─ Proposal Generator Node
      └─ Deal Validator Node
   
   Seller Agent (판매자 AI)
      ├─ Constraint Analyzer Node
      ├─ Counter-Proposal Node
      └─ Profit Calculator Node
   ```

2. ✅ 협상 알고리즘 개발
   - Rule-based baseline (Phase 2.0)
   - ML-based optimization (Phase 2.5)
   - Multi-round negotiation (최대 5 라운드)

3. ✅ AI 모델 통합
   - Solar Pro 2: 한국어 NLU, 협상 의도 파악
   - Gemini 2.0 Flash: 빠른 계산 (재고, 마진)
   - Claude 3.5 Sonnet: 복잡한 multi-step 추론

**Sprint 11-14 (Weeks 21-28): 판매자 플랫폼 풀 버전**

**개발 항목:**
1. ✅ 실시간 협상 대시보드
   - WebSocket 기반 실시간 업데이트
   - 협상 진행 상태 시각화
   - "수락 / 거절 / 역제안" 버튼

2. ✅ 자동 협상 룰 엔진
   - "재고 30% 이상이면 5% 추가 할인 자동 허용"
   - "최소 1,000개 이상 주문 시만 협상 개시"
   - 가격 하한선 설정

3. ✅ 거래 정산 시스템
   - 협상 성사 → 48시간 결제 윈도우
   - 구매자 결제 완료 → 판매자에게 출고 지시
   - 수수료 자동 정산 (월 1회)

**Sprint 15-18 (Weeks 29-36): 파일럿 프로그램**

**실행 계획:**
1. ✅ Top 20 전자제품 셀러 선정
   - 협상 교육 웨비나 개최
   - 1:1 온보딩 지원
   - 첫 3개월 수수료 면제 (인센티브)

2. ✅ 제한적 카테고리 오픈
   - 전자제품 중 이어폰/헤드폰만
   - 가격대 ₩100K-500K 제한
   - 일 거래량 100건 이하 제한

3. ✅ 집중적 모니터링
   - 매일 협상 로그 수동 검토
   - AI 할루시네이션 감지 및 수정
   - 사용자 피드백 수집 (NPS 조사)

**Phase 2 Exit Criteria:**
- ✅ 100+ 판매자 AI 협상 활성화
- ✅ 첫 1,000건 AI 협상 거래 성사
- ✅ 협상 성사율 40%+ (제안 대비)
- ✅ AI 에러율 \u003c5% (가격 계산, 재고 체크)
- ✅ 평균 절감액 8-12%
- ✅ 사용자 NPS \u003e50

---

### 6.3 Phase 3: Full-Scale Launch (2026 H1, 6개월)

**목표:** 완전한 AI 마켓플레이스 + 카테고리 확장

**Sprint 19-22 (Weeks 37-44): 프로덕션 스케일링**

**개발 항목:**
1. ✅ 고성능 처리 인프라
   - Kubernetes 기반 Auto-scaling
   - 동시 협상 처리 10,000+ 지원
   - Redis Cluster (고가용성)

2. ✅ 고급 AI 기능
   - Gemini 3.0 / GPT-5 업그레이드 (출시 시)
   - 할루시네이션 비율 \u003c0.1%
   - 협상 전략 강화학습 (RL)

3. ✅ 보안 및 컴플라이언스
   - PCI DSS Level 1 인증
   - AI Framework Act 완전 준수
   - Fraud Detection 시스템

**Sprint 23-26 (Weeks 45-52): 카테고리 확장**

**새 카테고리 추가:**
1. ✅ **여행 상품**
   - 항공권 (변동 가격 AI 협상)
   - 호텔 (단체 예약 할인)
   - 패키지 투어

2. ✅ **보험**
   - 자동차 보험 (설계사 대체)
   - 여행자 보험
   - 휴대폰 보험

3. ✅ **구독 서비스**
   - OTT 결합 상품
   - 헬스장 멤버십
   - 클라우드 스토리지

**Sprint 27-30 (Weeks 53-60): 생태계 완성**

**개발 항목:**
1. ✅ Open API for Partners
   - 제휴사가 이거사 협상 기능 임베딩
   - White-label 솔루션
   - Rev-share 모델

2. ✅ B2B SaaS 전환
   - 기업 구매 담당자용 대시보드
   - 대량 구매 자동 협상
   - 예산 관리 기능

3. ✅ 글로벌 확장 준비
   - 다국어 지원 (영어, 일본어)
   - 해외 결제 수단
   - 국제 배송 연동

**Phase 3 Exit Criteria:**
- ✅ 월 10,000+ AI 협상 거래
- ✅ 5개 카테고리 (전자제품, 여행, 보험, 구독, 가전)
- ✅ AI 협상이 전체 GMV의 30% 차지
- ✅ 월 매출 ₩12-18억 (수수료 + SaaS)
- ✅ 판매자 플랫폼 MAU 5,000+

---

## 7. Success Metrics

### 7.1 North Star Metrics

**Primary NSM:** **월 AI 협상 GMV**
- Phase 1 목표: ₩0 (수요 집계만)
- Phase 2 목표: ₩30억
- Phase 3 목표: ₩300억+

**Secondary NSMs:**
- AI 협상 거래 건수 (월)
- 평균 절감액 (%)
- 협상 성사율 (%)

### 7.2 Product Metrics

**사용자 측면:**
| Metric | Baseline | Phase 1 | Phase 2 | Phase 3 |
|--------|----------|---------|---------|---------|
| Price Tracking DAU/MAU | 20% | 60% | 70% | 75% |
| 희망 가격 설정 사용자 | 0 | 50K | 150K | 500K |
| 협상 알림 CTR | - | - | 35% | 45% |
| 48시간 구매 전환율 | - | - | 85% | 90% |
| NPS | 45 | 50 | 60 | 70 |

**판매자 측면:**
| Metric | Baseline | Phase 1 | Phase 2 | Phase 3 |
|--------|----------|---------|---------|---------|
| 데이터피딩 판매자 수 | 0 | 100 | 500 | 2000 |
| AI 협상 활성화 판매자 | 0 | 0 | 100 | 1000 |
| 평균 협상 수락 시간 | - | - | 4h | 30min |
| 판매자 NPS | - | - | 40 | 55 |

**비즈니스 측면:**
| Metric | Baseline | Phase 1 | Phase 2 | Phase 3 |
|--------|----------|---------|---------|---------|
| 월 GMV (전체) | ₩100억 | ₩150억 | ₩300억 | ₩1,000억 |
| 월 GMV (AI 협상) | ₩0 | ₩0 | ₩30억 | ₩300억 |
| 수수료 수익 | ₩4억 | ₩6억 | ₩8.5억 | ₩35억 |
| SaaS 수익 | ₩0 | ₩0.2억 | ₩1억 | ₩5억 |
| 총 월 매출 | ₩4억 | ₩6.2억 | ₩9.5억 | ₩40억 |

### 7.3 Technical Metrics

**성능:**
- API 응답 시간 P95: \u003c200ms (일반), \u003c500ms (협상)
- 가격 크롤링 성공률: \u003e99%
- AI 협상 처리 시간: \u003c500ms per round
- 시스템 Uptime: \u003e99.9%

**정확도:**
- AI 가격 예측 정확도: ±5% (30일 이내)
- 재고 데이터 정확도: \u003e98%
- AI 협상 에러율: \u003c1% (Phase 3)
- 할루시네이션 비율: \u003c0.1% (Phase 3)

**스케일:**
- 동시 활성 사용자: 10,000+
- 동시 진행 협상: 5,000+
- 일 가격 크롤링: 1M+ products
- DB Write TPS: 10,000+

### 7.4 Monitoring & Alerting

**실시간 대시보드 (Grafana):**
```
┌────────────────────────────────────────────────┐
│ Igosa NegoDeal 2.0 Monitoring Dashboard       │
├────────────────────────────────────────────────┤
│                                                │
│ 🎯 NSM: 월 AI 협상 GMV                         │
│    ₩3.2B / ₩30B (10.7%) ■■□□□□□□□□            │
│                                                │
│ 📊 실시간 지표                                  │
│    활성 협상: 847건                             │
│    금일 성사: 124건 (성사율 41%)               │
│    평균 처리시간: 387ms                         │
│    AI 에러율: 0.3%                             │
│                                                │
│ ⚠️  알림 (최근 1시간)                          │
│    [WARN] Negotiation latency spike: 1.2s     │
│    [INFO] New seller onboarded: seller_9912   │
│    [CRIT] Redis memory usage: 87%             │
│                                                │
└────────────────────────────────────────────────┘
```

**Alert Rules (PagerDuty):**
- P0 (즉시): AI 협상 에러율 \u003e5%, API Down, DB Outage
- P1 (15분): 응답시간 \u003e2s, 성사율 \u003c20%, Redis OOM
- P2 (1시간): 크롤링 실패율 \u003e10%, 이상 가격 패턴 감지
- P3 (1일): 사용자 피드백 NPS \u003c30, 판매자 이탈

---

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks

#### Risk 1: AI 할루시네이션으로 잘못된 가격 제안

**영향도:** 🔴 Critical (신뢰 붕괴)  
**발생 확률:** 🟡 Medium (15-20%)

**완화 전략:**
1. ✅ **Rule-based Validation Layer**
   - 모든 AI 제안을 규칙 기반 체크
   - 가격 범위 검증: (원가 × 1.05) ~ (현재가 × 1.5)
   - 재고 확인: 제안 수량 \u003c= 가용 재고

2. ✅ **Human-in-the-Loop (Phase 1-2)**
   - ₩500K+ 거래는 사람 승인 필수
   - 의심스러운 협상 플래그 (가격 급변 등)
   - 24/7 온콜 팀 운영

3. ✅ **보수적 시작**
   - Phase 2는 ±10% 가격 범위 제한
   - 일 거래량 Cap (100건)
   - 점진적 제한 해제

#### Risk 2: 협상 시스템 과부하 (Scaling Issue)

**영향도:** 🟠 High (서비스 중단)  
**발생 확률:** 🟡 Medium (25%)

**완화 전략:**
1. ✅ **우선순위 큐**
   - High-value 거래 우선 처리
   - Long-tail은 비동기 처리
   - Circuit Breaker 패턴

2. ✅ **Auto-scaling**
   - Kubernetes HPA (CPU 70% 기준)
   - Redis Cluster (Sharding)
   - Read Replica (PostgreSQL)

3. ✅ **Load Testing**
   - k6로 10,000 concurrent users 시뮬레이션
   - Chaos Engineering (Netflix Chaos Monkey)
   - 월 1회 Disaster Recovery 훈련

#### Risk 3: 데이터 품질 문제 (잘못된 재고/가격)

**영향도:** 🟠 High (거래 실패)  
**발생 확률:** 🔴 High (40%)

**완화 전략:**
1. ✅ **실시간 검증**
   - 협상 체결 전 재고 재확인 (2-phase commit)
   - 가격 급변 감지 (1시간 내 20%+ 변동)
   - Outlier 필터링

2. ✅ **판매자 책임**
   - SLA 계약: 데이터 정확도 95%+
   - 페널티: 3회 오류 시 협상 기능 정지
   - 인센티브: 99%+ 정확도 시 수수료 할인

3. ✅ **Fallback 메커니즘**
   - 데이터 불확실 시 협상 자동 중단
   - 사용자에게 명확한 이유 설명
   - 대체 제품 제안

### 8.2 Business Risks

#### Risk 4: 판매자 참여 저조

**영향도:** 🔴 Critical (비즈니스 모델 붕괴)  
**발생 확률:** 🟡 Medium (30%)

**완화 전략:**
1. ✅ **강력한 Value Proposition**
   - "광고비 ₩0 + 대량 판매" 메시지
   - 케이스 스터디: "A 판매자, 3일간 1,500개 완판"
   - ROI 계산기 제공

2. ✅ **온보딩 지원**
   - 1:1 기술 컨설팅
   - API 통합 대행 서비스
   - 첫 3개월 수수료 면제

3. ✅ **Marketplace Liquidity**
   - Cold Start: 자체 재고로 파일럿 (10개 제품)
   - Anchor Tenants: Top 5 셀러와 독점 계약
   - 커뮤니티: 판매자 포럼 운영

#### Risk 5: 법적/규제 리스크

**영향도:** 🔴 Critical (서비스 중단)  
**발생 확률:** 🟢 Low (10%)

**완화 전략:**
1. ✅ **선제적 컴플라이언스**
   - AI Framework Act 준수 (2026.01 시행)
   - 법무법인 자문 (월 1회)
   - 전자상거래법 완벽 준수

2. ✅ **투명성 우선**
   - AI 결정 과정 100% 공개
   - 사용자 동의 명확히 획득
   - "AI가 협상했습니다" 라벨 필수

3. ✅ **보험 가입**
   - 사이버 보험 (₩10억 보상 한도)
   - 전문가 배상책임보험
   - 법적 대응 예산 확보

### 8.3 Market Risks

#### Risk 6: 대기업 진입 (Naver, Coupang)

**영향도:** 🟠 High (시장 잠식)  
**발생 확률:** 🔴 High (60% within 18 months)

**방어 전략:**
1. ✅ **속도로 승부**
   - 12개월 First Mover Advantage 극대화
   - 빠른 iteration (2주 Sprint)
   - MVP → Production: 6개월

2. ✅ **데이터 해자**
   - 독점 행동 데이터 (비교 패턴, 선호도)
   - 네트워크 효과 (판매자-구매자 매칭)
   - 학습된 협상 전략

3. ✅ **틈새 공략**
   - 중소 판매자 집중 (대기업 관심 낮음)
   - 롱테일 제품 (쿠팡/네이버 커버 안 됨)
   - 버티컬 전문화 (여행, 보험)

#### Risk 7: 사용자 신뢰 문제

**영향도:** 🔴 Critical (Churn 증가)  
**발생 확률:** 🟡 Medium (20%)

**완화 전략:**
1. ✅ **Hyper-transparency**
   - 협상 과정 실시간 공개
   - "AI가 1,847명의 의견을 모아 협상했어요"
   - 절감액 명확히 표시

2. ✅ **사회적 증거**
   - "오늘 1,234명이 이 거래에 참여했어요"
   - 실제 구매자 후기 (with 프로필 사진)
   - 인플루언서 리뷰

3. ✅ **리스크 제로화**
   - 무조건 환불 정책 (48시간 이내)
   - 가격 보상제: 더 싼 곳 발견 시 차액 지급
   - 이거사 보증 배지

---

## 9. Team Structure & Roles

### 9.1 개발 조직

**Core Engineering Team (15명):**

```
CTO (1)
  │
  ├─ Backend Team (6)
  │   ├─ Tech Lead (Go/Python)
  │   ├─ Senior Backend Engineer × 2 (Microservices)
  │   ├─ Backend Engineer × 2 (API Development)
  │   └─ DevOps Engineer (Kubernetes, AWS)
  │
  ├─ AI/ML Team (4)
  │   ├─ ML Engineer Lead (LangGraph, RAG)
  │   ├─ ML Engineer (Model Training)
  │   ├─ Data Scientist (Analytics)
  │   └─ AI Ops Engineer (MLOps)
  │
  ├─ Frontend Team (3)
  │   ├─ Senior Frontend Engineer (React, Next.js)
  │   ├─ Mobile Engineer (React Native)
  │   └─ Frontend Engineer (UI/UX Implementation)
  │
  └─ Data Team (1)
      └─ Data Engineer (Pipeline, ClickHouse)
```

**Product & Design (5명):**
```
CPO (1)
  ├─ Sr. Product Manager (NegoDeal Owner)
  ├─ Product Manager (Price Tracking)
  ├─ Sr. Product Designer
  └─ UX Researcher
```

### 9.2 책임 매트릭스 (RACI)

| Task | Backend | AI/ML | Frontend | Product | DevOps |
|------|---------|-------|----------|---------|--------|
| Price Tracking API | R | C | C | A | I |
| Negotiation Engine | C | R | I | A | C |
| Seller Dashboard | R | I | R | A | C |
| LangGraph Integration | C | R | I | A | I |
| Demand Aggregation | R | C | I | A | C |
| Real-time WebSocket | R | I | R | C | C |
| K8s Deployment | I | I | I | C | R |
| AI Model Fine-tuning | I | R | I | A | C |

- R: Responsible (실행)
- A: Accountable (최종 책임)
- C: Consulted (자문)
- I: Informed (정보 공유)

---

## 10. Appendix

### 10.1 용어 정리

- **NegoDeal (네고딜):** "Negotiation + Deal"의 합성어. 이거사의 AI 협상 마켓플레이스 기능 명칭.
- **Price Tracking:** 사용자가 원하는 가격을 설정하면 해당 가격 도달 시 자동 알림하는 기능.
- **Demand Aggregation:** 동일/유사 제품에 대한 사용자들의 구매 희망 가격을 실시간으로 집계하는 시스템.
- **Buyer Agent:** 구매자를 대표하는 AI 에이전트 (이거사 AI).
- **Seller Agent:** 판매자를 대표하는 AI 에이전트.
- **Multi-round Negotiation:** AI 에이전트 간 여러 차례(최대 5회) 제안-역제안을 주고받는 협상.
- **Data Feeding:** 판매자가 AI가 읽을 수 있는 구조화된 제품 정보를 제공하는 행위.
- **Machine Customer:** AI 에이전트를 지칭하는 용어. 사람이 아닌 기계가 고객 역할.

### 10.2 참고 자료

**내부 문서:**
- [이거사 프로젝트 개요] /mnt/project/한국_최고의_AI_쇼핑_에이전트_개발_전략.md
- [기술 아키텍처 상세] /mnt/project/Building_Igosa_Technical_Roadmap.md
- [시장 분석 리포트] /mnt/project/AI_Shopping_Assistant_Market_Analysis.md

**외부 레퍼런스:**
- Google AI Mode (2025.01 한국 출시)
- Perplexity Shopping Price Tracking 기능
- Amazon "Buy For Me" 기능
- OpenAI Agentic Commerce Protocol (with Stripe)
- LangGraph Documentation: https://langchain-ai.github.io/langgraph/

**규제/법률:**
- AI Framework Act (2026.01.22 시행)
- 개인정보보호법 (PIPA) 최신 개정안
- 전자상거래법 다크 패턴 금지 조항
- PCI DSS v4.0 Requirements

### 10.3 다음 단계

**즉시 실행 (이번 주):**
1. ✅ Tech Lead 회의: 아키텍처 리뷰 및 기술 스택 최종 확정
2. ✅ JIRA 에픽 생성: Phase 1 Sprint 1-6 상세 티켓팅
3. ✅ 인프라 프로비저닝: AWS Seoul Region 환경 구축
4. ✅ 디자인 킥오프: 희망 가격 설정 UI/UX 스프린트

**1개월 내:**
1. ✅ Sprint 1 완료: Price Tracking 2.0 MVP
2. ✅ 판매자 파일럿 모집: Top 20 셀러 미팅
3. ✅ AI 모델 POC: LangGraph + Solar Pro 2 통합 테스트
4. ✅ 법무 검토: AI Framework Act 컴플라이언스 체크리스트

**3개월 내 (Phase 1 완료):**
1. ✅ 50,000명 희망 가격 설정 달성
2. ✅ 100개 판매자 데이터 피딩 연동
3. ✅ Phase 2 Go/No-Go 의사결정
4. ✅ Series A 준비: 투자 자료 업데이트

---

## 문서 승인

**작성:** Product & Engineering Leadership  
**검토:** CTO, CPO, CFO  
**승인:** CEO

**버전 히스토리:**
- v1.0 (2025-01-20): 초안 작성
- v1.1 (2025-02-05): 기술 스택 업데이트 예정
- v1.2 (2025-03-01): Phase 1 회고 반영 예정

---

**문의:** engineering@igosa.kr  
**내부 위키:** https://wiki.igosa.kr/negodeal-2.0
