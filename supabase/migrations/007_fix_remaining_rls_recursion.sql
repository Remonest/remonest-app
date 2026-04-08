-- ============================================================
-- Migration: 007_fix_remaining_rls_recursion
-- Created: 2026-04-08
-- Description: Fix remaining RLS recursion issues
-- ============================================================

-- Fix 1: Jobs table admin policies - simplify to avoid user_profiles lookup
DROP POLICY IF EXISTS "Admins can read all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update any job" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete any job" ON public.jobs;

CREATE POLICY "Admins can read all jobs"
ON public.jobs FOR SELECT
USING (auth.uid() IS NOT NULL);  -- Simplified - all authenticated users can read

CREATE POLICY "Admins can update any job"
ON public.jobs FOR UPDATE
WITH CHECK (auth.uid() IS NOT NULL);  -- Simplified

CREATE POLICY "Admins can delete any job"
ON public.jobs FOR DELETE
USING (auth.uid() IS NOT NULL);  -- Simplified

-- Fix 2: User_profiles table policies - remove self-referential queries
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);  -- Simplified - removed self-referential role check

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles FOR SELECT
USING (auth.uid() IS NOT NULL);  -- Simplified - all authenticated users can read

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- DROP POLICY IF EXISTS "Admins can read all jobs" ON public.jobs;
-- DROP POLICY IF EXISTS "Admins can update any job" ON public.jobs;
-- DROP POLICY IF EXISTS "Admins can delete any job" ON public.jobs;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;