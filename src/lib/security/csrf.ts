/**
 * CSRF Protection
 * Cross-Site Request Forgery 공격 방지
 */

import { NextRequest } from 'next/server';
import { randomBytes, createHmac } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'change-this-in-production';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const signature = createHmac('sha256', CSRF_SECRET).update(token).digest('hex');

  return `${token}.${signature}`;
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const [tokenValue, signature] = token.split('.');

  if (!tokenValue || !signature) {
    return false;
  }

  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(tokenValue)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(signature, expectedSignature);
}

/**
 * Constant-time string comparison
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Extract CSRF token from request
 */
export function getCsrfTokenFromRequest(req: NextRequest): string | null {
  // Check header first (recommended for API requests)
  const headerToken = req.headers.get('x-csrf-token');
  if (headerToken) {
    return headerToken;
  }

  // Check body for form submissions
  const contentType = req.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    // For JSON requests, token should be in header
    return null;
  }

  // For form data, we'd need to parse the body
  // This is handled at the route level
  return null;
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(req: NextRequest): boolean {
  // Skip CSRF check for safe methods
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  // Skip CSRF check for API routes with API key authentication
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    // API key authentication is handled separately
    return true;
  }

  const token = getCsrfTokenFromRequest(req);
  if (!token) {
    return false;
  }

  return verifyCsrfToken(token);
}

/**
 * Check if origin matches host (simple CORS check)
 */
export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (!origin) {
    // No origin header - might be same-origin request
    return true;
  }

  if (!host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const expectedHost = host.split(':')[0]; // Remove port if present

    // Check if origin matches host
    return originUrl.hostname === expectedHost;
  } catch {
    return false;
  }
}

/**
 * Create CSRF middleware
 */
export function createCsrfMiddleware() {
  return (req: NextRequest): boolean => {
    // Validate CSRF token
    if (!validateCsrfToken(req)) {
      return false;
    }

    // Validate origin
    if (!validateOrigin(req)) {
      return false;
    }

    return true;
  };
}

/**
 * CSRF token helper for client-side
 */
export const csrf = {
  generate: generateCsrfToken,
  verify: verifyCsrfToken,
  validate: validateCsrfToken,
  validateOrigin,
};
