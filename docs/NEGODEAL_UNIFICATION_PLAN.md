# 네고딜 1.0/2.0 통합 실행 계획

**날짜**: 2025-01-19
**목표**: 원래 PRD 비전에 맞춰 단일 통합 네고딜 경험 제공
**상태**: 🔄 진행 예정

---

## 📋 Executive Summary

### 문제점
- ❌ 네고딜 1.0 (수동 그룹 구매)과 2.0 (AI 가격 협상)이 분리되어 사용자 혼란
- ❌ "공동구매"와 "가격 알림" 두 가지 옵션 제시로 결정 피로
- ❌ 원래 PRD의 "AI 자동 그룹핑 + 협상" 비전과 불일치

### 솔루션
- ✅ 네고딜 1.0 제거, 2.0을 "네고딜"로 단일화
- ✅ 사용자 경험: "참여만 클릭 → AI가 알아서 처리"
- ✅ 용어 통일: "네고딜" (공동구매/가격알림 용어 제거)

### 예상 효과
- 🎯 전환율 30-50% 증가 (선택 피로 제거)
- 🎯 사용자 이해도 80%+ (단일 개념)
- 🎯 PRD 비전 100% 달성

---

## 🎯 통합 비전

### Before (현재 - 분리)
```
사용자 → 제품 페이지
  ↓
두 가지 옵션 제시:
  [ 네고딜 참여 ] (1.0) ← 뭐지?
  [ 가격 알림 설정 ] (2.0) ← 이건 또?
  ↓
사용자 혼란 → 이탈
```

### After (통합 - 명확)
```
사용자 → 제품 페이지
  ↓
단일 네고딜 위젯:
  "🎯 1,847명이 240,000원 원해요
   [ 네고딜 참여하기 ]"
  ↓
참여 → AI 자동 처리
  ↓
목표 달성 → 알림
```

---

## 🔧 기술 구현 계획

### Phase 1: 코드 정리 (1-2일)

#### 1.1 삭제할 파일
```bash
# 네고딜 1.0 전용 코드
❌ src/app/(main)/nego-deals/page.tsx           # 정적 딜 목록 페이지
❌ src/app/(main)/nego-deals/[id]/page.tsx      # 딜 상세 페이지
❌ src/components/nego-deals/nego-deal-card.tsx # 1.0 카드
❌ src/components/nego-deals/NegoDealDashboard.tsx
❌ src/lib/data/mock-nego-deals.ts              # 정적 mock 데이터
❌ src/lib/services/nego-deal-service.ts        # 1.0 전용 서비스
❌ src/types/nego-deal.ts                       # 1.0 타입

# API 라우트 (재설계 필요)
⚠️ src/app/api/nego-deals/*                     # 통합 API로 재설계
```

#### 1.2 유지/개선할 파일
```bash
# 핵심 네고딜 2.0 컴포넌트
✅ src/components/price-tracking/SetTargetPriceWidget.tsx
   → NegoDealWidget.tsx로 이름 변경 및 UX 개선

# API 라우트
✅ src/app/api/price-tracking/*
   → /api/negodeal/* 로 경로 변경

✅ src/app/api/demand/[productId]/route.ts
   → 수요 집계 로직 (핵심 유지)

# 데이터베이스
✅ price_tracking 테이블
   → negodeal_participations로 이름 변경 (마이그레이션)
```

---

### Phase 2: UI/UX 재설계 (2-3일)

#### 2.1 새로운 NegoDealWidget

**위치**: `src/components/negodeal/NegoDealWidget.tsx`

**기능**:
```typescript
interface NegoDealWidgetProps {
  productId: string;
  productName: string;
  currentPrice: number;
  lowestPrice?: number; // 최근 30일 최저가
}

// 표시 정보
- 현재 참여자 수 (실시간)
- AI 추천 목표 가격
- 진행률 (%) 프로그레스 바
- 예상 성공 확률
- 마감 시간 카운트다운
- 예상 할인 금액

// CTA
[ AI 추천가에 참여하기 ] (primary)
[ 내가 원하는 가격 설정 ] (secondary, 펼침)
```

