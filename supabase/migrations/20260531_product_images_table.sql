-- CREATE TABLE public.product_images (
--   id BIGINT generated always as identity PRIMARY KEY,
--   product_id BIGINT NOT NULL,
--   image_path TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
--   CONSTRAINT product_images_product_id_fkey 
--     FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE
-- );

-- ALTER TABLE public.products DROP COLUMN image_path;