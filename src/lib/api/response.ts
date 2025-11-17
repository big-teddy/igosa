/**
 * Standardized API Response Utilities
 *
 * Provides consistent response formats across all API routes
 */

import { NextResponse } from 'next/server';

interface SuccessResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  meta?: {
    timestamp: string;
    [key: string]: unknown;
  };
}

/**
 * Success Response (200)
 */
export function success<T>(data: T, meta?: Record<string, unknown>): NextResponse {
  const response: SuccessResponse<T> = {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Created Response (201)
 */
export function created<T>(data: T, meta?: Record<string, unknown>): NextResponse {
  const response: SuccessResponse<T> = {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status: 201 });
}

/**
 * No Content Response (204)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Paginated Response (200)
 */
export function paginated<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  meta?: Record<string, unknown>
): NextResponse {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const hasMore = pagination.page < totalPages;

  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      ...pagination,
      totalPages,
      hasMore,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Helper to extract pagination params from URL
 */
export function getPaginationParams(url: URL): { page: number; limit: number } {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));

  return { page, limit };
}

/**
 * Calculate pagination offset
 */
export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
