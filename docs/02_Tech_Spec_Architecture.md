# [Tech Spec] 이거사 Technical Architecture

**버전**: 1.0  
**날짜**: 2025-10-30  
**작성자**: Engineering Team  
**검토자**: CTO

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
│              (Web, Mobile Web, KakaoTalk)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  CDN (Vercel Edge)                           │
│              Static Assets + Edge Functions                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Next.js 14 App (Vercel)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend (React + TypeScript + Tailwind)             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (Edge Functions)                          │  │
│  │  - /api/chat                                          │  │
│  │  - /api/products                                      │  │
│  │  - /api/nego-deals                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼─────┐ ┌───▼────────┐
│   Database   │ │ Vector │ │   Cache    │
│  (Supabase)  │ │   DB   │ │  (Redis)   │
│ PostgreSQL   │ │ Weaviate│ │  Upstash   │
└──────────────┘ └────────┘ └────────────┘
        │
┌───────▼──────────────────────────────────────────┐
│           AI/LLM Layer                           │
│  ┌────────┐  ┌────────┐  ┌──────────┐          │
│  │  GPT-5 │  │ Gemini │  │  Claude  │          │
│  │   or   │  │  Flash │  │ Sonnet   │          │
│  │ Solar  │  │  Lite  │  │   4.5    │          │
│  └────────┘  └────────┘  └──────────┘          │
│        80%        15%          5%                 │
└──────────────────────────────────────────────────┘
        │
┌───────▼──────────────────────────────────────────┐
│        External APIs                              │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐    │
│  │ Coupang  │  │  Naver   │  │  Kakao     │    │
│  │ Partners │  │ Shopping │  │  Pay       │    │
│  └──────────┘  └──────────┘  └────────────┘    │
└───────────────────────────────────────────────────┘
```

### 1.2 Tech Stack Summary

**Frontend**
- Next.js 14 (App Router)
- TypeScript 5.3
- Tailwind CSS 3.4
- shadcn/ui

**Backend**
- Node.js 20 (Vercel Edge Runtime)
- Supabase (PostgreSQL)
- Weaviate Cloud (Vector DB)
- Redis (Upstash)

**AI/ML**
- Primary: GPT-5 / Solar Pro 2
- Speed: Gemini 2.5 Flash-Lite
- Complex: Claude Sonnet 4.5
- Embeddings: Voyage-multilingual-2

**Infrastructure**
- Hosting: Vercel
- CDN: Vercel Edge
- Monitoring: Sentry + Axiom + LangSmith

---

## 2. Data Architecture

### 2.1 Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  preferences JSONB
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  title VARCHAR(255),
  metadata JSONB
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  tokens_used INTEGER,
  metadata JSONB
);

-- Products (Cache)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255),
  platform VARCHAR(50),
  name VARCHAR(500),
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'KRW',
  image_url TEXT,
  product_url TEXT,
  category VARCHAR(100),
  brand VARCHAR(100),
  specs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(external_id, platform)
);

-- Price History
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  price DECIMAL(10,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Nego Deals
CREATE TABLE nego_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  target_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  discount_rate DECIMAL(5,2),
  original_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  deadline TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'failed')),
  seller_response VARCHAR(20) CHECK (seller_response IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Nego Participants
CREATE TABLE nego_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nego_deal_id UUID REFERENCES nego_deals(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(nego_deal_id, user_id)
);

-- User Actions (Analytics)
CREATE TABLE user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_products_platform ON products(platform);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_nego_deals_status ON nego_deals(status);
CREATE INDEX idx_user_actions_user ON user_actions(user_id);
CREATE INDEX idx_user_actions_type ON user_actions(action_type);
```

### 2.2 Vector Database Schema (Weaviate)

```python
# Product Embeddings
{
  "class": "Product",
  "properties": [
    {"name": "product_id", "dataType": ["string"]},
    {"name": "name", "dataType": ["text"]},
    {"name": "description", "dataType": ["text"]},
    {"name": "category", "dataType": ["string"]},
    {"name": "brand", "dataType": ["string"]},
    {"name": "price", "dataType": ["number"]},
    {"name": "platform", "dataType": ["string"]},
    {"name": "specs", "dataType": ["text"]},
    {"name": "reviews_summary", "dataType": ["text"]}
  ],
  "vectorizer": "none",  # We provide our own vectors
  "moduleConfig": {
    "generative-openai": {
      "model": "gpt-4o-mini"
    }
  }
}

# User Preferences Embeddings
{
  "class": "UserPreference",
  "properties": [
    {"name": "user_id", "dataType": ["string"]},
    {"name": "preference_type", "dataType": ["string"]},
    {"name": "preference_text", "dataType": ["text"]},
    {"name": "created_at", "dataType": ["date"]}
  ],
  "vectorizer": "none"
}
```

