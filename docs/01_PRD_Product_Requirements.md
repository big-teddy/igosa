# [PRD] 이거사 Product Requirements Document

**버전**: 1.0  
**날짜**: 2025-10-30  
**작성자**: Product Team  
**승인자**: CEO, CTO  
**최종 검토**: 2025-10-30

---

## 목차

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Users](#3-target-users)
4. [Core Features (MVP)](#4-core-features-mvp)
5. [Success Metrics](#5-success-metrics)
6. [Technical Requirements](#6-technical-requirements)
7. [Release Plan](#7-release-plan)
8. [Future Roadmap](#8-future-roadmap)

---

## 1. Executive Summary

### 1.1 제품 개요

**이거사**는 AI 기술을 활용한 한국 최초의 네이티브 쇼핑 에이전트 플랫폼입니다. 기존 가격 비교 사이트인 다나와의 수동 검색 방식을 넘어, 자연어 대화로 제품 발견부터 구매 결정까지 전 과정을 지원합니다.

### 1.2 시장 기회

- **시장 규모**: 한국 이커머스 시장 $114-230B (2024)
- **성장률**: 연평균 19.92% (2025-2030)
- **GAP**: AI 네이티브 쇼핑 에이전트 부재
- **경쟁사 약점**: 
  - 다나와: 수동 검색, 전자제품 한정, 구식 UI
  - 네이버/쿠팡: 플랫폼 종속, AI 기능 제한적

### 1.3 핵심 차별화

1. **대화형 AI 검색** - 자연어로 제품 검색
2. **멀티플랫폼 가격 비교** - 쿠팡/네이버/11번가 동시 검색
3. **AI 네고딜 (공동구매)** - 자동 그룹핑 + 판매자 협상
4. **설명 가능한 AI** - 모든 추천에 근거 제시

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

> "한국인들이 쇼핑 결정을 내릴 때 가장 먼저 찾는 AI 비서가 되자"

### 2.2 Mission

**단기 (6개월)**
- 1만 명 활성 사용자 확보
- 20% DAU/MAU 달성
- 10% 구매 전환율 달성

**중기 (12개월)**
- 10만 명 활성 사용자
- 월 ₩10억 GMV 달성
- 주요 브랜드 3개 이상 파트너십

**장기 (24개월)**
- 50만 명 활성 사용자
- 쇼핑 카테고리 1위 AI 앱
- 네이버/카카오 인수 또는 Series A

### 2.3 Success Criteria (MVP)

**User Engagement**
- ✅ 1,000명 베타 사용자 확보 (4주)
- ✅ 20% DAU/MAU 비율
- ✅ 평균 세션 5분 이상
- ✅ 주간 3회 이상 재방문

**Business Metrics**
- ✅ 10% 검색 → 구매 전환율
- ✅ ₩50M GMV (첫 달)
- ✅ ₩10M 제휴 수수료 수익

**Technical Performance**
- ✅ 응답 시간 < 3초 (P95)
- ✅ 99.5% uptime
- ✅ AI 추천 정확도 80%+

---

## 3. Target Users

### 3.1 Primary Persona: "가성비 민지"

**Demographics**
- 나이: 27세
- 직업: 마케터
- 월소득: ₩350만원
- 거주지: 서울 강남

**Behaviors**
- 온라인 쇼핑 주 5-7회
- 구매 전 반드시 3개 사이트 비교
- 인스타그램/네이버 블로그 리뷰 참고
- 쿠팡 로켓배송 선호

**Pain Points**
- 다나와는 UI가 복잡하고 전자제품만 강함
- 여러 탭 열어서 가격 비교하느라 시간 소모 (평균 20분)
- "내게 맞는" 제품을 찾기 어려움
- 리뷰 진위 파악 어려움

**Goals**
- 5분 안에 최적 제품 + 최저가 찾기
- 믿을 수 있는 추천
- 친구들과 공유하며 확신 얻기

**Quote**
> "시간 없는데 괜히 잘못 사면 후회돼요. 누가 딱 내 스타일 파악해서 추천해주면 좋겠어요."

---

### 3.2 Secondary Persona: "실속파 철수"

**Demographics**
- 나이: 45세
- 직업: 회사원 (부장)
- 월소득: ₩550만원
- 거주지: 경기도 분당

**Behaviors**
- 가족 쇼핑 담당 (가전, 생활용품)
- 월 2-3회 대량 구매
- 네이버 검색 의존도 높음
- 가성비 중시 but 품질도 중요

**Pain Points**
- 너무 많은 선택지에 혼란
- 기술 용어 이해 어려움
- 시간 없어서 충동구매 후 후회
- 가족 불만 ("왜 이걸 샀어?")

**Goals**
- 빠르고 정확한 결정
- 가족에게 "잘 샀다" 인정받기
- 시간 절약
- 돈 아끼면서 품질 유지

**Quote**
> "요즘 제품이 너무 많아요. 전문가가 딱 설명해주면 좋겠는데..."

---

## 4. Core Features (MVP)

### 4.1 Feature 1: AI 대화형 검색 ⭐⭐⭐

**User Story**
> **As a** 쇼핑 사용자  
> **I want** 자연어로 제품을 검색하면 AI가 내 의도를 파악하여  
> **So that** 정확한 제품을 빠르게 찾을 수 있다

**Acceptance Criteria**
- [ ] 자연어 쿼리 처리
  - ✅ "편한 러닝화 추천해줘"
  - ✅ "₩15만원 이하 게이밍 노트북"
  - ✅ "여자친구 생일 선물"
- [ ] 다중 턴 대화 지원
  - ✅ User: "더 가벼운 건?"
  - ✅ AI: "가장 가벼운 모델 3개 추천드릴게요"
- [ ] 응답 시간 < 3초 (P95)
- [ ] 한국어 존댓말(해요체) 사용
- [ ] Streaming response (실시간 타이핑 효과)

**Technical Spec**
```typescript
interface ChatRequest {
  message: string;
  conversation_id?: string;
  user_id: string;
}

interface ChatResponse {
  response: string;
  products: Product[];
  sources: Source[];
  suggestions: string[];
}
```

**Priority**: P0 (Must Have)  
**Effort**: 3 weeks  
**Dependencies**: LLM API, Vector DB

---

### 4.2 Feature 2: 실시간 멀티플랫폼 가격 비교 ⭐⭐⭐

**User Story**
> **As a** 쇼핑 사용자  
> **I want** 추천받은 제품의 가격을 여러 사이트에서 비교하여  
> **So that** 최저가로 구매할 수 있다

**Acceptance Criteria**
- [ ] 3개 플랫폼 동시 검색 (쿠팡, 네이버, 11번가)
- [ ] 실시간 가격 표시 (< 2초)
- [ ] 배송비 포함 총액 계산
- [ ] 배송 속도 표시 (로켓배송, 새벽배송 등)
- [ ] 재고 여부 확인

**UI Mockup**
```
┌─────────────────────────────────────────┐
│ 나이키 에어 줌 페가수스 40               │
├─────────────────────────────────────────┤
│                                           │
│ 🏆 최저가: ₩149,000 (쿠팡)             │
│                                           │
│ ┌─────────────────────────────────────┐ │
│ │ 쿠팡    ₩149,000  무료  로켓배송   │ │
│ │ 네이버  ₩152,000  무료  2일 배송   │ │
│ │ 11번가  ₩155,000  ₩2,500  3일 배송│ │
│ └─────────────────────────────────────┘ │
│                                           │
│ [쿠팡에서 구매하기] 버튼                 │
└─────────────────────────────────────────┘
```

**Technical Spec**
```typescript
interface PriceComparison {
  product_id: string;
  product_name: string;
  prices: {
    platform: 'coupang' | 'naver' | '11st';
    price: number;
    shipping: number;
    total: number;
    delivery_type: string;
    in_stock: boolean;
    url: string;
  }[];
  lowest_price: {
    platform: string;
    total: number;
  };
}
```

**Priority**: P0 (Must Have)  
**Effort**: 2 weeks  
**Dependencies**: Coupang Partners API, Naver Shopping API

---

### 4.3 Feature 3: AI 네고딜 (공동구매) ⭐⭐

**User Story**
> **As a** 쇼핑 사용자  
> **I want** 같은 제품을 원하는 다른 사용자들과 그룹을 만들어  
> **So that** 대량 구매 할인을 받을 수 있다

**Concept**
1. AI가 같은 제품 검색한 사용자들을 자동 그룹핑
2. 목표 인원 달성 시 AI가 판매자에게 협상 이메일 자동 발송
3. 판매자 승인 시 모든 참여자에게 할인가 적용

**Acceptance Criteria**
- [ ] 실시간 참여자 수 표시
- [ ] 목표 인원 및 할인율 명시
- [ ] 마감 시간 카운트다운
- [ ] 참여/취소 버튼
- [ ] 목표 달성 시 알림 (카카오톡)

**User Flow**
```
1. 사용자가 제품 검색
   ↓
2. AI가 진행 중인 네고딜 표시
   "이 제품 공동구매 진행 중! (7/10명)"
   ↓
3. [참여하기] 클릭
   ↓
4. 목표 달성 (10명)
   ↓
5. AI가 판매자에게 협상 이메일 발송
   ↓
6. 판매자 승인
   ↓
7. 모든 참여자에게 알림
   "네고딜 성공! 15% 할인 확정"
   ↓
8. 할인가로 구매 진행
```

**Technical Spec**
```typescript
interface NegoDeal {
  id: string;
  product_id: string;
  current_participants: number;
  target_participants: number;
  discount_rate: number;
  original_price: number;
  final_price: number;
  deadline: Date;
  status: 'active' | 'completed' | 'failed';
  seller_response?: 'pending' | 'approved' | 'rejected';
}
```

**Priority**: P1 (Should Have)  
**Effort**: 2 weeks  
**Dependencies**: Email service, KakaoTalk API

---

### 4.4 Feature 4: 설명 가능한 추천 ⭐⭐

**User Story**
> **As a** 쇼핑 사용자  
> **I want** AI가 추천하는 이유를 명확히 이해하여  
> **So that** 신뢰하고 구매 결정을 할 수 있다

**Acceptance Criteria**
- [ ] 모든 추천에 "추천 이유" 표시
- [ ] 리뷰 인용 (출처 명시)
- [ ] 스펙 비교표
- [ ] 전문가 의견 (있는 경우)

**Example Output**
```
추천 제품: 나이키 에어 줌 페가수스 40

✨ 추천 이유:
1. 편안함 (5점 만점 중 4.8)
   - 1,234개 리뷰 중 89%가 "편하다" 평가
   - "발에 딱 맞고 푹신해요" (네이버 블로그)
   
2. 가성비
   - 동급 모델 대비 ₩2만원 저렴
   - 쿠팡 로켓배송으로 내일 도착
   
3. 성능
   - Zoom Air 쿠셔닝 기술
   - 무게 280g (평균 대비 15% 가벼움)

📊 주요 스펙:
- 쿠셔닝: Zoom Air
- 무게: 280g (US 9 기준)
- 용도: 일상 러닝 / 체육관
- 내구성: 약 500-600km

🔗 출처:
- 네이버 쇼핑 리뷰 1,234개
- 런너스월드 "2024 Best Buy" 선정
- 유튜브 "러닝화 전문가" 리뷰 85만 뷰
```

**Technical Spec**
```typescript
interface Recommendation {
  product: Product;
  score: number;  // 0-100
  reasons: {
    category: 'comfort' | 'value' | 'performance' | 'reviews';
    explanation: string;
    evidence: {
      type: 'review' | 'spec' | 'expert' | 'comparison';
      source: string;
      excerpt: string;
    }[];
  }[];
  specs: KeyValuePair[];
  sources: Source[];
}
```

**Priority**: P1 (Should Have)  
**Effort**: 1 week  
**Dependencies**: Review aggregation, RAG system

---

### 4.5 Feature 5: 사용자 프로필 및 선호도 학습 ⭐

**User Story**
> **As a** 재방문 사용자  
> **I want** AI가 내 취향을 기억하여  
> **So that** 더 정확한 추천을 받을 수 있다

**Acceptance Criteria**
- [ ] 기본 정보 저장 (성별, 나이, 관심사)
- [ ] 검색 이력 저장
- [ ] 클릭한 제품 추적
- [ ] 구매 이력 연동 (선택)
- [ ] 선호 브랜드/스타일 학습

**Privacy**
- 사용자 동의 하에만 데이터 수집
- PIPA 준수
- 데이터 삭제 요청 지원

**Priority**: P2 (Nice to Have)  
**Effort**: 1 week  
**Dependencies**: User authentication

---

## 5. Success Metrics

### 5.1 North Star Metric

**Weekly Active Users (WAU)**
- 목표: 10,000 WAU (출시 12주 후)

### 5.2 Primary Metrics

**Engagement**
- DAU/MAU: 20%+
- Avg Session Duration: 5분+
- Sessions per User per Week: 3+
- Chat Messages per Session: 5+

**Conversion**
- Search → Product View: 80%+
- Product View → Click to Platform: 30%+
- Click → Purchase (estimated): 10%+
- Overall Search → Purchase: 10%+

**Retention**
- D1: 40%+
- D7: 25%+
- D30: 15%+

**Revenue**
- GMV: ₩50M (Month 1) → ₩500M (Month 6)
- Affiliate Revenue: 3-5% of GMV
- Avg Revenue per User: ₩5,000/month

### 5.3 Secondary Metrics

**AI Quality**
- Recommendation Acceptance Rate: 30%+
- "This is helpful" rating: 80%+
- Hallucination Rate: < 5%
- Response Accuracy: 85%+

**Technical Performance**
- API Response Time (P50): < 1s
- API Response Time (P95): < 3s
- API Response Time (P99): < 5s
- Uptime: 99.5%+
- Error Rate: < 1%

**Cost Efficiency**
- Cost per Query: < ₩50
- Cost per Conversion: < ₩5,000
- LLM Cost per User per Month: < ₩1,000

---

## 6. Technical Requirements

### 6.1 Performance

- **Response Time**
  - First Token: < 500ms
  - Full Response: < 3s (P95)
  - Price Comparison: < 2s

- **Throughput**
  - 100 concurrent users (MVP)
  - 1,000 concurrent users (Month 6)

- **Availability**
  - 99.5% uptime
  - < 1% error rate

### 6.2 Scalability

- Horizontal scaling via Vercel Edge Functions
- Database: Supabase (PostgreSQL) with read replicas
- Vector DB: Weaviate Cloud (auto-scaling)
- Cache: Redis (Upstash) for hot data

### 6.3 Security

- **Data Protection**
  - HTTPS only
  - JWT authentication
  - API key rotation
  - Secrets in environment variables

- **Privacy**
  - PIPA compliant
  - User consent required
  - Data anonymization
  - Right to be forgotten

### 6.4 Monitoring

- **Application Monitoring**
  - Vercel Analytics
  - Sentry (errors)
  - Axiom (logs)

- **AI Monitoring**
  - LangSmith (LLM traces)
  - Custom dashboards (accuracy, cost)

- **User Analytics**
  - PostHog (behavior)
  - Conversion funnels

---

## 7. Release Plan

### 7.1 MVP Phases

**Phase 1: Foundation (Week 1-2)**
- User authentication
- Basic chat UI
- Single LLM integration (GPT-4o-mini)
- 1 platform price comparison (Coupang)

**Phase 2: Core Features (Week 2-3)**
- Multi-turn conversation
- 3 platform price comparison
- RAG system
- Product recommendations

**Phase 3: Polish (Week 3-4)**
- AI 네고딜 (beta)
- User profiles
- Mobile optimization
- Performance tuning

**Phase 4: Launch (Week 4)**
- Beta testing (100 users)
- Bug fixes
- Public launch
- Marketing campaign

### 7.2 Launch Checklist

**Technical**
- [ ] All MVP features complete
- [ ] API integrations tested
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Monitoring setup

**Legal**
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] PIPA compliance
- [ ] API usage agreements

**Marketing**
- [ ] Landing page
- [ ] Social media accounts
- [ ] Press kit
- [ ] Influencer partnerships

---

## 8. Future Roadmap

### 8.1 Post-MVP Features (Month 2-3)

- 음성 검색
- 이미지 검색 ("이런 스타일 찾아줘")
- 가격 알림 (가격 하락 시 푸시 알림)
- KakaoTalk 미니앱
- 친구 추천 기능

### 8.2 Advanced Features (Month 4-6)

- 개인화 추천 엔진 (CF + CBF)
- 인플루언서 리뷰 통합
- 라이브 커머스 연동
- 구독 서비스 (₩9,900/month)
- 판매자 대시보드

### 8.3 Future Vision (Month 7-12)

- 카테고리 확장 (패션, 뷰티, 식품)
- AI 스타일링 ("이 옷에 어울리는 신발")
- 해외 직구 지원
- 앱 출시 (iOS/Android)
- 파트너십 (네이버, 카카오)

---

## Appendix

### A. Glossary

- **DAU**: Daily Active Users
- **MAU**: Monthly Active Users
- **GMV**: Gross Merchandise Value (거래액)
- **RAG**: Retrieval-Augmented Generation
- **PIPA**: Personal Information Protection Act (개인정보보호법)

### B. References

- [한국 최고의 AI 쇼핑 에이전트 개발 전략](../프로젝트_파일/전략_문서.md)
- [Building Igosa: Technical Roadmap](../프로젝트_파일/기술_로드맵.md)

### C. Change Log

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 2025-10-30 | 1.0 | 초기 버전 작성 | Product Team |

---

**문서 끝**

다음 단계: [Technical Architecture](./02_Tech_Spec_Architecture.md)
