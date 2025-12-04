-- Phase 1: AI Negotiation Engine - Database Schema
-- Migration: 20251204_create_negotiation_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Negotiations Table (협상 세션)
CREATE TABLE IF NOT EXISTS negotiations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status: 'pending', 'triggered', 'in_progress', 'accepted', 'rejected', 'expired', 'completed'
  
  -- 수요 정보
  total_participants INT NOT NULL DEFAULT 0,
  target_price DECIMAL(10, 2) NOT NULL,
  avg_target_price DECIMAL(10, 2) NOT NULL,
  peak_demand_price DECIMAL(10, 2),
  
  -- AI 제안
  ai_proposed_price DECIMAL(10, 2),
  ai_proposed_volume INT,
  ai_reasoning JSONB,
  ai_confidence_score DECIMAL(5, 4), -- 0.0000 ~ 1.0000
  
  -- 판매자 응답
  seller_id UUID REFERENCES auth.users(id),
  seller_response VARCHAR(50), -- 'accepted', 'rejected', 'counter'
  seller_counter_price DECIMAL(10, 2),
  seller_reasoning TEXT,
  seller_responded_at TIMESTAMP,
  
  -- 최종 결과
  final_price DECIMAL(10, 2),
  final_volume INT,
  success_rate DECIMAL(5, 2), -- 0.00 ~ 100.00
  actual_conversions INT DEFAULT 0,
  
  -- 타임스탬프
  triggered_at TIMESTAMP,
  proposal_sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'triggered', 'in_progress', 'accepted', 'rejected', 'expired', 'completed')),
  CONSTRAINT valid_seller_response CHECK (seller_response IS NULL OR seller_response IN ('accepted', 'rejected', 'counter')),
  CONSTRAINT positive_participants CHECK (total_participants >= 0),
  CONSTRAINT positive_prices CHECK (
    target_price > 0 AND
    avg_target_price > 0 AND
    (ai_proposed_price IS NULL OR ai_proposed_price > 0) AND
    (seller_counter_price IS NULL OR seller_counter_price > 0) AND
    (final_price IS NULL OR final_price > 0)
  )
);

-- Indexes for negotiations
CREATE INDEX idx_negotiations_product ON negotiations(product_id);
CREATE INDEX idx_negotiations_status ON negotiations(status);
CREATE INDEX idx_negotiations_seller ON negotiations(seller_id);
CREATE INDEX idx_negotiations_created ON negotiations(created_at DESC);
CREATE INDEX idx_negotiations_expires ON negotiations(expires_at) WHERE status IN ('triggered', 'in_progress');

-- 2. Negotiation Events Table (협상 이벤트 로그)
CREATE TABLE IF NOT EXISTS negotiation_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  
  event_type VARCHAR(100) NOT NULL,
  -- Types: 'demand_milestone', 'ai_analysis', 'ai_proposal', 'seller_response', 
  --        'deal_accepted', 'deal_rejected', 'deal_expired', 'user_notified'
  event_data JSONB NOT NULL DEFAULT '{}',
  message TEXT NOT NULL,
  impact VARCHAR(20) DEFAULT 'neutral', -- 'positive', 'neutral', 'negative'
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_impact CHECK (impact IN ('positive', 'neutral', 'negative'))
);

-- Indexes for negotiation_events
CREATE INDEX idx_negotiation_events_negotiation ON negotiation_events(negotiation_id);
CREATE INDEX idx_negotiation_events_type ON negotiation_events(event_type);
CREATE INDEX idx_negotiation_events_created ON negotiation_events(created_at DESC);

-- 3. Seller Profiles Table (판매자 프로필)
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  company_name VARCHAR(255) NOT NULL,
  business_number VARCHAR(50),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  website_url VARCHAR(500),
  
  -- 협상 설정
  auto_negotiate BOOLEAN DEFAULT false,
  min_margin_percent DECIMAL(5, 2) DEFAULT 15.0,
  min_volume INT DEFAULT 50,
  max_discount_percent DECIMAL(5, 2) DEFAULT 30.0,
  
  -- AI 자동 수락 조건
  auto_accept_config JSONB DEFAULT '{"enabled": false, "min_volume": 100, "min_margin": 15, "min_price": 0}',
  
  -- 통계
  total_negotiations INT DEFAULT 0,
  successful_negotiations INT DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  avg_response_time_hours DECIMAL(10, 2),
  
  -- 상태
  status VARCHAR(50) DEFAULT 'pending',
  -- Status: 'pending', 'active', 'suspended', 'inactive'
  verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_seller_status CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  CONSTRAINT valid_margins CHECK (
    min_margin_percent >= 0 AND min_margin_percent <= 100 AND
    max_discount_percent >= 0 AND max_discount_percent <= 100
  ),
  CONSTRAINT unique_seller_user UNIQUE (user_id)
);

-- Indexes for seller_profiles
CREATE INDEX idx_seller_profiles_user ON seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_status ON seller_profiles(status);
CREATE INDEX idx_seller_profiles_verified ON seller_profiles(verified);

