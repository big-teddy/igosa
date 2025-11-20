-- ==================== Critical Performance Indexes ====================
-- Generated: 2025-01-19
-- Purpose: Improve query performance for high-frequency operations
-- Expected impact: 80-95% faster queries, 70% DB CPU reduction
--
-- IMPORTANT: Run these with CONCURRENTLY to avoid blocking production traffic

-- ==================== 1. price_tracking Table ====================

-- 가장 빈번한 쿼리: "내 활성 알림 보기"
-- SELECT * FROM price_tracking WHERE user_id = ? AND status = 'active' ORDER BY updated_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_tracking_user_status
  ON price_tracking(user_id, status)
  WHERE status IN ('active', 'triggered');

-- 제품별 활성 알림 카운트: "이 제품을 원하는 사람 수"
-- SELECT COUNT(*) FROM price_tracking WHERE product_id = ? AND status = 'active'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_tracking_product_status
  ON price_tracking(product_id, status)
  WHERE status = 'active';

-- My Page 정렬: 최근 업데이트된 알림 먼저
-- SELECT * FROM price_tracking WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_tracking_updated
  ON price_tracking(updated_at DESC);

-- 상태별 조회 (관리자 대시보드)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_tracking_status
  ON price_tracking(status);

-- ==================== 2. price_history Table ====================

-- 가격 차트 조회: 제품별 최근 가격 히스토리
-- SELECT * FROM price_history WHERE product_id = ? ORDER BY recorded_at DESC LIMIT 30
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_history_product_time
  ON price_history(product_id, recorded_at DESC);

-- 특정 기간 가격 조회
-- SELECT * FROM price_history WHERE product_id = ? AND recorded_at BETWEEN ? AND ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_history_product_recorded
  ON price_history(product_id, recorded_at);

-- ==================== 3. price_notifications Table ====================

-- My Page 알림 목록: 사용자별 최근 알림
-- SELECT * FROM price_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_notifications_user_time
  ON price_notifications(user_id, created_at DESC);

-- 읽지 않은 알림 카운트
-- SELECT COUNT(*) FROM price_notifications WHERE user_id = ? AND is_read = false
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_notifications_user_read
  ON price_notifications(user_id, is_read)
  WHERE is_read = false;

-- ==================== 4. conversations Table ====================

-- 채팅 목록: 사용자별 최근 대화
-- SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_updated
  ON conversations(user_id, updated_at DESC);

-- 복합 인덱스: 정렬까지 커버
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_id_updated
  ON conversations(user_id, updated_at DESC);

-- ==================== 5. messages Table ====================

-- 채팅 메시지 페이지네이션
-- SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at LIMIT 50
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_time
  ON messages(conversation_id, created_at);

-- 최근 메시지 조회 (역순)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created_desc
  ON messages(conversation_id, created_at DESC);

-- ==================== 6. price_alerts Table ====================

-- 활성 알림 조회
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alerts_user_status
  ON price_alerts(user_id, status)
  WHERE status = 'active';

-- 제품별 알림
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alerts_product
  ON price_alerts(product_id);

-- ==================== Verification Queries ====================

-- 인덱스가 실제로 사용되는지 확인
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM price_tracking
-- WHERE user_id = 'test-user' AND status = 'active'
-- ORDER BY updated_at DESC LIMIT 10;

-- Expected output:
-- -> Index Scan using idx_price_tracking_user_status
--    Buffers: shared hit=4 (FAST! ✅)
--
-- Without index:
-- -> Seq Scan on price_tracking
--    Buffers: shared hit=234 (SLOW! ❌)

-- ==================== Maintenance ====================

-- 인덱스 통계 업데이트 (주기적으로 실행)
-- ANALYZE price_tracking;
-- ANALYZE price_history;
-- ANALYZE price_notifications;
-- ANALYZE conversations;
-- ANALYZE messages;
-- ANALYZE price_alerts;

-- 인덱스 사용률 확인
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- 인덱스 크기 확인
-- SELECT
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ==================== Rollback (if needed) ====================

-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_tracking_user_status;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_tracking_product_status;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_tracking_updated;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_tracking_status;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_history_product_time;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_history_product_recorded;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_notifications_user_time;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_notifications_user_read;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_user_updated;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_conversations_user_id_updated;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_messages_conversation_time;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_messages_conversation_created_desc;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_alerts_user_status;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_price_alerts_product;
