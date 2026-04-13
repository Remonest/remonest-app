-- ============================================================
-- Migration: 019_portfolio_items
-- Created: April 13, 2026
-- Description: Add portfolio_items table for user portfolios
--   - Users can add certificates, projects, and other items
--   - Each item has type, title, description, cover image, URL, tags
--   - order_index controls display order
-- ============================================================

-- ============================================================
-- 1. CREATE portfolio_items table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'project' CHECK (item_type IN ('certificate', 'project', 'achievement', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  external_url TEXT,
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON public.portfolio_items(user_id);

-- Index for ordering within user
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_order ON public.portfolio_items(user_id, order_index);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_portfolio_items_type ON public.portfolio_items(item_type);

-- ============================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================

-- Users can view their own items
CREATE POLICY "Users can view own portfolio items"
  ON public.portfolio_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own items
CREATE POLICY "Users can insert own portfolio items"
  ON public.portfolio_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update own portfolio items"
  ON public.portfolio_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "Users can delete own portfolio items"
  ON public.portfolio_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. TRIGGER: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_portfolio_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_portfolio_items_updated_at();

-- ============================================================
-- 5. HELPER FUNCTION: Auto-add certificate to portfolio
-- ============================================================

-- This function can be called when a user earns a certificate
-- to automatically add it to their portfolio
