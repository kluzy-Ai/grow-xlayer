-- -----------------------------------------------------------------------------
-- GROW WEB3 PLATFORM ON OKX X LAYER: MASTER SUPABASE SQL SCHEMA (100% IDEMPOTENT)
-- -----------------------------------------------------------------------------

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATORS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  community_name TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  token_symbol TEXT DEFAULT 'OKB',
  network_chain_id INTEGER DEFAULT 1952,
  total_budget NUMERIC DEFAULT 0,
  amount_per_claim NUMERIC DEFAULT 0.25,
  max_spots INTEGER DEFAULT 20,
  status TEXT DEFAULT 'active', -- active, completed, paused
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUBMISSIONS / CLAIMS TABLE (For Telegram & Community wallet claims)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id TEXT NOT NULL,
  telegram_handle TEXT NOT NULL,
  chat_id TEXT,
  wallet_address TEXT NOT NULL,
  amount NUMERIC DEFAULT 0.25,
  status TEXT DEFAULT 'pending', -- pending, approved, paid, rejected
  tx_hash TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TELEGRAM BOT CHAT SESSIONS TABLE (For persistent campaign tracking across webhook calls)
CREATE TABLE IF NOT EXISTS public.bot_sessions (
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

-- 5. AI DISTRIBUTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.ai_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  plan_json JSONB NOT NULL,
  status TEXT DEFAULT 'proposed', -- proposed, executed, cancelled
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_plans ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Campaigns Policies
DROP POLICY IF EXISTS "Anyone can view campaigns" ON public.campaigns;
CREATE POLICY "Anyone can view campaigns" ON public.campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can insert own campaigns" ON public.campaigns;
CREATE POLICY "Creators can insert own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can update own campaigns" ON public.campaigns;
CREATE POLICY "Creators can update own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = creator_id);

-- Submissions Policies
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.submissions;
CREATE POLICY "Anyone can insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update submissions" ON public.submissions;
CREATE POLICY "Anyone can update submissions" ON public.submissions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;
CREATE POLICY "Anyone can view submissions" ON public.submissions FOR SELECT USING (true);

-- Bot Sessions Policies
DROP POLICY IF EXISTS "Anyone can read bot sessions" ON public.bot_sessions;
CREATE POLICY "Anyone can read bot sessions" ON public.bot_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert or update bot sessions" ON public.bot_sessions;
CREATE POLICY "Anyone can insert or update bot sessions" ON public.bot_sessions FOR ALL USING (true);

-- AI Plans Policies
DROP POLICY IF EXISTS "Creators can manage AI plans" ON public.ai_plans;
CREATE POLICY "Creators can manage AI plans" ON public.ai_plans FOR ALL USING (true);

-- -----------------------------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, community_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'community_name', 'Community Leader')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for live updates safely
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

