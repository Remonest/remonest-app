-- ============================================================
-- Migration: 022_add_module_sections
-- Created: April 14, 2026
-- Description: Add support for grouping lessons into sections in Flow Builder
-- Dependencies: 021 (requires module_lessons table from 018_learning_revamp)
-- ============================================================

-- Create module_sections table
CREATE TABLE IF NOT EXISTS public.module_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add section_id to module_lessons
ALTER TABLE public.module_lessons
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.module_sections(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_sections_module_id ON public.module_sections(module_id);
CREATE INDEX IF NOT EXISTS idx_module_lessons_section_id ON public.module_lessons(section_id);

-- Add RLS policies
ALTER TABLE public.module_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage module sections"
  ON public.module_sections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- ROLLBACK:
-- DROP POLICY "Admins can manage module sections" ON public.module_sections;
-- ALTER TABLE public.module_sections DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_module_lessons_section_id;
-- DROP INDEX IF EXISTS idx_module_sections_module_id;
-- ALTER TABLE public.module_lessons DROP COLUMN IF EXISTS section_id;
-- DROP TABLE IF EXISTS public.module_sections;
-- ============================================================
