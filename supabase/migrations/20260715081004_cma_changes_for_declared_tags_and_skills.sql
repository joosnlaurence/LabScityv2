
  create table "public"."custom_profile_skills" (
    "id" bigint generated always as identity not null,
    "user_id" uuid not null,
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."declared_profile_tags" (
    "id" bigint generated always as identity not null,
    "user_id" uuid not null,
    "tag_id" bigint,
    "name" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."profile" add column "declared_tag_embedding" extensions.vector(1024);

CREATE UNIQUE INDEX custom_profile_skills_pkey ON public.custom_profile_skills USING btree (id);

CREATE UNIQUE INDEX declared_profile_tags_pkey ON public.declared_profile_tags USING btree (id);

CREATE UNIQUE INDEX declared_tags_unique_canonical ON public.declared_profile_tags USING btree (user_id, tag_id) WHERE (tag_id IS NOT NULL);

CREATE UNIQUE INDEX declared_tags_unique_custom ON public.declared_profile_tags USING btree (user_id, lower(name)) WHERE (name IS NOT NULL);

alter table "public"."custom_profile_skills" add constraint "custom_profile_skills_pkey" PRIMARY KEY using index "custom_profile_skills_pkey";

alter table "public"."declared_profile_tags" add constraint "declared_profile_tags_pkey" PRIMARY KEY using index "declared_profile_tags_pkey";

alter table "public"."custom_profile_skills" add constraint "custom_profile_skills_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profile(user_id) ON DELETE CASCADE not valid;

alter table "public"."custom_profile_skills" validate constraint "custom_profile_skills_user_id_fkey";

alter table "public"."custom_profile_skills" add constraint "custom_skills_name_len" CHECK (((char_length(name) >= 2) AND (char_length(name) <= 60))) not valid;

alter table "public"."custom_profile_skills" validate constraint "custom_skills_name_len";

alter table "public"."declared_profile_tags" add constraint "canonical_xor_custom" CHECK (((tag_id IS NOT NULL) <> (name IS NOT NULL))) not valid;

alter table "public"."declared_profile_tags" validate constraint "canonical_xor_custom";

alter table "public"."declared_profile_tags" add constraint "declared_profile_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE not valid;

alter table "public"."declared_profile_tags" validate constraint "declared_profile_tags_tag_id_fkey";

alter table "public"."declared_profile_tags" add constraint "declared_profile_tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profile(user_id) ON DELETE CASCADE not valid;

alter table "public"."declared_profile_tags" validate constraint "declared_profile_tags_user_id_fkey";

alter table "public"."declared_profile_tags" add constraint "declared_tag_name_len" CHECK (((name IS NULL) OR ((char_length(name) >= 2) AND (char_length(name) <= 60)))) not valid;

alter table "public"."declared_profile_tags" validate constraint "declared_tag_name_len";

set check_function_bodies = off;

create or replace view "public"."profile_declared_tags_view" as  SELECT dt.user_id,
    dt.tag_id,
    COALESCE(t.name, dt.name) AS name,
    (dt.tag_id IS NULL) AS is_custom
   FROM (public.declared_profile_tags dt
     LEFT JOIN public.tags t ON ((t.id = dt.tag_id)));


create or replace view "public"."profile_skills_view" as  SELECT ps.profile_user_id AS user_id,
    s.id AS skill_id,
    s.name,
    false AS is_custom
   FROM (public.profile_skills ps
     JOIN public.skills s ON ((s.id = ps.skill_id)))
UNION ALL
 SELECT cs.user_id,
    NULL::bigint AS skill_id,
    cs.name,
    true AS is_custom
   FROM public.custom_profile_skills cs;


CREATE OR REPLACE FUNCTION public.refresh_declared_tag_embedding(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
begin
  update profile p
  set declared_tag_embedding = sub.avg_embedding
  from (
    select avg(t.embedding) as avg_embedding
    from declared_profile_tags dt
    join tags t on t.id = dt.tag_id
    where dt.user_id = target_user_id
  ) sub
  where p.user_id = target_user_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_declared_tag_on_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
begin
  if tg_op = 'INSERT' then
    perform refresh_declared_tag_embedding(uid)
    from (select distinct user_id as uid from changed_new) s;
  elsif tg_op = 'DELETE' then
    perform refresh_declared_tag_embedding(uid)
    from (select distinct user_id as uid from changed_old) s;
  else
    perform refresh_declared_tag_embedding(uid)
    from (select user_id as uid from changed_new
          union select user_id from changed_old) s;
  end if;
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_declared_tags(p_tag_ids bigint[], p_custom_names text[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(array_length(p_tag_ids, 1), 0)
   + coalesce(array_length(p_custom_names, 1), 0) > 20 then
    raise exception 'Must list at most 20 research areas';
  end if;

  delete from declared_profile_tags where user_id = uid;

  insert into declared_profile_tags (user_id, tag_id)
  select uid, unnest(p_tag_ids);

  insert into declared_profile_tags (user_id, name)
  select uid, unnest(p_custom_names);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_profile_skills(p_skill_ids bigint[], p_custom_names text[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(array_length(p_skill_ids, 1), 0)
   + coalesce(array_length(p_custom_names, 1), 0) > 20 then
    raise exception 'Too many skills';
  end if;

  delete from profile_skills where profile_user_id = uid;
  delete from custom_profile_skills where user_id = uid;

  insert into profile_skills (profile_user_id, skill_id)
  select uid, unnest(p_skill_ids);

  insert into custom_profile_skills (user_id, name)
  select uid, unnest(p_custom_names);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_collaborators_final(current_user_id uuid)
 RETURNS TABLE(profile_user_id uuid, cosine_similarity double precision, first_name text, last_name text, profile_pic_path text, occupation text, workplace text)
 LANGUAGE plpgsql
AS $function$
declare
  cur_tag_vec      vector;
  cur_decl_vec     vector;
  cur_skill_vec    vector;
begin
  select p.tag_embedding, p.declared_tag_embedding, p.skill_embedding
  into cur_tag_vec, cur_decl_vec, cur_skill_vec
  from profile p
  where p.user_id = current_user_id;

  return query
  select
    p.user_id,
    ( coalesce(1 - (p.tag_embedding          <=> cur_tag_vec),   0) * 0.4
    + coalesce(1 - (p.declared_tag_embedding <=> cur_decl_vec),  0) * 0.3
    + coalesce(1 - (p.skill_embedding        <=> cur_skill_vec), 0) * 0.3 )
    / nullif(
        case when p.tag_embedding          is not null and cur_tag_vec   is not null then 0.4 else 0 end
      + case when p.declared_tag_embedding is not null and cur_decl_vec  is not null then 0.3 else 0 end
      + case when p.skill_embedding        is not null and cur_skill_vec is not null then 0.3 else 0 end
      , 0) as cosine_similarity,
    p.first_name, p.last_name, u.profile_pic_path, p.occupation, p.workplace
  from profile p, users u
  where p.user_id <> current_user_id and p.user_id = u.user_id
    and (
      (p.tag_embedding          is not null and cur_tag_vec   is not null) or
      (p.declared_tag_embedding is not null and cur_decl_vec  is not null) or
      (p.skill_embedding        is not null and cur_skill_vec is not null)
    )
  order by cosine_similarity desc nulls last;
end;
$function$
;

grant delete on table "public"."custom_profile_skills" to "anon";

grant insert on table "public"."custom_profile_skills" to "anon";

grant references on table "public"."custom_profile_skills" to "anon";

grant select on table "public"."custom_profile_skills" to "anon";

grant trigger on table "public"."custom_profile_skills" to "anon";

grant truncate on table "public"."custom_profile_skills" to "anon";

grant update on table "public"."custom_profile_skills" to "anon";

grant delete on table "public"."custom_profile_skills" to "authenticated";

grant insert on table "public"."custom_profile_skills" to "authenticated";

grant references on table "public"."custom_profile_skills" to "authenticated";

grant select on table "public"."custom_profile_skills" to "authenticated";

grant trigger on table "public"."custom_profile_skills" to "authenticated";

grant truncate on table "public"."custom_profile_skills" to "authenticated";

grant update on table "public"."custom_profile_skills" to "authenticated";

grant delete on table "public"."custom_profile_skills" to "service_role";

grant insert on table "public"."custom_profile_skills" to "service_role";

grant references on table "public"."custom_profile_skills" to "service_role";

grant select on table "public"."custom_profile_skills" to "service_role";

grant trigger on table "public"."custom_profile_skills" to "service_role";

grant truncate on table "public"."custom_profile_skills" to "service_role";

grant update on table "public"."custom_profile_skills" to "service_role";

grant delete on table "public"."declared_profile_tags" to "anon";

grant insert on table "public"."declared_profile_tags" to "anon";

grant references on table "public"."declared_profile_tags" to "anon";

grant select on table "public"."declared_profile_tags" to "anon";

grant trigger on table "public"."declared_profile_tags" to "anon";

grant truncate on table "public"."declared_profile_tags" to "anon";

grant update on table "public"."declared_profile_tags" to "anon";

grant delete on table "public"."declared_profile_tags" to "authenticated";

grant insert on table "public"."declared_profile_tags" to "authenticated";

grant references on table "public"."declared_profile_tags" to "authenticated";

grant select on table "public"."declared_profile_tags" to "authenticated";

grant trigger on table "public"."declared_profile_tags" to "authenticated";

grant truncate on table "public"."declared_profile_tags" to "authenticated";

grant update on table "public"."declared_profile_tags" to "authenticated";

grant delete on table "public"."declared_profile_tags" to "service_role";

grant insert on table "public"."declared_profile_tags" to "service_role";

grant references on table "public"."declared_profile_tags" to "service_role";

grant select on table "public"."declared_profile_tags" to "service_role";

grant trigger on table "public"."declared_profile_tags" to "service_role";

grant truncate on table "public"."declared_profile_tags" to "service_role";

grant update on table "public"."declared_profile_tags" to "service_role";

CREATE TRIGGER declared_tags_refresh_del AFTER DELETE ON public.declared_profile_tags REFERENCING OLD TABLE AS changed_old FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_declared_tag_on_change();

CREATE TRIGGER declared_tags_refresh_ins AFTER INSERT ON public.declared_profile_tags REFERENCING NEW TABLE AS changed_new FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_declared_tag_on_change();

CREATE TRIGGER declared_tags_refresh_upd AFTER UPDATE ON public.declared_profile_tags REFERENCING OLD TABLE AS changed_old NEW TABLE AS changed_new FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_declared_tag_on_change();


