# [Legal] Legal & Compliance Guide

**버전**: 1.0  
**날짜**: 2025-10-30  
**중요**: 실제 법률 자문은 변호사와 상담 필요

---

## 1. 개인정보보호법 (PIPA)

### 1.1 필수 조치사항

**개인정보 처리방침**
```
이거사 개인정보 처리방침

1. 수집하는 개인정보 항목
   - 필수: 이메일, 비밀번호 (해시화)
   - 선택: 이름, 전화번호, 선호 카테고리

2. 개인정보의 수집 및 이용 목적
   - 회원 가입 및 관리
   - 제품 추천 서비스 제공
   - 공동구매 참여 관리
   - 마케팅 및 광고 (동의 시)

3. 개인정보의 보유 및 이용 기간
   - 회원 탈퇴 시까지
   - 관계 법령에 따라 일부 정보는 보존

4. 개인정보의 제3자 제공
   - 쿠팡, 네이버 등 제휴 플랫폼에 구매 시 필요 정보 제공
   - 사전 동의 필요

5. 개인정보 처리 위탁
   - 결제 처리: 카카오페이, 네이버페이
   - 이메일 발송: SendGrid
   - 데이터 저장: AWS/Supabase

6. 정보주체의 권리·의무
   - 개인정보 열람 요구권
   - 개인정보 정정·삭제 요구권
   - 개인정보 처리정지 요구권
   - 개인정보 이동권

7. 개인정보 보호책임자
   - 이름: [담당자명]
   - 이메일: privacy@igosa.kr
   - 전화: 02-xxxx-xxxx

8. 개인정보 처리방침 변경
   - 변경 시 7일 전 공지
   - 중요 변경 시 30일 전 공지
```

### 1.2 동의 획득

```typescript
// components/auth/ConsentForm.tsx
interface ConsentFormProps {
  onSubmit: (consents: UserConsent) => void;
}

interface UserConsent {
  terms: boolean;            // 필수: 이용약관
  privacy: boolean;          // 필수: 개인정보처리방침
  marketing: boolean;        // 선택: 마케팅 수신
  personalization: boolean;  // 선택: 개인화 추천
}

export function ConsentForm({ onSubmit }: ConsentFormProps) {
  const [consents, setConsents] = useState<UserConsent>({
    terms: false,
    privacy: false,
    marketing: false,
    personalization: false,
  });

  const handleSubmit = () => {
    if (!consents.terms || !consents.privacy) {
      alert('필수 동의 항목을 확인해주세요.');
      return;
    }
    onSubmit(consents);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <input 
          type="checkbox" 
          checked={consents.terms}
          onChange={(e) => setConsents({ ...consents, terms: e.target.checked })}
        />
        [필수] 이용약관 동의
      </label>
      
      <label>
        <input 
          type="checkbox" 
          checked={consents.privacy}
          onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
        />
        [필수] 개인정보 처리방침 동의
      </label>
      
      <label>
        <input 
          type="checkbox" 
          checked={consents.marketing}
          onChange={(e) => setConsents({ ...consents, marketing: e.target.checked })}
        />
        [선택] 마케팅 정보 수신 동의
      </label>
      
      <label>
        <input 
          type="checkbox" 
          checked={consents.personalization}
          onChange={(e) => setConsents({ ...consents, personalization: e.target.checked })}
        />
        [선택] 개인화 추천 서비스 동의
      </label>
      
      <button type="submit">회원가입</button>
    </form>
  );
}
```

### 1.3 정보주체 권리 구현

```typescript
// app/api/user/data-request/route.ts
export async function POST(request: Request) {
  const { userId, requestType } = await request.json();
  
  switch (requestType) {
    case 'view':
      // 개인정보 열람
      const userData = await db.users.findUnique({
        where: { id: userId },
        include: {
          conversations: true,
          actions: true,
          consents: true,
        },
      });
      return Response.json(userData);
    
    case 'export':
      // 개인정보 이동권 (JSON 다운로드)
      const data = await exportUserData(userId);
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="user-data-${userId}.json"`,
        },
      });
    
    case 'delete':
      // 개인정보 삭제 요구권
      await deleteUserData(userId);
      return Response.json({ success: true });
  }
}
```

---

## 2. 전자상거래법

### 2.1 필수 표시 사항

```
웹사이트 하단에 표시:

