import { test, expect } from '@playwright/test';

/**
 * E2E Test: Demand Aggregation API
 *
 * Tests the demand aggregation REST API:
 * 1. GET /api/demand/:productId
 * 2. Verify data structure
 * 3. Verify statistics accuracy
 */

test.describe('Demand Aggregation API', () => {
  const TEST_PRODUCT_ID = 'test-product-001';

  test('should return demand data for a product', async ({ request }) => {
    const response = await request.get(`/api/demand/${TEST_PRODUCT_ID}`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');

    // Verify data fields
    expect(data.data).toHaveProperty('productId');
    expect(data.data).toHaveProperty('totalUsers');
    expect(data.data).toHaveProperty('avgTargetPrice');
    expect(data.data).toHaveProperty('medianTargetPrice');
    expect(data.data).toHaveProperty('peakDemandPrice');
    expect(data.data).toHaveProperty('priceTiers');
    expect(data.data).toHaveProperty('priceRange');

    // Verify data types
    expect(typeof data.data.totalUsers).toBe('number');
    expect(typeof data.data.avgTargetPrice).toBe('number');
    expect(Array.isArray(data.data.priceTiers)).toBeTruthy();
  });

  test('should return valid statistics', async ({ request }) => {
    const response = await request.get(`/api/demand/${TEST_PRODUCT_ID}`);
    const data = await response.json();

    // Statistics should be >= 0
    expect(data.data.totalUsers).toBeGreaterThanOrEqual(0);
    expect(data.data.avgTargetPrice).toBeGreaterThanOrEqual(0);
    expect(data.data.medianTargetPrice).toBeGreaterThanOrEqual(0);

    // If there are users, avg and median should be > 0
    if (data.data.totalUsers > 0) {
      expect(data.data.avgTargetPrice).toBeGreaterThan(0);
      expect(data.data.medianTargetPrice).toBeGreaterThan(0);
    }

    // Price range should be valid
    if (data.data.priceRange.min > 0 && data.data.priceRange.max > 0) {
      expect(data.data.priceRange.max).toBeGreaterThanOrEqual(data.data.priceRange.min);
    }
  });

  test('should include metadata', async ({ request }) => {
    const response = await request.get(`/api/demand/${TEST_PRODUCT_ID}`);
    const data = await response.json();

    // Verify meta fields
    expect(data.meta).toHaveProperty('timestamp');
    expect(data.meta).toHaveProperty('productId');
    expect(data.meta.productId).toBe(TEST_PRODUCT_ID);

    // Timestamp should be a valid date
    const timestamp = new Date(data.meta.timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });

  test('should handle non-existent product gracefully', async ({ request }) => {
    const response = await request.get(`/api/demand/non-existent-product-999`);

    // Should still return 200 with empty data
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.data.totalUsers).toBe(0);
    expect(data.data.priceTiers).toEqual([]);
  });

  test('should return consistent data structure for empty products', async ({ request }) => {
    const response = await request.get(`/api/demand/empty-product-test`);
    const data = await response.json();

    // Even empty products should have all fields
    expect(data.data).toHaveProperty('productId');
    expect(data.data).toHaveProperty('totalUsers');
    expect(data.data).toHaveProperty('avgTargetPrice');
    expect(data.data).toHaveProperty('priceTiers');
    expect(data.data.priceTiers).toEqual([]);
    expect(data.data.totalUsers).toBe(0);
  });
});

test.describe('Demand Aggregation Performance', () => {
  test('should respond within acceptable time', async ({ request }) => {
    const startTime = Date.now();

    await request.get(`/api/demand/test-product-001`);

    const duration = Date.now() - startTime;

    // API should respond within 500ms (generous for E2E)
    expect(duration).toBeLessThan(500);
  });

  test('should handle multiple concurrent requests', async ({ request }) => {
    const productIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'];

    // Make concurrent requests
    const responses = await Promise.all(
      productIds.map(id => request.get(`/api/demand/${id}`))
    );

    // All should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });

    // All should return valid JSON
    const dataArray = await Promise.all(
      responses.map(r => r.json())
    );

    dataArray.forEach((data, index) => {
      expect(data.data.productId).toBe(productIds[index]);
    });
  });
});
