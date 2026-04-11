-- ============================================================
-- Migration: 014_add_learning_materials_and_resources
-- Created: April 11, 2026
-- Description: Add learning materials (articles, videos) and 
--              learning resources (links, PDFs, tools) tables 
--              to support rich multimedia learning modules.
-- Dependencies: 013 (requires all previous migrations)
-- Rollback: DROP TABLE IF EXISTS public.learning_materials CASCADE;
--           DROP TABLE IF EXISTS public.learning_resources CASCADE;
--           DROP POLICY IF EXISTS "Public materials are viewable by everyone" ON public.learning_materials;
--           DROP POLICY IF EXISTS "Admins can manage learning materials" ON public.learning_materials;
--           DROP POLICY IF EXISTS "Public resources are viewable by everyone" ON public.learning_resources;
--           DROP POLICY IF EXISTS "Admins can manage learning resources" ON public.learning_resources;
-- ============================================================

-- ============================================================
-- TABLE: learning_materials
-- Purpose: Store multimedia learning content (articles, videos, 
--          documentation) attached to a learning module.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id             UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  content               TEXT,                              -- HTML or Markdown content
  summary               TEXT,                              -- Brief summary in Bahasa Indonesia
  source_url            TEXT,                              -- External source URL
  source_type           TEXT CHECK (source_type IN ('article', 'video', 'documentation', 'tutorial')),
  language              TEXT DEFAULT 'id',                 -- 'id' = Indonesian, 'en' = English
  reading_time_minutes  INT,                               -- Estimated reading time
  difficulty            TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags                  TEXT[],                            -- Array of tags for filtering
  is_published          BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: learning_resources
-- Purpose: Store supplementary resources (tools, templates, 
--          ebooks, checklists, cheatsheets, PDFs) attached to 
--          a learning module.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  url           TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('tool', 'template', 'ebook', 'checklist', 'cheatsheet', 'pdf')),
  is_free       BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: learning_materials
-- ============================================================

-- Anyone can view published materials (and their parent module must be published)
CREATE POLICY "Public materials are viewable by everyone"
  ON public.learning_materials
  FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.learning_modules lm
      WHERE lm.id = learning_materials.module_id
      AND lm.status = 'published'
    )
  );

-- Admins can manage learning materials
CREATE POLICY "Admins can manage learning materials"
  ON public.learning_materials
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- RLS POLICIES: learning_resources
-- ============================================================

-- Anyone can view resources (parent module must be published)
CREATE POLICY "Public resources are viewable by everyone"
  ON public.learning_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_modules lm
      WHERE lm.id = learning_resources.module_id
      AND lm.status = 'published'
    )
  );

-- Admins can manage learning resources
CREATE POLICY "Admins can manage learning resources"
  ON public.learning_resources
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_learning_materials_module ON public.learning_materials(module_id);
CREATE INDEX idx_learning_materials_published ON public.learning_materials(is_published);
CREATE INDEX idx_learning_materials_source_type ON public.learning_materials(source_type);
CREATE INDEX idx_learning_materials_difficulty ON public.learning_materials(difficulty);
CREATE INDEX idx_learning_materials_tags ON public.learning_materials USING GIN(tags);

CREATE INDEX idx_learning_resources_module ON public.learning_resources(module_id);
CREATE INDEX idx_learning_resources_type ON public.learning_resources(resource_type);

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_learning_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_materials_updated_at
  BEFORE UPDATE ON public.learning_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_materials_updated_at();

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- To rollback this migration:
-- DROP TABLE IF EXISTS public.learning_materials CASCADE;
-- DROP TABLE IF EXISTS public.learning_resources CASCADE;
-- DROP FUNCTION IF EXISTS public.update_learning_materials_updated_at() CASCADE;
-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '014';
