-- -----------------------------------------------------------------------------
-- GROW WEB3 PLATFORM: TELEGRAM BOT PERSISTENT SESSIONS & CAMPAIGN SLUG MIGRATION
-- -----------------------------------------------------------------------------

-- 1. Alter campaigns to add slug and max_spots if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN slug TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'max_spots'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN max_spots INTEGER DEFAULT 20;
  END IF;
END $$;

-- 2. Alter submissions to add chat_id and updated_at if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'submissions' AND column_name = 'chat_id'
  ) THEN
    ALTER TABLE public.submissions ADD COLUMN chat_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'submissions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.submissions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 3. Create bot_sessions table for serverless chat state
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

-- 4. Enable RLS on bot_sessions
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Policies for bot_sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read bot sessions') THEN
    CREATE POLICY "Anyone can read bot sessions" ON public.bot_sessions FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert or update bot sessions') THEN
    CREATE POLICY "Anyone can insert or update bot sessions" ON public.bot_sessions FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update submissions') THEN
    CREATE POLICY "Anyone can update submissions" ON public.submissions FOR UPDATE USING (true);
  END IF;
END $$;

-- 6. Add bot_sessions to realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_sessions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
