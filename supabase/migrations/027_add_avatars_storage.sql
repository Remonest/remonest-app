-- Migration: 027_add_avatars_storage
-- Description: Create Supabase Storage bucket for user avatars with RLS policies

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  2097152, -- 2MB limit (since we compress it anyway)
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Set up RLS policies for the avatars bucket

-- Policy: Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'avatars';
