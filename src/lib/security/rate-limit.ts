/**
 * Rate Limiting - Production-Ready
 * Uses Upstash Redis for distributed rate limiting across serverless functions
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

// Rate Limit Types
export type RateLimitType = 'chat' | 'search' | 'api' | 'auth' | 'priceTracking';

interface LimitConfig {
  requests: number;
  window: '1 m' | '1 h';
}

const limits: Record<RateLimitType, LimitConfig> = {
  chat: { requests: 10, window: '1 m' }, // Expensive (OpenAI)
  search: { requests: 30, window: '1 m' }, // Moderate
  auth: { requests: 20, window: '1 m' }, // Login/Signup
  api: { requests: 100, window: '1 m' }, // General API
  priceTracking: { requests: 50, window: '1 h' }, // Prevent spam
};

/**
 * In-memory fallback store for development
 */
const fallbackStore: Record<string, { count: number; reset: number }> = {};

/**
 * Clean up expired entries in fallback store
 */
function cleanupFallbackStore() {
  const now = Date.now();
  for (const key in fallbackStore) {
    if (fallbackStore[key].reset < now) {
      delete fallbackStore[key];
    }
  }
}

// Cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupFallbackStore, 60000);
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || '127.0.0.1';
}

/**
 * Check Rate Limit
 * Returns null if allowed, or NextResponse(429) if blocked
 */
export async function checkRateLimit(
  req: NextRequest,
  type: RateLimitType
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(req);
  const config = limits[type];

  let success = true;
  let limit = config.requests;
  let remaining = config.requests;
  let reset = Date.now() + 60000;

  if (redis) {
    // Production: Use Upstash Redis
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `@upstash/ratelimit:${type}`,
    });

    const result = await ratelimit.limit(identifier);
    success = result.success;
    limit = result.limit;
    remaining = result.remaining;
    reset = result.reset;

  } else {
    // Development: Use In-Memory Fallback
    const now = Date.now();
    const windowMs = config.window === '1 h' ? 3600000 : 60000;
    const key = `${type}:${identifier}`;

    if (!fallbackStore[key] || fallbackStore[key].reset < now) {
      fallbackStore[key] = { count: 0, reset: now + windowMs };
    }

    const record = fallbackStore[key];
    if (record.count >= config.requests) {
      success = false;
      remaining = 0;
    } else {
      record.count++;
      remaining = config.requests - record.count;
    }
    reset = record.reset;
  }

  // Construct Rate Limit Headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(reset).toISOString());

  if (!success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers),
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // If allowed, we can optionally attach headers to the request for downstream use,
  // but Middleware usually returns a response or modifies the request.
  // We'll return null to indicate "pass", but the caller should merge headers if possible.
  // Since Middleware must return one final response, if we continue, we technically
  // haven't created the response yet.

  // NOTE: In Next.js Middleware, if we return null here, 
  // the caller (middleware.ts) needs to know the headers to set on the FINAL response.
  // We can attach them to the request headers temporarily so middleware picks them up,
  // or return them in a wrapper object. 

  // A cleaner way for middleware usage:
  // We'll attach them to the request headers as internal metadata 
  // 'x-ratelimit-remaining', etc. so the final response can include them if needed.
  // But strict rate limit headers usually only matter on denial or specific auditing.
  // For now, let's just return null.

  return null;
}
