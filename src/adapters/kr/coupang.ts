import { Product, PriceHistory, ShoppingPlatformAdapter } from '../types';

export class CoupangAdapter implements ShoppingPlatformAdapter {
    name = 'Coupang';
    country = 'KR' as const;

    async search(query: string): Promise<Product[]> {
        // Mock implementation
        return [
            {
                id: 'cp-1',
                name: `[쿠팡] ${query} 상품 A`,
                price: 25000,
                currency: 'KRW',
                url: 'https://coupang.com',
                imageUrl: 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/product/image.jpg',
                platform: 'Coupang',
                rating: 4.5,
                reviewCount: 120,
            },
            {
                id: 'cp-2',
                name: `[쿠팡] ${query} 상품 B`,
                price: 32000,
                currency: 'KRW',
                url: 'https://coupang.com',
                imageUrl: 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/product/image2.jpg',
                platform: 'Coupang',
                rating: 4.8,
                reviewCount: 850,
            },
        ];
    }

    async getProductDetail(productId: string): Promise<Product | null> {
        return {
            id: productId,
            name: '[쿠팡] 상품 상세',
            price: 25000,
            currency: 'KRW',
            url: 'https://coupang.com',
            imageUrl: 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/product/image.jpg',
            platform: 'Coupang',
            rating: 4.5,
            reviewCount: 120,
        };
    }

    async getPriceHistory(productId: string): Promise<PriceHistory[]> {
        return [
            { date: '2023-11-01', price: 28000 },
            { date: '2023-11-15', price: 26000 },
            { date: '2023-12-01', price: 25000 },
        ];
    }
}
