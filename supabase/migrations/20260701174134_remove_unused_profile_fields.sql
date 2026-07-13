drop function if exists "public"."get_collaborators_final"(current_user_id uuid);

alter table "public"."profile" drop column "articles";

alter table "public"."profile" drop column "banner_pic_url";

alter table "public"."profile" drop column "profession";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_collaborators_final(current_user_id uuid)
 RETURNS TABLE(profile_user_id uuid, cosine_similarity double precision, first_name text, last_name text, profile_pic_path text, occupation text, workplace text)
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
    + COALESCE(1 - (p.skill_embedding <=> cur_skill_vec), 0) * 0.3 ) AS cosine_similarity,
    p.first_name,
    p.last_name,
    u.profile_pic_path,
    p.occupation,
    p.workplace
  FROM profile p, users u
  WHERE p.user_id <> current_user_id AND p.user_id = u.user_id
    AND (p.tag_embedding IS NOT NULL OR p.skill_embedding IS NOT NULL)
  ORDER BY cosine_similarity DESC;
END;
$function$
;