사업자명: [회사명]
대표자: [대표자명]
사업자등록번호: [xxx-xx-xxxxx]
통신판매업신고번호: [제 xxxx-서울강남-xxxxx 호]
주소: [주소]
고객센터: [전화번호]
이메일: [이메일]
```

### 2.2 이용약관

```
이거사 이용약관

제1조 (목적)
본 약관은 이거사가 제공하는 AI 쇼핑 에이전트 서비스의 이용 조건 및 절차를 규정함을 목적으로 합니다.

제2조 (서비스의 내용)
1. AI 기반 제품 추천
2. 멀티플랫폼 가격 비교
3. 공동구매 중개
4. 제휴 링크를 통한 구매 연결

제3조 (책임의 제한)
1. 회사는 제3자 판매자의 상품 품질에 대한 책임을 지지 않습니다
2. 실제 구매는 제휴 플랫폼에서 이루어지며, 해당 플랫폼의 정책이 적용됩니다
3. AI 추천은 참고용이며, 최종 구매 결정은 사용자의 책임입니다

제4조 (환불 정책)
1. 서비스 이용료: 구독 취소 시 남은 기간 일할 계산 환불
2. 제품 구매: 각 플랫폼의 환불 정책 따름

제5조 (AI 서비스 특칙)
1. AI 추천의 근거를 투명하게 제시합니다
2. AI 추천에 오류가 있을 수 있으며, 사용자의 판단이 최우선입니다
3. 추천 알고리즘은 계속 개선됩니다

[... 추가 약관 ...]
```

### 2.3 청약철회 안내

```typescript
// components/legal/RefundPolicy.tsx
export function RefundPolicy() {
  return (
    <div>
      <h2>청약철회 및 환불 안내</h2>
      
      <section>
        <h3>1. 구독 서비스 환불</h3>
        <ul>
          <li>구독 후 7일 이내: 전액 환불</li>
          <li>7일 이후: 남은 기간 일할 계산 환불</li>
          <li>환불 요청: 설정 {">"} 구독 관리</li>
        </ul>
      </section>
      
      <section>
        <h3>2. 제품 구매 환불</h3>
        <ul>
          <li>구매는 제휴 플랫폼(쿠팡, 네이버 등)에서 이루어집니다</li>
          <li>환불은 해당 플랫폼의 정책을 따릅니다</li>
          <li>쿠팡: 7일 이내 교환/반품</li>
          <li>네이버: 판매자별 정책 상이</li>
        </ul>
      </section>
      
      <section>
        <h3>3. 환불 불가 사항</h3>
        <ul>
          <li>디지털 콘텐츠 (다운로드 완료 시)</li>
          <li>사용자 귀책 사유로 인한 상품 훼손</li>
        </ul>
      </section>
    </div>
  );
}
```

---

## 3. AI 윤리 및 투명성

### 3.1 AI 사용 명시

```tsx
// components/chat/AIDisclaimer.tsx
export function AIDisclaimer() {
  return (
    <div className="bg-blue-50 p-4 rounded">
      <p className="text-sm">
        🤖 이 대화는 AI 기술을 활용합니다. 
        AI 추천은 참고용이며, 최종 구매 결정은 사용자의 책임입니다.
      </p>
      <button className="text-blue-600 underline text-sm">
        AI 추천 원리 알아보기
      </button>
    </div>
  );
}
```

### 3.2 추천 이유 설명

```typescript
// AI 응답에 항상 근거 포함
interface AIRecommendation {
  product: Product;
  score: number;
  reasons: {
    category: string;
    explanation: string;
    sources: string[];
  }[];
}

