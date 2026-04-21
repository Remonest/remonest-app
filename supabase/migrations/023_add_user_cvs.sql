-- ============================================================
-- Migration: 023_add_user_cvs
-- Created: April 21, 2026
-- Description: Add user_cvs table for storing CV data
--   - Stores structured CV data in JSONB format
--   - Supports multiple CVs per user (one primary)
--   - RLS policies for user-only access
-- ============================================================

-- ============================================================
-- 1. CREATE user_cvs table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_cvs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  cv_name TEXT NOT NULL DEFAULT 'My Resume',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_id TEXT NOT NULL DEFAULT 'standard',
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_cvs_user_id ON public.user_cvs(user_id);

-- Ensure only one primary CV per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_cvs_primary_user ON public.user_cvs(user_id) WHERE is_primary = true;

-- ============================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.user_cvs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================

-- Users can view their own CVs
CREATE POLICY "Users can view own CVs"
  ON public.user_cvs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own CVs
CREATE POLICY "Users can insert own CVs"
  ON public.user_cvs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own CVs
CREATE POLICY "Users can update own CVs"
  ON public.user_cvs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own CVs
CREATE POLICY "Users can delete own CVs"
  ON public.user_cvs
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. TRIGGER: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_user_cvs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_cvs_updated_at
  BEFORE UPDATE ON public.user_cvs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_cvs_updated_at();

-- ============================================================
-- 5. COMMENT FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE public.user_cvs IS 'Stores structured CV data for users in JSONB format';
COMMENT ON COLUMN public.user_cvs.data IS 'Structured JSON containing personal_info, experience, education, skills, etc.';
