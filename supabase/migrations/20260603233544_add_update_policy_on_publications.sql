create or replace view "public"."user_publications_full" as  SELECT p.publication_id,
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



  create policy "Enable authenticated users to update their own publications onl"
  on "public"."user_publications"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



