# [Testing] Testing & QA Guide

**버전**: 1.0  
**날짜**: 2025-10-30

---

## 1. Unit Tests (Jest + React Testing Library)

### 1.1 Setup

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// jest.setup.ts
import '@testing-library/jest-dom';
```

### 1.2 Component Tests

```typescript
// components/products/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: '나이키 신발',
    image: '/shoe.jpg',
    prices: [
      { platform: 'coupang', price: 100000, shipping: 0, total: 100000, url: 'https://...' }
    ],
    rating: 4.5,
    reviewCount: 1234,
  };

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('나이키 신발')).toBeInTheDocument();
  });

  it('shows lowest price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('₩100,000')).toBeInTheDocument();
  });

  it('displays rating', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});
```

### 1.3 API Tests

```typescript
// lib/api/coupang.test.ts
import { searchCoupang } from './coupang';

describe('Coupang API', () => {
  it('searches products successfully', async () => {
    const results = await searchCoupang({ keyword: '신발' });
    expect(results).toHaveLength(10);
    expect(results[0]).toHaveProperty('productId');
    expect(results[0]).toHaveProperty('productPrice');
  });

  it('handles API errors gracefully', async () => {
    await expect(
      searchCoupang({ keyword: '' })
    ).rejects.toThrow('Invalid keyword');
  });
});
```

---

## 2. E2E Tests (Playwright)

### 2.1 Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

### 2.2 User Flow Tests

```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
  test('user can search and view products', async ({ page }) => {
    await page.goto('/');
    
    // Type search query
    await page.fill('[data-testid="search-input"]', '러닝화');
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Check results
    const products = await page.$$('[data-testid="product-card"]');
    expect(products.length).toBeGreaterThan(0);
    
    // Click first product
    await products[0].click();
    
    // Check product details
    await expect(page).toHaveURL(/\/products\/.+/);
    await expect(page.locator('h1')).toContainText('러닝화');
  });

  test('user can compare prices', async ({ page }) => {
    await page.goto('/products/test-product-id');
    
    // Wait for price comparison table
    await page.waitForSelector('[data-testid="price-comparison"]');
    
    // Check platforms
    await expect(page.locator('text=쿠팡')).toBeVisible();
    await expect(page.locator('text=네이버')).toBeVisible();
    
    // Check lowest price badge
    await expect(page.locator('text=최저가')).toBeVisible();
  });
});
```

---

## 3. AI Quality Tests

### 3.1 Prompt Tests

```typescript
// tests/ai/prompts.test.ts
import { generateResponse } from '@/lib/ai/chat';

describe('AI Prompts', () => {
  it('responds in Korean 존댓말', async () => {
    const response = await generateResponse('신발 추천해줘');
    expect(response).toMatch(/드릴게요|드려요|해요/);
  });

  it('provides recommendations with reasons', async () => {
    const response = await generateResponse('편한 신발 찾아줘');
    expect(response).toContain('추천 이유');
    expect(response).toContain('특징');
  });

  it('cites prices with platforms', async () => {
    const response = await generateResponse('나이키 신발 가격');
    expect(response).toMatch(/쿠팡|네이버|11번가/);
    expect(response).toMatch(/₩[\d,]+/);
  });

  it('handles clarification questions', async () => {
    const response = await generateResponse('더 싼 거 없어?');
    expect(response).toContain('가격');
    expect(response).toMatch(/저렴한|싼|할인/);
  });
});
```

### 3.2 Hallucination Detection

```typescript
// tests/ai/validation.test.ts
import { validateResponse } from '@/lib/ai/validation';

describe('Response Validation', () => {
  it('detects unverified claims', () => {
    const response = '이 제품은 확인되지 않았지만 좋습니다.';
    const result = validateResponse(response);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Response contains unverified claims');
  });

  it('requires platform sources for prices', () => {
    const response = '가격은 ₩100,000입니다.';
    const result = validateResponse(response);
    expect(result.warnings).toContain('Prices mentioned without platform source');
  });

  it('checks for 존댓말', () => {
    const response = '이거 사';  // 반말
    const result = validateResponse(response);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Response not in 존댓말');
  });
});
```

---

## 4. Performance Tests

### 4.1 Load Testing (k6)

```javascript
// tests/load/api-load.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of requests < 3s
    http_req_failed: ['rate<0.01'],      // < 1% errors
  },
};

export default function () {
  const res = http.get('https://igosa.kr/api/products/search?query=신발');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });
}
```

### 4.2 Lighthouse CI

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/products'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 5. Manual QA Checklist

### 5.1 Functional Testing

**Chat Interface**
- [ ] 메시지 전송 작동
- [ ] Streaming response 표시
- [ ] 대화 히스토리 저장
- [ ] 존댓말 사용
- [ ] 에러 메시지 적절

**Product Search**
- [ ] 검색 결과 정확
- [ ] 이미지 로딩
- [ ] 가격 비교 표시
- [ ] 최저가 강조
- [ ] 제휴 링크 작동

**AI 네고딜**
- [ ] 참여 버튼 작동
- [ ] 인원 카운트 업데이트
- [ ] 마감 시간 표시
- [ ] 알림 전송

### 5.2 Cross-Browser Testing

- [ ] Chrome (Desktop)
- [ ] Safari (Desktop)
- [ ] Firefox (Desktop)
- [ ] Chrome (Android)
- [ ] Safari (iOS)

### 5.3 Accessibility

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators
- [ ] Alt text for images

---

## 6. Test Coverage

### 6.1 목표

```
Overall: > 80%
Critical paths: > 95%
- Authentication
- Product search
- Price comparison
- Payment flow
```

### 6.2 Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# View report
open coverage/lcov-report/index.html
```

---

## 7. Bug Tracking

### 7.1 Severity Levels

**P0 (Critical)** - 서비스 중단
- 예: API 완전 장애, 결제 불가

**P1 (High)** - 핵심 기능 장애
- 예: 검색 불가, 로그인 불가

**P2 (Medium)** - 부분적 기능 장애
- 예: 이미지 안 보임, 느린 로딩

**P3 (Low)** - UI 버그
- 예: 텍스트 오타, 스타일 이슈

### 7.2 Bug Report Template

```markdown
## Bug Description
[간단한 설명]

## Steps to Reproduce
1. 첫 번째 단계
2. 두 번째 단계
3. ...

## Expected Behavior
[예상 동작]

## Actual Behavior
[실제 동작]

## Screenshots
[스크린샷]

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Device: Desktop

## Severity
P1 (High)
```

---

**문서 끝**

다음: [Legal & Compliance](./09_Legal_Compliance.md)
