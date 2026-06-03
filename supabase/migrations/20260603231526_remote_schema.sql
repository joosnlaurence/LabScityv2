revoke delete on table "public"."profile_tags_temp" from "anon";

revoke insert on table "public"."profile_tags_temp" from "anon";

revoke references on table "public"."profile_tags_temp" from "anon";

revoke select on table "public"."profile_tags_temp" from "anon";

revoke trigger on table "public"."profile_tags_temp" from "anon";

revoke truncate on table "public"."profile_tags_temp" from "anon";

revoke update on table "public"."profile_tags_temp" from "anon";

revoke delete on table "public"."profile_tags_temp" from "authenticated";

revoke insert on table "public"."profile_tags_temp" from "authenticated";

revoke references on table "public"."profile_tags_temp" from "authenticated";

revoke select on table "public"."profile_tags_temp" from "authenticated";

revoke trigger on table "public"."profile_tags_temp" from "authenticated";

revoke truncate on table "public"."profile_tags_temp" from "authenticated";

revoke update on table "public"."profile_tags_temp" from "authenticated";

revoke delete on table "public"."profile_tags_temp" from "service_role";

revoke insert on table "public"."profile_tags_temp" from "service_role";

revoke references on table "public"."profile_tags_temp" from "service_role";

revoke select on table "public"."profile_tags_temp" from "service_role";

revoke trigger on table "public"."profile_tags_temp" from "service_role";

revoke truncate on table "public"."profile_tags_temp" from "service_role";

revoke update on table "public"."profile_tags_temp" from "service_role";

alter table "public"."profile_tags" drop constraint "profile_tags_tag_id_fkey";

drop index if exists "public"."tags_openalex_id_unique";

drop table "public"."profile_tags_temp";


  create table "public"."product_images" (
    "id" bigint generated always as identity not null,
    "product_id" bigint not null,
    "image_path" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."product_images" enable row level security;


  create table "public"."saved_jobs" (
    "profile_user_id" uuid not null default gen_random_uuid(),
    "jobs_id" bigint not null
      );


alter table "public"."saved_jobs" enable row level security;

alter table "public"."authors" enable row level security;

alter table "public"."authors_publications" enable row level security;

alter table "public"."jobs" enable row level security;

alter table "public"."jobs_applicants" enable row level security;

alter table "public"."jobs_skills" enable row level security;

alter table "public"."jobs_tags" enable row level security;

alter table "public"."product_tags" enable row level security;

alter table "public"."products" drop column "image_path";

alter table "public"."products" enable row level security;

alter table "public"."profile_skills" enable row level security;

alter table "public"."profile_tags" enable row level security;

alter table "public"."publication_tags" enable row level security;

alter table "public"."publications" enable row level security;

alter table "public"."skills" enable row level security;

alter table "public"."tags" enable row level security;

alter table "public"."user_products" enable row level security;

alter table "public"."user_publications" enable row level security;

CREATE UNIQUE INDEX product_images_pkey ON public.product_images USING btree (id);

CREATE UNIQUE INDEX saved_jobs_pkey ON public.saved_jobs USING btree (profile_user_id, jobs_id);

alter table "public"."product_images" add constraint "product_images_pkey" PRIMARY KEY using index "product_images_pkey";

alter table "public"."saved_jobs" add constraint "saved_jobs_pkey" PRIMARY KEY using index "saved_jobs_pkey";

alter table "public"."product_images" add constraint "product_images_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE not valid;

alter table "public"."product_images" validate constraint "product_images_product_id_fkey";

alter table "public"."saved_jobs" add constraint "saved_jobs_jobs_id_fkey" FOREIGN KEY (jobs_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."saved_jobs" validate constraint "saved_jobs_jobs_id_fkey";

alter table "public"."saved_jobs" add constraint "saved_jobs_profile_user_id_fkey" FOREIGN KEY (profile_user_id) REFERENCES public.profile(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."saved_jobs" validate constraint "saved_jobs_profile_user_id_fkey";

alter table "public"."profile_tags" add constraint "profile_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profile_tags" validate constraint "profile_tags_tag_id_fkey";

set check_function_bodies = off;

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
      SUM(pt1.weight * pt2.weight) AS dot_product
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
      o.dot_product / (m1.magnitude * m2.magnitude) AS similarity
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

grant delete on table "public"."product_images" to "anon";

grant insert on table "public"."product_images" to "anon";

grant references on table "public"."product_images" to "anon";

grant select on table "public"."product_images" to "anon";

grant trigger on table "public"."product_images" to "anon";

grant truncate on table "public"."product_images" to "anon";

grant update on table "public"."product_images" to "anon";

grant delete on table "public"."product_images" to "authenticated";

grant insert on table "public"."product_images" to "authenticated";

grant references on table "public"."product_images" to "authenticated";

grant select on table "public"."product_images" to "authenticated";

grant trigger on table "public"."product_images" to "authenticated";

grant truncate on table "public"."product_images" to "authenticated";

grant update on table "public"."product_images" to "authenticated";

grant delete on table "public"."product_images" to "service_role";

grant insert on table "public"."product_images" to "service_role";

grant references on table "public"."product_images" to "service_role";

grant select on table "public"."product_images" to "service_role";

grant trigger on table "public"."product_images" to "service_role";

grant truncate on table "public"."product_images" to "service_role";

grant update on table "public"."product_images" to "service_role";

grant delete on table "public"."saved_jobs" to "anon";

grant insert on table "public"."saved_jobs" to "anon";

grant references on table "public"."saved_jobs" to "anon";

grant select on table "public"."saved_jobs" to "anon";

grant trigger on table "public"."saved_jobs" to "anon";

grant truncate on table "public"."saved_jobs" to "anon";

grant update on table "public"."saved_jobs" to "anon";

grant delete on table "public"."saved_jobs" to "authenticated";

grant insert on table "public"."saved_jobs" to "authenticated";

grant references on table "public"."saved_jobs" to "authenticated";

grant select on table "public"."saved_jobs" to "authenticated";

grant trigger on table "public"."saved_jobs" to "authenticated";

grant truncate on table "public"."saved_jobs" to "authenticated";

grant update on table "public"."saved_jobs" to "authenticated";

grant delete on table "public"."saved_jobs" to "service_role";

grant insert on table "public"."saved_jobs" to "service_role";

grant references on table "public"."saved_jobs" to "service_role";

grant select on table "public"."saved_jobs" to "service_role";

grant trigger on table "public"."saved_jobs" to "service_role";

grant truncate on table "public"."saved_jobs" to "service_role";

grant update on table "public"."saved_jobs" to "service_role";


  create policy "Allow public read"
  on "public"."products"
  as permissive
  for select
  to public
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."publication_tags"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."publication_tags"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public read"
  on "public"."publications"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for authenticated users only"
  on "public"."publications"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."publications"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."tags"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public read"
  on "public"."user_products"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public read"
  on "public"."user_publications"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for users based on user_id"
  on "public"."user_publications"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for authenticated users only"
  on "public"."user_publications"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Allow authenticated users to upload product images 1uh8lhk_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'product_images'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Allow public read access to product images 1uh8lhk_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product_images'::text));



