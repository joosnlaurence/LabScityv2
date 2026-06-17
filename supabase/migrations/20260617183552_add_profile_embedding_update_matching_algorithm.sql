ALTER TABLE profile
  ADD COLUMN tag_embedding   vector,
  ADD COLUMN skill_embedding vector;



CREATE OR REPLACE FUNCTION recompute_profile_tag_embedding(target_user_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE profile p
  SET tag_embedding = sub.weighted_sum
  FROM (
    SELECT SUM(t.embedding * array_fill(pt.weight::real,
                                        ARRAY[vector_dims(t.embedding)])::vector) AS weighted_sum
    FROM profile_tags pt
    JOIN tags t ON t.id = pt.tag_id
    WHERE pt.profile_user_id = target_user_id
  ) sub
  WHERE p.user_id = target_user_id;
$$;

CREATE OR REPLACE FUNCTION recompute_profile_skill_embedding(target_user_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE profile p
  SET skill_embedding = sub.avg_embedding
  FROM (
    SELECT AVG(s.embedding) AS avg_embedding
    FROM profile_skills ps
    JOIN skills s ON s.id = ps.skill_id
    WHERE ps.profile_user_id = target_user_id
  ) sub
  WHERE p.user_id = target_user_id;
$$;



CREATE OR REPLACE FUNCTION refresh_tag_embedding_on_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM recompute_profile_tag_embedding(uid)
    FROM (SELECT DISTINCT profile_user_id AS uid FROM changed_new) s;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM recompute_profile_tag_embedding(uid)
    FROM (SELECT DISTINCT profile_user_id AS uid FROM changed_old) s;
  ELSE
    PERFORM recompute_profile_tag_embedding(uid)
    FROM (SELECT profile_user_id AS uid FROM changed_new
          UNION SELECT profile_user_id FROM changed_old) s;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER profile_tags_refresh_ins AFTER INSERT ON profile_tags
  REFERENCING NEW TABLE AS changed_new
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_tag_embedding_on_change();
CREATE TRIGGER profile_tags_refresh_del AFTER DELETE ON profile_tags
  REFERENCING OLD TABLE AS changed_old
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_tag_embedding_on_change();
CREATE TRIGGER profile_tags_refresh_upd AFTER UPDATE ON profile_tags
  REFERENCING NEW TABLE AS changed_new OLD TABLE AS changed_old
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_tag_embedding_on_change();

CREATE OR REPLACE FUNCTION refresh_skill_embedding_on_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM recompute_profile_skill_embedding(uid)
    FROM (SELECT DISTINCT profile_user_id AS uid FROM changed_new) s;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM recompute_profile_skill_embedding(uid)
    FROM (SELECT DISTINCT profile_user_id AS uid FROM changed_old) s;
  ELSE
    PERFORM recompute_profile_skill_embedding(uid)
    FROM (SELECT profile_user_id AS uid FROM changed_new
          UNION SELECT profile_user_id FROM changed_old) s;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER profile_skills_refresh_ins AFTER INSERT ON profile_skills
  REFERENCING NEW TABLE AS changed_new
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_skill_embedding_on_change();
CREATE TRIGGER profile_skills_refresh_del AFTER DELETE ON profile_skills
  REFERENCING OLD TABLE AS changed_old
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_skill_embedding_on_change();
CREATE TRIGGER profile_skills_refresh_upd AFTER UPDATE ON profile_skills
  REFERENCING NEW TABLE AS changed_new OLD TABLE AS changed_old
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_skill_embedding_on_change();



SELECT recompute_profile_tag_embedding(user_id)   FROM profile;
SELECT recompute_profile_skill_embedding(user_id) FROM profile;



CREATE OR REPLACE FUNCTION get_collaborators_full(current_user_id uuid)
RETURNS TABLE (
  profile_user_id     uuid,
  combined_similarity double precision,
  first_name          text,
  last_name           text,
  header_pic_path     text,
  occupation          text,
  workplace           text
)
LANGUAGE plpgsql AS $$
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
$$;