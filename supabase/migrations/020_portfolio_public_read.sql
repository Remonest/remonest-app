-- ============================================================
-- Migration: 020_portfolio_public_read
-- Created: April 13, 2026
-- Description: Allow public viewing of published portfolio items
--              and basic user profile info (name, avatar, etc.)
-- ============================================================

-- Allow anyone to view published portfolio items (no auth required)
CREATE POLICY "Anyone can view published portfolio items"
  ON public.portfolio_items
  FOR SELECT
  USING (is_published = true);

-- Allow anyone to view basic user profile info (needed for public portfolio)
CREATE POLICY "Anyone can view basic user profiles"
  ON public.user_profiles
  FOR SELECT
  USING (true);
