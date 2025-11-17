/**
 * Structured Logging Utility
 *
 * Provides consistent logging across the application
 */

import * as Sentry from '@sentry/nextjs';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const { level, message, context, timestamp, error } = entry;

    if (this.isDevelopment) {
      // Pretty format for development
      const contextStr = context ? `\n  Context: ${JSON.stringify(context, null, 2)}` : '';
      const errorStr = error ? `\n  Error: ${error.message}\n  Stack: ${error.stack}` : '';
      return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
    }

    // JSON format for production (for log aggregation)
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...context,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    });
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      error,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        Sentry.captureMessage(message, {
          level: 'warning',
          extra: context,
        });
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        if (error) {
          Sentry.captureException(error, {
            extra: context,
          });
        } else {
          Sentry.captureMessage(message, {
            level: 'error',
            extra: context,
          });
        }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      ...context,
    });
  }

  /**
   * Log API response
   */
  apiResponse(method: string, path: string, status: number, duration: number): void {
    this.info(`API ${method} ${path} - ${status}`, {
      method,
      path,
      status,
      duration,
    });
  }

  /**
   * Log database query
   */
  dbQuery(query: string, duration: number, context?: LogContext): void {
    this.debug(`DB Query: ${query}`, {
      query,
      duration,
      ...context,
    });
  }

  /**
   * Log external API call
   */
  externalApi(service: string, endpoint: string, duration: number, status?: number): void {
    this.info(`External API: ${service} ${endpoint}`, {
      service,
      endpoint,
      duration,
      status,
    });
  }

  /**
   * Performance measurement utility
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;

      this.debug(`${operation} completed`, {
        operation,
        duration,
        ...context,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      this.error(
        `${operation} failed`,
        error as Error,
        {
          operation,
          duration,
          ...context,
        }
      );

      throw error;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Create a child logger with pre-filled context
 */
export function createLogger(defaultContext: LogContext): Logger {
  const childLogger = new Logger();

  // Override log methods to include default context
  const originalDebug = childLogger.debug.bind(childLogger);
  const originalInfo = childLogger.info.bind(childLogger);
  const originalWarn = childLogger.warn.bind(childLogger);
  const originalError = childLogger.error.bind(childLogger);

  childLogger.debug = (message: string, context?: LogContext) => {
    originalDebug(message, { ...defaultContext, ...context });
  };

  childLogger.info = (message: string, context?: LogContext) => {
    originalInfo(message, { ...defaultContext, ...context });
  };

  childLogger.warn = (message: string, context?: LogContext) => {
    originalWarn(message, { ...defaultContext, ...context });
  };

  childLogger.error = (message: string, error?: Error, context?: LogContext) => {
    originalError(message, error, { ...defaultContext, ...context });
  };

  return childLogger;
}
