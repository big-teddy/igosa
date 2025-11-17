/**
 * Centralized API Error Handling
 *
 * Provides consistent error responses across all API routes
 */

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export enum ErrorCode {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  REDIS_ERROR = 'REDIS_ERROR',
}

interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  cause?: Error;
}

export class APIError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: Error;
  public readonly timestamp: string;

  constructor(params: ErrorDetails) {
    super(params.message);
    this.name = 'APIError';
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.details = params.details;
    this.cause = params.cause;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }
}

/**
 * Predefined API Errors
 */
export class BadRequestError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: ErrorCode.BAD_REQUEST,
      message,
      statusCode: 400,
      details,
    });
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Authentication required') {
    super({
      code: ErrorCode.UNAUTHORIZED,
      message,
      statusCode: 401,
    });
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Insufficient permissions') {
    super({
      code: ErrorCode.FORBIDDEN,
      message,
      statusCode: 403,
    });
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, id?: string) {
    super({
      code: ErrorCode.NOT_FOUND,
      message: id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      statusCode: 404,
      details: { resource, id },
    });
  }
}

export class ValidationError extends APIError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      statusCode: 422,
      details: { fields },
    });
  }
}

export class ConflictError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: ErrorCode.CONFLICT,
      message,
      statusCode: 409,
      details,
    });
  }
}

export class RateLimitError extends APIError {
  constructor(retryAfter?: number) {
    super({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Rate limit exceeded',
      statusCode: 429,
      details: { retryAfter },
    });
  }
}

export class DatabaseError extends APIError {
  constructor(message: string, cause?: Error) {
    super({
      code: ErrorCode.DATABASE_ERROR,
      message: 'Database operation failed',
      statusCode: 500,
      details: { originalMessage: message },
      cause,
    });
  }
}

export class RedisError extends APIError {
  constructor(message: string, cause?: Error) {
    super({
      code: ErrorCode.REDIS_ERROR,
      message: 'Redis operation failed',
      statusCode: 500,
      details: { originalMessage: message },
      cause,
    });
  }
}

export class ExternalServiceError extends APIError {
  constructor(service: string, message: string, cause?: Error) {
    super({
      code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message: `External service '${service}' error: ${message}`,
      statusCode: 502,
      details: { service },
      cause,
    });
  }
}

/**
 * Global Error Handler for API Routes
 */
export function handleAPIError(error: unknown): NextResponse {
  // Already an APIError
  if (error instanceof APIError) {
    // Log to Sentry for 5xx errors
    if (error.statusCode >= 500) {
      Sentry.captureException(error, {
        extra: {
          code: error.code,
          details: error.details,
        },
      });
    }

    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // Supabase/Postgres errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string };

    // Unique constraint violation
    if (dbError.code === '23505') {
      return NextResponse.json(
        new ConflictError('Resource already exists').toJSON(),
        { status: 409 }
      );
    }

    // Foreign key violation
    if (dbError.code === '23503') {
      return NextResponse.json(
        new BadRequestError('Invalid reference').toJSON(),
        { status: 400 }
      );
    }

    // Log database error
    Sentry.captureException(new DatabaseError(dbError.message, error as Error));

    return NextResponse.json(
      new DatabaseError(dbError.message).toJSON(),
      { status: 500 }
    );
  }

  // Generic Error
  if (error instanceof Error) {
    Sentry.captureException(error);

    return NextResponse.json(
      {
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }

  // Unknown error type
  Sentry.captureMessage(`Unknown error type: ${JSON.stringify(error)}`);

  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  );
}

/**
 * Async Error Wrapper for API Route Handlers
 *
 * Usage:
 * export const GET = withErrorHandling(async (request) => {
 *   // Your route logic
 * });
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error);
    }
  }) as T;
}