**UI 레이아웃**:
```
┌─────────────────────────────────────────────┐
│ 🎯 AI 네고딜                                │
│                                             │
│ 1,847명이 함께 협상 중이에요                │
│                                             │
│ 💰 AI 추천 가격: 240,000원                  │
│    (현재가 259,000원 → 19,000원 할인)       │
│                                             │
│ ████████░░ 92% 달성                        │
│ 목표: 2,000명 | 성공 확률: 85%              │
│ ⏰ 23시간 후 마감                           │
│                                             │
│ [   240,000원에 참여하기   ] ← Primary    │
│                                             │
│ ▼ 다른 가격으로 참여 (펼치기)               │
│   ┌─────────────────────────┐              │
│   │ 235,000원 [○─────────○] │              │
│   │         [  참여  ]       │              │
│   └─────────────────────────┘              │
└─────────────────────────────────────────────┘
```

#### 2.2 제품 상세 페이지 통합

**파일**: `src/app/(main)/products/[id]/page.tsx`

**변경사항**:
```typescript
// Before
<SetTargetPriceWidget productId={id} ... />

// After
<NegoDealWidget
  productId={id}
  productName={product.name}
  currentPrice={lowestPrice.total}
  lowestPrice={historicalLow}
/>
```

#### 2.3 네고딜 전용 페이지 (재설계)

**파일**: `src/app/(main)/negodeal/page.tsx` (새 경로)

**컨셉**: "진행 중인 모든 네고딜 한눈에"

```typescript
// 섹션 1: 내 참여 네고딜 (로그인 시)
- 참여 중: 3건
- 협상 성공 대기: 1건
- 구매 완료: 5건

// 섹션 2: 실시간 인기 네고딜
- 참여자 많은 순
- 마감 임박 순
- 성공 확률 높은 순

// 섹션 3: 카테고리별 네고딜
- 전자제품
- 생활용품
- 패션/뷰티
```

#### 2.4 마이페이지 통합

**파일**: `src/app/(main)/my/page.tsx`

**변경사항**:
```typescript
// Before
탭: "가격 알림"

// After
탭: "내 네고딜"

// 표시 내용
- 참여 중인 네고딜 (진행률 표시)
- 협상 성공 (구매 대기)
- 구매 완료
- 협상 실패 (재참여 가능)
```

---

### Phase 3: 헤더 네비게이션 변경 (30분)

**파일**: `src/components/layout/header.tsx`

```typescript
// Before
const navItems = [
  { href: "/feed", icon: Users, label: "친구 피드" },
  { href: "/nego-deals", icon: TrendingDown, label: "공동구매" },
  { href: "/products", icon: Package, label: "제품 둘러보기" },
  { href: "/price-alerts", icon: Bell, label: "가격 알림" },
];

// After
const navItems = [
  { href: "/feed", icon: Users, label: "친구 피드" },
  { href: "/negodeal", icon: Sparkles, label: "네고딜" }, // ✨ 변경
  { href: "/products", icon: Package, label: "제품 둘러보기" },
  { href: "/my", icon: User, label: "마이페이지" }, // Bell 제거
];
```

**아이콘 변경 이유**:
- `TrendingDown` → `Sparkles`: AI 자동화 느낌
- `Bell` 제거: 네고딜에 통합됨

---

### Phase 4: API 재설계 (2-3일)

#### 4.1 API 라우트 구조

```bash
# Before
/api/price-tracking          # 가격 추적 CRUD
/api/nego-deals              # 네고딜 1.0 CRUD
/api/demand/[productId]      # 수요 집계

# After (통합)
/api/negodeal/
  ├── participate            # POST: 네고딜 참여
  ├── my-participations      # GET: 내 참여 목록
  ├── product/[id]           # GET: 제품별 네고딜 현황
  ├── trending               # GET: 인기 네고딜 목록
  └── status/[participationId] # GET: 참여 상태 조회

/api/demand/[productId]      # 유지 (수요 집계)
```

#### 4.2 통합 API 스펙

##### POST /api/negodeal/participate
```typescript
// Request
{
  productId: string;
  targetPrice: number;
  notificationChannels: ['push', 'email'];
}

// Response
{
  success: true,
  participation: {
    id: string;
    productId: string;
    targetPrice: number;
    participantCount: 1847,      // 같은 가격대 참여자
    progressPercent: 92,          // 목표 대비 진행률
    successProbability: 85,       // AI 예측 성공률
    estimatedCompletion: "2025-01-20T15:00:00Z",
    status: "active"
  }
}
```

