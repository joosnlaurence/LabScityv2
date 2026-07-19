drop function if exists "public"."search_users"(search_query text);

alter table "public"."notifications" add column "actor_id" uuid;

alter table "public"."notifications" alter column "title" drop not null;

alter table "public"."notifications" add constraint "notifications_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.users(user_id) not valid;

alter table "public"."notifications" validate constraint "notifications_actor_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_comment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare target_user_id uuid; wants_notification boolean; is_item_muted boolean;
begin
  select user_id into target_user_id from public.posts where post_id = new.post_id;
  if target_user_id = new.user_id then return new; end if;

  select exists (select 1 from public.muted_items
    where user_id = target_user_id and item_id = new.post_id and item_type = 'post')
  into is_item_muted;
  if is_item_muted then return new; end if;

  select is_enabled into wants_notification from public.notification_preferences
  where user_id = target_user_id and notification_type = 'new_comment';
  if wants_notification = false then return new; end if;

  insert into public.notifications (user_id, actor_id, type, link)
  values (target_user_id, new.user_id, 'new_comment', '/posts/' || new.post_id);
  return new;
end; $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_follow()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare wants_notification boolean;
begin
  select is_enabled into wants_notification from public.notification_preferences
  where user_id = new.following_id and notification_type = 'new_follow';
  if wants_notification = false then return new; end if;

  insert into public.notifications (user_id, actor_id, type, link)
  values (new.following_id, new.follower_id, 'new_follow', '/profile/' || new.follower_id);
  return new;
end; $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_like()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare target_user_id uuid; wants_notification boolean; is_item_muted boolean;
begin
  select user_id into target_user_id from public.posts where post_id = new.post_id;
  if target_user_id = new.user_id then return new; end if;

  select exists (select 1 from public.muted_items
    where user_id = target_user_id and item_id = new.post_id and item_type = 'post')
  into is_item_muted;
  if is_item_muted then return new; end if;

  select is_enabled into wants_notification from public.notification_preferences
  where user_id = target_user_id and notification_type = 'post_like';
  if wants_notification = false then return new; end if;

  insert into public.notifications (user_id, actor_id, type, link)
  values (target_user_id, new.user_id, 'post_like', '/posts/' || new.post_id);
  return new;
end; $function$
;

CREATE OR REPLACE FUNCTION public.search_users(search_query text)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, email text, profile_pic_path text, occupation text, workplace text, about text)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT u.user_id, u.first_name, u.last_name, u.email, u.profile_pic_path,
         p.occupation, p.workplace, p.about
  FROM public.users u
  LEFT JOIN public.profile p ON u.user_id = p.user_id
  WHERE
    to_tsvector('english', concat_ws(' ', u.first_name, u.last_name, u.email, p.about, array_to_string(p.skill, ' '), p.occupation, p.workplace))
    @@ websearch_to_tsquery('english', search_query)
    OR
    similarity(concat_ws(' ', u.first_name, u.last_name), search_query) > 0.15
    OR
    concat_ws(' ', u.first_name, u.last_name) ILIKE '%' || search_query || '%'
  ORDER BY
    GREATEST(
      ts_rank(
        to_tsvector('english', concat_ws(' ', u.first_name, u.last_name, u.email, p.about, array_to_string(p.skill, ' '), p.occupation, p.workplace)),
        websearch_to_tsquery('english', search_query)
      ),
      similarity(concat_ws(' ', u.first_name, u.last_name), search_query)
    ) DESC
  LIMIT 50;
END;
$function$
;


