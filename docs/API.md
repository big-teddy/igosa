# 이거사 API 문서

## 개요
AI 기반 가격 협상 플랫폼 API

**Base URL**: `https://igosa.vercel.app/api`

---

## 인증
모든 API는 Supabase 인증 사용. 요청 시 쿠키에 세션 토큰 포함 필요.

```typescript
// 클라이언트에서 자동 처리
const supabase = createClient();
await supabase.auth.signInWithPassword({ email, password });
```

---

## API 엔드포인트

### 채팅 (Chat)

#### POST `/api/chat`
AI 어시스턴트와 대화

**요청**:
```json
{
  "messages": [
    { "role": "user", "content": "아이폰 15 최저가 찾아줘" }
  ]
}
```

**응답**: Server-Sent Events (SSE) 스트림

---

### 협상 (Negotiations)

#### POST `/api/negotiations/trigger`
새 협상 시작

**요청**:
```json
{
  "productId": "product-1",
  "targetPrice": 950000,
  "userId": "user-1"
}
```

**응답**:
```json
{
  "success": true,
  "negotiationId": "neg-123"
}
```

---

### 네고딜 (Nego Deals)

#### GET `/api/nego-deals`
활성 딜 목록 조회

**응답**:
```json
{
  "deals": [
    {
      "id": "deal-1",
      "productName": "애플워치",
      "currentPrice": 450000,
      "participants": 15
    }
  ]
}
```

---

### 가격 알림 (Price Alerts)

#### POST `/api/price-alerts`
가격 알림 생성

**요청**:
```json
{
  "productId": "product-1",
  "targetPrice": 800000
}
```

---

## 에러 코드

| 코드 | 설명 |
|-----|------|
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 429 | 요청 제한 초과 |
| 500 | 서버 오류 |

---

## Rate Limiting

- 인증 사용자: 100 req/min
- 비인증: 20 req/min
- AI API: 10 req/min
