-- Social Invitations and Rewards System
-- Created: 2025-12-04

-- =====================================================
-- 1. INVITATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
  code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'used')),
  reward_amount INTEGER DEFAULT 1000,
  reward_claimed BOOLEAN DEFAULT FALSE,
  source VARCHAR(50) DEFAULT 'kakao', -- kakao, link, etc
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes for performance
CREATE INDEX idx_invitations_code ON invitations(code);
CREATE INDEX idx_invitations_inviter ON invitations(inviter_id);
CREATE INDEX idx_invitations_invitee ON invitations(invitee_id);
CREATE INDEX idx_invitations_negotiation ON invitations(negotiation_id);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_created ON invitations(created_at DESC);

-- =====================================================
-- 2. REWARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- invitation_sent, invitation_accepted, purchase_completed
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Indexes
CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_invitation ON rewards(invitation_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_created ON rewards(created_at DESC);

-- =====================================================
-- 3. SHARE EVENTS TABLE (Analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS share_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  platform VARCHAR(50) NOT NULL, -- kakao, link, twitter, etc
  event_type VARCHAR(50) NOT NULL, -- share_clicked, share_completed, link_opened
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_share_events_user ON share_events(user_id);
CREATE INDEX idx_share_events_negotiation ON share_events(negotiation_id);
CREATE INDEX idx_share_events_platform ON share_events(platform);
CREATE INDEX idx_share_events_created ON share_events(created_at DESC);

-- =====================================================
-- 4. USER STATS TABLE (Denormalized for performance)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_social_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_invitations_sent INTEGER DEFAULT 0,
  total_invitations_accepted INTEGER DEFAULT 0,
  total_rewards_earned INTEGER DEFAULT 0,
  total_rewards_claimed INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  viral_score DECIMAL(5,2) DEFAULT 0, -- invitations_accepted / invitations_sent
  last_share_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

-- Invitations: Users can view their own invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invitations"
  ON invitations FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their own invitations"
  ON invitations FOR UPDATE
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Rewards: Users can only view their own rewards
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
  ON rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can claim their own rewards"
  ON rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- Share events: Users can view their own events
ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own share events"
  ON share_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create share events"
  ON share_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User stats: Users can view their own stats
ALTER TABLE user_social_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats"
  ON user_social_stats FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. FUNCTIONS
-- =====================================================

-- Function to update user social stats
CREATE OR REPLACE FUNCTION update_user_social_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update stats
  INSERT INTO user_social_stats (user_id, total_invitations_sent, updated_at)
  VALUES (NEW.inviter_id, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_invitations_sent = user_social_stats.total_invitations_sent + 1,
    last_share_at = NOW(),
    updated_at = NOW();
  
  -- If invitation accepted, update acceptance stats
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE user_social_stats
    SET 
      total_invitations_accepted = total_invitations_accepted + 1,
      viral_score = CASE 
        WHEN total_invitations_sent > 0 
        THEN (total_invitations_accepted + 1)::DECIMAL / total_invitations_sent 
        ELSE 0 
      END,
      updated_at = NOW()
    WHERE user_id = NEW.inviter_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invitation stats
CREATE TRIGGER update_stats_on_invitation
  AFTER INSERT OR UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_social_stats();

-- Function to auto-expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. VIEWS
-- =====================================================

-- View for invitation analytics
CREATE OR REPLACE VIEW invitation_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  source,
  COUNT(*) as total_invitations,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted_invitations,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_invitations,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'accepted')::DECIMAL / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as acceptance_rate
FROM invitations
GROUP BY DATE_TRUNC('day', created_at), source
ORDER BY date DESC;

-- View for top inviters
CREATE OR REPLACE VIEW top_inviters AS
SELECT 
  u.id as user_id,
  u.email,
  uss.total_invitations_sent,
  uss.total_invitations_accepted,
  uss.viral_score,
  uss.total_rewards_earned
FROM user_social_stats uss
JOIN auth.users u ON u.id = uss.user_id
ORDER BY uss.total_invitations_accepted DESC
LIMIT 100;

-- =====================================================
-- 8. SAMPLE DATA (for testing)
-- =====================================================

-- This will be run separately in development
-- INSERT INTO invitations (inviter_id, code, negotiation_id, source)
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   'TEST1234',
--   (SELECT id FROM negotiations LIMIT 1),
--   'kakao'
-- );
