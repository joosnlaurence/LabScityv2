INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product_images', 'product_images', true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product_images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product_images');