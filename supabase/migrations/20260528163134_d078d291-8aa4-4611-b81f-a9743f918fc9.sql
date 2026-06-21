GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_measurements TO authenticated;
GRANT ALL ON public.body_measurements TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_photos TO authenticated;
GRANT ALL ON public.progress_photos TO service_role;

UPDATE storage.buckets
SET public = true
WHERE id = 'progress-photos';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'users read own progress photos'
  ) THEN
    CREATE POLICY "users read own progress photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'users upload own progress photos'
  ) THEN
    CREATE POLICY "users upload own progress photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'users update own progress photos'
  ) THEN
    CREATE POLICY "users update own progress photos"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'users delete own progress photos'
  ) THEN
    CREATE POLICY "users delete own progress photos"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;