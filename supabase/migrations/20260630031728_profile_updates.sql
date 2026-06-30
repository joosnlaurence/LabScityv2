alter table "public"."profile" add column "lab_department" text;

alter table "public"."profile" add column "location" text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_product_facets(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  with user_products as (
    select up.product_id, up.product_type
    from user_products_full up
    where up.user_id = p_user_id
  ),
  types as (
    select product_type, count(*)::int as count
    from user_products
    group by product_type
    order by count desc
  ),
  tag_counts as (
    select t.id, t.name, count(*)::int as count
    from user_products up
    join product_tags pt on pt.product_id = up.product_id
    join tags t on t.id = pt.tag_id
    group by t.id, t.name
    order by count desc, t.name
  )
  select jsonb_build_object(
    'types', coalesce((select jsonb_agg(jsonb_build_object('type', product_type, 'count', count)) from types), '[]'::jsonb),
    'tags',  coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', count)) from tag_counts), '[]'::jsonb),
    'count', (select count(*)::int from user_products)
  );
$function$
;

create or replace view "public"."user_products_full" as  SELECT up.created_at,
    up.user_id,
    p.product_id,
    p.title,
    p.short_summary,
    p.publication_id,
    p.contributors,
    p.is_featured,
    p.product_type,
    p.links
   FROM (public.user_products up
     JOIN public.products p ON ((p.product_id = up.product_id)));


CREATE OR REPLACE FUNCTION public.get_collaborators_full(current_user_id uuid)
 RETURNS TABLE(profile_user_id uuid, combined_similarity double precision, first_name text, last_name text, header_pic_path text, occupation text, workplace text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH 
  -- TAG SIMILARITY (70% weight)
  tag_overlap AS (
    SELECT pt2.profile_user_id,
      SUM(pt1.weight * pt2.weight) ASdot_product
    FROM profile_tags pt1
    JOIN profile_tags pt2 ON pt1.tag_id = pt2.tag_id
    WHERE pt1.profile_user_id = current_user_id
      AND pt2.profile_user_id != current_user_id
    GROUP BY pt2.profile_user_id
  ),
  tag_magnitudes AS (
    SELECT pt.profile_user_id,
      SQRT(SUM(pt.weight * pt.weight)) AS magnitude
    FROM profile_tags pt
    GROUP BY pt.profile_user_id
  ),
  tag_similarity AS (
    SELECT 
      o.profile_user_id,
      o.dot_product / (m1.magnitude *m2.magnitude) AS similarity
    FROM tag_overlap o
    JOIN tag_magnitudes m1 ON m1.profile_user_id = current_user_id
    JOIN tag_magnitudes m2 ON m2.profile_user_id = o.profile_user_id
  ),

  -- SKILL SIMILARITY (30% weight)
  current_user_vector AS (
    SELECT AVG(s.embedding) AS avg_embedding
    FROM profile_skills ps
    JOIN skills s ON s.id = ps.skill_id
    WHERE ps.profile_user_id = current_user_id
  ),
  other_user_vectors AS (
    SELECT
      ps.profile_user_id,
      AVG(s.embedding) AS avg_embedding
    FROM profile_skills ps
    JOIN skills s ON s.id = ps.skill_id
    WHERE ps.profile_user_id != current_user_id
    GROUP BY ps.profile_user_id
  ),
  skill_similarity AS (
    SELECT
      uv.profile_user_id,
      (1 - (uv.avg_embedding <=> cv.avg_embedding)) AS similarity
    FROM other_user_vectors uv
    CROSS JOIN current_user_vector cv
  ),

  -- COMBINED SCORE
  combined AS (
    SELECT
      COALESCE(ts.profile_user_id, ss.profile_user_id) AS profile_user_id,
      (COALESCE(ts.similarity, 0) * 0.7) + (COALESCE(ss.similarity, 0) * 0.3) AS combined_similarity
    FROM tag_similarity ts
    FULL OUTER JOIN skill_similarity ss ON ss.profile_user_id = ts.profile_user_id
  )

  SELECT 
    c.profile_user_id,
    c.combined_similarity,
    p.first_name,
    p.last_name,
    p.header_pic_path,
    p.occupation,
    p.workplace
  FROM combined c
  JOIN profile p ON p.user_id = c.profile_user_id
  ORDER BY combined_similarity DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_publication_facets(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  with user_pubs as (
    select up.publication_id, up.date_published, up.type
    from user_publications_full up
    where up.user_id = p_user_id
  ),
  years as (
    select extract(year from date_published)::int as year, count(*)::int ascount
    from user_pubs
    where date_published is not null
    group by 1
    order by year desc
  ),
  types as (
    select type, count(*)::int as count
    from user_pubs
    group by type
    order by count desc
  ),
  tag_counts as (
    select t.id, t.name, count(*)::int as count
    from user_pubs up
    join publication_tags pt on pt.publication_id = up.publication_id
    join tags t on t.id = pt.tag_id
    group by t.id, t.name
    order by count desc, t.name
  )
  select jsonb_build_object(
    'years', coalesce((select jsonb_agg(jsonb_build_object('year', year, 'count', count)) from years), '[]'::jsonb),
    'types', coalesce((select jsonb_agg(jsonb_build_object('type', type, 'count', count)) from types), '[]'::jsonb),
    'tags',  coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', count)) from tag_counts), '[]'::jsonb),
    'count', (select count(*)::int from user_pubs)
  );
$function$
;