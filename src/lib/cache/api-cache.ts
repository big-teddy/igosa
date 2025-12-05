/**
 * API Caching Utilities
 * 클라이언트 사이드 API 응답 캐싱
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheConfig {
    ttl: number; // Time to live in milliseconds
    staleWhileRevalidate?: number; // Serve stale while fetching fresh
}

class APICache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private pendingRequests = new Map<string, Promise<unknown>>();

    /**
     * Get cached data or fetch fresh
     */
    async get<T>(
        key: string,
        fetcher: () => Promise<T>,
        config: CacheConfig = { ttl: 60000 }
    ): Promise<T> {
        const now = Date.now();
        const cached = this.cache.get(key) as CacheEntry<T> | undefined;

        // Return valid cache
        if (cached && cached.expiresAt > now) {
            return cached.data;
        }

        // Stale-while-revalidate: return stale data while fetching
        if (cached && config.staleWhileRevalidate) {
            const staleWindow = cached.expiresAt + config.staleWhileRevalidate;
            if (now < staleWindow) {
                // Trigger background refresh
                this.fetchAndCache(key, fetcher, config);
                return cached.data;
            }
        }

        // Deduplicate concurrent requests
        const pending = this.pendingRequests.get(key);
        if (pending) {
            return pending as Promise<T>;
        }

        return this.fetchAndCache(key, fetcher, config);
    }

    private async fetchAndCache<T>(
        key: string,
        fetcher: () => Promise<T>,
        config: CacheConfig
    ): Promise<T> {
        const promise = fetcher();
        this.pendingRequests.set(key, promise);

        try {
            const data = await promise;
            const now = Date.now();

            this.cache.set(key, {
                data,
                timestamp: now,
                expiresAt: now + config.ttl,
            });

            return data;
        } finally {
            this.pendingRequests.delete(key);
        }
    }

    /**
     * Invalidate cache entry
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
   * Invalidate all entries matching prefix
   */
    invalidatePrefix(prefix: string): void {
        Array.from(this.cache.keys()).forEach(key => {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        });
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getStats() {
        let validCount = 0;
        let staleCount = 0;
        const now = Date.now();

        Array.from(this.cache.values()).forEach(entry => {
            if ((entry as CacheEntry<unknown>).expiresAt > now) {
                validCount++;
            } else {
                staleCount++;
            }
        });

        return {
            total: this.cache.size,
            valid: validCount,
            stale: staleCount,
        };
    }
}

// Singleton instance
export const apiCache = new APICache();

// TTL presets
export const CacheTTL = {
    SHORT: 30 * 1000,       // 30 seconds
    MEDIUM: 5 * 60 * 1000,  // 5 minutes
    LONG: 30 * 60 * 1000,   // 30 minutes
    HOUR: 60 * 60 * 1000,   // 1 hour
};

/**
 * Fetch with caching helper
 */
export async function cachedFetch<T>(
    url: string,
    options?: RequestInit,
    cacheConfig?: CacheConfig
): Promise<T> {
    const key = `fetch:${url}:${JSON.stringify(options?.body || '')}`;

    return apiCache.get(
        key,
        async () => {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        },
        cacheConfig || { ttl: CacheTTL.MEDIUM }
    );
}
