import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
    fetchFn: (page: number) => Promise<T[]>;
    initialPage?: number;
    threshold?: number;
}

/**
 * 무한 스크롤 훅
 */
export function useInfiniteScroll<T>({
    fetchFn,
    initialPage = 1,
    threshold = 200,
}: UseInfiniteScrollOptions<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(initialPage);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        try {
            const newItems = await fetchFn(page);

            if (newItems.length === 0) {
                setHasMore(false);
            } else {
                setItems((prev) => [...prev, ...newItems]);
                setPage((prev) => prev + 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load'));
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, page, isLoading, hasMore]);

    const reset = useCallback(() => {
        setItems([]);
        setPage(initialPage);
        setHasMore(true);
        setError(null);
    }, [initialPage]);

    // Intersection Observer for trigger element
    const lastItemRef = useCallback(
        (node: HTMLElement | null) => {
            if (isLoading) return;

            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            observerRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore) {
                        loadMore();
                    }
                },
                { rootMargin: `${threshold}px` }
            );

            if (node) {
                observerRef.current.observe(node);
            }
        },
        [isLoading, hasMore, loadMore, threshold]
    );

    // Initial load
    useEffect(() => {
        if (items.length === 0 && hasMore) {
            loadMore();
        }
    }, []);

    return {
        items,
        isLoading,
        hasMore,
        error,
        loadMore,
        reset,
        lastItemRef,
    };
}

/**
 * 스크롤 위치 추적 훅
 */
export function useScrollPosition() {
    const [scrollY, setScrollY] = useState(0);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
            setScrollY(currentScrollY);
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return { scrollY, scrollDirection };
}

/**
 * 스크롤 최상단 이동 훅
 */
export function useScrollToTop() {
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return scrollToTop;
}
