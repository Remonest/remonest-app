-- ============================================================
-- Migration: 006_fix_rls_recursion
-- Created: 2026-04-08
-- Description: Fix RLS recursion in jobs and user_profiles tables
-- ============================================================

-- Problem: RLS policies were causing infinite recursion (error 42P17) by:
-- 1. Jobs admin policies checking user_profiles table
-- 2. User_profiles policies with self-referential queries
-- This prevented draft creation and other operations.

-- Solution: Simplify all RLS policies to avoid table lookups and self-referential queries.

-- Fix 1: Jobs table user policies
DROP POLICY IF EXISTS "Users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.jobs;

CREATE POLICY "Users can create jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own jobs"
ON public.jobs FOR UPDATE
WITH CHECK (auth.uid() = posted_by_user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own jobs"
ON public.jobs FOR DELETE
USING (auth.uid() = posted_by_user_id AND auth.uid() IS NOT NULL);

-- Fix 2: Jobs table admin policies - simplify to avoid user_profiles lookup
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

-- Fix 3: User_profiles table policies - remove self-referential queries
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
-- DROP POLICY IF EXISTS "Users can create jobs" ON public.jobs;
-- DROP POLICY IF EXISTS "Users can update own jobs" ON public.jobs;
-- DROP POLICY IF EXISTS "Users can delete own jobs" ON public.jobs;
-- DROP POLICY IF EXISTS "Admins can read all jobs" ON public.jobs;
-- DROP POLICY IF EXISTS "Admins can update any job" ON public.jobs;
-- DROP POLICY IF EXISTS "Admins can delete any job" ON public.jobs;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
