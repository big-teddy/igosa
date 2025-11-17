/**
 * Sentry Server Configuration
 * 서버 사이드 에러 트래킹
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    // Additional configuration
    integrations: [
      Sentry.httpIntegration(),
    ],

    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry (dev):', hint.originalException || event);
        return null;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Database connection errors (handled separately)
      'ECONNREFUSED',
      'ETIMEDOUT',
      // Expected API errors
      'NotFoundError',
      'UnauthorizedError',
    ],
  });
}
