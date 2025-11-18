/**
 * Rate Limiting Middleware
 *
 * Uses Upstash Rate Limit for serverless-friendly rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient } from '@/lib/redis/client';
import { RateLimitError } from '@/lib/errors/api-error';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

/**
 * Rate limit configurations
 */
export const RateLimitConfig = {
  // Strict rate limit for anonymous users
  anonymous: {
    requests: 10,
    window: '60 s', // 10 requests per minute
  },
  // Normal rate limit for authenticated users
  authenticated: {
    requests: 100,
    window: '60 s', // 100 requests per minute
  },
  // Rate limit for expensive operations
  expensive: {
    requests: 5,
    window: '60 s', // 5 requests per minute
  },
  // Rate limit for write operations
  write: {
    requests: 30,
    window: '60 s', // 30 writes per minute
  },
} as const;

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Use IP address for anonymous users
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Create rate limiter instance
 */
function createRateLimiter(config: { requests: number; window: string }) {
  try {
    const redis = getRedisClient();

    return new Ratelimit({
      redis: redis as any,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: 'ratelimit',
    });
  } catch (error) {
    logger.warn('Rate limiter initialization failed, using in-memory fallback', {
      error,
    });

    // Fallback to in-memory rate limiting if Redis is unavailable
    const store = new Map<string, { count: number; resetAt: number }>();

    return {
      limit: async (identifier: string) => {
        const now = Date.now();
        const windowMs = parseWindow(config.window);
        const existing = store.get(identifier);

        if (existing && existing.resetAt > now) {
          if (existing.count >= config.requests) {
            return {
              success: false,
              limit: config.requests,
              remaining: 0,
              reset: existing.resetAt,
            };
          }

          existing.count++;
          return {
            success: true,
            limit: config.requests,
            remaining: config.requests - existing.count,
            reset: existing.resetAt,
          };
        }

        // New window
        store.set(identifier, {
          count: 1,
          resetAt: now + windowMs,
        });

        return {
          success: true,
          limit: config.requests,
          remaining: config.requests - 1,
          reset: now + windowMs,
        };
      },
    };
  }
}

/**
 * Parse window string to milliseconds
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return 60000; // Default 1 minute

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case 's':
      return num * 1000;
    case 'm':
      return num * 60 * 1000;
    case 'h':
      return num * 60 * 60 * 1000;
    case 'd':
      return num * 24 * 60 * 60 * 1000;
    default:
      return 60000;
  }
}

/**
 * Apply rate limiting to request
 */
export async function rateLimit(
  request: NextRequest,
  options: {
    config: typeof RateLimitConfig[keyof typeof RateLimitConfig];
    userId?: string;
    identifier?: string;
  }
): Promise<void> {
  const { config, userId, identifier } = options;

  const clientId = identifier || getClientId(request, userId);
  const limiter = createRateLimiter(config);

  try {
    const result = await limiter.limit(clientId);

    logger.debug('Rate limit check', {
      clientId,
      success: result.success,
      remaining: result.remaining,
      limit: result.limit,
    });

    if (!result.success) {
      const resetDate = new Date(result.reset);
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

      logger.warn('Rate limit exceeded', {
        clientId,
        limit: result.limit,
        reset: resetDate.toISOString(),
      });

      throw new RateLimitError(retryAfter);
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }

    // If rate limiting fails, log and allow the request
    logger.error('Rate limiting check failed', error as Error, { clientId });
  }
}

/**
 * Rate limit decorator for API routes
 */
export function withRateLimit(
  config: typeof RateLimitConfig[keyof typeof RateLimitConfig],
  getUserId?: (request: NextRequest) => Promise<string | undefined>
) {
  return function <T extends (request: NextRequest, ...args: any[]) => Promise<any>>(
    handler: T
  ): T {
    return (async (request: NextRequest, ...args: any[]) => {
      const userId = getUserId ? await getUserId(request) : undefined;

      await rateLimit(request, { config, userId });

      return handler(request, ...args);
    }) as T;
  };
}
