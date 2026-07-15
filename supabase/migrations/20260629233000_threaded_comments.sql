alter table "public"."comment"
add column if not exists "parent_comment_id" bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'comment_parent_comment_id_fkey'
  ) then
    alter table "public"."comment"
    add constraint "comment_parent_comment_id_fkey"
    foreign key ("parent_comment_id")
    references "public"."comment"("comment_id")
    on update cascade
    on delete cascade;
  end if;
end
$$;

create index if not exists "comment_post_parent_created_idx"
on "public"."comment" ("post_id", "parent_comment_id", "created_at");
