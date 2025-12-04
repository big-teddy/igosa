/**
 * Critical User Flows - E2E Tests
 * 
 * 시니어 개발자 관점: 비즈니스 크리티컬한 3가지 플로우만 테스트
 * 1. 가격 알림 설정 → 알림 수신
 * 2. 제품 검색 → 상세 보기
 * 3. 네고딜 참여 → 진행 상황 확인
 */

import { test, expect } from '@playwright/test';

// 테스트 환경 설정
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

test.describe('Critical User Flow 1: Price Tracking', () => {
  test('사용자가 가격 알림을 설정하고 확인할 수 있다', async ({ page }) => {
    // 1. 홈페이지 접속
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/이거사|Igosa/);

    // 2. 로그인 (Supabase Auth)
    await page.click('text=로그인');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button:has-text("로그인")');

    // 로그인 성공 확인
    await expect(page.locator('text=마이페이지')).toBeVisible({ timeout: 10000 });

    // 3. 제품 검색
    await page.fill('input[placeholder*="검색"]', '갤럭시 버즈');
    await page.press('input[placeholder*="검색"]', 'Enter');

    // 검색 결과 확인
    await expect(page.locator('text=갤럭시')).toBeVisible({ timeout: 5000 });

    // 4. 제품 상세 페이지 진입
    await page.click('text=갤럭시 버즈3 Pro');
    await expect(page).toHaveURL(/\/products\//);

    // 5. 가격 알림 설정
    const targetPrice = '240000';
    await page.fill('input[type="range"]', targetPrice);
    await page.click('button:has-text("네고딜 참여")');

    // 6. 성공 메시지 확인
    await expect(page.locator('text=참여 완료')).toBeVisible({ timeout: 5000 });

    // 7. 마이페이지에서 확인
    await page.click('text=마이페이지');
    await page.click('text=내 네고딜');

    // 생성한 알림이 목록에 있는지 확인
    await expect(page.locator(`text=갤럭시 버즈3 Pro`)).toBeVisible();
    await expect(page.locator(`text=${targetPrice}`)).toBeVisible();
  });

  test('가격 알림을 삭제할 수 있다', async ({ page }) => {
    await page.goto(`${BASE_URL}/my`);

    // 로그인 상태 확인
    await expect(page.locator('text=내 네고딜')).toBeVisible();

    // 알림 삭제
    await page.locator('button[aria-label="삭제"]').first().click();
    await page.click('button:has-text("확인")'); // 확인 모달

    // 삭제 성공 메시지
    await expect(page.locator('text=삭제되었습니다')).toBeVisible();
  });
});

test.describe('Critical User Flow 2: Product Discovery', () => {
  test('사용자가 제품을 검색하고 가격 비교를 볼 수 있다', async ({ page }) => {
    await page.goto(BASE_URL);

    // 1. AI 채팅으로 제품 검색
    await page.click('text=AI 검색');
    await page.fill('textarea[placeholder*="찾고"]', '편한 러닝화 추천해줘');
    await page.click('button[type="submit"]');

    // 2. AI 응답 확인
    await expect(page.locator('text=추천')).toBeVisible({ timeout: 10000 });

    // 3. 추천 제품 클릭
    await page.locator('.product-card').first().click();

    // 4. 가격 비교 정보 확인
    await expect(page.locator('text=쿠팡')).toBeVisible();
    await expect(page.locator('text=네이버')).toBeVisible();
    await expect(page.locator('text=최저가')).toBeVisible();

    // 5. 가격 차트 확인
    await expect(page.locator('canvas')).toBeVisible(); // Recharts canvas
  });
});

test.describe('Critical User Flow 3: NegoDeal Participation', () => {
  test('사용자가 네고딜에 참여하고 진행 상황을 확인할 수 있다', async ({ page }) => {
    await page.goto(`${BASE_URL}/products/test-product-1`);

    // 1. 네고딜 위젯 확인
    await expect(page.locator('text=AI 네고딜')).toBeVisible();
    await expect(page.locator('text=명이 함께 협상 중')).toBeVisible();

    // 2. 진행률 확인
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();

    // 3. AI 추천 가격 확인
    await expect(page.locator('text=AI 추천 가격')).toBeVisible();

    // 4. 참여하기 클릭
    await page.click('button:has-text("네고딜 참여")');

    // 5. 참여 완료 확인
    await expect(page.locator('text=참여 완료')).toBeVisible({ timeout: 5000 });

    // 6. 실시간 참여자 수 증가 확인
    const participantCount = await page.locator('text=/\\d+명이 함께/').textContent();
    expect(participantCount).toMatch(/\d+명/);
  });
});

test.describe('Performance & Error Handling', () => {
  test('페이지 로딩 성능 확인', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    const loadTime = Date.now() - startTime;

    // 3초 이내 로딩
    expect(loadTime).toBeLessThan(3000);

    // Core Web Vitals 확인
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        fcp: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        lcp: navigation.loadEventEnd - navigation.fetchStart,
      };
    });

    expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
  });

  test('API 에러 처리 확인', async ({ page }) => {
    // 네트워크 오프라인 시뮬레이션
    await page.route('**/api/**', route => route.abort());

    await page.goto(BASE_URL);
    await page.click('text=제품 둘러보기');

    // 에러 메시지 표시 확인
    await expect(page.locator('text=오류가 발생했습니다')).toBeVisible({ timeout: 5000 });
  });

  test('인증 없이 보호된 페이지 접근 시 리다이렉트', async ({ page }) => {
    await page.goto(`${BASE_URL}/my`);

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/login/);
  });
});
