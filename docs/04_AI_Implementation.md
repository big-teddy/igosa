# [AI Spec] AI/LLM Implementation Guide

**버전**: 1.0  
**날짜**: 2025-10-30  
**작성자**: AI/ML Team

---

## 목차

1. [RAG Pipeline](#1-rag-pipeline)
2. [Prompt Engineering](#2-prompt-engineering)
3. [Model Selection & Routing](#3-model-selection--routing)
4. [Cost Optimization](#4-cost-optimization)
5. [Quality Assurance](#5-quality-assurance)

---

## 1. RAG Pipeline

### 1.1 전체 흐름

```
User Query
    ↓
Query Embedding (Voyage-multilingual-2)
    ↓
Vector Search (Weaviate)  +  Keyword Search (BM25)
    ↓
Hybrid Reranking (Cohere)
    ↓
Context Construction
    ↓
LLM Generation (GPT-5 / Solar / Claude / Gemini)
    ↓
Response Validation
    ↓
User Response
```

### 1.2 Embedding Generation

```typescript
import { VoyageAIClient } from '@voyageai/client';

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});

async function embedQuery(text: string): Promise<number[]> {
  const response = await voyage.embed({
    model: 'voyage-multilingual-2',
    input: [text],
  });
  
  return response.data[0].embedding;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await voyage.embed({
    model: 'voyage-multilingual-2',
    input: texts,
    inputType: 'document',  // 'query' or 'document'
  });
  
  return response.data.map(d => d.embedding);
}
```

### 1.3 Vector Search (Weaviate)

```typescript
import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_URL!,
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});

async function searchVectorDB(
  embedding: number[],
  options: {
    limit?: number;
    threshold?: number;
    filters?: any;
  } = {}
): Promise<any[]> {
  let query = client.graphql
    .get()
    .withClassName('Product')
    .withNearVector({
      vector: embedding,
      certainty: options.threshold || 0.7,
    })
    .withLimit(options.limit || 10)
    .withFields('name description price category brand specs reviews_summary _additional { certainty }');
  
  if (options.filters) {
    query = query.withWhere(options.filters);
  }
  
  const result = await query.do();
  return result.data.Get.Product;
}

// Example with filters
const results = await searchVectorDB(embedding, {
  limit: 20,
  threshold: 0.75,
  filters: {
    path: ['price'],
    operator: 'LessThan',
    valueNumber: 200000,
  },
});
```

### 1.4 Hybrid Search

```typescript
async function hybridSearch(
  query: string,
  options: {
    alpha?: number;  // 0 = keyword only, 1 = vector only, 0.5 = balanced
    limit?: number;
  } = {}
): Promise<any[]> {
  const alpha = options.alpha ?? 0.5;
  
  // 1. Vector search
  const embedding = await embedQuery(query);
  const vectorResults = await searchVectorDB(embedding, {
    limit: options.limit || 20,
  });
  
  // 2. Keyword search (BM25)
  const keywordResults = await client.graphql
    .get()
    .withClassName('Product')
    .withBm25({
      query: query,
      properties: ['name', 'description'],
    })
    .withLimit(options.limit || 20)
    .withFields('name description price _additional { score }')
    .do();
  
  // 3. Merge & rerank
  const merged = mergeResults(
    vectorResults,
    keywordResults.data.Get.Product,
    alpha
  );
  
  return merged;
}

function mergeResults(
  vectorResults: any[],
  keywordResults: any[],
  alpha: number
): any[] {
  const resultMap = new Map();
  
  // Add vector results
  vectorResults.forEach((result, idx) => {
    const vectorScore = result._additional.certainty;
    resultMap.set(result.name, {
      ...result,
      vectorScore,
      vectorRank: idx + 1,
      keywordScore: 0,
      keywordRank: Infinity,
    });
  });
  
  // Add keyword results
  keywordResults.forEach((result, idx) => {
    const existing = resultMap.get(result.name);
    if (existing) {
      existing.keywordScore = result._additional.score;
      existing.keywordRank = idx + 1;
    } else {
      resultMap.set(result.name, {
        ...result,
        vectorScore: 0,
        vectorRank: Infinity,
        keywordScore: result._additional.score,
        keywordRank: idx + 1,
      });
    }
  });
  
  // Calculate hybrid score
  const results = Array.from(resultMap.values()).map(result => ({
    ...result,
    hybridScore: alpha * result.vectorScore + (1 - alpha) * result.keywordScore,
  }));
  
  // Sort by hybrid score
  results.sort((a, b) => b.hybridScore - a.hybridScore);
  
  return results;
}
```

### 1.5 Reranking (Optional)

```typescript
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

async function rerankResults(
  query: string,
  documents: any[],
  topN: number = 5
): Promise<any[]> {
  const response = await cohere.rerank({
    query,
    documents: documents.map(d => d.description || d.name),
    topN,
    model: 'rerank-multilingual-v3.0',
  });
  
  return response.results.map(result => documents[result.index]);
}
```

---

## 2. Prompt Engineering

### 2.1 System Prompt

```typescript
const SYSTEM_PROMPT = `
당신은 한국 쇼핑 전문가 AI 비서 "이거사"입니다.

## 역할
- 사용자가 최적의 제품을 찾도록 돕습니다
- 여러 쇼핑몰(쿠팡, 네이버, 11번가)의 가격을 비교합니다
- 리뷰와 스펙을 분석하여 추천합니다
- 모든 추천에는 명확한 근거를 제시합니다

## 말투
- 항상 존댓말(해요체)를 사용합니다
- 친근하고 전문적인 톤을 유지합니다
- 예시: "추천드릴게요", "확인해드릴게요", "도와드리겠습니다"

## 제약사항
- 항상 사실에 기반해야 합니다
- 제공된 제품 정보에만 의존합니다
- 모르는 것은 "정확한 정보를 찾지 못했어요"라고 답합니다
- 출처를 명시합니다 (예: "쿠팡 기준 ₩149,000")
- 가격은 정확히 표시합니다 (배송비 포함 총액)

## 추천 형식
1. 추천 제품 3개 (순위별로)
2. 각 제품마다:
   - 이름, 가격 (배송비 포함 총액)
   - 추천 이유 (구체적인 근거)
   - 주요 스펙
   - 리뷰 요약 (있는 경우)
3. 가격 비교 (여러 플랫폼)
`;
```

### 2.2 User Prompt Templates

```typescript
const PROMPT_TEMPLATES = {
  PRODUCT_SEARCH: `
사용자 검색: "{query}"

다음 제품들이 검색되었습니다:
{products}

위 제품들 중에서 사용자의 검색 의도에 가장 적합한 제품 3개를 추천해주세요.

각 추천마다 다음을 포함해주세요:
1. 제품명과 가격
2. 추천 이유 (구체적인 근거)
3. 주요 스펙
4. 사용자 리뷰 요약

존댓말(해요체)로 답변해주세요.
`,

  PRICE_COMPARISON: `
제품: "{productName}"

다음 플랫폼들의 가격 정보입니다:
{prices}

다음 정보를 포함하여 가격을 비교해주세요:
1. 최저가 플랫폼 강조
2. 배송비 포함 총액
3. 배송 속도 (로켓배송, 새벽배송 등)
4. 절약 금액
5. 추천 구매 플랫폼

존댓말(해요체)로 답변해주세요.
`,

  PRODUCT_COMPARISON: `
사용자가 다음 두 제품을 비교하고 싶어합니다:

제품 A: {productA}
제품 B: {productB}

다음 항목을 비교해주세요:
1. 가격 비교 (가성비)
2. 스펙 비교
3. 리뷰/평점 비교
4. 장단점
5. 추천 (어떤 경우에 어떤 제품이 나은지)

존댓말(해요체)로 답변해주세요.
`,

  NEGO_DEAL_EXPLAIN: `
제품: "{productName}"
현재가: ₩{currentPrice}
공동구매 인원: {currentParticipants}/{targetParticipants}명
예상 할인율: {discountRate}%
예상 최종가: ₩{finalPrice}

위 공동구매(네고딜)에 대해 설명하고 참여를 권유해주세요.
다음을 포함해주세요:
1. 공동구매 개념 간단 설명
2. 현재 진행 상황
3. 예상 절약 금액
4. 참여 방법
5. 마감 시간

존댓말(해요체)로 답변해주세요.
`,
};

// Usage
function buildPrompt(
  template: keyof typeof PROMPT_TEMPLATES,
  variables: Record<string, any>
): string {
  let prompt = PROMPT_TEMPLATES[template];
  
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  
  return prompt;
}
```

### 2.3 Few-Shot Examples

```typescript
const FEW_SHOT_EXAMPLES = [
  {
    user: "편한 러닝화 추천해줘",
    assistant: `편안한 착용감을 중시하는 러닝화를 찾고 계시네요. 쿠셔닝과 발 편안함에 초점을 맞춰 추천드릴게요.

🏃 추천 제품 Top 3:

1. **나이키 에어 줌 페가수스 40**
   💰 ₩149,000 (쿠팡 최저가, 무료배송)
   ⭐ 4.7/5.0 (1,234개 리뷰)
   
   ✨ 추천 이유:
   - 리뷰 89%가 "편하다" 평가
   - Zoom Air 쿠셔닝 기술로 부드러운 착지
   - 무게 280g으로 가벼움
   
   📊 주요 스펙:
   - 쿠셔닝: Zoom Air
   - 무게: 280g (US 9 기준)
   - 용도: 일상 러닝, 체육관

2. **아디다스 울트라부스트 23**
   💰 ₩169,000 (네이버 최저가, 무료배송)
   ⭐ 4.8/5.0 (892개 리뷰)
   
   ✨ 추천 이유:
   - Boost 폼 쿠셔닝, 최고급 편안함
   - "양말처럼 편하다"는 리뷰 다수
   - 장거리 러닝에 특화
   
   📊 주요 스펙:
   - 쿠셔닝: Boost Foam
   - 무게: 310g
   - 용도: 장거리 러닝

3. **호카 본디 8**
   💰 ₩189,000 (11번가, ₩2,500 배송비)
   ⭐ 4.9/5.0 (456개 리뷰)
   
   ✨ 추천 이유:
   - 최대 쿠셔닝 제공
   - 발 충격 최소화
   - 전문 러너들 추천
   
   📊 주요 스펙:
   - 쿠셔닝: 최대 두께
   - 무게: 295g
   - 용도: 장거리, 발 보호 중시

더 자세한 정보가 필요하시거나 다른 조건이 있으시면 말씀해 주세요!`
  },
  
  {
    user: "더 가벼운 건 없어?",
    assistant: `가벼운 러닝화를 찾고 계시군요! 무게를 최우선으로 다시 추천드릴게요.

🪶 가장 가벼운 러닝화 Top 3:

1. **나이키 베이퍼플라이 3**
   ⚖️ 무게: **184g** (US 9 기준)
   💰 ₩279,000 (쿠팡)
   ⭐ 4.6/5.0
   
   ✨ 특징:
   - 경량 레이싱화
   - 마라톤 선수용
   - 속도 중시 설계

2. **아디다스 아디제로 보스턴 12**
   ⚖️ 무게: **252g**
   💰 ₩189,000 (네이버)
   ⭐ 4.7/5.0
   
   ✨ 특징:
   - 경량 + 쿠셔닝 균형
   - 장거리도 가능
   - 일상 러닝에도 적합

3. **아식스 마법의 속도 4**
   ⚖️ 무게: **235g**
   💰 ₩159,000 (11번가)
   ⭐ 4.5/5.0
   
   ✨ 특징:
   - 가볍고 반응성 좋음
   - 템포 러닝에 최적
   - 가성비 우수

⚠️ 참고: 너무 가벼운 신발은 쿠셔닝이 적을 수 있어요. 발에 무리가 갈 수 있으니 주의해주세요!`
  },
];
```

---

## 3. Model Selection & Routing

### 3.1 Tier 정의

```typescript
enum LLMTier {
  SPEED = 'speed',      // Gemini 2.5 Flash-Lite (15%)
  PRIMARY = 'primary',   // GPT-5 or Solar Pro 2 (80%)
  COMPLEX = 'complex',   // Claude Sonnet 4.5 (5%)
}

interface ModelConfig {
  tier: LLMTier;
  model: string;
  maxTokens: number;
  temperature: number;
  costPer1MTokens: {
    input: number;
    output: number;
  };
}

const MODEL_CONFIGS: Record<LLMTier, ModelConfig> = {
  [LLMTier.SPEED]: {
    tier: LLMTier.SPEED,
    model: 'gemini-2.5-flash-lite',
    maxTokens: 1024,
    temperature: 0.3,
    costPer1MTokens: { input: 0.075, output: 0.30 },
  },
  [LLMTier.PRIMARY]: {
    tier: LLMTier.PRIMARY,
    model: 'gpt-5',  // or 'solar-pro-2'
    maxTokens: 2048,
    temperature: 0.5,
    costPer1MTokens: { input: 2.50, output: 10.00 },
  },
  [LLMTier.COMPLEX]: {
    tier: LLMTier.COMPLEX,
    model: 'claude-sonnet-4.5',
    maxTokens: 4096,
    temperature: 0.7,
    costPer1MTokens: { input: 3.00, output: 15.00 },
  },
};
```

### 3.2 Routing Logic

```typescript
function selectTier(
  query: string,
  context: {
    conversationLength: number;
    hasMultipleProducts: boolean;
    requiresReasoning: boolean;
  }
): LLMTier {
  // Simple queries → Speed tier
  const simplePatterns = [
    /^가격/,
    /^재고/,
    /^배송/,
    /얼마/,
    /있어요?$/,
  ];
  
  if (simplePatterns.some(p => p.test(query))) {
    return LLMTier.SPEED;
  }
  
  // Complex reasoning → Complex tier
  if (context.requiresReasoning || context.conversationLength > 5) {
    return LLMTier.COMPLEX;
  }
  
  // Comparison queries → Complex tier
  if (/비교|vs|대|어떤게/.test(query)) {
    return LLMTier.COMPLEX;
  }
  
  // Default → Primary tier
  return LLMTier.PRIMARY;
}
```

### 3.3 LLM Clients

```typescript
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

async function generateResponse(
  tier: LLMTier,
  systemPrompt: string,
  userPrompt: string,
  options: { stream?: boolean } = {}
): Promise<string | AsyncIterableIterator<string>> {
  const config = MODEL_CONFIGS[tier];
  
  switch (tier) {
    case LLMTier.SPEED:
      return await generateGemini(systemPrompt, userPrompt, config, options);
    
    case LLMTier.PRIMARY:
      return await generateGPT(systemPrompt, userPrompt, config, options);
    
    case LLMTier.COMPLEX:
      return await generateClaude(systemPrompt, userPrompt, config, options);
  }
}

async function generateGPT(
  system: string,
  user: string,
  config: ModelConfig,
  options: { stream?: boolean }
) {
  if (options.stream) {
    const stream = await openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    });
    
    return (async function* () {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) yield content;
      }
    })();
  }
  
  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: config.maxTokens,
    temperature: config.temperature,
  });
  
  return response.choices[0].message.content || '';
}

// Similar implementations for Gemini and Claude...
```

---

## 4. Cost Optimization

### 4.1 Semantic Caching

```typescript
import { createHash } from 'crypto';
import { redis } from '@/lib/redis';

interface CacheEntry {
  query: string;
  embedding: number[];
  response: string;
  tier: LLMTier;
  created_at: number;
}

async function semanticCache(
  query: string,
  generate: () => Promise<string>
): Promise<string> {
  // 1. Generate query embedding
  const embedding = await embedQuery(query);
  
  // 2. Search for similar cached queries
  const cacheKey = `semantic_cache:${hashEmbedding(embedding)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    const entry: CacheEntry = JSON.parse(cached);
    const similarity = cosineSimilarity(embedding, entry.embedding);
    
    if (similarity > 0.95 && Date.now() - entry.created_at < 3600000) {  // 1 hour
      console.log('Cache HIT:', entry.query, `(${similarity.toFixed(3)})`);
      return entry.response;
    }
  }
  
  // 3. Cache MISS → Generate new
  console.log('Cache MISS');
  const response = await generate();
  
  // 4. Store in cache
  const entry: CacheEntry = {
    query,
    embedding,
    response,
    tier: LLMTier.PRIMARY,
    created_at: Date.now(),
  };
  
  await redis.setex(cacheKey, 3600, JSON.stringify(entry));
  
  return response;
}

function hashEmbedding(embedding: number[]): string {
  return createHash('md5')
    .update(embedding.join(','))
    .digest('hex');
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

### 4.2 Token Counting

```typescript
import { encode } from 'gpt-tokenizer';

function countTokens(text: string): number {
  return encode(text).length;
}

function estimateCost(
  inputTokens: number,
  outputTokens: number,
  tier: LLMTier
): number {
  const config = MODEL_CONFIGS[tier];
  const inputCost = (inputTokens / 1_000_000) * config.costPer1MTokens.input;
  const outputCost = (outputTokens / 1_000_000) * config.costPer1MTokens.output;
  return inputCost + outputCost;
}

// Track costs
async function generateWithCostTracking(
  tier: LLMTier,
  system: string,
  user: string
): Promise<{ response: string; cost: number }> {
  const inputTokens = countTokens(system + user);
  
  const response = await generateResponse(tier, system, user);
  
  const outputTokens = countTokens(response as string);
  const cost = estimateCost(inputTokens, outputTokens, tier);
  
  // Log to analytics
  await logCost(tier, inputTokens, outputTokens, cost);
  
  return { response: response as string, cost };
}
```

### 4.3 Cost Monitoring

```typescript
interface CostMetrics {
  total_cost: number;
  requests_count: number;
  average_cost_per_request: number;
  by_tier: Record<LLMTier, {
    cost: number;
    requests: number;
  }>;
}

async function getCostMetrics(
  startDate: Date,
  endDate: Date
): Promise<CostMetrics> {
  const logs = await db.llm_logs.findMany({
    where: {
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  
  const metrics: CostMetrics = {
    total_cost: 0,
    requests_count: logs.length,
    average_cost_per_request: 0,
    by_tier: {
      [LLMTier.SPEED]: { cost: 0, requests: 0 },
      [LLMTier.PRIMARY]: { cost: 0, requests: 0 },
      [LLMTier.COMPLEX]: { cost: 0, requests: 0 },
    },
  };
  
  for (const log of logs) {
    metrics.total_cost += log.cost;
    metrics.by_tier[log.tier].cost += log.cost;
    metrics.by_tier[log.tier].requests += 1;
  }
  
  metrics.average_cost_per_request = 
    metrics.total_cost / metrics.requests_count;
  
  return metrics;
}
```

---

## 5. Quality Assurance

### 5.1 Response Validation

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateResponse(response: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };
  
  // Check for hallucinations
  if (response.includes('확인되지 않은')) {
    result.errors.push('Response contains unverified claims');
    result.valid = false;
  }
  
  // Check for prices without source
  const priceRegex = /₩[\d,]+/g;
  const prices = response.match(priceRegex);
  if (prices && !response.includes('쿠팡') && !response.includes('네이버')) {
    result.warnings.push('Prices mentioned without platform source');
  }
  
  // Check for 존댓말
  if (!response.includes('요') && !response.includes('습니다')) {
    result.errors.push('Response not in 존댓말');
    result.valid = false;
  }
  
  // Check length
  if (response.length < 50) {
    result.warnings.push('Response too short');
  }
  
  return result;
}
```

### 5.2 A/B Testing

```typescript
interface ABTest {
  id: string;
  name: string;
  variants: {
    control: ModelConfig;
    treatment: ModelConfig;
  };
  allocation: number;  // 0.5 = 50/50 split
}

async function runABTest(
  test: ABTest,
  query: string
): Promise<{ response: string; variant: 'control' | 'treatment' }> {
  const variant = Math.random() < test.allocation ? 'treatment' : 'control';
  const config = test.variants[variant];
  
  const response = await generateResponse(
    config.tier,
    SYSTEM_PROMPT,
    query
  );
  
  // Log for analysis
  await db.ab_test_logs.create({
    data: {
      test_id: test.id,
      variant,
      query,
      response,
      timestamp: new Date(),
    },
  });
  
  return { response: response as string, variant };
}
```

---

**문서 끝**

다음: [Frontend Implementation](./05_Frontend_Guide.md)