// Example response
{
  product: { name: "나이키 신발", ... },
  score: 92,
  reasons: [
    {
      category: "comfort",
      explanation: "리뷰 89%가 '편하다' 평가",
      sources: ["네이버 쇼핑 리뷰 1,234개"]
    },
    {
      category: "value",
      explanation: "동급 제품 대비 ₩20,000 저렴",
      sources: ["가격 비교 분석"]
    }
  ]
}
```

### 3.3 편향성 방지

```typescript
// lib/ai/bias-detection.ts
export function detectBias(recommendations: Product[]): BiasReport {
  const brandDistribution = countByBrand(recommendations);
  const priceDistribution = analyzePrice Distribution(recommendations);
  
  const warnings: string[] = [];
  
  // Check brand concentration
  if (brandDistribution['나이키'] > 0.5) {
    warnings.push('특정 브랜드(나이키)에 치우친 추천');
  }
  
  // Check price range
  if (priceDistribution.min / priceDistribution.max < 0.3) {
    warnings.push('가격대가 균형있지 않음');
  }
  
  return {
    hasBias: warnings.length > 0,
    warnings,
    recommendations: suggestions,
  };
}
```

---

## 4. 저작권 및 상표권

### 4.1 제품 이미지 사용

```
원칙:
1. 제품 이미지는 제휴 플랫폼 API에서 제공하는 것만 사용
2. 사용자 생성 콘텐츠는 명시적 동의 후 사용
3. 로고/상표는 공식 브랜드 자산 사용

이미지 출처 표시:
<img src={product.image} alt={product.name} />
<small>이미지 출처: {product.platform}</small>
```

### 4.2 리뷰 인용

```typescript
// 리뷰 인용 시 출처 명시
interface ReviewQuote {
  text: string;
  author?: string;
  source: string;  // "네이버 쇼핑 리뷰", "쿠팡 리뷰" 등
  date: Date;
}

// Usage
"편하고 가볍습니다" (네이버 쇼핑 리뷰, 2024-10-15)
```

---

## 5. 데이터 보안

### 5.1 비밀번호 암호화

```typescript
// lib/auth/password.ts
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### 5.2 데이터 전송 암호화

```typescript
// All API calls use HTTPS
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.igosa.kr'
  : 'http://localhost:3000';

// JWT tokens
import jwt from 'jsonwebtoken';

export function createToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}
```

### 5.3 데이터베이스 암호화

```sql
-- Sensitive data encryption at rest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt payment info (if stored)
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  card_last4 VARCHAR(4),
  encrypted_token BYTEA  -- Encrypted using pgcrypto
);
```

---

## 6. 준수 체크리스트

### 6.1 출시 전 필수 확인

**법률 문서**
- [ ] 이용약관 작성 및 게시
- [ ] 개인정보 처리방침 작성 및 게시
- [ ] 사업자 정보 표시 (하단)
- [ ] 청약철회 안내

**개인정보보호**
- [ ] 개인정보 보호책임자 지정
- [ ] 동의 획득 프로세스 구현
- [ ] 정보주체 권리 행사 기능 (열람, 삭제)
- [ ] 데이터 암호화 (전송, 저장)

**AI 윤리**
- [ ] AI 사용 명시
- [ ] 추천 이유 설명 기능
- [ ] 편향성 모니터링
- [ ] 사용자 피드백 수집

**전자상거래**
- [ ] 환불 정책 명시
- [ ] 제품 정보 정확성 확인
- [ ] 제휴 관계 명시
- [ ] 고객센터 운영

### 6.2 정기 점검 (월 1회)

- [ ] 개인정보 처리 현황 점검
- [ ] 사용자 권리 요청 처리 현황
- [ ] AI 추천 품질 및 편향성 점검
- [ ] 법률 개정 사항 확인

---

## 7. 문의 및 신고

### 7.1 고객센터

```
이거사 고객센터

이메일: support@igosa.kr
전화: 02-xxxx-xxxx
운영시간: 평일 10:00-18:00 (주말/공휴일 휴무)

개인정보 관련 문의: privacy@igosa.kr
사업 제휴 문의: partnership@igosa.kr
```

### 7.2 분쟁 해결

```
분쟁 조정 기관:
- 한국소비자원: 국번없이 1372
- 개인정보 침해신고센터: 국번없이 118
- 전자거래분쟁조정위원회: www.ecmc.or.kr
```

---

**⚠️ 중요 고지**

이 문서는 일반적인 가이드이며 법률 자문을 대체하지 않습니다.
실제 서비스 출시 전 반드시 변호사와 상담하시기 바랍니다.

---

**문서 끝**

🎉 모든 개발 문서 완성!
