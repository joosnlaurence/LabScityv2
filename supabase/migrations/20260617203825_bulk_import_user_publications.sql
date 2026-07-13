alter table "public"."publications" alter column "doi" set not null;

CREATE UNIQUE INDEX publications_doi_key ON public.publications USING btree (doi);

alter table "public"."publications" add constraint "publications_doi_key" UNIQUE using index "publications_doi_key";

set check_function_bodies = off;

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
      as p(title text, doi text, journal text, "publicationDate" date,    authors text[], type publication_type, "isOA" boolean, "pdfUrl" text, "openAlexTopicIds" text[])
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
    on conflict (publication_id, tag_id) do nothing
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


