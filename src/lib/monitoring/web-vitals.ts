/**
 * Web Vitals Performance Monitoring
 *
 * Core Web Vitals 및 성능 지표 추적
 */

import posthog from './posthog';

/**
 * Web Vitals Metric Types
 */
export type WebVitalMetric = {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
};

/**
 * Performance thresholds for Web Vitals
 * Based on Google's Core Web Vitals recommendations
 */
export const WEB_VITALS_THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500, // < 2.5s
    poor: 4000, // > 4s
  },
  // First Input Delay (FID)
  FID: {
    good: 100, // < 100ms
    poor: 300, // > 300ms
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1, // < 0.1
    poor: 0.25, // > 0.25
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800, // < 1.8s
    poor: 3000, // > 3s
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800, // < 800ms
    poor: 1800, // > 1.8s
  },
  // Interaction to Next Paint (INP)
  INP: {
    good: 200, // < 200ms
    poor: 500, // > 500ms
  },
} as const;

/**
 * Get rating for a metric value
 */
function getRating(
  name: WebVitalMetric['name'],
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name];

  if (value <= thresholds.good) {
    return 'good';
  }

  if (value <= thresholds.poor) {
    return 'needs-improvement';
  }

  return 'poor';
}

/**
 * Track Web Vital to PostHog
 */
export function trackWebVital(metric: WebVitalMetric) {
  if (typeof window === 'undefined') return;

  try {
    const rating = getRating(metric.name, metric.value);

    // Send to PostHog
    posthog.capture('$web_vitals', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: rating,
      metric_id: metric.id,
      metric_delta: metric.delta,
      navigation_type: metric.navigationType,
      page_path: window.location.pathname,
      page_url: window.location.href,
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${rating})`
      );
    }

    // Send to Sentry for performance monitoring
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.metrics.distribution(metric.name, metric.value, {
        tags: {
          rating,
          page: window.location.pathname,
        },
        unit: metric.name === 'CLS' ? 'ratio' : 'millisecond',
      });
    }
  } catch (error) {
    console.error('Error tracking web vital:', error);
  }
}

/**
 * Track custom performance metrics
 */
export function trackPerformanceMetric(
  name: string,
  value: number,
  unit: 'millisecond' | 'byte' | 'count' = 'millisecond',
  tags?: Record<string, string>
) {
  if (typeof window === 'undefined') return;

  try {
    posthog.capture('performance_metric', {
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
      page_path: window.location.pathname,
      ...tags,
    });
  } catch (error) {
    console.error('Error tracking performance metric:', error);
  }
}

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return;

  try {
    // Wait for page to fully load
    if (document.readyState === 'complete') {
      capturePageLoadMetrics();
    } else {
      window.addEventListener('load', capturePageLoadMetrics, { once: true });
    }
  } catch (error) {
    console.error('Error setting up page load tracking:', error);
  }
}

function capturePageLoadMetrics() {
  try {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!perfData) return;

    const metrics = {
      // DNS lookup time
      dns_time: perfData.domainLookupEnd - perfData.domainLookupStart,

      // TCP connection time
      tcp_time: perfData.connectEnd - perfData.connectStart,

      // Request time
      request_time: perfData.responseStart - perfData.requestStart,

      // Response time
      response_time: perfData.responseEnd - perfData.responseStart,

      // DOM processing time
      dom_processing_time: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,

      // Load event time
      load_event_time: perfData.loadEventEnd - perfData.loadEventStart,

      // Total page load time
      total_load_time: perfData.loadEventEnd - perfData.fetchStart,

      // DOM Interactive time
      dom_interactive_time: perfData.domInteractive - perfData.fetchStart,
    };

    // Track each metric
    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        trackPerformanceMetric(name, value, 'millisecond');
      }
    });

    // Track overall page load
    posthog.capture('page_load_complete', {
      ...metrics,
      page_path: window.location.pathname,
      page_url: window.location.href,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance] Page Load Metrics:', metrics);
    }
  } catch (error) {
    console.error('Error capturing page load metrics:', error);
  }
}

/**
 * Track resource loading performance
 */
export function trackResourcePerformance() {
  if (typeof window === 'undefined') return;

  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Group resources by type
    const resourcesByType: Record<string, number[]> = {};

    resources.forEach((resource) => {
      const type = getResourceType(resource.name);
      if (!resourcesByType[type]) {
        resourcesByType[type] = [];
      }
      resourcesByType[type].push(resource.duration);
    });

    // Calculate average duration per type
    Object.entries(resourcesByType).forEach(([type, durations]) => {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

      posthog.capture('resource_load_time', {
        resource_type: type,
        resource_count: durations.length,
        avg_duration: avgDuration,
        total_duration: durations.reduce((a, b) => a + b, 0),
        page_path: window.location.pathname,
      });
    });
  } catch (error) {
    console.error('Error tracking resource performance:', error);
  }
}

function getResourceType(url: string): string {
  if (url.endsWith('.js')) return 'javascript';
  if (url.endsWith('.css')) return 'stylesheet';
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) return 'image';
  if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
  if (url.includes('/api/')) return 'api';
  return 'other';
}

/**
 * Monitor long tasks (tasks > 50ms)
 */
export function monitorLongTasks() {
  if (typeof window === 'undefined') return;

  try {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            posthog.capture('long_task_detected', {
              task_duration: entry.duration,
              task_start_time: entry.startTime,
              page_path: window.location.pathname,
            });

            if (process.env.NODE_ENV === 'development') {
              console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  } catch (error) {
    console.error('Error setting up long task monitoring:', error);
  }
}

/**
 * Track JavaScript errors impact on performance
 */
export function trackErrorImpact(error: Error, componentStack?: string) {
  if (typeof window === 'undefined') return;

  try {
    posthog.capture('performance_error', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: componentStack,
      page_path: window.location.pathname,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Error tracking error impact:', err);
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  try {
    // Track page load
    trackPageLoad();

    // Track resources (after load)
    window.addEventListener('load', () => {
      setTimeout(() => {
        trackResourcePerformance();
      }, 1000);
    });

    // Monitor long tasks
    monitorLongTasks();

    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance] Monitoring initialized');
    }
  } catch (error) {
    console.error('Error initializing performance monitoring:', error);
  }
}

/**
 * Get current page performance summary
 */
export function getPerformanceSummary() {
  if (typeof window === 'undefined') return null;

  try {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!perfData) return null;

    return {
      loadTime: perfData.loadEventEnd - perfData.fetchStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
      domInteractive: perfData.domInteractive - perfData.fetchStart,
      firstByte: perfData.responseStart - perfData.requestStart,
    };
  } catch (error) {
    console.error('Error getting performance summary:', error);
    return null;
  }
}
