DROP FUNCTION IF EXISTS public.get_recommended_jobs(uuid);

CREATE OR REPLACE FUNCTION public.get_recommended_jobs(p_user_id uuid)
RETURNS TABLE(
  id bigint,
  combined_similarity double precision,
  title character varying,
  description text,
  organization text,
  location text,
  job_type public.job_type,
  work_mode public.work_mode,
  academia_role public.academia_role,
  application_link text,
  poster_id uuid
)
LANGUAGE plpgsql AS $$
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
    j.id,
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
$$;