/**
 * Price Tracking API Integration Tests
 * 
 * 시니어 개발자 관점: 실제 DB 연동 테스트 (Supabase)
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// 테스트 환경 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

describe('Price Tracking API Integration', () => {
    let testUserId: string;
    let testTrackingId: string;
    let authToken: string;

    beforeAll(async () => {
        // 테스트 사용자 생성
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: `test-${Date.now()}@example.com`,
            password: 'TestPassword123!',
        });

        if (authError) throw authError;
        testUserId = authData.user!.id;
        authToken = authData.session!.access_token;
    });

    afterAll(async () => {
        // 테스트 데이터 정리
        if (testTrackingId) {
            await supabase.from('price_tracking').delete().eq('id', testTrackingId);
        }
        if (testUserId) {
            await supabase.auth.admin.deleteUser(testUserId);
        }
    });

    describe('POST /api/price-tracking', () => {
        it('가격 알림을 생성할 수 있다', async () => {
            const response = await fetch(`${API_BASE}/api/price-tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    productId: 'TEST_PRODUCT_001',
                    targetPrice: 240000,
                    notificationChannels: ['push'],
                }),
            });

            expect(response.status).toBe(201);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('id');
            expect(data.data.target_price).toBe(240000);
            expect(data.data.status).toBe('active');

            testTrackingId = data.data.id;
        });

        it('중복 가격 알림 생성 시 에러 반환', async () => {
            const response = await fetch(`${API_BASE}/api/price-tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    productId: 'TEST_PRODUCT_001',
                    targetPrice: 240000,
                    notificationChannels: ['push'],
                }),
            });

            expect(response.status).toBe(409); // Conflict
            const data = await response.json();
            expect(data.error.code).toBe('CONFLICT');
        });

        it('인증 없이 요청 시 401 에러', async () => {
            const response = await fetch(`${API_BASE}/api/price-tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: 'TEST_PRODUCT_001',
                    targetPrice: 240000,
                }),
            });

            expect(response.status).toBe(401);
        });

        it('잘못된 입력값 검증', async () => {
            const response = await fetch(`${API_BASE}/api/price-tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    productId: '', // 빈 문자열
                    targetPrice: -1000, // 음수
                }),
            });

            expect(response.status).toBe(422); // Validation Error
            const data = await response.json();
            expect(data.error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('GET /api/price-tracking', () => {
        it('내 가격 알림 목록을 조회할 수 있다', async () => {
            const response = await fetch(`${API_BASE}/api/price-tracking`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
            expect(data.data.length).toBeGreaterThan(0);
            expect(data.data[0]).toHaveProperty('id');
            expect(data.data[0]).toHaveProperty('product_id');
            expect(data.data[0]).toHaveProperty('target_price');
        });

        it('페이지네이션 동작 확인', async () => {
            const response = await fetch(`${API_BASE}/api/price-tracking?page=1&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.pagination).toBeDefined();
            expect(data.pagination.page).toBe(1);
            expect(data.pagination.limit).toBe(10);
        });
    });

    describe('DELETE /api/price-tracking/:id', () => {
        it('가격 알림을 삭제할 수 있다', async () => {
            const response = await fetch(`${API_BASE}/api/price-tracking/${testTrackingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            expect(response.status).toBe(204);

            // DB에서 실제로 삭제되었는지 확인
            const { data } = await supabase
                .from('price_tracking')
                .select('*')
                .eq('id', testTrackingId)
                .single();

            expect(data).toBeNull();
        });

        it('다른 사용자의 알림 삭제 시도 시 403 에러', async () => {
            // 다른 사용자 생성
            const { data: otherUser } = await supabase.auth.signUp({
                email: `other-${Date.now()}@example.com`,
                password: 'TestPassword123!',
            });

            const response = await fetch(`${API_BASE}/api/price-tracking/${testTrackingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${otherUser!.session!.access_token}`,
                },
            });

            expect(response.status).toBe(403); // Forbidden

            // 정리
            await supabase.auth.admin.deleteUser(otherUser!.user!.id);
        });
    });

    describe('Demand Aggregation Integration', () => {
        it('가격 알림 생성 시 Redis에 수요 데이터 추가', async () => {
            const response = await fetch(`${API_BASE}/api/price-tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    productId: 'TEST_PRODUCT_002',
                    targetPrice: 250000,
                    notificationChannels: ['push'],
                }),
            });

            expect(response.status).toBe(201);
            const data = await response.json();

            // Demand API로 확인
            const demandResponse = await fetch(`${API_BASE}/api/demand/TEST_PRODUCT_002`);
            const demandData = await demandResponse.json();

            expect(demandData.success).toBe(true);
            expect(demandData.data.totalUsers).toBeGreaterThan(0);
            expect(demandData.data.priceDistribution).toBeDefined();

            // 정리
            await supabase.from('price_tracking').delete().eq('id', data.data.id);
        });
    });

    describe('Performance Tests', () => {
        it('가격 알림 조회 응답 시간 < 200ms', async () => {
            const startTime = Date.now();

            await fetch(`${API_BASE}/api/price-tracking`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(200);
        });

        it('동시 요청 처리 (10개)', async () => {
            const requests = Array.from({ length: 10 }, (_, i) =>
                fetch(`${API_BASE}/api/price-tracking`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        productId: `TEST_PRODUCT_${i}`,
                        targetPrice: 200000 + i * 10000,
                        notificationChannels: ['push'],
                    }),
                })
            );

            const responses = await Promise.all(requests);
            const successCount = responses.filter(r => r.status === 201).length;

            expect(successCount).toBe(10);

            // 정리
            const ids = await Promise.all(
                responses.map(async r => {
                    const data = await r.json();
                    return data.data.id;
                })
            );
            await supabase.from('price_tracking').delete().in('id', ids);
        });
    });
});
