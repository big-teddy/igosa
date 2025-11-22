# 🧪 로컬 테스트 체크리스트

**서버**: http://localhost:3000
**상태**: ✅ 실행 중
**Supabase**: gaceyqigufvasshjifnl (Seoul)

---

## 📋 테스트 시나리오

### 1. 홈페이지 테스트 ✅

**URL**: http://localhost:3000

**확인사항**:
- [ ] 페이지가 정상적으로 로드됨
- [ ] 레이아웃이 깨지지 않음
- [ ] 헤더 메뉴 표시:
  - [ ] "친구 피드"
  - [ ] **"네고딜"** (✨ Sparkles 아이콘) ← 새 메뉴
  - [ ] "제품 둘러보기"
- [ ] ~~"가격 알림" 메뉴 없음~~ (제거됨)

**예상 결과**:
```
✅ 헤더에 "네고딜" 메뉴 표시
✅ "공동구매" 및 "가격 알림" 메뉴 없음
```

---

### 2. 제품 목록 페이지 ✅

**URL**: http://localhost:3000/products

**확인사항**:
- [ ] 제품 목록이 표시됨
- [ ] 제품 카드 클릭 가능
- [ ] 이미지 로딩 정상

---

### 3. 제품 상세 페이지 - 네고딜 위젯 ✅

**URL**: http://localhost:3000/products/[임의의 제품 ID]

**3-1. 네고딜 위젯 표시 확인**

위젯 구조:
```
┌─────────────────────────────────────┐
│ ✨ AI 네고딜          [실시간]      │
│ 👥 N명이 함께 협상 중!              │
├─────────────────────────────────────┤
│ 현재: ₩XXX,XXX | 최저: ₩XXX,XXX     │
│                                     │
│ ⚡ AI 추천 가격                     │
│ ₩XXX,XXX  [X% 할인] X,XXX원 절약    │
│ 가장 많은 사람들이 원하는 가격      │
│                                     │
│ 참여 진행률                         │
│ X,XXX/2,000명 (XX%)                 │
│ ████████░░ XX%                      │
│                                     │
│ 성공 확률: XX% | 남은시간: XXh      │
│                                     │
│ [ ₩XXX,XXX에 네고딜 참여 ]          │
│                                     │
│ ▼ 다른 가격으로 참여                │
└─────────────────────────────────────┘
```

**확인사항**:
- [ ] 제목: "✨ AI 네고딜" 표시
- [ ] 실시간 배지 표시
- [ ] 참여자 수 표시 (예: "1,847명이 함께 협상 중!")
- [ ] 현재가 / 최저가 표시
- [ ] AI 추천 가격 표시
- [ ] 할인율 및 절감 금액 표시
- [ ] 진행률 프로그레스 바 표시
- [ ] 성공 확률 표시
- [ ] 카운트다운 타이머 표시
- [ ] Primary CTA: "₩XXX,XXX에 네고딜 참여" 버튼

**예상 결과**:
```
✅ 통합 네고딜 위젯 표시
❌ 기존 SetTargetPriceWidget 없음
```

---

### 4. 네고딜 참여 플로우 테스트 ✅

**4-1. 비로그인 상태**

**단계**:
1. 제품 상세 페이지 접속
2. "네고딜 참여" 버튼 클릭

**예상 동작**:
- [ ] 로그인 페이지로 리다이렉트
- [ ] 또는 로그인 모달 표시

**확인**:
```bash
# 브라우저 개발자 도구 → Network 탭
# API 호출 확인
```

---

**4-2. 로그인 상태 (Mock)**

**단계**:
1. 제품 상세 페이지 접속 (user-1로 로그인 상태)
2. AI 추천 가격 확인 (예: ₩240,000)
3. "₩240,000에 네고딜 참여" 버튼 클릭

**예상 동작**:
- [ ] API 호출 발생: `POST /api/price-tracking`
- [ ] 요청 Body:
  ```json
  {
    "productId": "...",
    "targetPrice": 240000,
    "maxAcceptableDelta": 3000,
    "notificationChannels": ["push"]
  }
  ```
- [ ] 성공 메시지 Toast 표시: "🎉 네고딜 참여 완료!"
- [ ] 위젯 상태 변경: "참여 중" 표시

**디버깅**:
```javascript
// 브라우저 콘솔
// Network 탭에서 API 호출 확인
```

---

**4-3. 커스텀 가격 설정**

**단계**:
1. "▼ 다른 가격으로 참여" 클릭
2. 슬라이더로 가격 조정 (예: ₩230,000)
3. "이 가격으로 참여" 버튼 클릭

**예상 동작**:
- [ ] 커스텀 가격 섹션 펼쳐짐
- [ ] 슬라이더 드래그 가능
- [ ] 실시간으로 절감액 / 성공 확률 업데이트
- [ ] Analytics 이벤트 발생: `negodeal_custom_price_set`

---

### 5. 실시간 업데이트 테스트 ✅

**목표**: 10초마다 수요 데이터가 업데이트되는지 확인

**단계**:
1. 제품 상세 페이지 접속
2. 브라우저 개발자 도구 → Network 탭 열기
3. 10초 대기

**예상 동작**:
- [ ] 10초마다 `/api/demand/[productId]` API 호출
- [ ] 참여자 수 업데이트 (변경 시)
- [ ] 진행률 업데이트

