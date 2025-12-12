/**
 * Server-side caching utilities
 * Using Next.js unstable_cache for server components
 */

import { unstable_cache } from 'next/cache';

/**
 * Cache popular products list
 * Revalidates every 5 minutes
 */
export const getPopularProducts = unstable_cache(
    async () => {
        // This would fetch from your data source
        // For now, returning empty array as placeholder
        return [];
    },
    ['popular-products'],
    {
        revalidate: 300, // 5 minutes
        tags: ['products'],
    }
);

/**
 * Cache category filters
 * Revalidates every 1 hour
 */
export const getCategoryFilters = unstable_cache(
    async () => {
        // This would fetch categories from DB
        return [];
    },
    ['category-filters'],
    {
        revalidate: 3600, // 1 hour
        tags: ['categories'],
    }
);

/**
 * Cache static content
 * Revalidates daily
 */
export const getStaticContent = unstable_cache(
    async (key: string) => {
        // Fetch static content by key
        return null;
    },
    ['static-content'],
    {
        revalidate: 86400, // 24 hours
        tags: ['static'],
    }
);

/**
 * Cache user preferences
 * Revalidates every 10 minutes
 */
export const getUserPreferences = unstable_cache(
    async (userId: string) => {
        // Fetch user preferences
        return null;
    },
    ['user-preferences'],
    {
        revalidate: 600, // 10 minutes
        tags: ['user'],
    }
);

/**
 * Invalidate cache by tag
 */
export async function invalidateCache(tags: string[]) {
    const { revalidateTag } = require('next/cache');
    tags.forEach((tag) => revalidateTag(tag));
}
