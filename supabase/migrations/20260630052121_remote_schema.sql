drop policy "Enable insert for authenticated users only" on "public"."product_images";

drop policy "Enable read access for all users" on "public"."product_images";

drop policy "Enable insert for authenticated users only" on "public"."product_tags";

drop policy "Enable read access for all users" on "public"."product_tags";

alter table "public"."jobs" disable row level security;

alter table "public"."jobs_applicants" disable row level security;

alter table "public"."jobs_skills" disable row level security;

alter table "public"."jobs_tags" disable row level security;

alter table "public"."product_images" alter column "height" set not null;

alter table "public"."product_images" alter column "position" set not null;

alter table "public"."product_images" alter column "width" set not null;

alter table "public"."profile" drop column "lab_department";

alter table "public"."profile" drop column "location";

alter table "public"."profile" add column "profile_embedding" extensions.vector(1024);

alter table "public"."saved_jobs" disable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.compute_job_embedding(p_job_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  computed_vector vector(1024);
BEGIN
  SELECT scale_vector(SUM(scale_vector(t.embedding, jt.weight)), 1.0)
  INTO computed_vector
  FROM jobs_tags jt
  JOIN tags t ON t.id = jt.tag_id
  WHERE jt.job_id = p_job_id;

  UPDATE jobs
  SET job_embedding = computed_vector
  WHERE id = p_job_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.compute_profile_embedding(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  computed_vector vector(1024);
BEGIN
  SELECT
    (COALESCE(tag_part, skill_part))
  INTO computed_vector
  FROM (
    SELECT
      -- TAG (70%)
      (SELECT scale_vector(SUM(scale_vector(t.embedding, pt.weight)), 0.7)
       FROM profile_tags pt
       JOIN tags t ON t.id = pt.tag_id
       WHERE pt.profile_user_id = p_user_id) AS tag_part,

      -- SKILL (30%)
      (SELECT scale_vector(AVG(s.embedding), 0.3)
       FROM profile_skills ps
       JOIN skills s ON s.id = ps.skill_id
       WHERE ps.profile_user_id = p_user_id) AS skill_part
  ) parts;

  UPDATE profile
  SET profile_embedding = computed_vector
  WHERE user_id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_recommended_jobs(p_user_id uuid)
 RETURNS TABLE(out_job_id bigint, combined_similarity double precision, title character varying, description text, organization text, location text, job_type public.job_type, work_mode public.work_mode, academia_role public.academia_role, application_link text, poster_id uuid)
 LANGUAGE plpgsql
AS $function$
DECLARE
  cur_tag_vec   extensions.vector;
  cur_skill_vec extensions.vector;
BEGIN
  SELECT p.tag_embedding, p.skill_embedding
  INTO cur_tag_vec, cur_skill_vec
  FROM profile p
  WHERE p.user_id = p_user_id;

  RETURN QUERY
  WITH
  -- TAG SIMILARITY (60% weight)
  job_tag_vectors AS (
    SELECT
      jt.job_id,
      AVG(t.embedding) AS avg_embedding
    FROM (
      SELECT job_id, tag_id, is_required FROM jobs_tags
      UNION ALL
      SELECT job_id, tag_id, is_required FROM jobs_tags WHERE is_required = true
    ) jt
    JOIN tags t ON t.id = jt.tag_id
    GROUP BY jt.job_id
  ),

  job_skill_vectors AS (
    SELECT
      js.job_id,
      AVG(s.embedding) AS avg_embedding
    FROM (
      SELECT job_id, skill_id, is_required FROM jobs_skills
      UNION ALL
      SELECT job_id, skill_id, is_required FROM jobs_skills WHERE is_required = true
    ) js
    JOIN skills s ON s.id = js.skill_id
    GROUP BY js.job_id
  ),

  combined AS (
    SELECT
      COALESCE(jt.job_id, js.job_id) AS job_id,
      ( COALESCE(1 - (jt.avg_embedding <=> cur_tag_vec), 0) * 0.6
      + COALESCE(1 - (js.avg_embedding <=> cur_skill_vec), 0) * 0.4 ) AS combined_similarity
    FROM job_tag_vectors jt
    FULL OUTER JOIN job_skill_vectors js ON js.job_id = jt.job_id
  )

  SELECT
    c.job_id,
    c.combined_similarity,
    j.title,
    j.description,
    j.organization,
    j.location,
    j.job_type,
    j.work_mode,
    j.academia_role,
    j.application_link,
    j.poster_id
  FROM combined c
  JOIN jobs j ON j.id = c.job_id
  ORDER BY combined_similarity DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.recompute_profile_tags_from_publications(p_user_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  INSERT INTO profile_tags (profile_user_id, tag_id, raw_count, weight)
  SELECT
    p_user_id,
    pt.tag_id,
    COUNT(*)::integer AS raw_count,
    COUNT(*)::double precision / (
      SELECT COUNT(*) FROM user_publications WHERE user_id = p_user_id
    ) AS weight
  FROM publication_tags pt
  JOIN user_publications up ON up.publication_id = pt.publication_id
  WHERE up.user_id = p_user_id
  GROUP BY pt.tag_id
  ON CONFLICT (profile_user_id, tag_id)
  DO UPDATE SET
    raw_count = EXCLUDED.raw_count,
    weight = EXCLUDED.weight;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_profile_tags_on_publication_tag_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM recompute_profile_tags_from_publications(up.user_id)
    FROM (SELECT DISTINCT publication_id FROM changed_new) cn
    JOIN user_publications up ON up.publication_id = cn.publication_id
    JOIN profile p ON p.user_id = up.user_id
    WHERE p.orcid IS NULL;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM recompute_profile_tags_from_publications(up.user_id)
    FROM (SELECT DISTINCT publication_id FROM changed_old) co
    JOIN user_publications up ON up.publication_id = co.publication_id
    JOIN profile p ON p.user_id = up.user_id
    WHERE p.orcid IS NULL;
  ELSE
    PERFORM recompute_profile_tags_from_publications(up.user_id)
    FROM (
      SELECT publication_id FROM changed_new
      UNION
      SELECT publication_id FROM changed_old
    ) c
    JOIN user_publications up ON up.publication_id = c.publication_id
    JOIN profile p ON p.user_id = up.user_id
    WHERE p.orcid IS NULL;
  END IF;
  RETURN NULL;
END; $function$
;

CREATE OR REPLACE FUNCTION public.get_collaborators_full(current_user_id uuid)
 RETURNS TABLE(profile_user_id uuid, combined_similarity double precision, first_name text, last_name text, header_pic_path text, occupation text, workplace text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  cur_tag_vec   vector;
  cur_skill_vec vector;
BEGIN
  SELECT p.tag_embedding, p.skill_embedding
  INTO cur_tag_vec, cur_skill_vec
  FROM profile p
  WHERE p.user_id = current_user_id;

  RETURN QUERY
  SELECT
    p.user_id,
    ( COALESCE(1 - (p.tag_embedding   <=> cur_tag_vec),   0) * 0.7
    + COALESCE(1 - (p.skill_embedding <=> cur_skill_vec), 0) * 0.3 ) AS combined_similarity,
    p.first_name,
    p.last_name,
    p.header_pic_path,
    p.occupation,
    p.workplace
  FROM profile p
  WHERE p.user_id <> current_user_id
    AND (p.tag_embedding IS NOT NULL OR p.skill_embedding IS NOT NULL)
  ORDER BY combined_similarity DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_collaborators_skills(current_user_id uuid, input_skill_ids bigint[], match_limit integer DEFAULT 10)
 RETURNS TABLE(profile_user_id uuid, cosine_similarity double precision, first_name text, last_name text, header_pic_path text, occupation text, workplace text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH
  query_vector AS (
    SELECT AVG(embedding) AS avg_embedding
    FROM skills
    WHERE id = ANY(input_skill_ids)
  ),
  user_vectors AS (
    SELECT
      ps.profile_user_id,
      AVG(s.embedding) AS avg_embedding
    FROM profile_skills ps
    JOIN skills s ON s.id = ps.skill_id
    WHERE ps.profile_user_id != current_user_id
    GROUP BY ps.profile_user_id
  )
  SELECT uv.profile_user_id,
    (1 - (uv.avg_embedding <=> qv.avg_embedding)) AS cosine_similarity,
    p.first_name,
    p.last_name,
    p.header_pic_path,
    p.occupation,
    p.workplace
  FROM user_vectors uv
  CROSS JOIN query_vector qv
  JOIN profile p ON p.user_id = uv.profile_user_id
  ORDER BY cosine_similarity DESC;
END;
$function$
;

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
    'tags',  coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', count)) from tag_counts), '[]'::jsonb)
  );
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
    select extract(year from date_published)::int as year, count(*)::int as count
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
    'tags',  coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', count)) from tag_counts), '[]'::jsonb)
  );
$function$
;


  create policy "Enable delete for authenticated users only"
  on "public"."publication_tags"
  as permissive
  for delete
  to authenticated
using (true);


CREATE TRIGGER publication_tags_refresh_del AFTER DELETE ON public.publication_tags REFERENCING OLD TABLE AS changed_old FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_profile_tags_on_publication_tag_change();

CREATE TRIGGER publication_tags_refresh_ins AFTER INSERT ON public.publication_tags REFERENCING NEW TABLE AS changed_new FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_profile_tags_on_publication_tag_change();

CREATE TRIGGER publication_tags_refresh_upd AFTER UPDATE ON public.publication_tags REFERENCING OLD TABLE AS changed_old NEW TABLE AS changed_new FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_profile_tags_on_publication_tag_change();