**확인**:
```
Network 탭에서:
  GET /api/demand/nike-pegasus-40
  Status: 200
  Response: { totalUsers: 1847, ... }
```

---

### 6. Supabase 데이터베이스 확인 ✅

**Supabase Dashboard**: https://supabase.com/dashboard/project/gaceyqigufvasshjifnl

**6-1. 테이블 확인**

SQL Editor에서 실행:
```sql
-- 1. 테이블 존재 확인
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 예상 결과:
--  price_alerts
--  price_history
--  price_tracking
```

**6-2. 데이터 확인**

```sql
-- 2. price_tracking 데이터 확인
SELECT
  id,
  user_id,
  product_id,
  target_price,
  status,
  created_at
FROM price_tracking
ORDER BY created_at DESC
LIMIT 10;
```

**예상 결과**:
- 위젯에서 참여한 데이터가 저장됨
- status = 'active'

---

### 7. Analytics 이벤트 확인 ✅

**브라우저 개발자 도구 → Console**

**예상 로그**:
```javascript
// Widget 노출
analytics.track("negodeal_widget_viewed", {
  product_id: "...",
  variant: "unified",
  ai_recommended_price: 240000,
  participant_count: 1847
})

// 참여 클릭
analytics.track("negodeal_participate_clicked", {
  product_id: "...",
  target_price: 240000,
  is_ai_recommended: true
})

// 참여 완료
analytics.track("negodeal_participate_completed", {
  time_to_complete_ms: 523,
  custom_price_used: false
})
```

**확인**:
- [ ] 이벤트가 정상적으로 발생
- [ ] PostHog/GA4에 전송됨 (설정된 경우)

---

### 8. 에러 핸들링 테스트 ✅

**8-1. 네트워크 오프라인**

**단계**:
1. DevTools → Network → Offline 체크
2. 페이지 새로고침

**예상 동작**:
- [ ] 에러 메시지 표시
- [ ] 또는 로딩 상태 유지

---

**8-2. API 에러 시뮬레이션**

Supabase를 일시적으로 비활성화:
```bash
# .env.local에서 잘못된 URL 설정
NEXT_PUBLIC_SUPABASE_URL="https://invalid.supabase.co"
```

**예상 동작**:
- [ ] 에러 메시지: "일시적인 오류가 발생했습니다"
- [ ] Sentry에 에러 로깅 (설정된 경우)

---

### 9. 반응형 UI 테스트 ✅

**DevTools → Toggle device toolbar**

**테스트 해상도**:

#### Desktop (1920x1080)
- [ ] 레이아웃 정상
- [ ] 위젯이 적절한 크기로 표시

#### Tablet (768x1024)
- [ ] 컴팩트 레이아웃 전환
- [ ] 터치 인터랙션 반응

#### Mobile (375x667)
- [ ] 단일 컬럼 레이아웃
- [ ] 버튼 터치 영역 충분 (44x44px 이상)
- [ ] 텍스트 읽기 쉬움

---

### 10. Feature Flag 토글 테스트 ✅

**목표**: Feature Flag 변경 시 올바르게 전환되는지 확인

**단계**:
1. `.env.local` 수정:
   ```bash
   NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL="false"
   ```
2. 개발 서버 재시작:
   ```bash
   npm run dev
   ```
3. 제품 상세 페이지 새로고침

**예상 동작**:
- [ ] 기존 SetTargetPriceWidget 표시
- [ ] 제목: "원하는 가격에 구매하기"
- [ ] CTA: "가격 알림 받기"

**복구**:
```bash
NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL="true"
npm run dev
```

---

## ✅ 테스트 통과 기준

### 필수 (Must Pass)
- [x] 서버가 에러 없이 실행됨
- [ ] 홈페이지 정상 로딩
- [ ] 헤더에 "네고딜" 메뉴 표시
- [ ] 제품 상세 페이지에 네고딜 위젯 표시
- [ ] 참여 버튼 클릭 가능
- [ ] Supabase 연결 정상

### 권장 (Should Pass)
- [ ] 실시간 업데이트 동작
- [ ] 커스텀 가격 설정 가능
- [ ] Analytics 이벤트 발생
- [ ] 반응형 UI 정상

### 선택 (Nice to Have)
- [ ] 에러 핸들링 적절
- [ ] Feature Flag 토글 동작
- [ ] 성능 (페이지 로딩 < 2초)

---

## 🐛 발견된 이슈 기록

### 이슈 템플릿

**이슈 #1**: [제목]
- **심각도**: 🔴 Critical / 🟡 Medium / 🟢 Low
- **재현 단계**: ...
- **예상 동작**: ...
- **실제 동작**: ...
- **스크린샷**: ...
- **해결 방법**: ...

---

## 📊 테스트 결과 요약

**테스트 일자**: ___________
**테스트 환경**: 로컬 (http://localhost:3000)
**Supabase**: gaceyqigufvasshjifnl

**결과**:
- ✅ 통과: ___ / ___
- ⚠️ 경고: ___ 개
- ❌ 실패: ___ 개

**종합 평가**:
- [ ] 🟢 배포 가능
- [ ] 🟡 조건부 배포 (경미한 이슈)
- [ ] 🔴 배포 불가 (Critical 이슈)

**다음 단계**: ___________

---

**작성**: 2025-01-20
**서버**: http://localhost:3000
**상태**: ✅ 실행 중
