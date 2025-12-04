#!/usr/bin/env node
/**
 * Quick Setup Script
 * 시니어 개발자 관점: 5분 안에 테스트 환경 구축
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Igosa 빠른 설정 시작...\n');

// 1. .env.local 파일 확인
const envPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 .env.local 파일 생성 중...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local 파일 생성 완료');
    console.log('⚠️  다음 환경변수를 설정해주세요:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('   - REDIS_URL 또는 UPSTASH_REDIS_REST_URL\n');
} else {
    console.log('✅ .env.local 파일 존재\n');
}

// 2. 환경변수 검증
console.log('🔍 필수 환경변수 확인 중...');

// Read .env.local file directly (no dotenv needed)
let envVars = {};
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            envVars[key] = value;
        }
    });
}

const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const missingVars = requiredEnvVars.filter(varName => !envVars[varName] || envVars[varName].includes('your-'));


if (missingVars.length > 0) {
    console.log('❌ 누락된 환경변수:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n.env.local 파일을 수정한 후 다시 실행해주세요.\n');
    process.exit(1);
} else {
    console.log('✅ 필수 환경변수 설정 완료\n');
}

// 3. Redis 설정 확인
const hasRedis = envVars.REDIS_URL ||
    (envVars.UPSTASH_REDIS_REST_URL && envVars.UPSTASH_REDIS_REST_TOKEN);

if (!hasRedis) {
    console.log('⚠️  Redis 미설정 (Mock 클라이언트 사용)');
    console.log('   프로덕션 배포 전 설정 필요:\n');
    console.log('   Railway: REDIS_URL');
    console.log('   Upstash: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN\n');
} else {
    console.log('✅ Redis 설정 완료\n');
}

// 4. 의존성 확인
console.log('📦 의존성 확인 중...');
try {
    execSync('npm list --depth=0', { stdio: 'ignore' });
    console.log('✅ 의존성 설치 완료\n');
} catch (error) {
    console.log('⚠️  의존성 설치 필요');
    console.log('   실행: npm install\n');
}

// 5. 테스트 디렉토리 확인
console.log('📁 테스트 디렉토리 확인 중...');
const testDirs = [
    'tests/e2e',
    'tests/integration/api',
];

testDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir} 존재`);
    } else {
        console.log(`⚠️  ${dir} 없음`);
    }
});

console.log('\n✨ 설정 완료!\n');
console.log('다음 단계:');
console.log('1. npm run dev          # 개발 서버 실행');
console.log('2. npm run quick:test   # 빠른 테스트 실행');
console.log('3. 브라우저에서 http://localhost:3000 접속\n');
