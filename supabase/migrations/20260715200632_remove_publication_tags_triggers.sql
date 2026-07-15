drop trigger if exists "publication_tags_refresh_del" on "public"."publication_tags";

drop trigger if exists "publication_tags_refresh_ins" on "public"."publication_tags";

drop trigger if exists "publication_tags_refresh_upd" on "public"."publication_tags";

drop function if exists "public"."refresh_profile_tags_on_publication_tag_change"();

alter table "public"."profile" alter column "skill_embedding" set data type extensions.vector(1024) using "skill_embedding"::extensions.vector(1024);

alter table "public"."profile" alter column "tag_embedding" set data type extensions.vector(1024) using "tag_embedding"::extensions.vector(1024);

alter table "public"."skills" alter column "embedding" set data type extensions.vector(1024) using "embedding"::extensions.vector(1024);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.refresh_profile_tags_on_user_pub_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
begin
  if tg_op = 'INSERT' then
    perform recompute_profile_tags_from_publications(uid)
    from (select distinct user_id as uid from changed_new) s;
  elsif tg_op = 'DELETE' then
    perform recompute_profile_tags_from_publications(uid)
    from (select distinct user_id as uid from changed_old) s;
  else
    perform recompute_profile_tags_from_publications(uid)
    from (select user_id as uid from changed_new
          union select user_id from changed_old) s;
  end if;
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.recompute_profile_tags_from_publications(p_user_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  delete from profile_tags where profile_user_id = p_user_id;

  insert into profile_tags (profile_user_id, tag_id, raw_count, weight)
  select p_user_id, pt.tag_id,
         count(*)::integer,
         count(*)::double precision /
           (select count(*) from user_publications where user_id = p_user_id)
  from publication_tags pt
  join user_publications up on up.publication_id = pt.publication_id
  where up.user_id = p_user_id
  group by pt.tag_id;
$function$
;

CREATE TRIGGER user_publications_refresh_tags_del AFTER DELETE ON public.user_publications REFERENCING OLD TABLE AS changed_old FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_profile_tags_on_user_pub_change();

CREATE TRIGGER user_publications_refresh_tags_ins AFTER INSERT ON public.user_publications REFERENCING NEW TABLE AS changed_new FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_profile_tags_on_user_pub_change();


