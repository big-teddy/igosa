/**
 * Environment Variable Validation Schema
 * 환경 변수 검증 및 타입 안전성 보장
 */

import { z } from 'zod';

// 환경 변수 스키마 정의
// Production 환경에서는 필수, Development에서는 optional
const isProd = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  // === Supabase (프로덕션 필수) ===
  NEXT_PUBLIC_SUPABASE_URL: isProd
    ? z.string().url()
    : z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: isProd
    ? z.string().min(20)
    : z.string().min(20).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

  // === Database ===
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),

  // === AI Models (프로덕션에서 OpenAI 필수) ===
  OPENAI_API_KEY: isProd
    ? z.string().min(20)
    : z.string().min(20).optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  UPSTAGE_API_KEY: z.string().optional(),

  // === Vector DB ===
  WEAVIATE_URL: z.string().url().optional(),
  WEAVIATE_API_KEY: z.string().optional(),

  // === Cache ===
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // === E-commerce APIs ===
  COUPANG_ACCESS_KEY: z.string().optional(),
  COUPANG_SECRET_KEY: z.string().optional(),
  NAVER_CLIENT_ID: z.string().optional(),
  NAVER_CLIENT_SECRET: z.string().optional(),

  // === Payment ===
  NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().optional(),
  TOSS_SECRET_KEY: z.string().optional(),
  KAKAOPAY_CID: z.string().optional(),
  KAKAOPAY_SECRET: z.string().optional(),

  // === Authentication ===
  JWT_SECRET: z.string().min(32).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // === Monitoring ===
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),

  // === Analytics ===
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  LANGSMITH_API_KEY: z.string().optional(),

  // === App Configuration ===
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

// 환경 변수 타입 추론
export type Env = z.infer<typeof envSchema>;

// 환경 변수 검증 및 파싱
function validateEnv(): Env {
  // 빌드 타임에는 검증 스킵 (환경변수는 런타임에 Vercel에서 주입됨)
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

  if (isBuildTime) {
    console.log('⏭️  Skipping env validation during build (runtime env vars will be injected)');
    return process.env as Env;
  }

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(JSON.stringify(error.issues, null, 2));

      // 개발 환경에서는 경고만
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Continuing with invalid env vars in development mode');
        return process.env as Env;
      }

      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

// 싱글톤 패턴으로 환경 변수 export
export const env = validateEnv();

// 헬퍼 함수: 필수 환경 변수 체크
export function requireEnv(key: keyof Env): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Required environment variable "${key}" is not set`);
  }
  return value;
}

// 헬퍼 함수: 프로덕션 환경 체크
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

// 헬퍼 함수: 개발 환경 체크
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

// 헬퍼 함수: 테스트 환경 체크
export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}
