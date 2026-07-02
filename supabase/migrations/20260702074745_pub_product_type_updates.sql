create type "public"."openalex_work_type" as enum ('journal_article', 'book', 'book_chapter', 'book_review', 'conference_abstract', 'conference_paper', 'data_paper', 'dataset', 'dissertation', 'editorial', 'erratum', 'letter', 'libguides', 'other', 'paratext', 'peer_review', 'preprint', 'reference_entry', 'technical_report', 'retraction', 'review_article', 'software', 'software_product', 'standard', 'supplementary_materials');

drop view if exists "public"."user_products_full";
drop view if exists "public"."user_publications_full";

alter type "public"."product_type_enum" rename to "product_type_enum__old_version_to_be_dropped";
create type "public"."product_type_enum" as enum ('tool', 'platform', 'ai_tool', 'simulation', 'other', 'conference_abstract', 'data_paper', 'dataset', 'dissertation', 'erratum', 'letter', 'libguides', 'paratext', 'peer_review', 'preprint', 'reference_entry', 'technical_report', 'retraction', 'review_article', 'software', 'standard', 'supplementary_materials');
alter table "public"."products"
  alter column product_type type "public"."product_type_enum"
  using product_type::text::"public"."product_type_enum";
drop type "public"."product_type_enum__old_version_to_be_dropped";

alter type "public"."publication_type" rename to "publication_type__old_version_to_be_dropped";
alter table "public"."publications" alter column "type" drop default;
alter table "public"."publications"
  alter column "type" set data type public.openalex_work_type
  using "type"::text::public.openalex_work_type;
drop type "public"."publication_type__old_version_to_be_dropped";

create or replace view "public"."user_products_full" as
  SELECT up.created_at,
    up.user_id,
    p.product_id,
    p.title,
    p.short_summary,
    p.publication_id,
    p.contributors,
    p.is_featured,
    p.product_type,
    p.links
  FROM (public.user_products up
    JOIN public.products p ON ((p.product_id = up.product_id)));

create or replace view "public"."user_publications_full" as
  SELECT p.publication_id,
    p.title,
    p.journal,
    p.date_published,
    p.authors,
    p.preview_path,
    p.is_oa,
    p.pdf_url,
    p.type,
    p.doi,
    up.user_id,
    up.is_featured
  FROM (public.publications p
    JOIN public.user_publications up ON ((up.publication_id = p.publication_id)));