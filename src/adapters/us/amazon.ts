import { Product, PriceHistory, ShoppingPlatformAdapter } from '../types';

export class AmazonUSAdapter implements ShoppingPlatformAdapter {
    name = 'Amazon US';
    country = 'US' as const;

    async search(query: string): Promise<Product[]> {
        // Mock implementation
        return [
            {
                id: 'amzn-1',
                name: `[Amazon] ${query} Item X`,
                price: 25.99,
                currency: 'USD',
                url: 'https://amazon.com',
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
                platform: 'Amazon',
                rating: 4.3,
                reviewCount: 1540,
            },
            {
                id: 'amzn-2',
                name: `[Amazon] ${query} Item Y`,
                price: 49.99,
                currency: 'USD',
                url: 'https://amazon.com',
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
                platform: 'Amazon',
                rating: 4.7,
                reviewCount: 320,
            },
        ];
    }

    async getProductDetail(productId: string): Promise<Product | null> {
        return {
            id: productId,
            name: '[Amazon] Product Detail',
            price: 25.99,
            currency: 'USD',
            url: 'https://amazon.com',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
            platform: 'Amazon',
            rating: 4.3,
            reviewCount: 1540,
        };
    }

    async getPriceHistory(productId: string): Promise<PriceHistory[]> {
        return [
            { date: '2023-11-01', price: 29.99 },
            { date: '2023-11-15', price: 27.99 },
            { date: '2023-12-01', price: 25.99 },
        ];
    }
}