### 2.3 Cache Strategy (Redis)

```typescript
// Cache Keys
const CACHE_KEYS = {
  PRODUCT: (id: string) => `product:${id}`,
  PRICE: (productId: string, platform: string) => 
    `price:${productId}:${platform}`,
  SEARCH: (query: string) => `search:${query}`,
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  NEGO_DEAL: (id: string) => `nego:${id}`,
};

// TTL (Time To Live)
const CACHE_TTL = {
  PRODUCT: 3600,        // 1 hour
  PRICE: 300,           // 5 minutes
  SEARCH: 1800,         // 30 minutes
  USER_PROFILE: 86400,  // 24 hours
  NEGO_DEAL: 60,        // 1 minute
};
```

---

## 3. API Design

### 3.1 Chat API

**Endpoint**: `POST /api/chat`

**Request**:
```typescript
interface ChatRequest {
  message: string;
  conversation_id?: string;
  user_id: string;
  stream?: boolean;
}
```

**Response** (Streaming):
```typescript
// Server-Sent Events (SSE)
event: message
data: {"type": "token", "content": "안녕"}

event: message
data: {"type": "token", "content": "하세요"}

event: message
data: {"type": "products", "data": [...]}

event: message
data: {"type": "done"}
```

**Implementation**:
```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { generateChatResponse } from '@/lib/ai/chat';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { message, conversation_id, user_id } = await req.json();
  
  // Streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of generateChatResponse(message, conversation_id)) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 3.2 Product Search API

**Endpoint**: `GET /api/products/search`

**Request**:
```typescript
interface SearchRequest {
  query: string;
  platforms?: string[];  // ['coupang', 'naver', '11st']
  min_price?: number;
  max_price?: number;
  category?: string;
  brand?: string;
  limit?: number;
}
```

**Response**:
```typescript
interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
  took_ms: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  prices: {
    platform: string;
    price: number;
    shipping: number;
    total: number;
    url: string;
  }[];
  lowest_price: {
    platform: string;
    total: number;
  };
  specs: Record<string, any>;
  reviews_summary: string;
  rating: number;
}
```

### 3.3 Price Comparison API

**Endpoint**: `GET /api/products/:id/prices`

**Response**:
```typescript
interface PriceComparisonResponse {
  product_id: string;
  product_name: string;
  prices: {
    platform: string;
    price: number;
    shipping: number;
    total: number;
    delivery_type: string;
    delivery_days: number;
    in_stock: boolean;
    url: string;
    last_updated: string;
  }[];
  lowest_price: {
    platform: string;
    total: number;
    url: string;
  };
  price_history: {
    date: string;
    price: number;
  }[];
}
```

### 3.4 Nego Deal API

**Endpoint**: `POST /api/nego-deals`

**Request**:
```typescript
interface CreateNegoDealRequest {
  product_id: string;
  target_participants: number;
  discount_rate: number;
  deadline_hours: number;
}
```

**Endpoint**: `POST /api/nego-deals/:id/join`

**Request**:
```typescript
interface JoinNegoDealRequest {
  user_id: string;
}
```

**Response**:
```typescript
interface NegoDealResponse {
  id: string;
  product: Product;
  current_participants: number;
  target_participants: number;
  progress_percentage: number;
  discount_rate: number;
  original_price: number;
  final_price: number;
  savings: number;
  deadline: string;
  time_remaining_hours: number;
  status: string;
  can_join: boolean;
}
```

---

## 4. AI/LLM Architecture

### 4.1 Model Tier Routing

```typescript
enum LLMTier {
  PRIMARY = 'primary',    // GPT-5 or Solar Pro 2 (80%)
  SPEED = 'speed',       // Gemini 2.5 Flash-Lite (15%)
  COMPLEX = 'complex',   // Claude Sonnet 4.5 (5%)
}

function routeToTier(query: string, context: Context): LLMTier {
  // Simple queries → Speed tier
  if (isSimpleQuery(query)) {
    return LLMTier.SPEED;
  }
  
  // Complex reasoning → Complex tier
  if (requiresComplexReasoning(query, context)) {
    return LLMTier.COMPLEX;
  }
  
  // Default → Primary tier
  return LLMTier.PRIMARY;
}

function isSimpleQuery(query: string): boolean {
  const simplePatterns = [
    /^가격/,
    /^재고/,
    /^배송/,
    /얼마/,
  ];
  return simplePatterns.some(pattern => pattern.test(query));
}

