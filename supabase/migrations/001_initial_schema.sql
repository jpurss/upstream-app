-- =============================================================================
-- Upstream: Initial Schema Migration
-- Version: 001
-- Description: Full schema with 8 tables, indexes, RLS policies, Auth Hook
--
-- CRITICAL MODIFICATIONS from PRD section 7.2:
-- - D-09: Role CHECK limited to ('consultant', 'admin') — no 'lead' role in v1
-- - D-14: RLS policies use auth.jwt() -> 'app_metadata' ->> 'role' (not auth.role())
-- - Pitfall 5: prompts read policy includes 'anon' role for demo bypass users
-- - Added: original_content column on forked_prompts (snapshot at fork time)
-- - Added: merge_status as TEXT with DEFAULT 'none'
-- =============================================================================

-- =============================================================================
-- A. TABLES (8 total)
-- =============================================================================

-- 1. profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('consultant', 'admin')) DEFAULT 'consultant',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. prompts
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  category TEXT NOT NULL,
  capability_type TEXT NOT NULL,
  industry_tags TEXT[] DEFAULT '{}',
  use_case_tags TEXT[] DEFAULT '{}',
  target_model TEXT DEFAULT 'model-agnostic',
  complexity TEXT DEFAULT 'moderate',
  input_schema TEXT,
  output_schema TEXT,
  dependencies UUID[] DEFAULT '{}',
  sensitivity TEXT DEFAULT 'internal',
  status TEXT DEFAULT 'active',
  avg_effectiveness FLOAT DEFAULT 0,
  total_checkouts INTEGER DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  last_tested_date DATE,
  last_tested_model TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. prompt_changelog
CREATE TABLE prompt_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  change_description TEXT,
  previous_content TEXT,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. engagements
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT,
  industry TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 5. engagement_members
CREATE TABLE engagement_members (
  engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  PRIMARY KEY (engagement_id, user_id)
);

-- 6. forked_prompts
-- NOTE: original_content added per STATE.md decision:
--   "Fork captures original_content snapshot at fork time — diff never breaks when parent updates"
CREATE TABLE forked_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_prompt_id UUID REFERENCES prompts(id),
  source_version INTEGER NOT NULL,
  engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
  original_content TEXT,
  adapted_content TEXT,
  adaptation_notes TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  usage_count INTEGER DEFAULT 0,
  feedback_notes TEXT,
  issues TEXT[] DEFAULT '{}',
  merge_status TEXT DEFAULT 'none',
  merge_suggestion TEXT,
  contains_client_context BOOLEAN DEFAULT FALSE,
  forked_by UUID REFERENCES profiles(id),
  forked_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

-- 7. prompt_requests
CREATE TABLE prompt_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  capability_type TEXT,
  industry_context TEXT,
  urgency TEXT DEFAULT 'nice_to_have',
  status TEXT DEFAULT 'open',
  requested_by UUID REFERENCES profiles(id),
  engagement_context UUID REFERENCES engagements(id),
  resolved_by_prompt UUID REFERENCES prompts(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. request_upvotes
CREATE TABLE request_upvotes (
  request_id UUID REFERENCES prompt_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  PRIMARY KEY (request_id, user_id)
);

-- =============================================================================
-- B. INDEXES (6 from PRD section 7.2)
-- =============================================================================

CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_forked_prompts_engagement ON forked_prompts(engagement_id);
CREATE INDEX idx_forked_prompts_source ON forked_prompts(source_prompt_id);
CREATE INDEX idx_prompt_requests_status ON prompt_requests(status);
CREATE INDEX idx_prompts_fulltext ON prompts USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || content)
);

-- =============================================================================
-- C. ENABLE ROW LEVEL SECURITY ON ALL 8 TABLES
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forked_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_upvotes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- D. RLS POLICIES
-- IMPORTANT: All role checks use auth.jwt() -> 'app_metadata' ->> 'role'
--            NOT auth.role() (which is the Postgres role, not RBAC role)
-- NOTE on 'anon' in prompts_read_all: anonymous demo users must see seed data
-- =============================================================================

-- Prompts: all users (including anonymous demo users) can read
CREATE POLICY "prompts_read_all" ON prompts
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Prompts: only admins can write (insert/update/delete)
CREATE POLICY "prompts_write_admin" ON prompts
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Profiles: read own profile, or admin can read all
CREATE POLICY "profiles_read_own" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Profiles: update own profile only
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Forked prompts: full access to own forks
CREATE POLICY "forked_prompts_own" ON forked_prompts
  FOR ALL
  TO authenticated
  USING (forked_by = auth.uid());

-- Engagements: full access to own engagements
CREATE POLICY "engagements_own" ON engagements
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Engagements: members can read engagements they belong to
CREATE POLICY "engagements_member_read" ON engagements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM engagement_members
      WHERE engagement_id = engagements.id AND user_id = auth.uid()
    )
  );

-- Prompt requests: all authenticated users can read
CREATE POLICY "requests_read" ON prompt_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Prompt requests: users can only insert requests attributed to themselves
CREATE POLICY "requests_insert_own" ON prompt_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (requested_by = auth.uid());

-- Prompt changelog: readable by all including anonymous demo users
CREATE POLICY "prompt_changelog_read" ON prompt_changelog
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Request upvotes: full access to own upvotes
CREATE POLICY "request_upvotes_own" ON request_upvotes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Engagement members: read own memberships
CREATE POLICY "engagement_members_read" ON engagement_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- E. AUTH HOOK FUNCTION (per RESEARCH Pattern 3 and D-14)
--
-- This function is registered in the Supabase Dashboard under:
-- Authentication > Hooks > Custom Access Token Hook
-- Select: public.custom_access_token_hook
--
-- What it does: Reads role from profiles table and injects into JWT app_metadata.
-- Anonymous demo users have no profile row -> role will be 'anon' in JWT.
-- RLS policies that check (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
-- will correctly deny access to anonymous and consultant users.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Read role from profiles table for this user
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Ensure app_metadata object exists
  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  END IF;

  -- Inject role (or 'anon' if no profile — anonymous demo users have no profile row)
  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    to_jsonb(COALESCE(user_role, 'anon'))
  );

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- =============================================================================
-- F. AUTH HOOK GRANTS
-- supabase_auth_admin needs access to read profiles for the hook.
-- These grants prevent the hook from being called by other roles.
-- =============================================================================

GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
REVOKE ALL ON TABLE public.profiles FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- =============================================================================
-- G. UPDATED_AT TRIGGER FOR PROMPTS
-- Automatically updates updated_at on every UPDATE to the prompts table.
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
