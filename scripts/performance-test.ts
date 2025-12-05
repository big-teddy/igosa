/**
 * Performance Testing Scripts
 * Lighthouse CI and Web Vitals benchmarks
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

interface PerformanceMetrics {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    totalBlockingTime: number;
    speedIndex: number;
    interactive: number;
}

interface PerformanceBenchmarks {
    good: Partial<PerformanceMetrics>;
    acceptable: Partial<PerformanceMetrics>;
}

const BENCHMARKS: PerformanceBenchmarks = {
    good: {
        firstContentfulPaint: 1800,     // < 1.8s
        largestContentfulPaint: 2500,   // < 2.5s
        cumulativeLayoutShift: 0.1,     // < 0.1
        totalBlockingTime: 200,         // < 200ms
        speedIndex: 3400,               // < 3.4s
        interactive: 3800,              // < 3.8s
    },
    acceptable: {
        firstContentfulPaint: 3000,     // < 3s
        largestContentfulPaint: 4000,   // < 4s
        cumulativeLayoutShift: 0.25,    // < 0.25
        totalBlockingTime: 600,         // < 600ms
        speedIndex: 5800,               // < 5.8s
        interactive: 7300,              // < 7.3s
    },
};

async function runLighthouse(url: string): Promise<any> {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
        logLevel: 'info',
        output: 'json',
        port: chrome.port,
        onlyCategories: ['performance'],
    };

    const result = await lighthouse(url, options);
    await chrome.kill();
    return result;
}

function evaluateMetric(
    value: number,
    goodThreshold: number,
    acceptableThreshold: number
): 'good' | 'acceptable' | 'poor' {
    if (value <= goodThreshold) return 'good';
    if (value <= acceptableThreshold) return 'acceptable';
    return 'poor';
}

export async function runPerformanceTest(url: string) {
    console.log(`\n🚀 Running performance test for: ${url}\n`);

    const result = await runLighthouse(url);
    const { audits } = result.lhr;

    const metrics: PerformanceMetrics = {
        firstContentfulPaint: audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
        cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: audits['total-blocking-time'].numericValue,
        speedIndex: audits['speed-index'].numericValue,
        interactive: audits['interactive'].numericValue,
    };

    console.log('📊 Performance Results:');
    console.log('─'.repeat(50));

    const results: Record<string, string> = {};

    for (const [key, value] of Object.entries(metrics)) {
        const goodThreshold = BENCHMARKS.good[key as keyof PerformanceMetrics]!;
        const acceptableThreshold = BENCHMARKS.acceptable[key as keyof PerformanceMetrics]!;
        const rating = evaluateMetric(value, goodThreshold, acceptableThreshold);

        const icon = rating === 'good' ? '✅' : rating === 'acceptable' ? '🟡' : '🔴';
        const displayValue = key === 'cumulativeLayoutShift'
            ? value.toFixed(3)
            : `${(value / 1000).toFixed(2)}s`;

        console.log(`${icon} ${key}: ${displayValue} (${rating})`);
        results[key] = rating;
    }

    console.log('─'.repeat(50));
    console.log(`🎯 Performance Score: ${result.lhr.categories.performance.score * 100}/100`);

    return { metrics, results, score: result.lhr.categories.performance.score * 100 };
}

// CLI runner
if (require.main === module) {
    const url = process.argv[2] || 'http://localhost:3000';
    runPerformanceTest(url)
        .then(({ score }) => {
            process.exit(score >= 80 ? 0 : 1);
        })
        .catch((err) => {
            console.error('❌ Performance test failed:', err);
            process.exit(1);
        });
}
