-- ============================================================
-- Migration: 015_add_learning_files_storage
-- Created: April 12, 2026
-- Description: Create Supabase Storage bucket for learning
--              materials (PDFs, images, documents).
--              Add file_url column to learning_materials.
-- Dependencies: 014 (requires previous migrations)
-- Rollback: ALTER TABLE learning_materials DROP COLUMN IF EXISTS file_url;
--           DROP POLICY IF EXISTS "Anyone can view learning files" ON storage.objects;
--           DROP POLICY IF EXISTS "Admins can manage learning files" ON storage.objects;
--           DELETE FROM storage.buckets WHERE id = 'learning-files';
-- ============================================================

-- ============================================================
-- Add file_url column to learning_materials
-- ============================================================
ALTER TABLE public.learning_materials ADD COLUMN IF NOT EXISTS file_url TEXT;

-- ============================================================
-- STORAGE BUCKET: learning-files
-- ============================================================

-- Create bucket (public, max file size 10MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'learning-files',
  'learning-files',
  true,
  10485760,  -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES: learning-files
-- ============================================================

-- Anyone can view files (bucket is public)
CREATE POLICY "Anyone can view learning files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'learning-files');

-- Admins can upload files
CREATE POLICY "Admins can manage learning files"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'learning-files'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- DROP POLICY IF EXISTS "Anyone can view learning files" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can manage learning files" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'learning-files';
-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '015';
