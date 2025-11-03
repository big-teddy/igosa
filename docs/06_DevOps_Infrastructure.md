# [DevOps] Deployment & Infrastructure Guide

**버전**: 1.0  
**날짜**: 2025-10-30

---

## 1. Vercel 배포

### 1.1 초기 설정

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# 환경 변수 설정
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
# ... 모든 환경 변수 추가

# 배포
vercel --prod
```

### 1.2 vercel.json

```json
{
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "NODE_VERSION": "20"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

---

## 2. CI/CD (GitHub Actions)

### 2.1 .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build

  deploy-preview:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID}}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

---

## 3. 모니터링

### 3.1 Sentry (에러 추적)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['authorization'];
    }
    return event;
  },
});
```

### 3.2 Axiom (로깅)

```typescript
// lib/logger.ts
import { Axiom } from '@axiomhq/js';

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});

export async function log(
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, any>
) {
  await axiom.ingest('igosa-logs', [
    {
      _time: new Date().toISOString(),
      level,
      message,
      ...metadata,
    },
  ]);
}
```

### 3.3 PostHog (애널리틱스)

```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.opt_out_capturing();
      }
    },
  });
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  posthog.identify(userId, properties);
}
```

---

## 4. 보안

### 4.1 환경 변수 관리

```bash
# .env.example (commit to repo)
DATABASE_URL=
OPENAI_API_KEY=
COUPANG_ACCESS_KEY=
# ...

# .env.local (DO NOT commit)
# Local development values

# .env.production (Vercel)
# Production values (managed in Vercel dashboard)
```

### 4.2 API Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  }
  
  return NextResponse.next();
}
```

### 4.3 CORS 설정

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://igosa.kr' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};
```

---

## 5. 데이터베이스 관리

### 5.1 Prisma Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Generate client
npx prisma generate

# Studio (GUI)
npx prisma studio
```

### 5.2 Backup Strategy

```bash
# Daily automated backup (cron job)
0 2 * * * pg_dump $DATABASE_URL | gzip > backup_$(date +\%Y\%m\%d).sql.gz

# Weekly backup to S3
0 0 * * 0 pg_dump $DATABASE_URL | aws s3 cp - s3://igosa-backups/weekly_$(date +\%Y\%m\%d).sql
```

---

## 6. 성능 최적화

### 6.1 Caching Strategy

```typescript
// app/api/products/[id]/route.ts
export const revalidate = 300;  // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = await getProduct(params.id);
  
  return Response.json(product, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

### 6.2 Database Connection Pooling

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 7. 장애 대응

### 7.1 Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    redis: false,
    weaviate: false,
  };
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {}
  
  try {
    await redis.ping();
    checks.redis = true;
  } catch (e) {}
  
  try {
    await weaviate.schema.getter().do();
    checks.weaviate = true;
  } catch (e) {}
  
  const allHealthy = Object.values(checks).every(v => v);
  
  return Response.json(checks, {
    status: allHealthy ? 200 : 503,
  });
}
```

### 7.2 Incident Response

```
1. Detection: Sentry alert → Slack notification
2. Triage: Check dashboard (Vercel + Axiom + Sentry)
3. Rollback: `vercel rollback` (if recent deployment)
4. Fix: Apply hotfix, test locally
5. Deploy: `vercel --prod`
6. Monitor: Check metrics for 30 minutes
7. Postmortem: Document in Notion
```

---

**문서 끝**

다음: [Development Timeline](./07_Development_Timeline.md)
