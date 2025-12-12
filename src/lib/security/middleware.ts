/**
 * Security Middleware
 * 통합 보안 미들웨어
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken, validateOrigin } from './csrf';
import { checkRateLimit, RateLimitType } from './rate-limit';

export interface SecurityConfig {
  enableCsrf?: boolean;
  enableRateLimit?: boolean;
  rateLimitType?: RateLimitType;
  enableCors?: boolean;
  allowedOrigins?: string[];
  enableSecurityHeaders?: boolean;
}

// ... (applySecurityHeaders and applyCorsHeaders remain unchanged)

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = response.headers;

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // XSS Protection
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://app.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://api.anthropic.com https://app.posthog.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Permissions Policy
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

/**
 * Apply CORS headers
 */
export function applyCorsHeaders(
  response: NextResponse,
  allowedOrigins: string[] = []
): NextResponse {
  const origin = response.headers.get('origin');

  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }

  return response;
}

/**
 * Main security middleware
 */
export async function securityMiddleware(
  req: NextRequest,
  config: SecurityConfig = {}
): Promise<NextResponse | null> {
  const {
    enableCsrf = true,
    enableRateLimit = true,
    rateLimitType = 'api',
    enableCors = false,
    allowedOrigins = [],
    enableSecurityHeaders = true,
  } = config;

  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (enableCors) {
      return applyCorsHeaders(response, allowedOrigins);
    }
    return response;
  }

  // Apply rate limiting
  if (enableRateLimit) {
    const limitResponse = await checkRateLimit(req, rateLimitType);

    if (limitResponse) {
      if (enableSecurityHeaders) {
        return applySecurityHeaders(limitResponse);
      }
      return limitResponse;
    }
  }

  // Validate CSRF token for state-changing requests
  if (enableCsrf) {
    const method = req.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      if (!validateCsrfToken(req)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Invalid CSRF Token',
            message: 'CSRF 토큰이 유효하지 않습니다.',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (!validateOrigin(req)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Invalid Origin',
            message: '요청 출처가 유효하지 않습니다.',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
  }

  // All checks passed
  return null;
}

/**
 * Create a secured API route handler
 */
export function withSecurity<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  config: SecurityConfig = {}
): T {
  return (async (req: NextRequest, ...args: any[]) => {
    // Apply security middleware
    const securityResult = await securityMiddleware(req, config);

    if (securityResult) {
      return securityResult;
    }

    // Call original handler
    const response = await handler(req, ...args);

    // Apply security headers to response
    if (config.enableSecurityHeaders !== false) {
      return applySecurityHeaders(response);
    }

    // Apply CORS headers if enabled
    if (config.enableCors) {
      return applyCorsHeaders(response, config.allowedOrigins);
    }

    return response;
  }) as T;
}

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<{ success: true; data: T } | { success: false; error: any }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Security utilities export
 */
export const security = {
  middleware: securityMiddleware,
  withSecurity,
  applySecurityHeaders,
  applyCorsHeaders,
  validateRequestBody,
};
