import { adapterRegistry } from '@/adapters/registry';
import { ProductSearchResult, SearchOptions, SearchResult } from '@/types/search';
import { ShoppingPlatformAdapter } from '@/adapters/types';

class UnifiedSearchService {
    private static instance: UnifiedSearchService;

    private constructor() { }

    static getInstance(): UnifiedSearchService {
        if (!UnifiedSearchService.instance) {
            UnifiedSearchService.instance = new UnifiedSearchService();
        }
        return UnifiedSearchService.instance;
    }

    /**
     * Search products across all registered adapters
     */
    async searchProducts(options: SearchOptions): Promise<SearchResult<ProductSearchResult>> {
        const query = options.filters.query || '';
        if (!query) {
            return {
                items: [],
                total: 0,
                page: options.page || 1,
                limit: options.limit || 20,
                hasMore: false,
            };
        }

        try {
            // Get all adapters or filter by specific country/platform
            const adapters = adapterRegistry.getAllAdapters();

            // Execute search in parallel
            const searchPromises = adapters.map(async (adapter) => {
                try {
                    const results = await adapter.search(query);
                    // Transform adapter results to ProductSearchResult
                    return results.map(item => this.mapToProductSearchResult(item, adapter));
                } catch (error) {
                    console.error(`Search failed for adapter ${adapter.name}:`, error);
                    return [];
                }
            });

            const adapterResults = await Promise.all(searchPromises);
            let allProducts = adapterResults.flat();

            // Apply local filters (since APIs might not support all filters)
            allProducts = this.applyLocalFilters(allProducts, options);

            // Apply sorting
            allProducts = this.applySorting(allProducts, options);

            // Pagination
            const page = options.page || 1;
            const limit = options.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedProducts = allProducts.slice(startIndex, endIndex);

            return {
                items: paginatedProducts,
                total: allProducts.length,
                page,
                limit,
                hasMore: endIndex < allProducts.length,
            };
        } catch (error) {
            console.error('Unified search failed:', error);
            throw error;
        }
    }

    private mapToProductSearchResult(item: any, adapter: ShoppingPlatformAdapter): ProductSearchResult {
        return {
            id: item.id,
            name: item.name,
            description: item.name, // Fallback
            price: item.price,
            originalPrice: item.price * 1.2, // Mock original price
            discountRate: 20, // Mock discount
            image: item.imageUrl,
            category: 'electronics', // Mock category
            brand: item.platform,
            inStock: true,
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            popularity: item.reviewCount || 0,
            hasNegoDeal: false,
            createdAt: new Date().toISOString(),
            platform: adapter.name,
            country: adapter.country,
            currency: item.currency,
            link: item.url
        };
    }

    private applyLocalFilters(products: ProductSearchResult[], options: SearchOptions): ProductSearchResult[] {
        let filtered = [...products];
        const { filters } = options;

        // Price range
        if (filters.priceRange) {
            filtered = filtered.filter(
                (p) =>
                    p.price >= filters.priceRange!.min &&
                    (filters.priceRange!.max === Infinity || p.price <= filters.priceRange!.max)
            );
        }

        // Min discount
        if (filters.minDiscount) {
            filtered = filtered.filter((p) => (p.discountRate || 0) >= filters.minDiscount!);
        }

        // Platform (Mall)
        if (filters.platforms && filters.platforms.length > 0) {
            filtered = filtered.filter((p) =>
                filters.platforms!.some(platform =>
                    p.platform.toLowerCase() === platform.toLowerCase()
                )
            );
        }

        // Min Rating
        if (filters.minRating) {
            filtered = filtered.filter((p) => (p.rating || 0) >= filters.minRating!);
        }

        return filtered;
    }

    private applySorting(products: ProductSearchResult[], options: SearchOptions): ProductSearchResult[] {
        const sorted = [...products];
        const { sort } = options;

        switch (sort) {
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'discount':
                return sorted.sort((a, b) => (b.discountRate || 0) - (a.discountRate || 0));
            case 'newest':
                return sorted.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            case 'popularity':
                return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            default:
                return sorted;
        }
    }
}

export const unifiedSearchService = UnifiedSearchService.getInstance();
