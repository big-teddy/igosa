# [API Spec] API Integration Guide

**버전**: 1.0  
**날짜**: 2025-10-30  
**작성자**: Backend Team

---

## 목차

1. [Coupang Partners API](#1-coupang-partners-api)
2. [Naver Shopping API](#2-naver-shopping-api)
3. [Kakao Pay API](#3-kakao-pay-api)
4. [KakaoTalk Channel API](#4-kakaotalk-channel-api)
5. [Error Handling](#5-error-handling)
6. [Rate Limiting](#6-rate-limiting)

---

## 1. Coupang Partners API

### 1.1 인증

```typescript
import crypto from 'crypto';

function generateCoupangSignature(
  method: string,
  url: string,
  accessKey: string,
  secretKey: string
): string {
  const datetime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const message = `${datetime}${method}${url}`;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');
  
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}

// Usage
const authorization = generateCoupangSignature(
  'GET',
  '/v2/providers/affiliate_open_api/apis/openapi/products/search',
  process.env.COUPANG_ACCESS_KEY!,
  process.env.COUPANG_SECRET_KEY!
);
```

### 1.2 제품 검색

```typescript
interface CoupangSearchParams {
  keyword: string;
  limit?: number;  // Default: 10, Max: 100
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface CoupangProduct {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  categoryName: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  rating: number;
  reviewCount: number;
}

async function searchCoupang(params: CoupangSearchParams): Promise<CoupangProduct[]> {
  const url = new URL('https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/products/search');
  url.searchParams.set('keyword', params.keyword);
  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.categoryId) url.searchParams.set('categoryId', params.categoryId.toString());
  if (params.minPrice) url.searchParams.set('minPrice', params.minPrice.toString());
  if (params.maxPrice) url.searchParams.set('maxPrice', params.maxPrice.toString());
  
  const authorization = generateCoupangSignature('GET', url.pathname + url.search, ...);
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Coupang API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data.productData.map(mapCoupangProduct);
}

function mapCoupangProduct(raw: any): CoupangProduct {
  return {
    productId: raw.productId,
    productName: raw.productName,
    productPrice: raw.productPrice,
    productImage: raw.productImage,
    productUrl: raw.productUrl,
    categoryName: raw.categoryName,
    isRocket: raw.isRocket,
    isFreeShipping: raw.isFreeShipping,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
  };
}
```

### 1.3 딥링크 생성 (제휴 추적)

```typescript
async function generateCoupangDeepLink(productUrl: string): Promise<string> {
  const url = new URL('https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/deeplink');
  
  const authorization = generateCoupangSignature('POST', url.pathname, ...);
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coupangUrls: [productUrl],
    }),
  });
  
  const data = await response.json();
  return data.data[0].shortenUrl;  // 제휴 링크
}
```

---

## 2. Naver Shopping API

### 2.1 인증

```typescript
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID!;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!;

const headers = {
  'X-Naver-Client-Id': NAVER_CLIENT_ID,
  'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
};
```

### 2.2 제품 검색

```typescript
interface NaverSearchParams {
  query: string;
  display?: number;  // Default: 10, Max: 100
  start?: number;    // 시작 인덱스 (페이지네이션)
  sort?: 'sim' | 'date' | 'asc' | 'dsc';  // 유사도, 날짜, 가격 오름차순, 가격 내림차순
}

interface NaverProduct {
  title: string;
  link: string;
  image: string;
  lprice: string;  // 최저가
  hprice: string;  // 최고가
  mallName: string;
  productId: string;
  productType: string;
  brand: string;
  maker: string;
  category1: string;
  category2: string;
  category3: string;
}

async function searchNaver(params: NaverSearchParams): Promise<NaverProduct[]> {
  const url = new URL('https://openapi.naver.com/v1/search/shop.json');
  url.searchParams.set('query', params.query);
  if (params.display) url.searchParams.set('display', params.display.toString());
  if (params.start) url.searchParams.set('start', params.start.toString());
  if (params.sort) url.searchParams.set('sort', params.sort);
  
  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    throw new Error(`Naver API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.items;
}
```

---

## 3. Kakao Pay API

### 3.1 결제 준비

```typescript
interface KakaoPayReadyParams {
  cid: string;  // 가맹점 코드
  partner_order_id: string;  // 주문 번호
  partner_user_id: string;   // 사용자 ID
  item_name: string;         // 상품명
  quantity: number;
  total_amount: number;
  tax_free_amount: number;
  approval_url: string;  // 결제 성공 시 redirect URL
  cancel_url: string;    // 결제 취소 시 redirect URL
  fail_url: string;      // 결제 실패 시 redirect URL
}

interface KakaoPayReadyResponse {
  tid: string;  // 거래 고유번호
  next_redirect_app_url: string;
  next_redirect_mobile_url: string;
  next_redirect_pc_url: string;
  android_app_scheme: string;
  ios_app_scheme: string;
  created_at: string;
}

async function kakaoPayReady(params: KakaoPayReadyParams): Promise<KakaoPayReadyResponse> {
  const response = await fetch('https://kapi.kakao.com/v1/payment/ready', {
    method: 'POST',
    headers: {
      'Authorization': `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      cid: params.cid,
      partner_order_id: params.partner_order_id,
      partner_user_id: params.partner_user_id,
      item_name: params.item_name,
      quantity: params.quantity.toString(),
      total_amount: params.total_amount.toString(),
      tax_free_amount: params.tax_free_amount.toString(),
      approval_url: params.approval_url,
      cancel_url: params.cancel_url,
      fail_url: params.fail_url,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Kakao Pay error: ${response.status}`);
  }
  
  return await response.json();
}
```

### 3.2 결제 승인

```typescript
interface KakaoPayApproveParams {
  cid: string;
  tid: string;  // ready에서 받은 tid
  partner_order_id: string;
  partner_user_id: string;
  pg_token: string;  // 사용자가 결제 완료 후 받는 토큰
}

async function kakaoPayApprove(params: KakaoPayApproveParams) {
  const response = await fetch('https://kapi.kakao.com/v1/payment/approve', {
    method: 'POST',
    headers: {
      'Authorization': `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      cid: params.cid,
      tid: params.tid,
      partner_order_id: params.partner_order_id,
      partner_user_id: params.partner_user_id,
      pg_token: params.pg_token,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Kakao Pay approve error: ${response.status}`);
  }
  
  return await response.json();
}
```

---

## 4. KakaoTalk Channel API

### 4.1 메시지 전송

```typescript
interface KakaoMessageParams {
  receiver_uuids: string[];  // 사용자 UUID 배열
  template_object: {
    object_type: 'text' | 'feed' | 'list';
    text: string;
    link?: {
      web_url: string;
      mobile_web_url: string;
    };
    buttons?: {
      title: string;
      link: {
        web_url: string;
        mobile_web_url: string;
      };
    }[];
  };
}

async function sendKakaoMessage(params: KakaoMessageParams) {
  const response = await fetch('https://kapi.kakao.com/v1/api/talk/friends/message/default/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,  // 사용자 액세스 토큰
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      receiver_uuids: JSON.stringify(params.receiver_uuids),
      template_object: JSON.stringify(params.template_object),
    }),
  });
  
  return await response.json();
}

// Example: 네고딜 알림 전송
async function sendNegoDealNotification(
  userIds: string[],
  productName: string,
  discount: number
) {
  await sendKakaoMessage({
    receiver_uuids: userIds,
    template_object: {
      object_type: 'feed',
      text: `🎉 네고딜 성공!\n\n"${productName}" 공동구매가 성공했습니다.\n${discount}% 할인이 적용되었어요!`,
      link: {
        web_url: 'https://igosa.kr/nego-deals',
        mobile_web_url: 'https://igosa.kr/nego-deals',
      },
      buttons: [{
        title: '구매하러 가기',
        link: {
          web_url: 'https://igosa.kr/nego-deals',
          mobile_web_url: 'https://igosa.kr/nego-deals',
        },
      }],
    },
  });
}
```

---

## 5. Error Handling

### 5.1 통합 에러 핸들러

```typescript
class APIError extends Error {
  constructor(
    public platform: string,
    public statusCode: number,
    public message: string,
    public originalError?: any
  ) {
    super(`${platform} API Error: ${message}`);
  }
}

async function safeAPICall<T>(
  platform: string,
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.response) {
      throw new APIError(
        platform,
        error.response.status,
        error.response.statusText,
        error
      );
    }
    throw error;
  }
}

// Usage
try {
  const products = await safeAPICall('Coupang', () => searchCoupang({ keyword: '신발' }));
} catch (error) {
  if (error instanceof APIError) {
    console.error(`${error.platform} failed:`, error.message);
    // Fallback to other platforms
  }
}
```

### 5.2 Retry Logic

```typescript
async function retryAPICall<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 6. Rate Limiting

### 6.1 API별 제한

```typescript
const RATE_LIMITS = {
  coupang: {
    requests_per_second: 10,
    requests_per_day: 10000,
  },
  naver: {
    requests_per_second: 10,
    requests_per_day: 25000,
  },
  kakao: {
    requests_per_second: 30,
    requests_per_day: 100000,
  },
};

class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  constructor(
    private requestsPerSecond: number
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.process();
      }
    });
  }
  
  private async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      await fn();
      await new Promise(resolve => setTimeout(resolve, 1000 / this.requestsPerSecond));
    }
    
    this.processing = false;
  }
}

// Usage
const coupangLimiter = new RateLimiter(RATE_LIMITS.coupang.requests_per_second);

async function searchCoupangWithLimit(params: CoupangSearchParams) {
  return await coupangLimiter.execute(() => searchCoupang(params));
}
```

---

**문서 끝**

다음: [AI Implementation](./04_AI_Implementation.md)
