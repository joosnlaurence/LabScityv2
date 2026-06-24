set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_publication_facets(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  with user_pubs as (
    select up.publication_id, up.date_published, up.type
    from user_publications_full up
    where up.user_id = p_user_id
  ),
  years as (
    select extract(year from date_published)::int as year, count(*)::int as count
    from user_pubs
    where date_published is not null
    group by 1
    order by year desc
  ),
  types as (
    select type, count(*)::int as count
    from user_pubs
    group by type
    order by count desc
  ),
  tag_counts as (
    select t.id, t.name, count(*)::int as count
    from user_pubs up
    join publication_tags pt on pt.publication_id = up.publication_id
    join tags t on t.id = pt.tag_id
    group by t.id, t.name
    order by count desc, t.name
  )
  select jsonb_build_object(
    'years', coalesce((select jsonb_agg(jsonb_build_object('year', year, 'count', count)) from years), '[]'::jsonb),
    'types', coalesce((select jsonb_agg(jsonb_build_object('type', type, 'count', count)) from types), '[]'::jsonb),
    'tags',  coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', count)) from tag_counts), '[]'::jsonb)
  );
$function$
;


