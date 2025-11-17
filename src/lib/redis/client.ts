/**
 * Upstash Redis Client
 *
 * For production: Set environment variables in Vercel
 * UPSTASH_REDIS_REST_URL
 * UPSTASH_REDIS_REST_TOKEN
 */

import { Redis } from '@upstash/redis';

// Singleton Redis client
let redis: Redis | null = null;

/**
 * Get Redis client instance
 * Uses Upstash REST API for serverless compatibility
 */
export function getRedisClient(): Redis {
  if (redis) {
    return redis;
  }

  // Check for environment variables
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('Redis environment variables not set. Using mock Redis client.');

    // Return mock client for development
    return {
      zadd: async () => 1,
      zrange: async () => [],
      zrangebyscore: async () => [],
      zcount: async () => 0,
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      expire: async () => 1,
      incr: async () => 1,
      decr: async () => 1,
    } as any;
  }

  redis = new Redis({
    url,
    token,
  });

  return redis;
}

/**
 * Redis key prefixes for different data types
 */
export const REDIS_KEYS = {
  // Price tracking demand: product:{productId}:demand
  PRODUCT_DEMAND: (productId: string) => `product:${productId}:demand`,

  // Price distribution cache: product:{productId}:distribution
  PRICE_DISTRIBUTION: (productId: string) => `product:${productId}:distribution`,

  // Similar users count: product:{productId}:price:{price}:users
  SIMILAR_USERS: (productId: string, price: number) =>
    `product:${productId}:price:${Math.floor(price / 10000) * 10000}:users`,

  // Product demand stats: product:{productId}:stats
  DEMAND_STATS: (productId: string) => `product:${productId}:stats`,
};

/**
 * TTL (Time To Live) values in seconds
 */
export const REDIS_TTL = {
  DEMAND_DATA: 3600, // 1 hour
  DISTRIBUTION_CACHE: 300, // 5 minutes
  STATS_CACHE: 600, // 10 minutes
};