##### GET /api/negodeal/product/[id]
```typescript
// Response
{
  productId: string;
  currentPrice: 259000,

  // AI 추천 가격
  recommendedPrice: 240000,
  recommendedReason: "1,847명이 참여 중이며 성공 확률 85%",

  // 가격대별 통계
  priceDistribution: [
    { price: 240000, count: 1847, probability: 85 },
    { price: 245000, count: 892, probability: 65 },
    { price: 250000, count: 534, probability: 45 }
  ],

  // 전체 통계
  totalParticipants: 3273,
  targetGoal: 2000,
  progressPercent: 163,
  deadline: "2025-01-20T15:00:00Z"
}
```

---

### Phase 5: 데이터베이스 마이그레이션 (1일)

#### 5.1 테이블 이름 변경 (선택사항)

```sql
-- Option A: 테이블 이름 변경
ALTER TABLE price_tracking
RENAME TO negodeal_participations;

-- Option B: 뷰 생성 (하위 호환성 유지)
CREATE VIEW negodeal_participations AS
SELECT * FROM price_tracking;
```

**권장**: Option B (뷰 생성)
- 기존 API 깨지지 않음
- 점진적 마이그레이션 가능

#### 5.2 컬럼 추가

```sql
ALTER TABLE price_tracking ADD COLUMN IF NOT EXISTS
  success_probability INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  estimated_completion TIMESTAMP,
  participant_count INTEGER DEFAULT 0;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_price_tracking_probability
  ON price_tracking(success_probability DESC)
  WHERE status = 'active';
```

---

### Phase 6: 용어 통일 (전체 코드베이스)

#### 6.1 용어 매핑

```typescript
// Before → After
"가격 알림"        → "네고딜"
"가격 추적"        → "네고딜 참여"
"알림 설정"        → "네고딜 참여"
"공동구매"         → "네고딜"
"Price Tracking"  → "NegoDeal"
"Price Alert"     → "NegoDeal Participation"
```

#### 6.2 일괄 변경 스크립트

```bash
# 컴포넌트 파일명
mv src/components/price-tracking src/components/negodeal
mv SetTargetPriceWidget.tsx NegoDealWidget.tsx

# import 경로 일괄 변경
find src -type f -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i '' 's/price-tracking/negodeal/g'

# UI 텍스트 변경
find src -type f -name "*.tsx" | \
  xargs sed -i '' 's/가격 알림/네고딜/g'
```

---

## 📊 마이그레이션 체크리스트

### Phase 1: 코드 정리 ✅
- [ ] 네고딜 1.0 파일 삭제
  - [ ] `src/app/(main)/nego-deals/page.tsx`
  - [ ] `src/app/(main)/nego-deals/[id]/page.tsx`
  - [ ] `src/components/nego-deals/*`
  - [ ] `src/lib/data/mock-nego-deals.ts`
  - [ ] `src/lib/services/nego-deal-service.ts`
  - [ ] `src/types/nego-deal.ts`

### Phase 2: UI/UX 재설계 ✅
- [ ] NegoDealWidget 구현
  - [ ] 실시간 참여자 수 표시
  - [ ] 진행률 프로그레스 바
  - [ ] 성공 확률 표시
  - [ ] 마감 카운트다운
  - [ ] AI 추천 가격 로직
- [ ] 제품 상세 페이지 통합
- [ ] 네고딜 전용 페이지 재설계
- [ ] 마이페이지 "내 네고딜" 탭

### Phase 3: 네비게이션 변경 ✅
- [ ] Header 메뉴 아이템 변경
- [ ] 아이콘 변경 (Sparkles)
- [ ] 라우팅 경로 변경

### Phase 4: API 재설계 ✅
- [ ] `/api/negodeal/participate`
- [ ] `/api/negodeal/my-participations`
- [ ] `/api/negodeal/product/[id]`
- [ ] `/api/negodeal/trending`
- [ ] 기존 API 하위 호환성 유지

