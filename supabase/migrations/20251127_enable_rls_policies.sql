-- Enable Row Level Security Policies
-- Created: 2025-11-27
-- Purpose: Secure user data access with RLS policies

-- ============================================================================
-- PRICE_TRACKING TABLE
-- ============================================================================

-- Enable RLS on price_tracking table
ALTER TABLE price_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own price tracking records
CREATE POLICY "Users can view own price trackings"
  ON price_tracking
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can insert their own price tracking records
CREATE POLICY "Users can insert own price trackings"
  ON price_tracking
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can update their own price tracking records
CREATE POLICY "Users can update own price trackings"
  ON price_tracking
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can delete their own price tracking records
CREATE POLICY "Users can delete own price trackings"
  ON price_tracking
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role has full access to price_tracking"
  ON price_tracking
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ============================================================================
-- PRICE_HISTORY TABLE
-- ============================================================================

-- Enable RLS on price_history table
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read price history
CREATE POLICY "Authenticated users can view price history"
  ON price_history
  FOR SELECT
  USING (true); -- Allow all authenticated users to read

-- Policy: Only service role can insert/update/delete price history
CREATE POLICY "Service role has full access to price_history"
  ON price_history
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ============================================================================
-- PRICE_ALERTS TABLE
-- ============================================================================

-- Enable RLS on price_alerts table
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own price alerts
CREATE POLICY "Users can view own price alerts"
  ON price_alerts
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can update their own alerts (mark as read, etc.)
CREATE POLICY "Users can update own price alerts"
  ON price_alerts
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Service role can manage all alerts
CREATE POLICY "Service role has full access to price_alerts"
  ON price_alerts
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's email from JWT
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'email';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user is service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- TESTING & VERIFICATION
-- ============================================================================

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('price_tracking', 'price_history', 'price_alerts')
ORDER BY tablename;

-- Verify policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('price_tracking', 'price_history', 'price_alerts')
ORDER BY tablename, policyname;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own price trackings" ON price_tracking
  IS 'Users can only SELECT their own price tracking records';

COMMENT ON POLICY "Users can view own price alerts" ON price_alerts
  IS 'Users can only SELECT their own price alerts';

COMMENT ON POLICY "Authenticated users can view price history" ON price_history
  IS 'All authenticated users can view price history for research purposes';
