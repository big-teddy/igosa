/**
 * API Client with caching support
 * Integrates with SWR for client-side caching
 */

interface FetchOptions extends RequestInit {
    cache?: RequestCache;
    next?: {
        revalidate?: number;
        tags?: string[];
    };
}

/**
 * Base API client with default headers
 */
export async function apiClient<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config: FetchOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Client Error:', error);
        throw error;
    }
}

/**
 * GET request with caching support
 */
export const getCached = <T = any>(
    url: string,
    revalidate: number = 60
): Promise<T> => {
    return apiClient<T>(url, {
        method: 'GET',
        next: {
            revalidate, // Revalidate in seconds
        },
    });
};

/**
 * GET request with tag-based revalidation
 */
export const getWithTags = <T = any>(
    url: string,
    tags: string[],
    revalidate: number = 3600
): Promise<T> => {
    return apiClient<T>(url, {
        method: 'GET',
        next: {
            tags,
            revalidate,
        },
    });
};

/**
 * POST request (no caching)
 */
export const post = <T = any>(url: string, data: any): Promise<T> => {
    return apiClient<T>(url, {
        method: 'POST',
        body: JSON.stringify(data),
        cache: 'no-store',
    });
};

/**
 * PUT request (no caching)
 */
export const put = <T = any>(url: string, data: any): Promise<T> => {
    return apiClient<T>(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        cache: 'no-store',
    });
};

/**
 * DELETE request (no caching)
 */
export const del = <T = any>(url: string): Promise<T> => {
    return apiClient<T>(url, {
        method: 'DELETE',
        cache: 'no-store',
    });
};

/**
 * SWR configuration for client-side caching
 */
export const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    fetcher: (url: string) => fetch(url).then((res) => res.json()),
};