function requiresComplexReasoning(query: string, context: Context): boolean {
  // Multi-step reasoning
  if (context.conversation_length > 5) return true;
  
  // Comparison queries
  if (/비교|vs|대|어떤게/.test(query)) return true;
  
  // Advice queries
  if (/추천|어떻게|왜|이유/.test(query)) return true;
  
  return false;
}
```

### 4.2 RAG Pipeline

```typescript
async function generateResponse(
  query: string,
  conversation_id: string
): Promise<string> {
  // 1. Embed query
  const queryEmbedding = await embedQuery(query);
  
  // 2. Semantic search in vector DB
  const relevantProducts = await searchVectorDB(queryEmbedding, {
    limit: 10,
    threshold: 0.7
  });
  
  // 3. Hybrid search (semantic + keyword)
  const keywordResults = await searchKeywords(query);
  const combinedResults = mergeResults(relevantProducts, keywordResults);
  
  // 4. Rerank
  const rerankedResults = await rerankResults(query, combinedResults);
  
  // 5. Construct context
  const context = buildContext(rerankedResults, conversation_id);
  
  // 6. Generate response
  const llm = selectLLM(query, context);
  const response = await llm.generate(query, context);
  
  // 7. Validate & post-process
  const validatedResponse = await validateResponse(response);
  
  return validatedResponse;
}

function buildContext(
  products: Product[],
  conversation_id: string
): string {
  const productDescriptions = products.map(p => 
    `제품: ${p.name}\n가격: ${p.price}\n설명: ${p.description}\n리뷰: ${p.reviews_summary}`
  ).join('\n\n');
  
  const conversationHistory = getConversationHistory(conversation_id);
  
  return `
대화 기록:
${conversationHistory}

관련 제품 정보:
${productDescriptions}
`;
}
```

### 4.3 Prompt Templates

```typescript
const SYSTEM_PROMPT = `
당신은 한국 쇼핑 전문가 AI 비서입니다.
사용자가 최적의 제품을 찾고 현명한 구매 결정을 내리도록 돕습니다.

역할:
- 자연어로 제품 검색 의도를 이해합니다
- 여러 쇼핑몰에서 가격을 비교합니다
- 리뷰와 스펙을 분석하여 추천합니다
- 모든 추천에는 명확한 근거를 제시합니다
- 존댓말(해요체)를 사용합니다

제약사항:
- 항상 사실에 기반해야 합니다
- 모르는 것은 솔직히 "잘 모르겠습니다"라고 답합니다
- 출처를 명시합니다
- 가격은 정확히 표시합니다 (배송비 포함 총액)
`;

const PRODUCT_SEARCH_PROMPT = `
사용자 검색: "{query}"

다음 제품들 중에서 가장 적합한 제품을 추천해주세요:
{products}

추천 시 다음 형식을 따르세요:
1. 추천 제품 3개 (순위별로)
2. 각 제품마다:
   - 이름, 가격 (배송비 포함 총액)
   - 추천 이유 (구체적인 근거 포함)
   - 주요 스펙
   - 리뷰 요약

존댓말(해요체)을 사용해주세요.
`;

const PRICE_COMPARISON_PROMPT = `
제품: {product_name}

다음 플랫폼들의 가격을 비교해주세요:
{prices}

다음 정보를 포함해주세요:
1. 최저가 플랫폼 강조
2. 배송비 포함 총액
3. 배송 속도 (로켓배송, 새벽배송 등)
4. 절약 금액

존댓말(해요체)을 사용해주세요.
`;
```

### 4.4 Semantic Caching

```typescript
import { createHash } from 'crypto';
import { redis } from '@/lib/redis';

interface CacheEntry {
  query: string;
  embedding: number[];
  response: string;
  created_at: number;
}

async function semanticCache(
  query: string,
  generate: () => Promise<string>
): Promise<string> {
  // 1. Embed query
  const queryEmbedding = await embedQuery(query);
  
  // 2. Search for similar cached queries
  const similarCache = await findSimilarCache(queryEmbedding, {
    threshold: 0.95,  // Very high similarity
    maxAge: 3600      // 1 hour
  });
  
  if (similarCache) {
    console.log('Cache HIT:', similarCache.query);
    return similarCache.response;
  }
  
  // 3. Cache MISS → Generate new response
  console.log('Cache MISS');
  const response = await generate();
  
  // 4. Store in cache
  await storeCache(query, queryEmbedding, response);
  
  return response;
}

