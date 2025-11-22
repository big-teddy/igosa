# 🗄️ Supabase 설정 가이드

**프로젝트**: igosa-production
**URL**: https://gaceyqigufvasshjifnl.supabase.co
**대시보드**: https://supabase.com/dashboard/project/gaceyqigufvasshjifnl

---

## ✅ 완료된 작업

1. **프로젝트 생성** ✅
   - 이름: `igosa-production`
   - 리전: Northeast Asia (Seoul)
   - Project ID: `gaceyqigufvasshjifnl`

2. **환경변수 설정** ✅
   - `.env.local` 파일 생성 완료
   - Supabase URL 및 API Keys 설정 완료

---

## 🔧 남은 작업

### Step 1: 데이터베이스 스키마 적용 (5분)

#### 1-1. Supabase SQL Editor 접속
1. **대시보드 열기**: https://supabase.com/dashboard/project/gaceyqigufvasshjifnl
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. **New query** 버튼 클릭

#### 1-2. 스키마 생성 SQL 실행

**파일**: `supabase/migrations/20251117_create_price_tracking.sql`

SQL Editor에 아래 내용을 복사하여 붙여넣고 **Run** 버튼 클릭:

```sql
-- Price Tracking 2.0 Database Schema
-- Created: 2025-11-17

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Price Tracking Status Enum
CREATE TYPE price_tracking_status AS ENUM (
  'active',
  'triggered',
  'paused',
  'expired',
  'cancelled'
);

-- Notification Channel Enum
CREATE TYPE notification_channel AS ENUM (
  'push',
  'email',
  'kakao',
  'sms'
);

-- Price Tracking Table
CREATE TABLE IF NOT EXISTS price_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,

  -- Price Information
  target_price INTEGER NOT NULL,
  current_price INTEGER NOT NULL,
  max_acceptable_delta INTEGER DEFAULT 3000,

  -- Notification Settings
  notification_channels notification_channel[] DEFAULT ARRAY['push']::notification_channel[],
  notify_on_threshold BOOLEAN DEFAULT true,
  notify_on_negotiation BOOLEAN DEFAULT true,

  -- Auto Purchase (Phase 3)
  auto_purchase BOOLEAN DEFAULT false,
  auto_purchase_max_price INTEGER,

  -- Status & Metadata
  status price_tracking_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  triggered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Statistics
  estimated_probability DECIMAL(3, 2),
  similar_users_count INTEGER DEFAULT 0,

  -- Unique constraint
  CONSTRAINT price_tracking_user_product_unique UNIQUE (user_id, product_id, status)
);

-- Indexes for performance
CREATE INDEX idx_price_tracking_user_id ON price_tracking(user_id);
CREATE INDEX idx_price_tracking_product_id ON price_tracking(product_id);
CREATE INDEX idx_price_tracking_status ON price_tracking(status);
CREATE INDEX idx_price_tracking_created_at ON price_tracking(created_at DESC);

-- Price History Table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock_status TEXT DEFAULT 'in_stock',
  shipping_method TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  source TEXT DEFAULT 'manual',
  confidence DECIMAL(3, 2) DEFAULT 1.00
);

-- Indexes for price history
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at DESC);
CREATE INDEX idx_price_history_product_platform ON price_history(product_id, platform);

-- Price Alerts Table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id UUID REFERENCES price_tracking(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,

  -- Price Information
  target_price INTEGER NOT NULL,
  current_price INTEGER NOT NULL,
  price_drop_amount INTEGER NOT NULL,
  price_drop_percentage DECIMAL(5, 2) NOT NULL,

  -- Alert Metadata
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  notified BOOLEAN DEFAULT false,

  -- CTA
  purchase_url TEXT,
  deep_link TEXT
);

-- Indexes for alerts
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_triggered_at ON price_alerts(triggered_at DESC);
CREATE INDEX idx_price_alerts_notified ON price_alerts(notified) WHERE notified = false;

-- Demand Aggregation View
CREATE MATERIALIZED VIEW IF NOT EXISTS demand_aggregation AS
SELECT
  product_id,
  COUNT(DISTINCT user_id) as total_users,
  AVG(target_price)::INTEGER as avg_target_price,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY target_price)::INTEGER as median_target_price,
  MIN(target_price) as min_target_price,
  MAX(target_price) as max_target_price,
  FLOOR(target_price / 10000) * 10000 as price_bucket,
  COUNT(*) as bucket_count
FROM price_tracking
WHERE status = 'active'
GROUP BY product_id, price_bucket;

-- Index for demand aggregation view
CREATE UNIQUE INDEX idx_demand_agg_product_bucket ON demand_aggregation(product_id, price_bucket);

-- Function to refresh demand aggregation
CREATE OR REPLACE FUNCTION refresh_demand_aggregation()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY demand_aggregation;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate estimated probability
CREATE OR REPLACE FUNCTION calculate_probability(
  p_target_price INTEGER,
  p_current_price INTEGER,
  p_min_price INTEGER,
  p_avg_price INTEGER
) RETURNS DECIMAL(3, 2) AS $$
DECLARE
  probability DECIMAL(3, 2);
  price_range INTEGER;
  position INTEGER;
  ratio DECIMAL(3, 2);
BEGIN
  IF p_target_price >= p_current_price THEN
    RETURN 0.95;
  END IF;

  IF p_target_price <= p_min_price THEN
    RETURN 0.15;
  END IF;

  price_range := p_current_price - p_min_price;
  position := p_current_price - p_target_price;
  ratio := position::DECIMAL / price_range::DECIMAL;

  probability := 0.15 + (ratio * 0.80);

  RETURN LEAST(GREATEST(probability, 0.00), 1.00);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update similar_users_count
CREATE OR REPLACE FUNCTION update_similar_users_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE price_tracking pt
  SET similar_users_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM price_tracking
    WHERE product_id = NEW.product_id
      AND status = 'active'
      AND target_price BETWEEN (NEW.target_price * 0.95) AND (NEW.target_price * 1.05)
      AND id != NEW.id
  )
  WHERE pt.id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_similar_users
AFTER INSERT OR UPDATE ON price_tracking
FOR EACH ROW
EXECUTE FUNCTION update_similar_users_count();

-- Comments for documentation
COMMENT ON TABLE price_tracking IS 'User price tracking records for NegoDeal 2.0';
COMMENT ON TABLE price_history IS 'Historical price data from various platforms';
COMMENT ON TABLE price_alerts IS 'Triggered price alerts when target price is reached';
COMMENT ON MATERIALIZED VIEW demand_aggregation IS 'Real-time demand aggregation by product and price tier';
```

