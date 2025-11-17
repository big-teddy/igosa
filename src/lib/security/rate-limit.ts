/**
 * Rate Limiting
 * API 요청 제한으로 DoS 공격 방지
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

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
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }

    // Initialize or get existing record
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + this.interval,
      };
    }

    const record = store[key];

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
    delete store[identifier];
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
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict: 10 requests per minute
  strict: createRateLimitMiddleware({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10,
  }),

  // Standard: 60 requests per minute
  standard: createRateLimitMiddleware({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 60,
  }),

  // Generous: 300 requests per minute
  generous: createRateLimitMiddleware({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 300,
  }),

  // Auth: 5 failed attempts per 15 minutes
  auth: createRateLimitMiddleware({
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 5,
  }),

  // Search: 30 requests per minute
  search: createRateLimitMiddleware({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30,
  }),

  // API: 100 requests per minute
  api: createRateLimitMiddleware({
    interval: 60 * 1000, // 1 minute
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
