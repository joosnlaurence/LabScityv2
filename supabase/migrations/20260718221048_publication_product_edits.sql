alter table "public"."product_tags" drop constraint "product_tags_pkey";

alter table "public"."publication_tags" drop constraint "publication_tags_pkey";

drop index if exists "public"."product_tags_pkey";

drop index if exists "public"."publication_tags_pkey";


  create table "public"."user_publication_tags" (
    "id" bigint generated always as identity not null,
    "user_id" uuid not null,
    "publication_id" bigint not null,
    "tag_id" bigint,
    "name" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_publication_tags" enable row level security;

alter table "public"."product_tags" add column "id" bigint generated always as identity not null;

alter table "public"."product_tags" add column "name" text;

alter table "public"."product_tags" alter column "tag_id" drop not null;

alter table "public"."product_tags" disable row level security;

alter table "public"."publication_tags" add column "id" bigint generated always as identity not null;

alter table "public"."publication_tags" add column "name" text;

alter table "public"."publication_tags" alter column "tag_id" drop not null;

alter table "public"."user_publications" add column "tags_overridden" boolean not null default false;

CREATE UNIQUE INDEX product_tags_unique_canonical ON public.product_tags USING btree (product_id, tag_id) WHERE (tag_id IS NOT NULL);

CREATE UNIQUE INDEX product_tags_unique_custom ON public.product_tags USING btree (product_id, lower(name)) WHERE (name IS NOT NULL);

CREATE UNIQUE INDEX publication_tags_unique_canonical ON public.publication_tags USING btree (publication_id, tag_id) WHERE (tag_id IS NOT NULL);

CREATE UNIQUE INDEX publication_tags_unique_custom ON public.publication_tags USING btree (publication_id, lower(name)) WHERE (name IS NOT NULL);

CREATE UNIQUE INDEX upt_unique_canonical ON public.user_publication_tags USING btree (user_id, publication_id, tag_id) WHERE (tag_id IS NOT NULL);

CREATE UNIQUE INDEX upt_unique_custom ON public.user_publication_tags USING btree (user_id, publication_id, lower(name)) WHERE (name IS NOT NULL);

CREATE UNIQUE INDEX user_publication_tags_pkey ON public.user_publication_tags USING btree (id);

CREATE UNIQUE INDEX product_tags_pkey ON public.product_tags USING btree (id);

CREATE UNIQUE INDEX publication_tags_pkey ON public.publication_tags USING btree (id);

alter table "public"."user_publication_tags" add constraint "user_publication_tags_pkey" PRIMARY KEY using index "user_publication_tags_pkey";

alter table "public"."product_tags" add constraint "product_tags_pkey" PRIMARY KEY using index "product_tags_pkey";

alter table "public"."publication_tags" add constraint "publication_tags_pkey" PRIMARY KEY using index "publication_tags_pkey";

alter table "public"."product_tags" add constraint "product_tag_canonical_xor_custom" CHECK (((tag_id IS NOT NULL) <> (name IS NOT NULL))) not valid;

alter table "public"."product_tags" validate constraint "product_tag_canonical_xor_custom";

alter table "public"."product_tags" add constraint "product_tag_name_len" CHECK (((name IS NULL) OR ((char_length(name) >= 2) AND (char_length(name) <= 60)))) not valid;

alter table "public"."product_tags" validate constraint "product_tag_name_len";

alter table "public"."publication_tags" add constraint "publication_tag_canonical_xor_custom" CHECK (((tag_id IS NOT NULL) <> (name IS NOT NULL))) not valid;

alter table "public"."publication_tags" validate constraint "publication_tag_canonical_xor_custom";

alter table "public"."publication_tags" add constraint "publication_tag_name_len" CHECK (((name IS NULL) OR ((char_length(name) >= 2) AND (char_length(name) <= 60)))) not valid;

alter table "public"."publication_tags" validate constraint "publication_tag_name_len";

alter table "public"."user_publication_tags" add constraint "upt_canonical_xor_custom" CHECK (((tag_id IS NOT NULL) <> (name IS NOT NULL))) not valid;

alter table "public"."user_publication_tags" validate constraint "upt_canonical_xor_custom";

alter table "public"."user_publication_tags" add constraint "upt_name_len" CHECK (((name IS NULL) OR ((char_length(name) >= 2) AND (char_length(name) <= 60)))) not valid;

alter table "public"."user_publication_tags" validate constraint "upt_name_len";

alter table "public"."user_publication_tags" add constraint "user_publication_tags_publication_id_fkey" FOREIGN KEY (publication_id) REFERENCES public.publications(publication_id) ON DELETE CASCADE not valid;

alter table "public"."user_publication_tags" validate constraint "user_publication_tags_publication_id_fkey";

alter table "public"."user_publication_tags" add constraint "user_publication_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE not valid;

alter table "public"."user_publication_tags" validate constraint "user_publication_tags_tag_id_fkey";

alter table "public"."user_publication_tags" add constraint "user_publication_tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profile(user_id) ON DELETE CASCADE not valid;

alter table "public"."user_publication_tags" validate constraint "user_publication_tags_user_id_fkey";

set check_function_bodies = off;

create or replace view "public"."effective_publication_tags" as  SELECT up.user_id,
    upt.publication_id,
    upt.tag_id,
    COALESCE(t.name, upt.name) AS name
   FROM ((public.user_publications up
     JOIN public.user_publication_tags upt ON (((upt.user_id = up.user_id) AND (upt.publication_id = up.publication_id))))
     LEFT JOIN public.tags t ON ((t.id = upt.tag_id)))
  WHERE (up.tags_overridden = true)
UNION ALL
 SELECT up.user_id,
    pt.publication_id,
    pt.tag_id,
    COALESCE(t.name, pt.name) AS name
   FROM ((public.user_publications up
     JOIN public.publication_tags pt ON ((pt.publication_id = up.publication_id)))
     LEFT JOIN public.tags t ON ((t.id = pt.tag_id)))
  WHERE (up.tags_overridden = false);


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
    on conflict (product_id, tag_id) where tag_id is not null do nothing
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

CREATE OR REPLACE FUNCTION public.bulk_import_user_publications(p_publications jsonb, p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
declare
  v_total int;
  v_inserted int;
  v_topics_linked int;
begin
  v_total := jsonb_array_length(p_publications);

  with parsed as (
    select * 
    from jsonb_to_recordset(p_publications) 
      as p(title text, doi text, journal text, "publicationDate" date, authors text[], type openalex_work_type, "isOA" boolean, "pdfUrl" text, "openAlexTopicIds" text[])
  ),
  ins_pubs as (
    insert into publications (title, doi, journal, date_published, authors, type, is_oa, pdf_url)
    select title, doi, journal, "publicationDate", authors, type, "isOA", "pdfUrl" from parsed
    on conflict(doi) do nothing
    returning publication_id, doi
  ),
  all_pub_ids as (
    select publication_id, doi from ins_pubs
    union 
    select p.publication_id, p.doi from publications p
    join parsed on p.doi = parsed.doi
  ),
  ins_links as (
    insert into user_publications (user_id, publication_id)
    select p_user_id, all_pub_ids.publication_id from all_pub_ids
    on conflict (user_id, publication_id) do nothing
    returning publication_id
  ),
  pub_topics as (
    select all_pub_ids.publication_id, topic_id
    from all_pub_ids
    join parsed on all_pub_ids.doi = parsed.doi
    cross join lateral unnest(parsed."openAlexTopicIds") as topic_id
  ),
  pub_tags as (
    select pub_topics.publication_id, tags.id as tag_id
    from pub_topics
    join tags on tags.openalex_id = topic_id
  ),
  ins_pub_tags as (
    insert into publication_tags (publication_id, tag_id)
    select publication_id, tag_id from pub_tags
    on conflict (publication_id, tag_id) where tag_id is not null do nothing
    returning 1
  )
  select 
    count(*), (select count(*) from ins_pub_tags)
  into v_inserted, v_topics_linked
  from ins_links;

  return json_build_object('inserted', v_inserted, 'skipped', v_total - v_inserted);
end
$function$
;

create or replace view "public"."user_publications_full" as  SELECT p.publication_id,
        CASE
            WHEN (up.updates ? 'title'::text) THEN (up.updates ->> 'title'::text)
            ELSE p.title
        END AS title,
        CASE
            WHEN (up.updates ? 'journal'::text) THEN (up.updates ->> 'journal'::text)
            ELSE p.journal
        END AS journal,
        CASE
            WHEN (up.updates ? 'date_published'::text) THEN ((up.updates ->> 'date_published'::text))::date
            ELSE p.date_published
        END AS date_published,
        CASE
            WHEN (up.updates ? 'authors'::text) THEN ARRAY( SELECT jsonb_array_elements_text((up.updates -> 'authors'::text)) AS jsonb_array_elements_text)
            ELSE p.authors
        END AS authors,
    p.preview_path,
        CASE
            WHEN (up.updates ? 'is_oa'::text) THEN ((up.updates ->> 'is_oa'::text))::boolean
            ELSE p.is_oa
        END AS is_oa,
        CASE
            WHEN (up.updates ? 'pdf_url'::text) THEN (up.updates ->> 'pdf_url'::text)
            ELSE p.pdf_url
        END AS pdf_url,
        CASE
            WHEN (up.updates ? 'type'::text) THEN ((up.updates ->> 'type'::text))::public.openalex_work_type
            ELSE p.type
        END AS type,
    p.doi,
    up.user_id,
    up.is_featured
   FROM (public.publications p
     JOIN public.user_publications up ON ((up.publication_id = p.publication_id)));


grant delete on table "public"."user_publication_tags" to "anon";

grant insert on table "public"."user_publication_tags" to "anon";

grant references on table "public"."user_publication_tags" to "anon";

grant select on table "public"."user_publication_tags" to "anon";

grant trigger on table "public"."user_publication_tags" to "anon";

grant truncate on table "public"."user_publication_tags" to "anon";

grant update on table "public"."user_publication_tags" to "anon";

grant delete on table "public"."user_publication_tags" to "authenticated";

grant insert on table "public"."user_publication_tags" to "authenticated";

grant references on table "public"."user_publication_tags" to "authenticated";

grant select on table "public"."user_publication_tags" to "authenticated";

grant trigger on table "public"."user_publication_tags" to "authenticated";

grant truncate on table "public"."user_publication_tags" to "authenticated";

grant update on table "public"."user_publication_tags" to "authenticated";

grant delete on table "public"."user_publication_tags" to "service_role";

grant insert on table "public"."user_publication_tags" to "service_role";

grant references on table "public"."user_publication_tags" to "service_role";

grant select on table "public"."user_publication_tags" to "service_role";

grant trigger on table "public"."user_publication_tags" to "service_role";

grant truncate on table "public"."user_publication_tags" to "service_role";

grant update on table "public"."user_publication_tags" to "service_role";


  create policy "Enable deleting product images for a user's own product"
  on "public"."product_images"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_products up
  WHERE ((up.product_id = product_images.product_id) AND (up.user_id = auth.uid())))));



  create policy "Enable updates for user's own publications"
  on "public"."publications"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.user_publications up
  WHERE ((up.publication_id = publications.publication_id) AND (up.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM public.user_publications up
  WHERE ((up.publication_id = publications.publication_id) AND (up.user_id = auth.uid())))));



  create policy "Enable auth users to delete their own custom publication tags"
  on "public"."user_publication_tags"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "Enable authenticatted users to read their custom publication ta"
  on "public"."user_publication_tags"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable autheticatied users to add their own custom publication "
  on "public"."user_publication_tags"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



