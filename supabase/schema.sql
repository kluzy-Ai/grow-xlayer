-- =============================================================================
-- GROW ON OKX X LAYER: MASTER SUPABASE SQL SCHEMA (DROP & RECREATE)
-- =============================================================================

-- 1. DROP EXISTING TABLES & TRIGGERS (IN CORRECT DEPENDENCY ORDER)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

DROP TABLE IF EXISTS public.ai_plans CASCADE;
DROP TABLE IF EXISTS public.bot_sessions CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. CREATE CORE TABLES
-- =============================================================================

-- PROFILES (Linked to Supabase Auth Users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  community_name TEXT NOT NULL DEFAULT 'Web3 Community',
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAMPAIGNS (Token Giveaways & Airdrop Campaigns)
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  token_symbol TEXT DEFAULT 'OKB',
  network_chain_id INTEGER DEFAULT 1952,
  total_budget NUMERIC DEFAULT 0,
  amount_per_claim NUMERIC DEFAULT 0.25,
  max_spots INTEGER DEFAULT 20,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBMISSIONS (Telegram Bot Wallet Submissions & Batch Payout Ledger)
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id TEXT NOT NULL, -- Supports UUID or slug (e.g. cmp_xyz)
  telegram_handle TEXT NOT NULL,
  chat_id TEXT,
  wallet_address TEXT NOT NULL,
  amount NUMERIC DEFAULT 0.25,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'rejected'
  tx_hash TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOT SESSIONS (Persistent Telegram Webhook State Tracking)
CREATE TABLE public.bot_sessions (
  chat_id TEXT PRIMARY KEY,
  telegram_user_id TEXT,
  telegram_handle TEXT,
  campaign_id TEXT NOT NULL,
  campaign_title TEXT,
  amount_per_claim NUMERIC DEFAULT 0.25,
  token_symbol TEXT DEFAULT 'OKB',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI PLANS (AI-Generated Distribution & Treasury Allocations)
CREATE TABLE public.ai_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  plan_json JSONB NOT NULL,
  status TEXT DEFAULT 'proposed', -- 'proposed', 'executed', 'cancelled'
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. PERFORMANCE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON public.campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

CREATE INDEX IF NOT EXISTS idx_submissions_campaign_id ON public.submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_wallet ON public.submissions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_handle ON public.submissions(telegram_handle);

CREATE INDEX IF NOT EXISTS idx_bot_sessions_campaign ON public.bot_sessions(campaign_id);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_plans ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Campaigns: Anyone can view active campaigns; Authenticated creators can insert/update
CREATE POLICY "Anyone can view campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Creators can insert campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can update campaigns" ON public.campaigns FOR UPDATE USING (true);

-- Submissions: Open for public Telegram bot insertions and dashboard reading/updating
CREATE POLICY "Anyone can view submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update submissions" ON public.submissions FOR UPDATE USING (true);

-- Bot Sessions: Telegram Webhook read/write access
CREATE POLICY "Anyone can read bot sessions" ON public.bot_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can manage bot sessions" ON public.bot_sessions FOR ALL USING (true);

-- AI Plans: Manage AI distribution records
CREATE POLICY "Anyone can manage AI plans" ON public.ai_plans FOR ALL USING (true);

-- =============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER ON USER SIGNUP
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, community_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'community_name', NEW.raw_user_meta_data->>'name', 'Web3 Creator')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 6. ENABLE SUPABASE REALTIME STREAMING
-- =============================================================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_sessions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