-- 4. Social Invitations Table (소셜 초대)
CREATE TABLE IF NOT EXISTS social_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 초대자/피초대자
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255),
  invitee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- 연결된 네고딜
  negotiation_id UUID REFERENCES negotiations(id) ON DELETE SET NULL,
  product_id VARCHAR(255),
  
  -- 공유 채널
  share_channel VARCHAR(50) DEFAULT 'kakao', -- 'kakao', 'link', 'email', 'sms'
  share_url TEXT,
  
  -- 상태
  status VARCHAR(50) DEFAULT 'pending',
  -- Status: 'pending', 'accepted', 'expired', 'cancelled'
  
  -- 인센티브
  inviter_reward DECIMAL(10, 2) DEFAULT 1000,
  invitee_reward DECIMAL(10, 2) DEFAULT 1000,
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP,
  
  -- 타임스탬프
  sent_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  CONSTRAINT valid_share_channel CHECK (share_channel IN ('kakao', 'link', 'email', 'sms')),
  CONSTRAINT positive_rewards CHECK (inviter_reward >= 0 AND invitee_reward >= 0)
);

-- Indexes for social_invitations
CREATE INDEX idx_social_invitations_inviter ON social_invitations(inviter_id);
CREATE INDEX idx_social_invitations_invitee_email ON social_invitations(invitee_email);
CREATE INDEX idx_social_invitations_invitee_id ON social_invitations(invitee_id);
CREATE INDEX idx_social_invitations_negotiation ON social_invitations(negotiation_id);
CREATE INDEX idx_social_invitations_status ON social_invitations(status);
CREATE INDEX idx_social_invitations_expires ON social_invitations(expires_at) WHERE status = 'pending';

-- 5. Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_negotiations_updated_at BEFORE UPDATE ON negotiations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON seller_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_invitations ENABLE ROW LEVEL SECURITY;

-- Negotiations: 모든 사용자가 읽기 가능, 시스템만 쓰기
CREATE POLICY "Negotiations are viewable by everyone"
  ON negotiations FOR SELECT
  USING (true);

CREATE POLICY "Negotiations are insertable by authenticated users"
  ON negotiations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Negotiations are updatable by system"
  ON negotiations FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Negotiation Events: 모든 사용자가 읽기 가능
CREATE POLICY "Negotiation events are viewable by everyone"
  ON negotiation_events FOR SELECT
  USING (true);

CREATE POLICY "Negotiation events are insertable by system"
  ON negotiation_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Seller Profiles: 본인 또는 관리자만 접근
CREATE POLICY "Seller profiles are viewable by owner or admin"
  ON seller_profiles FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Seller profiles are insertable by authenticated users"
  ON seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Seller profiles are updatable by owner"
  ON seller_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Social Invitations: 초대자 또는 피초대자만 접근
CREATE POLICY "Social invitations are viewable by inviter or invitee"
  ON social_invitations FOR SELECT
  USING (
    auth.uid() = inviter_id OR
    auth.uid() = invitee_id
  );

CREATE POLICY "Social invitations are insertable by authenticated users"
  ON social_invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Social invitations are updatable by inviter"
  ON social_invitations FOR UPDATE
  USING (auth.uid() = inviter_id);

-- 7. Helpful views

-- Active negotiations view
CREATE OR REPLACE VIEW active_negotiations AS
SELECT 
  n.*,
  COUNT(DISTINCT pt.user_id) as actual_participants,
  AVG(pt.target_price) as current_avg_price
FROM negotiations n
LEFT JOIN price_tracking pt ON pt.product_id = n.product_id AND pt.status = 'active'
WHERE n.status IN ('triggered', 'in_progress')
GROUP BY n.id;

-- Seller performance view
CREATE OR REPLACE VIEW seller_performance AS
SELECT 
  sp.id,
  sp.company_name,
  sp.total_negotiations,
  sp.successful_negotiations,
  CASE 
    WHEN sp.total_negotiations > 0 
    THEN ROUND((sp.successful_negotiations::DECIMAL / sp.total_negotiations * 100), 2)
    ELSE 0 
  END as success_rate,
  sp.total_revenue,
  sp.avg_response_time_hours
FROM seller_profiles sp
WHERE sp.status = 'active';

-- Comments
COMMENT ON TABLE negotiations IS 'AI 협상 세션 - 수요 집계부터 최종 거래까지 전체 협상 프로세스 추적';
COMMENT ON TABLE negotiation_events IS '협상 이벤트 로그 - 실시간 타임라인 표시용';
COMMENT ON TABLE seller_profiles IS '판매자 프로필 - 협상 설정 및 통계';
COMMENT ON TABLE social_invitations IS '소셜 초대 - 바이럴 그로스 추적';

COMMENT ON COLUMN negotiations.ai_reasoning IS 'AI 의사결정 근거 (JSON 형식)';
COMMENT ON COLUMN negotiations.ai_confidence_score IS 'AI 신뢰도 점수 (0~1)';
COMMENT ON COLUMN seller_profiles.auto_accept_config IS 'AI 자동 수락 조건 설정 (JSON)';
COMMENT ON COLUMN social_invitations.share_channel IS '공유 채널 (kakao, link, email, sms)';
