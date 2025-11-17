/**
 * Next.js Web Vitals Integration
 *
 * This file is automatically imported by Next.js to report Web Vitals
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/analytics
 */

'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { trackWebVital, initPerformanceMonitoring, type WebVitalMetric } from '@/lib/monitoring/web-vitals';

/**
 * Web Vitals Reporter Component
 *
 * Automatically tracks Core Web Vitals and sends to PostHog
 */
export function WebVitals() {
  // Track Web Vitals using Next.js hook
  useReportWebVitals((metric) => {
    // Convert Next.js metric to our format
    const webVitalMetric: WebVitalMetric = {
      id: metric.id,
      name: metric.name as WebVitalMetric['name'],
      value: metric.value,
      rating: 'good', // Will be calculated in trackWebVital
      delta: metric.delta || 0,
      navigationType: metric.navigationType || 'navigate',
    };

    // Track the metric
    trackWebVital(webVitalMetric);
  });

  // Initialize performance monitoring once
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return null;
}
