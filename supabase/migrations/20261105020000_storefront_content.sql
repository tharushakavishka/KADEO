ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS storefront_content jsonb NOT NULL DEFAULT '{}'::jsonb;
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('storefront-assets', 'storefront-assets', true, 4194304, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public storefront images" ON storage.objects FOR SELECT USING (bucket_id = 'storefront-assets');
CREATE POLICY "Owners upload storefront images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'storefront-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
