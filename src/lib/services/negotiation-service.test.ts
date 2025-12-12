// Mock dependencies BEFORE imports
jest.mock('@/lib/redis/client', () => ({
    getRedisClient: jest.fn(),
    REDIS_KEYS: {
        PRODUCT_DEMAND: (id: string) => `demand:${id}`,
        PRICE_DISTRIBUTION: (id: string) => `dist:${id}`,
        DEMAND_STATS: (id: string) => `stats:${id}`,
    },
    REDIS_TTL: {},
}));

jest.mock('./demand-aggregation-service', () => ({
    getDemandAggregation: jest.fn(),
}));

jest.mock('@/lib/supabase/server');

import { NegotiationService } from './negotiation-service';
import { getDemandAggregation } from './demand-aggregation-service';
import { createClient } from '@/lib/supabase/server';

// Mock types
const mockGetDemandAggregation = getDemandAggregation as jest.Mock;
const mockCreateClient = createClient as jest.Mock;

describe('NegotiationService', () => {
    let mockSupabase: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock Supabase client
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
        };
        mockCreateClient.mockResolvedValue(mockSupabase);
    });

    describe('canTriggerNegotiation', () => {
        it('should return true when all thresholds are met', async () => {
            mockGetDemandAggregation.mockResolvedValue({
                totalUsers: 60, // > 50
                priceTiers: [
                    { price: 10000, userCount: 20, percentage: 33 }, // Concentration > 30%
                    { price: 9000, userCount: 40, percentage: 67 },
                ],
                peakDemandPrice: 9000,
                avgTargetPrice: 9500,
            });

            const result = await NegotiationService.canTriggerNegotiation('prod-1');

            expect(result.canTrigger).toBe(true);
            expect(result.metrics.participants).toBe(60);
        });

        it('should return false when participants is too low', async () => {
            mockGetDemandAggregation.mockResolvedValue({
                totalUsers: 10, // < 50
                priceTiers: [],
                peakDemandPrice: 10000,
                avgTargetPrice: 10000,
            });

            const result = await NegotiationService.canTriggerNegotiation('prod-1');

            expect(result.canTrigger).toBe(false);
            expect(result.reason).toContain('참여자 수 부족');
        });

        it('should return false when demand is too dispersed', async () => {
            mockGetDemandAggregation.mockResolvedValue({
                totalUsers: 100,
                priceTiers: [
                    { price: 10000, userCount: 10, percentage: 10 },
                    { price: 10000, userCount: 10, percentage: 10 }, // Max concentration 10% < 30%
                ],
                peakDemandPrice: 10000,
                avgTargetPrice: 10000,
            });

            const result = await NegotiationService.canTriggerNegotiation('prod-1');

            expect(result.canTrigger).toBe(false);
            expect(result.reason).toContain('수요 분산됨');
        });
    });

    describe('createNegotiation', () => {
        it('should create negotiation correctly', async () => {
            const mockDemandData = {
                totalUsers: 100,
                peakDemandPrice: 9000,
                avgTargetPrice: 9500,
            };

            const mockDbResponse = {
                id: 'nego-123',
                product_id: 'prod-1',
                status: 'triggered',
                total_participants: 100,
                target_price: 9000,
                avg_target_price: 9500,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            mockSupabase.single.mockResolvedValue({ data: mockDbResponse, error: null });

            const result = await NegotiationService.createNegotiation('prod-1', mockDemandData);

            expect(mockSupabase.from).toHaveBeenCalledWith('negotiations');
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                product_id: 'prod-1',
                total_participants: 100,
                target_price: 9000,
            }));
            expect(result.id).toBe('nego-123');
        });

        it('should throw error if db insert fails', async () => {
            mockSupabase.single.mockResolvedValue({ data: null, error: new Error('DB Error') });

            await expect(NegotiationService.createNegotiation('prod-1', {})).rejects.toThrow('DB Error');
        });
    });

    describe('completeNegotiation', () => {
        it('should update status to completed and log event', async () => {
            // Mock logEvent indirectly by mocking update and ignoring the separate logEvent internal call logic 
            // (Integration test would check side effects, here unit test focuses on update call)

            // We can also mock the logEvent method if we want to isolate it, 
            // but since it's a static method on the SAME class, it's harder to Jest spyOn it while testing the class itself 
            // without some tricks. For simplicity, we assume logEvent works or test it separately. 
            // However, logEvent calls supabase insert. We essentially verify supabase calls.

            await NegotiationService.completeNegotiation('nego-123', 8000, 50);

            expect(mockSupabase.from).toHaveBeenCalledWith('negotiations');
            expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
                status: 'completed',
                final_price: 8000,
                final_volume: 50,
            }));
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'nego-123');

            // Verify log event insertion
            expect(mockSupabase.from).toHaveBeenCalledWith('negotiation_events');
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                negotiation_id: 'nego-123',
                event_type: 'deal_closed',
                impact: 'positive',
            }));
        });
    });
});
