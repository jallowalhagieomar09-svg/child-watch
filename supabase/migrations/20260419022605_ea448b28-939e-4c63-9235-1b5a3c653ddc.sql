
-- Tighten report_media insert
DROP POLICY IF EXISTS "Anyone can insert media" ON public.report_media;

CREATE POLICY "Insert media for existing report"
ON public.report_media FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_media.report_id)
);

-- Tighten storage upload: folder must match a real report id
DROP POLICY IF EXISTS "Anyone can upload report media" ON storage.objects;

CREATE POLICY "Upload to existing report folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'report-media'
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id::text = (storage.foldername(name))[1]
  )
);
