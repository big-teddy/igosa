/**
 * Redis Client - Supports both Railway and Upstash
 *
 * Environment variables:
 * - Railway: REDIS_URL (e.g., redis://default:password@host:6379)
 * - Upstash: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 */

import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

// Unified Redis interface
export interface RedisClient {
  zadd(key: string, ...args: any[]): Promise<number>;
  zrange(key: string, start: number, stop: number, options?: any): Promise<any>;
  zrem(key: string, ...members: string[]): Promise<number>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: any): Promise<string>;
  del(...keys: string[]): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

// Singleton clients
let upstashClient: UpstashRedis | null = null;
let railwayClient: Redis | null = null;
let clientType: 'upstash' | 'railway' | 'mock' | null = null;

/**
 * Wrapper for Railway Redis (ioredis) to match Upstash API
 */
class RailwayRedisAdapter implements RedisClient {
  constructor(private client: Redis) {}

  async zadd(key: string, ...args: any[]): Promise<number> {
    // Handle both formats: zadd(key, {score, member}) and zadd(key, score, member)
    if (args.length === 1 && typeof args[0] === 'object' && 'score' in args[0]) {
      const { score, member } = args[0];
      return this.client.zadd(key, score, member);
    }
    return this.client.zadd(key, ...args);
  }

  async zrange(key: string, start: number, stop: number, options?: any): Promise<any> {
    if (options?.withScores) {
      const result = await this.client.zrange(key, start, stop, 'WITHSCORES');
      return result;
    }
    return this.client.zrange(key, start, stop);
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return this.client.zrem(key, ...members);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, options?: any): Promise<string> {
    if (options?.ex) {
      await this.client.setex(key, options.ex, value);
      return 'OK';
    }
    await this.client.set(key, value);
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }
}

/**
 * Mock Redis client for development
 */
const mockClient: RedisClient = {
  zadd: async () => 1,
  zrange: async () => [],
  zrem: async () => 1,
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  expire: async () => 1,
};

/**
 * Get Redis client instance
 * Auto-detects Railway or Upstash based on environment variables
 */
export function getRedisClient(): RedisClient {
  // Return existing client if already initialized
  if (clientType === 'upstash' && upstashClient) return upstashClient as any;
  if (clientType === 'railway' && railwayClient) return new RailwayRedisAdapter(railwayClient);
  if (clientType === 'mock') return mockClient;

  // Check for Upstash (Serverless-optimized)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    console.log('🔴 Using Upstash Redis (REST API)');
    upstashClient = new UpstashRedis({
      url: upstashUrl,
      token: upstashToken,
    });
    clientType = 'upstash';
    return upstashClient as any;
  }

  // Check for Railway or standard Redis
  const railwayUrl = process.env.REDIS_URL;

  if (railwayUrl) {
    console.log('🚂 Using Railway Redis (TCP)');
    railwayClient = new Redis(railwayUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 50, 2000); // Exponential backoff
      },
    });
    clientType = 'railway';
    return new RailwayRedisAdapter(railwayClient);
  }

  // No Redis configured - use mock
  console.warn('⚠️  No Redis configured. Using mock client.');
  console.warn('   Set REDIS_URL (Railway) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash)');
  clientType = 'mock';
  return mockClient;
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedisConnection(): Promise<void> {
  if (railwayClient) {
    await railwayClient.quit();
    railwayClient = null;
  }
  upstashClient = null;
  clientType = null;
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