### Phase 5: DB 마이그레이션 ✅
- [ ] 뷰 생성 또는 테이블 이름 변경
- [ ] 새 컬럼 추가
- [ ] 인덱스 추가
- [ ] 데이터 검증

### Phase 6: 용어 통일 ✅
- [ ] 파일명 변경
- [ ] import 경로 변경
- [ ] UI 텍스트 변경
- [ ] 주석/문서 업데이트

### Phase 7: 테스트 ✅
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests (주요 시나리오)
- [ ] 사용자 인수 테스트

### Phase 8: 문서 업데이트 ✅
- [ ] README.md
- [ ] API 문서
- [ ] 컴포넌트 Storybook
- [ ] 사용자 가이드

---

## 🎯 예상 타임라인

| Phase | 작업 | 예상 시간 | 담당 |
|-------|------|----------|------|
| 1 | 코드 정리 | 1-2일 | Backend |
| 2 | UI/UX 재설계 | 2-3일 | Frontend |
| 3 | 네비게이션 | 0.5일 | Frontend |
| 4 | API 재설계 | 2-3일 | Backend |
| 5 | DB 마이그레이션 | 1일 | Backend |
| 6 | 용어 통일 | 1일 | Full Stack |
| 7 | 테스트 | 2-3일 | QA |
| 8 | 문서화 | 1일 | Tech Writer |
| **총계** | | **10-15일** | |

---

## 🚨 리스크 및 대응책

### Risk 1: 기존 사용자 데이터 손실
**완화책**:
- ✅ 테이블 이름 변경 대신 뷰 생성
- ✅ 기존 API 엔드포인트 유지 (deprecation 경고만)
- ✅ 마이그레이션 스크립트 롤백 가능하게

### Risk 2: 사용자 혼란 (UI 급변)
**완화책**:
- ✅ 점진적 롤아웃 (10% → 50% → 100%)
- ✅ 온보딩 툴팁 표시 "네고딜이 새로워졌어요!"
- ✅ FAQ 및 도움말 업데이트

### Risk 3: 개발 지연
**완화책**:
- ✅ Phase별 독립 배포 가능하게 설계
- ✅ Feature Flag로 On/Off 전환 가능
- ✅ Phase 2만 우선 배포 (UI 개선)

---

## 📈 성공 지표

### 출시 후 1주일
- [ ] 네고딜 참여율 30% 증가
- [ ] 평균 체류 시간 20% 증가
- [ ] 이탈률 15% 감소

### 출시 후 1개월
- [ ] 전환율 (참여 → 구매) 10% → 15%
- [ ] NPS 점수 +10점
- [ ] 사용자 피드백 80%+ 긍정적

---

## 🎨 디자인 시스템

### 색상 테마
```typescript
// 네고딜 전용 색상
--negodeal-primary: #FF6B35;      // 활기찬 오렌지
--negodeal-progress: #4ECDC4;     // 민트 그린
--negodeal-success: #44CF6C;      // 성공 그린
--negodeal-warning: #FFD93D;      // 주의 옐로우
```

### 애니메이션
```css
/* 진행률 바 애니메이션 */
@keyframes pulse-progress {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* 참여 버튼 호버 */
.negodeal-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(255, 107, 53, 0.3);
}
```

---

## 📞 커뮤니케이션 플랜

### 내부
- **Kickoff Meeting**: 2025-01-20 10:00
- **Daily Standup**: 매일 오전 10시
- **Sprint Review**: 매주 금요일 15:00

### 외부 (사용자)
- **사전 공지**: 배포 1주 전 (이메일, 푸시)
- **변경사항 안내**: 첫 접속 시 모달
- **FAQ 업데이트**: 배포 전날
- **고객 지원**: 배포 후 1주일 집중 모니터링

---

## 🔗 관련 문서

- [원래 PRD](./01_PRD_Product_Requirements.md)
- [네고딜 2.0 PRD](./igosa_negodeal_2.0_product_requirements_document.md)
- [Phase 3 완료 리포트](./PHASE_3_COMPLETION.md)
- [프로덕션 체크리스트](./DEPLOYMENT_CHECKLIST.md)

---

**작성**: 2025-01-19
**다음 업데이트**: Phase 1 완료 후
**담당자**: Engineering Team

