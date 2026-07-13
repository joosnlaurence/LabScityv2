CREATE TABLE saved_publications (
    profile_user_id uuid REFERENCES profile(user_id) ON DELETE CASCADE,
    publication_id bigint REFERENCES publications(publication_id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (profile_user_id, publication_id)
);

CREATE TABLE saved_products (
    profile_user_id uuid REFERENCES profile(user_id) ON DELETE CASCADE,
    product_id bigint REFERENCES products(product_id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (profile_user_id, product_id)
);

CREATE TABLE saved_posts (
    profile_user_id uuid REFERENCES profile(user_id) ON DELETE CASCADE,
    post_id bigint REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (profile_user_id, post_id)
);

ALTER TABLE saved_jobs ADD COLUMN created_at timestamp with time zone DEFAULT now();


ALTER TABLE saved_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can save publications" ON saved_publications
    FOR INSERT TO authenticated WITH CHECK (profile_user_id = auth.uid());

CREATE POLICY "Users can unsave publications" ON saved_publications
    FOR DELETE TO authenticated USING (profile_user_id = auth.uid());

CREATE POLICY "Users can view their saved publications" ON saved_publications
    FOR SELECT TO authenticated USING (profile_user_id = auth.uid());

ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can save products" ON saved_products
    FOR INSERT TO authenticated WITH CHECK (profile_user_id = auth.uid());

CREATE POLICY "Users can unsave products" ON saved_products
    FOR DELETE TO authenticated USING (profile_user_id = auth.uid());

CREATE POLICY "Users can view their saved products" ON saved_products
    FOR SELECT TO authenticated USING (profile_user_id = auth.uid());


ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can save posts" ON saved_posts
    FOR INSERT TO authenticated WITH CHECK (profile_user_id = auth.uid());

CREATE POLICY "Users can unsave posts" ON saved_posts
    FOR DELETE TO authenticated USING (profile_user_id = auth.uid());

CREATE POLICY "Users can view their saved posts" ON saved_posts
    FOR SELECT TO authenticated USING (profile_user_id = auth.uid());

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can save jobs" ON saved_jobs
    FOR INSERT TO authenticated WITH CHECK (profile_user_id = auth.uid());

CREATE POLICY "Users can unsave jobs" ON saved_jobs
    FOR DELETE TO authenticated USING (profile_user_id = auth.uid());

CREATE POLICY "Users can view their saved jobs" ON saved_jobs
    FOR SELECT TO authenticated USING (profile_user_id = auth.uid());