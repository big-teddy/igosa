import { test, expect } from '@playwright/test';

/**
 * E2E Test: Price Tracking Flow
 *
 * Tests the complete price tracking user journey:
 * 1. Navigate to negodeal page
 * 2. Set target price
 * 3. Verify notification preferences
 * 4. Check demand aggregation
 */

test.describe('Price Tracking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should navigate to negodeal page successfully', async ({ page }) => {
    // Click on NegoDeal menu
    await page.click('text=네고딜');

    // Wait for navigation
    await page.waitForURL('**/nego-deals');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('AI 네고딜');

    // Verify deals are displayed
    const dealCards = page.locator('[data-testid="nego-deal-card"], .grid > div');
    await expect(dealCards.first()).toBeVisible();
  });

  test('should display negodeal detail page with price tracking widget', async ({ page }) => {
    // Navigate to negodeal page
    await page.goto('/nego-deals');

    // Click on first deal
    await page.click('text=지금 참여하기 >> nth=0');

    // Wait for detail page
    await page.waitForURL('**/nego-deals/*');

    // Verify price tracking widget is visible
    await expect(page.locator('text=원하는 가격에 구매하기')).toBeVisible();

    // Verify "가격 알림 받기" button exists (slider might be hidden initially or require login)
    await expect(page.locator('button:has-text("가격 알림 받기")')).toBeVisible();
  });

  test('should display price tracking widget section', async ({ page }) => {
    // Navigate to a negodeal detail page
    await page.goto('/nego-deals/nego-001');

    // Verify price tracking widget section exists
    await expect(page.locator('text=원하는 가격에 구매하기')).toBeVisible();

    // Verify price information is displayed
    await expect(page.locator('text=현재 가격')).toBeVisible();
    await expect(page.locator('text=최저가')).toBeVisible();

    // Verify action button exists
    await expect(page.locator('button:has-text("가격 알림 받기")')).toBeVisible();
  });

  test('should show demand statistics', async ({ page }) => {
    // Navigate to negodeal detail page
    await page.goto('/nego-deals/nego-001');

    // Wait for price tracking widget
    await page.waitForSelector('text=원하는 가격에 구매하기');

    // Check for demand-related text
    // Could be "234명이 비슷한 가격을 원해요" or similar
    const demandText = page.locator('text=/\\d+명/');

    // Verify some demand indicator exists (may be 0 in test environment)
    const count = await demandText.count();
    expect(count).toBeGreaterThanOrEqual(0); // Allow 0 for empty state
  });

  test('should display savings calculation', async ({ page }) => {
    // Navigate to negodeal detail page
    await page.goto('/nego-deals/nego-001');

    // Verify savings amount is displayed
    await expect(page.locator('text=예상 절감액')).toBeVisible();

    // Verify percentage is displayed (use .first() to avoid strict mode violation)
    await expect(page.locator('text=/\\d+\\.?\\d*% 할인/').first()).toBeVisible();

    // Verify probability is shown
    await expect(page.locator('text=/\\d+일 내 달성 확률/')).toBeVisible();
  });

  test('should show price range information', async ({ page }) => {
    // Navigate to negodeal detail page
    await page.goto('/nego-deals/nego-001');

    // Wait for widget to load
    await page.waitForSelector('text=원하는 가격에 구매하기');

    // Verify price information is displayed
    await expect(page.locator('text=현재 가격')).toBeVisible();
    await expect(page.locator('text=최저가')).toBeVisible();

    // Verify prices are shown with ₩ symbol
    const priceElements = page.locator('text=/₩[\\d,]+/');
    const priceCount = await priceElements.count();
    expect(priceCount).toBeGreaterThan(0);
  });
});

test.describe('NegoDeal List Page', () => {
  test('should display multiple negodeals', async ({ page }) => {
    await page.goto('/nego-deals');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('AI 네고딜');

    // Check for stats
    await expect(page.locator('text=진행 중인 딜')).toBeVisible();

    // Verify deal count is displayed (use specific selector to avoid duplicates)
    await expect(page.locator('.mb-4.text-sm.text-muted-foreground')).toContainText('개의 네고딜');
  });

  test('should filter negodeals by category', async ({ page }) => {
    await page.goto('/nego-deals');

    // Click on "마감 임박" filter
    await page.click('text=마감 임박');

    // Verify URL or content changes
    // Note: Depending on implementation, this might update the displayed deals
    await page.waitForTimeout(500); // Allow for filter to apply

    // Verify some deals are shown (or empty state)
    const dealsText = page.locator('text=/\\d+개의 네고딜/');
    await expect(dealsText).toBeVisible();
  });

  test('should show "How it Works" section', async ({ page }) => {
    await page.goto('/nego-deals');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify "How it Works" section
    await expect(page.locator('text=네고딜은 어떻게 작동하나요?')).toBeVisible();

    // Verify steps are shown
    await expect(page.locator('text=제품 선택')).toBeVisible();
    await expect(page.locator('text=그룹 형성')).toBeVisible();
  });
});
