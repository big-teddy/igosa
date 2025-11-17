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
  
  -- Statistics
  estimated_probability DECIMAL(3, 2), -- 0.00 to 1.00
  similar_users_count INTEGER DEFAULT 0,
  
  -- Indexes
  CONSTRAINT price_tracking_user_product_unique UNIQUE (user_id, product_id, status)
);

-- Indexes for performance
CREATE INDEX idx_price_tracking_user_id ON price_tracking(user_id);
CREATE INDEX idx_price_tracking_product_id ON price_tracking(product_id);
CREATE INDEX idx_price_tracking_status ON price_tracking(status);
CREATE INDEX idx_price_tracking_created_at ON price_tracking(created_at DESC);

-- Price History Table (for historical price data)
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

-- Price Alerts Table (when target price is reached)
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

-- Demand Aggregation View (real-time)
-- This will be replaced by Redis Sorted Sets in Phase 2
CREATE MATERIALIZED VIEW IF NOT EXISTS demand_aggregation AS
SELECT
  product_id,
  COUNT(DISTINCT user_id) as total_users,
  AVG(target_price)::INTEGER as avg_target_price,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY target_price)::INTEGER as median_target_price,
  MIN(target_price) as min_target_price,
  MAX(target_price) as max_target_price,
  -- Price tiers (bucketed by 10k increments)
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
  -- If target >= current, very high probability
  IF p_target_price >= p_current_price THEN
    RETURN 0.95;
  END IF;
  
  -- If target <= min, low probability
  IF p_target_price <= p_min_price THEN
    RETURN 0.15;
  END IF;
  
  -- Calculate position in range
  price_range := p_current_price - p_min_price;
  position := p_current_price - p_target_price;
  ratio := position::DECIMAL / price_range::DECIMAL;
  
  -- Linear interpolation: 15% at min, 95% at current
  probability := 0.15 + (ratio * 0.80);
  
  RETURN LEAST(GREATEST(probability, 0.00), 1.00);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update similar_users_count
CREATE OR REPLACE FUNCTION update_similar_users_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update similar users count for the same product with similar target price (±5%)
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

-- Sample data for testing (optional)
-- INSERT INTO price_tracking (user_id, product_id, product_name, target_price, current_price)
-- VALUES ('user-1', 'nike-pegasus-40', '나이키 에어 줌 페가수스 40', 120000, 149000);
