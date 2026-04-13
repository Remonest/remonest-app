-- ============================================================
-- Migration: 021_portfolio_user_profiles_read
-- Created: April 13, 2026
-- Description: Allow public viewing of basic user profile info
--              (needed for public portfolio page)
-- ============================================================

-- Allow anyone to view basic user profile info
CREATE POLICY "Anyone can view basic user profiles"
  ON public.user_profiles
  FOR SELECT
  USING (true);
