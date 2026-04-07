-- ============================================================
-- Migration: 001_create_user_profiles
-- Created: 2026-04-07
-- Description: Extended user profile table with RLS and auto-create trigger
-- ============================================================

-- 1. Create the user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS 'Extended profile data for authenticated users. One row per auth.users entry.';

-- 2. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop any stale policies (idempotent re-runs)
DROP POLICY IF EXISTS "Users can view own profile"        ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile"      ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"      ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles"  ON public.user_profiles;

-- 4. Policy: users can READ their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 5. Policy: users can UPDATE their own profile
--    (but cannot change their own role — that's admin-only)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
  );

-- 6. Policy: admins can READ all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Policy: service role (Supabase internals) can INSERT
--    This lets the auto-create trigger fire without RLS blocking it
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

-- 8. Trigger function: auto-create a user_profiles row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$;

-- 9. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 10. Indexes
--     Primary key (id) is already indexed automatically.
--     Add an index on role for admin-lookup queries:
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles (role);

-- 11. Seed existing users who signed up before this migration
INSERT INTO public.user_profiles (id, full_name, role)
SELECT au.id,
       COALESCE(au.raw_user_meta_data->>'full_name', au.email),
       'user'
FROM   auth.users au
WHERE  au.id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;
