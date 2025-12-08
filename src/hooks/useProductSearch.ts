import { useState, useCallback, useEffect } from 'react';
import { unifiedSearchService } from '@/services/unified-search';
import { SearchOptions, ProductSearchResult, SearchFilters, SortOption } from '@/types/search';
import { useDebounce } from '@/hooks/useUtils';

interface UseProductSearchProps {
    initialQuery?: string;
    initialFilters?: Partial<SearchFilters>;
}

export function useProductSearch({ initialQuery = '', initialFilters = {} }: UseProductSearchProps = {}) {
    const [query, setQuery] = useState(initialQuery);
    const [filters, setFilters] = useState<SearchFilters>({
        query: initialQuery,
        categories: ['all'],
        ...initialFilters
    });
    const [sort, setSort] = useState<SortOption>('relevance');
    const [results, setResults] = useState<ProductSearchResult[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const debouncedQuery = useDebounce(query, 500);

    const search = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore) {
            setLoading(true);
            setPage(1);
            setResults([]);
        }

        try {
            const searchOptions: SearchOptions = {
                filters: { ...filters, query: debouncedQuery },
                sort,
                page: isLoadMore ? page + 1 : 1,
                limit: 20
            };

            const result = await unifiedSearchService.searchProducts(searchOptions);

            setResults(prev => isLoadMore ? [...prev, ...result.items] : result.items);
            setTotal(result.total);
            setHasMore(result.hasMore);
            if (isLoadMore) setPage(prev => prev + 1);

        } catch (err) {
            setError(err instanceof Error ? err : new Error('Search failed'));
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, filters, sort, page]);

    // Initial search and query changes
    useEffect(() => {
        search();
    }, [debouncedQuery, sort, JSON.stringify(filters)]);

    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore) {
            search(true);
        }
    }, [loading, hasMore, search]);

    const updateFilters = (newFilters: Partial<SearchFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return {
        query,
        setQuery,
        filters,
        setFilters: updateFilters,
        sort,
        setSort,
        results,
        total,
        loading,
        error,
        hasMore,
        loadMore: handleLoadMore
    };
}
