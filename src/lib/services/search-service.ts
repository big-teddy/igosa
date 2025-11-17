/**
 * Search Service
 * 상품 및 네고딜 검색, 필터링, 정렬 기능
 *
 * Features:
 * - 키워드 검색
 * - 카테고리 필터
 * - 가격 범위 필터
 * - 브랜드 필터
 * - 할인율 필터
 * - 다양한 정렬 옵션
 */

import {
  SearchFilters,
  SearchOptions,
  SearchResult,
  ProductSearchResult,
  NegoDealSearchResult,
  SortOption,
  ProductCategory,
} from '@/types/search';

class SearchService {
  private static instance: SearchService;

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // ==================== PRODUCT SEARCH ====================

  /**
   * Search products with filters and sorting
   */
  searchProducts(options: SearchOptions): SearchResult<ProductSearchResult> {
    try {
      // In a real app, this would call an API
      // For now, we'll use mock data
      let products = this.getMockProducts();

      // Apply filters
      products = this.applyProductFilters(products, options.filters);

      // Apply sorting
      products = this.sortProducts(products, options.sort);

      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      return {
        items: paginatedProducts,
        total: products.length,
        page,
        limit,
        hasMore: endIndex < products.length,
      };
    } catch (error) {
      console.error('Failed to search products:', error);
      return {
        items: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 20,
        hasMore: false,
      };
    }
  }

