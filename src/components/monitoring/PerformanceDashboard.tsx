'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Zap, Timer, Monitor } from 'lucide-react';

interface PerformanceMetrics {
    fcp: number | null;
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    ttfb: number | null;
}

/**
 * 성능 메트릭 대시보드
 * Core Web Vitals 실시간 모니터링
 */
export function PerformanceDashboard() {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        fcp: null,
        lcp: null,
        fid: null,
        cls: null,
        ttfb: null,
    });

    useEffect(() => {
        // Check if Performance Observer is available
        if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
            return;
        }

        const updateMetric = (name: keyof PerformanceMetrics, value: number) => {
            setMetrics((prev) => ({ ...prev, [name]: value }));
        };

        // FCP
        try {
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length > 0) {
                    updateMetric('fcp', entries[0].startTime);
                }
            });
            fcpObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
            // Fallback
        }

        // LCP
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length > 0) {
                    const lastEntry = entries[entries.length - 1];
                    updateMetric('lcp', lastEntry.startTime);
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Fallback
        }

        // CLS
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!(entry as any).hadRecentInput) {
                        clsValue += (entry as any).value;
                        updateMetric('cls', clsValue);
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            // Fallback
        }

        // TTFB
        try {
            const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navEntry) {
                updateMetric('ttfb', navEntry.responseStart - navEntry.requestStart);
            }
        } catch (e) {
            // Fallback
        }
    }, []);

    const getScoreColor = (metric: string, value: number | null): string => {
        if (value === null) return 'secondary';

        const thresholds: Record<string, { good: number; poor: number }> = {
            fcp: { good: 1800, poor: 3000 },
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            ttfb: { good: 800, poor: 1800 },
        };

        const t = thresholds[metric];
        if (!t) return 'secondary';

        if (value <= t.good) return 'default';
        if (value <= t.poor) return 'secondary';
        return 'destructive';
    };

    const formatValue = (metric: string, value: number | null): string => {
        if (value === null) return '-';
        if (metric === 'cls') return value.toFixed(3);
        return `${Math.round(value)}ms`;
    };

    const metricsConfig = [
        { key: 'fcp', label: 'FCP', icon: Zap, desc: 'First Contentful Paint' },
        { key: 'lcp', label: 'LCP', icon: Monitor, desc: 'Largest Contentful Paint' },
        { key: 'fid', label: 'FID', icon: Timer, desc: 'First Input Delay' },
        { key: 'cls', label: 'CLS', icon: Gauge, desc: 'Cumulative Layout Shift' },
        { key: 'ttfb', label: 'TTFB', icon: Zap, desc: 'Time to First Byte' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Core Web Vitals
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {metricsConfig.map(({ key, label, icon: Icon, desc }) => (
                        <div key={key} className="text-center space-y-2">
                            <Icon className="h-6 w-6 mx-auto text-muted-foreground" />
                            <div className="font-medium">{label}</div>
                            <Badge variant={getScoreColor(key, metrics[key as keyof PerformanceMetrics]) as any}>
                                {formatValue(key, metrics[key as keyof PerformanceMetrics])}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
