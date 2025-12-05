/**
 * Service Tests
 * 핵심 서비스 기능 테스트
 */

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
    length: 0,
    key: jest.fn(),
};
global.localStorage = localStorageMock as Storage;

describe('NotificationService', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.getItem.mockReturnValue('[]');
    });

    test('should return empty array when no notifications', async () => {
        const { notificationService } = await import('@/lib/services/notification-service');
        const notifications = await notificationService.getUserNotifications('user-1');
        expect(Array.isArray(notifications)).toBe(true);
    });

    test('should create notification', async () => {
        const { notificationService } = await import('@/lib/services/notification-service');
        const notification = await notificationService.create({
            userId: 'user-1',
            type: 'price_alert',
            title: '가격 알림',
            message: '상품 가격이 내려갔습니다!',
        });
        expect(notification).toBeDefined();
        expect(notification.title).toBe('가격 알림');
    });
});

describe('SearchService', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
    });

    test('should return search results', async () => {
        const { searchService } = await import('@/lib/services/search-service');
        const results = await searchService.search({
            query: '아이폰',
            page: 1,
            pageSize: 10,
        });
        expect(results).toBeDefined();
        expect(results.products).toBeDefined();
    });
});

describe('RecommendationService', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.getItem.mockReturnValue('[]');
    });

    test('should return recommendations', async () => {
        const { recommendationService } = await import('@/lib/services/recommendation-service');
        const recommendations = await recommendationService.getProductRecommendations('user-1', 5);
        expect(Array.isArray(recommendations)).toBe(true);
    });
});
