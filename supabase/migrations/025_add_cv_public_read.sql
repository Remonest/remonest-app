-- ============================================================
-- Migration: 025_add_cv_public_read
-- Created: April 22, 2026
-- Description: Allow public viewing of primary user CVs
-- ============================================================

-- Allow anyone to view primary user CVs (no auth required)
CREATE POLICY "Anyone can view primary CVs"
  ON public.user_cvs
  FOR SELECT
  USING (is_primary = true);
