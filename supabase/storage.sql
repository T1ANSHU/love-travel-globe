-- ============================================================
-- Supabase Storage — photos bucket policies
-- Run AFTER creating the bucket named "photos" (set to Private)
-- ============================================================

-- SELECT: users can only read files inside their own userId folder
CREATE POLICY "storage_photos_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT: users can only upload into their own userId folder
CREATE POLICY "storage_photos_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE: users can only update files in their own userId folder
CREATE POLICY "storage_photos_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: users can only delete files in their own userId folder
CREATE POLICY "storage_photos_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Upload path convention enforced by frontend: {userId}/{filename}
-- or {userId}/{albumId}/{filename} for organized albums.
