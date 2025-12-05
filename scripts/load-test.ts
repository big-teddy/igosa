/**
 * API Load Testing Script
 * 부하 테스트 - 주요 API 엔드포인트
 */

interface LoadTestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: object;
    concurrentUsers: number;
    requestsPerUser: number;
    delayBetweenRequests: number; // ms
}

interface LoadTestResult {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
}

async function makeRequest(config: LoadTestConfig): Promise<{ success: boolean; responseTime: number }> {
    const start = Date.now();
    try {
        const response = await fetch(config.url, {
            method: config.method,
            headers: { 'Content-Type': 'application/json' },
            body: config.body ? JSON.stringify(config.body) : undefined,
        });

        return {
            success: response.ok,
            responseTime: Date.now() - start,
        };
    } catch {
        return {
            success: false,
            responseTime: Date.now() - start,
        };
    }
}

async function runUserSimulation(config: LoadTestConfig): Promise<{ success: boolean; responseTime: number }[]> {
    const results: { success: boolean; responseTime: number }[] = [];

    for (let i = 0; i < config.requestsPerUser; i++) {
        const result = await makeRequest(config);
        results.push(result);

        if (config.delayBetweenRequests > 0) {
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
        }
    }

    return results;
}

function calculatePercentile(arr: number[], percentile: number): number {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

export async function runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    console.log(`\n🔥 Load Test: ${config.method} ${config.url}`);
    console.log(`   Users: ${config.concurrentUsers}, Requests/User: ${config.requestsPerUser}`);
    console.log('─'.repeat(50));

    const startTime = Date.now();

    // Run concurrent users
    const userPromises = Array(config.concurrentUsers)
        .fill(null)
        .map(() => runUserSimulation(config));

    const allUserResults = await Promise.all(userPromises);
    const allResults = allUserResults.flat();

    const totalTime = (Date.now() - startTime) / 1000; // seconds
    const responseTimes = allResults.map(r => r.responseTime);

    const result: LoadTestResult = {
        totalRequests: allResults.length,
        successfulRequests: allResults.filter(r => r.success).length,
        failedRequests: allResults.filter(r => !r.success).length,
        avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes),
        p95ResponseTime: calculatePercentile(responseTimes, 95),
        p99ResponseTime: calculatePercentile(responseTimes, 99),
        requestsPerSecond: allResults.length / totalTime,
        errorRate: (allResults.filter(r => !r.success).length / allResults.length) * 100,
    };

    console.log(`✅ Total Requests: ${result.totalRequests}`);
    console.log(`✅ Successful: ${result.successfulRequests}`);
    console.log(`❌ Failed: ${result.failedRequests}`);
    console.log(`📊 Avg Response Time: ${result.avgResponseTime.toFixed(2)}ms`);
    console.log(`📊 P95 Response Time: ${result.p95ResponseTime}ms`);
    console.log(`📊 P99 Response Time: ${result.p99ResponseTime}ms`);
    console.log(`🚀 Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);
    console.log(`⚠️  Error Rate: ${result.errorRate.toFixed(2)}%`);
    console.log('─'.repeat(50));

    return result;
}

// Run all API load tests
export async function runAllLoadTests(baseUrl: string) {
    const tests: LoadTestConfig[] = [
        {
            url: `${baseUrl}/api/products/search?q=이어폰`,
            method: 'GET',
            concurrentUsers: 10,
            requestsPerUser: 5,
            delayBetweenRequests: 100,
        },
        {
            url: `${baseUrl}/api/demand/prod-1`,
            method: 'GET',
            concurrentUsers: 10,
            requestsPerUser: 5,
            delayBetweenRequests: 100,
        },
        {
            url: `${baseUrl}/api/negotiations/trigger`,
            method: 'POST',
            body: { productId: 'test-prod', forceTrigger: true },
            concurrentUsers: 5,
            requestsPerUser: 3,
            delayBetweenRequests: 200,
        },
    ];

    console.log('\n🧪 Running Load Tests...\n');

    const results: Record<string, LoadTestResult> = {};

    for (const config of tests) {
        results[config.url] = await runLoadTest(config);
    }

    // Summary
    console.log('\n📋 Load Test Summary');
    console.log('═'.repeat(50));

    let allPassed = true;
    for (const [url, result] of Object.entries(results)) {
        const passed = result.errorRate < 5 && result.p95ResponseTime < 2000;
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${url.split('/').slice(-2).join('/')}`);
        console.log(`   RPS: ${result.requestsPerSecond.toFixed(1)}, P95: ${result.p95ResponseTime}ms, Errors: ${result.errorRate.toFixed(1)}%`);
        if (!passed) allPassed = false;
    }

    console.log('═'.repeat(50));
    console.log(allPassed ? '🎉 All load tests passed!' : '⚠️ Some load tests failed');

    return { results, passed: allPassed };
}

// CLI
if (require.main === module) {
    const baseUrl = process.argv[2] || 'http://localhost:3000';
    runAllLoadTests(baseUrl)
        .then(({ passed }) => process.exit(passed ? 0 : 1))
        .catch(err => {
            console.error('Load test failed:', err);
            process.exit(1);
        });
}
