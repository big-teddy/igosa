-- Enable Realtime for negotiations and events
-- Created: 2025-12-04

-- 1. Check if publication exists, if not create it (standard Supabase setup usually has this)
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
--     CREATE PUBLICATION supabase_realtime;
--   END IF;
-- END
-- $$;

-- 2. Add tables to the publication to enable realtime events
ALTER PUBLICATION supabase_realtime ADD TABLE negotiations;
ALTER PUBLICATION supabase_realtime ADD TABLE negotiation_events;

-- 3. Ensure RLS policies allow reading (already set up, but good to verify)
-- Realtime respects RLS policies. Users must have SELECT permission to receive updates.
