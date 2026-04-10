-- ============================================================
-- Migration: 012_fix_rls_recursion
-- Created: 2026-04-10
-- Description: Fix infinite recursion in user_profiles RLS policies
--              by using SECURITY DEFINER functions to bypass RLS
-- ============================================================

-- ============================================================
-- 1. Create helper function to check admin role (bypasses RLS)
-- ============================================================

-- This function runs with SECURITY DEFINER so it bypasses RLS
-- and can safely query user_profiles without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

COMMENT ON FUNCTION public.is_admin IS 'Check if current user is admin. Bypasses RLS to avoid recursion.';

-- ============================================================
-- 2. Create helper function to check client role (bypasses RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_client()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'client'
  )
$$;

COMMENT ON FUNCTION public.is_client IS 'Check if current user is client. Bypasses RLS to avoid recursion.';

-- ============================================================
-- 3. Create helper function to get user role (bypasses RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.user_profiles
  WHERE id = auth.uid()
$$;

COMMENT ON FUNCTION public.get_user_role IS 'Get current user role. Bypasses RLS to avoid recursion.';

-- ============================================================
-- 4. Drop old recursive policies
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Clients can view all profiles" ON public.user_profiles;

-- ============================================================
-- 5. Create new non-recursive policies
-- ============================================================

-- Policy: Users can view their own profile
-- Simple check, no recursion
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (but cannot change role)
-- Uses get_user_role() to avoid recursion
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = public.get_user_role()
  );

-- Policy: Admins can view all profiles
-- Uses is_admin() function to avoid recursion
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin());

-- Policy: Admins can update all profiles (including role changes)
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (public.is_admin());

-- Policy: Service role can insert profiles (for auto-create trigger)
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

-- Policy: Clients can view all profiles (for networking/job context)
-- Uses is_client() function to avoid recursion
CREATE POLICY "Clients can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (public.is_client());

-- ============================================================
-- 6. Update other tables to use helper functions
-- ============================================================

-- Update jobs table policies to use is_admin()
DROP POLICY IF EXISTS "Admins can read all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update any job" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete any job" ON public.jobs;

CREATE POLICY "Admins can read all jobs"
  ON public.jobs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any job"
  ON public.jobs FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete any job"
  ON public.jobs FOR DELETE
  USING (public.is_admin());

-- Update job_applications table policies
DROP POLICY IF EXISTS "Admins can view all applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON public.job_applications;

CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all applications"
  ON public.job_applications FOR UPDATE
  USING (public.is_admin());

-- Update learning_modules table policies
DROP POLICY IF EXISTS "Admins can manage modules" ON public.learning_modules;

CREATE POLICY "Admins can manage modules"
  ON public.learning_modules FOR ALL
  USING (public.is_admin());

-- Update user_learning_progress table policies
DROP POLICY IF EXISTS "Admins can view all progress" ON public.user_learning_progress;

CREATE POLICY "Admins can view all progress"
  ON public.user_learning_progress FOR SELECT
  USING (public.is_admin());

-- Update user_settings table policies
DROP POLICY IF EXISTS "Admins can view all settings" ON public.user_settings;

CREATE POLICY "Admins can view all settings"
  ON public.user_settings FOR SELECT
  USING (public.is_admin());

-- Update activity_log table policies
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_log;

CREATE POLICY "Admins can view all activity"
  ON public.activity_log FOR SELECT
  USING (public.is_admin());

-- Update admin_actions table policies
DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions;

CREATE POLICY "Admins can view all admin actions"
  ON public.admin_actions FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- Rollback instructions
-- ============================================================
-- To rollback this migration:
--
-- DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
-- DROP FUNCTION IF EXISTS public.is_client() CASCADE;
-- DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
--
-- Then re-run migration 011 to restore old policies
