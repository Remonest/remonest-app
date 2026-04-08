-- ============================================================
-- Migration: 009_add_client_role
-- Created: 2026-04-08
-- Description: Add 'client' role to user_profiles CHECK constraint
--              Clients can post jobs (pending approval workflow)
-- ============================================================

-- 1. Drop existing CHECK constraint
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- 2. Add new CHECK constraint with 'client' role included
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('user', 'admin', 'client'));

-- 3. Update RLS policies to allow clients to view all profiles
--    (needed for networking/job posting context)
DROP POLICY IF EXISTS "Clients can view all profiles" ON public.user_profiles;

CREATE POLICY "Clients can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'client'
    )
  );

-- 4. Update auto-create trigger to support client role from metadata
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$;

-- 5. Add comment
COMMENT ON COLUMN public.user_profiles.role IS 'User role: user (standard), admin (full access), client (job poster/employer)';

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- ALTER TABLE public.user_profiles DROP CONSTRAINT user_profiles_role_check;
-- ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('user', 'admin'));
-- DROP POLICY IF EXISTS "Clients can view all profiles" ON public.user_profiles;
