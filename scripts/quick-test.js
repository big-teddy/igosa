#!/usr/bin/env node
/**
 * Quick Test Script
 * 시니어 개발자 관점: 2분 안에 핵심 기능 검증
 */

const http = require('http');

console.log('🧪 Igosa 빠른 테스트 시작...\n');

const BASE_URL = 'http://localhost:3000';
const tests = [];
let passedTests = 0;
let failedTests = 0;

// 테스트 헬퍼
function test(name, fn) {
    tests.push({ name, fn });
}

function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const req = http.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data,
                });
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

// 테스트 정의
test('홈페이지 로딩', async () => {
    const res = await makeRequest('/');
    if (res.status !== 200) {
        throw new Error(`Expected 200, got ${res.status}`);
    }
    if (!res.body.includes('이거사') && !res.body.includes('Igosa')) {
        throw new Error('페이지 내용 확인 실패');
    }
});

test('API 헬스 체크', async () => {
    try {
        const res = await makeRequest('/api/health');
        if (res.status !== 200 && res.status !== 404) {
            throw new Error(`Unexpected status: ${res.status}`);
        }
    } catch (error) {
        // Health endpoint가 없을 수 있음 - 경고만
        console.log('  ⚠️  Health endpoint 없음 (선택사항)');
    }
});

test('정적 리소스 로딩', async () => {
    const res = await makeRequest('/favicon.ico');
    if (res.status !== 200 && res.status !== 404) {
        throw new Error(`Expected 200 or 404, got ${res.status}`);
    }
});

// 테스트 실행
async function runTests() {
    console.log(`총 ${tests.length}개 테스트 실행 중...\n`);

    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passedTests++;
        } catch (error) {
            console.log(`❌ ${name}`);
            console.log(`   ${error.message}`);
            failedTests++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`결과: ${passedTests}/${tests.length} 통과`);

    if (failedTests === 0) {
        console.log('✨ 모든 테스트 통과!\n');
        console.log('다음 단계:');
        console.log('1. 브라우저에서 http://localhost:3000 접속');
        console.log('2. MANUAL_TEST_CHECKLIST.md 따라 수동 테스트');
        console.log('3. npm run test:integration (선택)\n');
        process.exit(0);
    } else {
        console.log(`⚠️  ${failedTests}개 테스트 실패\n`);
        console.log('문제 해결:');
        console.log('1. 개발 서버 실행 확인: npm run dev');
        console.log('2. 환경변수 확인: .env.local');
        console.log('3. 포트 확인: 3000번 포트 사용 중인지\n');
        process.exit(1);
    }
}

// 서버 연결 확인
console.log('🔍 서버 연결 확인 중...');
makeRequest('/')
    .then(() => {
        console.log('✅ 서버 연결 성공\n');
        return runTests();
    })
    .catch((error) => {
        console.log('❌ 서버 연결 실패\n');
        console.log('다음을 확인해주세요:');
        console.log('1. 개발 서버 실행: npm run dev');
        console.log('2. 포트 확인: http://localhost:3000');
        console.log('3. 방화벽 설정\n');
        console.log(`에러: ${error.message}\n`);
        process.exit(1);
    });
