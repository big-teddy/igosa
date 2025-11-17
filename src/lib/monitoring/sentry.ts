/**
 * Sentry Error Tracking Utilities
 * 에러 추적 및 모니터링 유틸리티
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Capture an exception with additional context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error as Error, {
        context,
        args,
      });
      throw error;
    }
  }) as T;
}

/**
 * Track performance
 */
export function startTransaction(name: string, op: string) {
  if (process.env.NODE_ENV === 'development') {
    return {
      finish: () => {},
      setStatus: () => {},
      setData: () => {},
    };
  }

  return Sentry.startSpan({ name, op }, (span) => span);
}
