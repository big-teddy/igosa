export interface Product {
    id: string;
    name: string;
    price: number;
    currency: string;
    url: string;
    imageUrl: string;
    platform: string;
    rating?: number;
    reviewCount?: number;
}

export interface PriceHistory {
    date: string;
    price: number;
}

export interface ShoppingPlatformAdapter {
    name: string;
    country: 'KR' | 'US' | 'JP';

    /**
     * 상품 검색
     */
    search(query: string): Promise<Product[]>;

    /**
     * 상품 상세 정보 조회
     */
    getProductDetail(productId: string): Promise<Product | null>;

    /**
     * 가격 변동 내역 조회
     */
    getPriceHistory(productId: string): Promise<PriceHistory[]>;
}