**예상 결과**: `Success. No rows returned`

---

### Step 2: 성능 인덱스 적용 (5분)

새 쿼리 창에서 아래 SQL 실행:

**파일**: `supabase/migrations/20250119_add_performance_indexes.sql`

```sql
-- Performance Indexes for Price Tracking 2.0
-- Phase 1: Critical Priority Indexes
-- Created: 2025-01-19

-- Priority 1: User Activity Queries
-- Query: "내 활성 알림 목록" (가장 자주 사용)
CREATE INDEX IF NOT EXISTS idx_price_tracking_user_status
ON price_tracking(user_id, status)
WHERE status = 'active';

-- Query: "제품별 활성 참여자 수"
CREATE INDEX IF NOT EXISTS idx_price_tracking_product_status
ON price_tracking(product_id, status)
WHERE status = 'active';

-- Priority 2: Time-based Queries
-- Query: "최근 업데이트된 알림"
CREATE INDEX IF NOT EXISTS idx_price_tracking_updated
ON price_tracking(updated_at DESC)
WHERE status = 'active';

-- Query: "만료된 알림 정리"
CREATE INDEX IF NOT EXISTS idx_price_tracking_expires
ON price_tracking(expires_at)
WHERE status = 'active' AND expires_at IS NOT NULL;

-- Priority 3: Status Management
-- Query: "상태별 알림 조회"
CREATE INDEX IF NOT EXISTS idx_price_tracking_status_created
ON price_tracking(status, created_at DESC);

-- Priority 4: Price History Performance
-- Query: "제품의 최근 가격 이력"
CREATE INDEX IF NOT EXISTS idx_price_history_product_time
ON price_history(product_id, recorded_at DESC);

-- Query: "플랫폼별 최근 가격"
CREATE INDEX IF NOT EXISTS idx_price_history_product_platform_time
ON price_history(product_id, platform, recorded_at DESC);

-- Priority 5: Alerts Performance
-- Query: "미읽은 알림 조회"
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_notified
ON price_alerts(user_id, notified, triggered_at DESC);

-- Query: "제품별 알림 이력"
CREATE INDEX IF NOT EXISTS idx_price_alerts_product_time
ON price_alerts(product_id, triggered_at DESC);

-- Priority 6: Covering Indexes (Query 성능 극대화)
-- Query: "내 알림 목록 + 기본 정보"
CREATE INDEX IF NOT EXISTS idx_price_tracking_user_cover
ON price_tracking(user_id, status, updated_at DESC)
INCLUDE (product_id, product_name, target_price, current_price, similar_users_count);

-- Priority 7: Composite Indexes for Complex Queries
-- Query: "제품별 가격대 분포"
CREATE INDEX IF NOT EXISTS idx_price_tracking_product_price
ON price_tracking(product_id, target_price)
WHERE status = 'active';

-- Query: "비슷한 참여자 찾기"
CREATE INDEX IF NOT EXISTS idx_price_tracking_similar_users
ON price_tracking(product_id, target_price, status);

-- Priority 8: Demand Aggregation Performance
-- Materialized View를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_demand_agg_product
ON demand_aggregation(product_id);

CREATE INDEX IF NOT EXISTS idx_demand_agg_users
ON demand_aggregation(total_users DESC);

-- Verify indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (indexname LIKE 'idx_%' OR indexname LIKE 'price_%')
ORDER BY tablename, indexname;
```

