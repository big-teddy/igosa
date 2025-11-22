-- Performance Indexes for Price Tracking
-- Generated: 2025-01-20

-- price_tracking table indexes
CREATE INDEX IF NOT EXISTS idx_price_tracking_user_status
  ON price_tracking(user_id, status)
  WHERE status IN ('active', 'triggered');

CREATE INDEX IF NOT EXISTS idx_price_tracking_product_status
  ON price_tracking(product_id, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_price_tracking_created
  ON price_tracking(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_tracking_status
  ON price_tracking(status);

-- price_history table indexes  
CREATE INDEX IF NOT EXISTS idx_price_history_product_recorded
  ON price_history(product_id, recorded_at DESC);

-- price_alerts table indexes
CREATE INDEX IF NOT EXISTS idx_price_alerts_user
  ON price_alerts(user_id, triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_alerts_product
  ON price_alerts(product_id, triggered_at DESC);

-- Verify indexes created
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('price_tracking', 'price_history', 'price_alerts')
ORDER BY tablename, indexname;