async function findSimilarCache(
  embedding: number[],
  options: { threshold: number; maxAge: number }
): Promise<CacheEntry | null> {
  // Query vector DB for similar embeddings
  const results = await weaviate.query({
    collection: 'QueryCache',
    vector: embedding,
    limit: 1
  });
  
  if (results.length === 0) return null;
  
  const bestMatch = results[0];
  if (bestMatch.score < options.threshold) return null;
  
  const age = Date.now() - bestMatch.created_at;
  if (age > options.maxAge * 1000) return null;
  
  return bestMatch;
}
```

---

## 5. Security & Privacy

### 5.1 Authentication

```typescript
// JWT-based authentication
import { SignJWT, jwtVerify } from 'jose';

export async function createToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: string }> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return { userId: payload.userId as string };
}
```

### 5.2 API Key Management

```typescript
// Rotate API keys
const API_KEYS = {
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  google: process.env.GOOGLE_AI_API_KEY,
  coupang: {
    accessKey: process.env.COUPANG_ACCESS_KEY,
    secretKey: process.env.COUPANG_SECRET_KEY,
  },
};

// Never expose in client-side code
if (typeof window !== 'undefined') {
  throw new Error('API keys accessed on client side!');
}
```

### 5.3 PIPA Compliance

```typescript
// User consent management
interface UserConsent {
  user_id: string;
  marketing: boolean;
  analytics: boolean;
  personalization: boolean;
  consented_at: Date;
}

// Data anonymization
function anonymizeUser(user: User): AnonymizedUser {
  return {
    id: hashUserId(user.id),
    age_range: getAgeRange(user.age),
    region: getRegion(user.location),
    // Remove PII
  };
}

// Right to be forgotten
async function deleteUserData(userId: string) {
  await db.users.delete({ where: { id: userId } });
  await db.conversations.deleteMany({ where: { user_id: userId } });
  await db.user_actions.deleteMany({ where: { user_id: userId } });
  // ... delete from all tables
}
```

---

## 6. Performance Optimization

### 6.1 Edge Caching

```typescript
// Vercel Edge Config
export const config = {
  runtime: 'edge',
  regions: ['icn1'],  // Seoul
};

// Static generation for landing pages
export const revalidate = 3600;  // 1 hour
```

### 6.2 Database Optimization

```sql
-- Query optimization examples

-- BEFORE (slow)
SELECT * FROM products WHERE name LIKE '%신발%';

-- AFTER (fast with index)
SELECT * FROM products 
WHERE to_tsvector('korean', name) @@ to_tsquery('korean', '신발')
AND category = 'shoes';

-- Full-text search index
CREATE INDEX idx_products_search 
ON products USING gin(to_tsvector('korean', name || ' ' || description));
```

### 6.3 API Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),  // 10 requests per minute
});

export async function checkRateLimit(userId: string): Promise<boolean> {
  const { success } = await ratelimit.limit(userId);
  return success;
}
```

---

## 7. Monitoring & Logging

### 7.1 Application Monitoring

```typescript
// Sentry for error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});

// Custom error boundaries
export function withErrorBoundary(Component) {
  return Sentry.withErrorBoundary(Component, {
    fallback: ErrorFallback,
    showDialog: true,
  });
}
```

### 7.2 LLM Monitoring

```typescript
// LangSmith integration
import { Client } from 'langsmith';

const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

export async function traceGeneration(
  name: string,
  run: () => Promise<any>
) {
  return await client.traceRun(
    name,
    run,
    {
      project_name: 'igosa',
      tags: ['production'],
    }
  );
}
```

### 7.3 Analytics

```typescript
// PostHog for user analytics
import posthog from 'posthog-js';

posthog.init(process.env.POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
});

export function trackEvent(
  event: string,
  properties?: Record<string, any>
) {
  posthog.capture(event, properties);
}

// Usage
trackEvent('product_searched', {
  query: 'running shoes',
  results_count: 15,
});

trackEvent('product_clicked', {
  product_id: '123',
  platform: 'coupang',
  price: 149000,
});
```

---

## 8. Deployment

### 8.1 Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

OPENAI_API_KEY="sk-..."
UPSTAGE_API_KEY="up-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="AIza..."

WEAVIATE_URL="https://..."
WEAVIATE_API_KEY="..."

REDIS_URL="redis://..."
REDIS_TOKEN="..."

COUPANG_ACCESS_KEY="..."
COUPANG_SECRET_KEY="..."

NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."

JWT_SECRET="..."

SENTRY_DSN="..."
LANGSMITH_API_KEY="..."
POSTHOG_KEY="..."
```

### 8.2 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["icn1"],
  "env": {
    "NODE_VERSION": "20"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

---

**문서 끝**

다음: [API Integration Guide](./03_API_Integration_Guide.md)
