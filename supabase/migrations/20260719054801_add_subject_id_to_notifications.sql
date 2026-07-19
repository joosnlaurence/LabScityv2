alter table "public"."notifications" add column "subject_id" bigint;

alter table "public"."notifications" add constraint "notifications_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES public.posts(post_id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_subject_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_comment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  target_user_id uuid;
  wants_notification boolean;
  is_item_muted boolean;
begin
  select user_id into target_user_id from public.posts where post_id = new.post_id;

  if target_user_id = new.user_id then return new; end if;

  select exists (
    select 1 from public.muted_items
    where user_id = target_user_id and item_id = new.post_id and item_type = 'post'
  ) into is_item_muted;
  if is_item_muted then return new; end if;

  select is_enabled into wants_notification from public.notification_preferences
  where user_id = target_user_id and notification_type = 'new_comment';
  if wants_notification = false then return new; end if;

  insert into public.notifications (user_id, actor_id, subject_id, type, link)
  values (target_user_id, new.user_id, new.post_id, 'new_comment', '/posts/' || new.post_id);

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_like()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  target_user_id uuid;
  wants_notification boolean;
  is_item_muted boolean;
begin
  select user_id into target_user_id from public.posts where post_id = new.post_id;

  if target_user_id = new.user_id then return new; end if;

  select exists (
    select 1 from public.muted_items
    where user_id = target_user_id and item_id = new.post_id and item_type = 'post'
  ) into is_item_muted;
  if is_item_muted then return new; end if;

  select is_enabled into wants_notification from public.notification_preferences
  where user_id = target_user_id and notification_type = 'post_like';
  if wants_notification = false then return new; end if;

  insert into public.notifications (user_id, actor_id, subject_id, type, link)
  values (target_user_id, new.user_id, new.post_id, 'post_like', '/posts/' || new.post_id);

  return new;
end;
$function$
;


