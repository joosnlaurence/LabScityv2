drop view if exists "public"."user_products_full";

alter table "public"."products" drop column "is_featured";

alter table "public"."products" add column "openalex_id" text;

alter table "public"."products" add column "release_date" date;

alter table "public"."user_products" add column "is_featured" boolean not null default false;

CREATE UNIQUE INDEX products_openalex_id_idx ON public.products USING btree (openalex_id);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.bulk_import_user_products(p_products jsonb, p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
declare
  v_total int;
  v_inserted int;
  v_topics_linked int;
begin
  v_total := jsonb_array_length(p_products);

  with parsed as (
    select *
    from jsonb_to_recordset(p_products)
      as p("workId" text, title text, contributors text[], type product_type_enum, "releaseDate" date, links jsonb, "openAlexTopicIds" text[])
  ),
  ins_prods as (
    insert into products (openalex_id, title, contributors, product_type, release_date, links)
    select "workId", title, contributors, type, "releaseDate", links from parsed
    on conflict (openalex_id) do nothing
    returning product_id, openalex_id
  ),
  all_prod_ids as (
    select product_id, openalex_id from ins_prods
    union
    select p.product_id, p.openalex_id from products p
    join parsed on p.openalex_id = parsed."workId"
  ),
  ins_links as (
    insert into user_products (user_id, product_id)
    select p_user_id, all_prod_ids.product_id from all_prod_ids
    on conflict (user_id, product_id) do nothing
    returning product_id
  ),
  prod_topics as (
    select all_prod_ids.product_id, topic_id
    from all_prod_ids
    join parsed on all_prod_ids.openalex_id = parsed."workId"
    cross join lateral unnest(parsed."openAlexTopicIds") as topic_id
  ),
  prod_tags as (
    select prod_topics.product_id, tags.id as tag_id
    from prod_topics
    join tags on tags.openalex_id = topic_id
  ),
  ins_prod_tags as (
    insert into product_tags (product_id, tag_id)
    select product_id, tag_id from prod_tags
    on conflict (product_id, tag_id) do nothing
    returning 1
  )
  select
    count(*), (select count(*) from ins_prod_tags)
  into v_inserted, v_topics_linked
  from ins_links;

  return json_build_object(
    'inserted', v_inserted,
    'skipped', v_total - v_inserted
  );
end
$function$
;

create or replace view "public"."user_products_full" as  SELECT up.created_at,
    up.user_id,
    p.product_id,
    p.title,
    p.short_summary,
    p.publication_id,
    p.contributors,
    up.is_featured,
    p.product_type,
    p.links,
    p.release_date,
    COALESCE((p.release_date)::timestamp with time zone, up.created_at) AS sort_date
   FROM (public.user_products up
     JOIN public.products p ON ((p.product_id = up.product_id)));



  create policy "Enabled authenticated users to update user_publications"
  on "public"."user_products"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