**예상 결과**: 인덱스 목록이 표시됨

---

### Step 3: 테스트 데이터 삽입 (선택사항)

```sql
-- 테스트 사용자 데이터
INSERT INTO price_tracking (
  user_id,
  product_id,
  product_name,
  target_price,
  current_price,
  estimated_probability,
  similar_users_count
) VALUES
  ('user-1', 'nike-pegasus-40', '나이키 에어 줌 페가수스 40', 120000, 149000, 0.75, 0),
  ('user-2', 'nike-pegasus-40', '나이키 에어 줌 페가수스 40', 115000, 149000, 0.65, 0),
  ('user-3', 'nike-pegasus-40', '나이키 에어 줌 페가수스 40', 125000, 149000, 0.80, 0);

-- Demand aggregation 새로고침
SELECT refresh_demand_aggregation();

-- 결과 확인
SELECT * FROM demand_aggregation;
```

---

### Step 4: 연결 테스트

로컬에서 테스트:

```bash
cd /Users/sunghyunkim/igosa
npm run dev
```

브라우저에서 확인:
- http://localhost:3000
- 제품 상세 페이지에서 네고딜 위젯 확인

---

## 🔐 환경변수 설정 완료

### 로컬 개발 (.env.local) ✅
```bash
NEXT_PUBLIC_SUPABASE_URL="https://gaceyqigufvasshjifnl.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbG..."
```

### Vercel 프로덕션 (필요 시 설정)
```bash
# Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL="https://gaceyqigufvasshjifnl.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbG..."
NEXT_PUBLIC_ROLLOUT_PERCENT="100"
```

---

## ✅ 체크리스트

- [x] Supabase 프로젝트 생성
- [x] 로컬 환경변수 설정
- [ ] 스키마 SQL 실행 (Step 1)
- [ ] 성능 인덱스 SQL 실행 (Step 2)
- [ ] 테스트 데이터 삽입 (Step 3)
- [ ] 로컬 개발 서버 테스트 (Step 4)
- [ ] Vercel 환경변수 설정 (배포 시)

---

## 📊 예상 성능 개선

인덱스 적용 후:
- 사용자 알림 조회: **300ms → 5ms** (60배 향상)
- 제품별 참여자 수: **500ms → 8ms** (62배 향상)
- 수요 집계: **1200ms → 15ms** (80배 향상)

---

**작성**: 2025-01-20
**프로젝트**: igosa-production
**담당자**: Claude & User