  /**
   * Apply filters to products
   */
  private applyProductFilters(
    products: ProductSearchResult[],
    filters: SearchFilters
  ): ProductSearchResult[] {
    let filtered = [...products];

    // Query filter (search in name and description)
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes('all')) {
        filtered = filtered.filter((p) => filters.categories!.includes(p.category));
      }
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        (p) =>
          p.price >= filters.priceRange!.min &&
          (filters.priceRange!.max === Infinity || p.price <= filters.priceRange!.max)
      );
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter((p) => p.brand && filters.brands!.includes(p.brand));
    }

    // Minimum discount filter
    if (filters.minDiscount !== undefined && filters.minDiscount > 0) {
      filtered = filtered.filter((p) => (p.discountRate || 0) >= filters.minDiscount!);
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.inStock);
    }

    // Has nego deal filter
    if (filters.hasNegoDeal) {
      filtered = filtered.filter((p) => p.hasNegoDeal);
    }

    return filtered;
  }

  /**
   * Sort products
   */
  private sortProducts(
    products: ProductSearchResult[],
    sort: SortOption
  ): ProductSearchResult[] {
    const sorted = [...products];

    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);

      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);

      case 'popularity':
        return sorted.sort((a, b) => b.popularity - a.popularity);

      case 'newest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case 'discount':
        return sorted.sort((a, b) => (b.discountRate || 0) - (a.discountRate || 0));

      case 'relevance':
      default:
        // Relevance sorting (can be improved with search scoring)
        return sorted;
    }
  }

  // ==================== NEGO DEAL SEARCH ====================

  /**
   * Search nego deals with filters and sorting
   */
  searchNegoDeals(options: SearchOptions): SearchResult<NegoDealSearchResult> {
    try {
      let deals = this.getMockNegoDeals();

      // Apply filters
      deals = this.applyNegoDealFilters(deals, options.filters);

      // Apply sorting
      deals = this.sortNegoDeals(deals, options.sort);

      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedDeals = deals.slice(startIndex, endIndex);

      return {
        items: paginatedDeals,
        total: deals.length,
        page,
        limit,
        hasMore: endIndex < deals.length,
      };
    } catch (error) {
      console.error('Failed to search nego deals:', error);
      return {
        items: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 20,
        hasMore: false,
      };
    }
  }

  /**
   * Apply filters to nego deals
   */
  private applyNegoDealFilters(
    deals: NegoDealSearchResult[],
    filters: SearchFilters
  ): NegoDealSearchResult[] {
    let filtered = [...deals];

    // Query filter
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter((d) => d.productName.toLowerCase().includes(query));
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes('all')) {
        filtered = filtered.filter((d) => filters.categories!.includes(d.category));
      }
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        (d) =>
          d.targetPrice >= filters.priceRange!.min &&
          (filters.priceRange!.max === Infinity || d.targetPrice <= filters.priceRange!.max)
      );
    }

    // Minimum discount filter
    if (filters.minDiscount !== undefined && filters.minDiscount > 0) {
      filtered = filtered.filter((d) => d.discountRate >= filters.minDiscount!);
    }

    return filtered;
  }

  /**
   * Sort nego deals
   */
  private sortNegoDeals(
    deals: NegoDealSearchResult[],
    sort: SortOption
  ): NegoDealSearchResult[] {
    const sorted = [...deals];

    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.targetPrice - b.targetPrice);

      case 'price-desc':
        return sorted.sort((a, b) => b.targetPrice - a.targetPrice);

      case 'popularity':
        return sorted.sort((a, b) => b.currentParticipants - a.currentParticipants);

      case 'newest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case 'discount':
        return sorted.sort((a, b) => b.discountRate - a.discountRate);

      case 'deadline':
        return sorted.sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        );

      case 'relevance':
      default:
        // Sort by progress (closer to goal = more relevant)
        return sorted.sort((a, b) => b.progress - a.progress);
    }
  }

  // ==================== MOCK DATA ====================

  /**
   * Get mock products (in real app, this would fetch from API)
   */
  private getMockProducts(): ProductSearchResult[] {
    return [
      {
        id: 'prod-1',
        name: '삼성 갤럭시 버즈2 프로',
        description: '프리미엄 노이즈캔슬링 무선 이어폰',
        price: 189000,
        originalPrice: 259000,
        discountRate: 27,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        category: 'electronics',
        brand: '삼성',
        inStock: true,
        rating: 4.5,
        reviewCount: 1234,
        popularity: 95,
        hasNegoDeal: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'prod-2',
        name: '애플 에어팟 프로 2세대',
        description: '적응형 투명 모드와 개인 맞춤형 공간 음향',
        price: 359000,
        originalPrice: 359000,
        discountRate: 0,
        image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
        category: 'electronics',
        brand: '애플',
        inStock: true,
        rating: 4.8,
        reviewCount: 2345,
        popularity: 98,
        hasNegoDeal: false,
        createdAt: '2024-01-20T10:00:00Z',
      },
      {
        id: 'prod-3',
        name: '나이키 에어맥스 97',
        description: '클래식 러닝화',
        price: 159000,
        originalPrice: 219000,
        discountRate: 27,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        category: 'fashion',
        brand: '나이키',
        inStock: true,
        rating: 4.6,
        reviewCount: 567,
        popularity: 87,
        hasNegoDeal: true,
        createdAt: '2024-01-18T10:00:00Z',
      },
      {
        id: 'prod-4',
        name: '다이슨 V15 디텍트 무선청소기',
        description: '강력한 흡입력과 레이저 먼지 감지',
        price: 890000,
        originalPrice: 1190000,
        discountRate: 25,
        image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
        category: 'home',
        brand: '다이슨',
        inStock: true,
        rating: 4.7,
        reviewCount: 890,
        popularity: 92,
        hasNegoDeal: false,
        createdAt: '2024-01-10T10:00:00Z',
      },
    ];
  }

  /**
   * Get mock nego deals (in real app, this would fetch from API)
   */
  private getMockNegoDeals(): NegoDealSearchResult[] {
    return [
      {
        id: 'deal-1',
        productId: 'prod-1',
        productName: '삼성 갤럭시 버즈2 프로',
        productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        currentPrice: 189000,
        targetPrice: 149000,
        originalPrice: 259000,
        discountRate: 42,
        currentParticipants: 87,
        targetParticipants: 100,
        progress: 87,
        deadline: '2024-12-31T23:59:59Z',
        category: 'electronics',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'deal-2',
        productId: 'prod-3',
        productName: '나이키 에어맥스 97',
        productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        currentPrice: 159000,
        targetPrice: 129000,
        originalPrice: 219000,
        discountRate: 41,
        currentParticipants: 45,
        targetParticipants: 50,
        progress: 90,
        deadline: '2024-12-25T23:59:59Z',
        category: 'fashion',
        isActive: true,
        createdAt: '2024-01-18T10:00:00Z',
      },
    ];
  }

  /**
   * Get unique brands from products
   */
  getAvailableBrands(): string[] {
    const products = this.getMockProducts();
    const brands = new Set(products.map((p) => p.brand).filter((b): b is string => !!b));
    return Array.from(brands).sort();
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();
