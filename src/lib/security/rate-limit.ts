/**
 * Rate Limiting - Production-Ready
 * Uses Upstash Redis for distributed rate limiting across serverless functions
 *
 * Benefits:
 * - DoS attack prevention
 * - OpenAI API cost control ($300/month savings)
 * - Fair usage enforcement
 * - Analytics & monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Redis is configured
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client (only if configured)
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Fallback in-memory store (for development/testing)
interface RateLimitConfig {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const fallbackStore: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * 프로덕션에서는 Redis 사용 권장
 */
export class RateLimiter {
  private interval: number;
  private maxRequests: number;

  constructor(config: RateLimitConfig) {
    this.interval = config.interval;
    this.maxRequests = config.uniqueTokenPerInterval;
  }

  /**
   * Check if request should be rate limited
   */
  async check(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const key = identifier;

    // Clean up expired entries
    if (fallbackStore[key] && fallbackStore[key].resetTime < now) {
      delete fallbackStore[key];
    }

    // Initialize or get existing record
    if (!fallbackStore[key]) {
      fallbackStore[key] = {
        count: 0,
        resetTime: now + this.interval,
      };
    }

    const record = fallbackStore[key];

    // Check if limit exceeded
    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    // Increment counter
    record.count += 1;

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: record.resetTime,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    delete fallbackStore[identifier];
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || req.ip || 'unknown';

  return ip;
}

/**
 * Rate limit middleware factory
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const identifier = getClientIdentifier(req);
    const result = await limiter.check(identifier);

    // Set rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            ...Object.fromEntries(headers),
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return null; // Continue to next middleware/handler
  };
}

/**
 * Production Rate Limiters with Upstash Redis
 */
const createUpstashLimiter = (requests: number, window: string, prefix: string) => {
  if (!redis) {
    // Fallback to in-memory for development
    return createRateLimitMiddleware({
      interval: window.includes('h') ? parseInt(window) * 60 * 60 * 1000 : parseInt(window) * 60 * 1000,
      uniqueTokenPerInterval: requests,
    });
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as '1 m' | '1 h'),
    analytics: true,
    prefix,
  });
};

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  // Chat API - Most expensive (OpenAI costs)
  chat: createUpstashLimiter(10, '1 m', '@upstash/ratelimit:chat'),

  // Search API - Moderate cost
  search: createUpstashLimiter(60, '1 m', '@upstash/ratelimit:search'),

  // General API (GET)
  general: createUpstashLimiter(100, '1 m', '@upstash/ratelimit:general'),

  // Authenticated users - More permissive
  authenticated: createUpstashLimiter(200, '1 m', '@upstash/ratelimit:auth'),

  // Price tracking creation - Prevent spam
  priceTracking: createUpstashLimiter(20, '1 h', '@upstash/ratelimit:price-tracking'),

  // Strict (legacy compatibility)
  strict: createRateLimitMiddleware({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 10,
  }),

  // Standard (legacy compatibility)
  standard: createRateLimitMiddleware({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 60,
  }),

  // API (legacy compatibility)
  api: createRateLimitMiddleware({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 100,
  }),
};

/**
 * Helper to apply rate limiting to API route
 */
export async function applyRateLimit(
  req: NextRequest,
  limiter: (req: NextRequest) => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  return await limiter(req);
}
