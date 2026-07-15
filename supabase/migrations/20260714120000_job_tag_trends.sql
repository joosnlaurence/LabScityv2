create table "public"."job_tag_trends" (
    "tag_id" bigint not null,
    "job_count" integer not null default 0,
    "updated_at" timestamp with time zone not null default now()
);

alter table "public"."job_tag_trends" add constraint "job_tag_trends_pkey" primary key ("tag_id");

alter table "public"."job_tag_trends" add constraint "job_tag_trends_tag_id_fkey"
    foreign key ("tag_id") references "public"."tags"("id") on delete cascade;

alter table "public"."job_tag_trends" enable row level security;

create policy "Enable read access for all users"
on "public"."job_tag_trends"
as permissive
for select
to public
using (true);

CREATE OR REPLACE FUNCTION public.handle_job_tag_trend_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.job_tag_trends (tag_id, job_count, updated_at)
    VALUES (NEW.tag_id, 1, now())
    ON CONFLICT (tag_id)
    DO UPDATE SET job_count = job_tag_trends.job_count + 1, updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.job_tag_trends
    SET job_count = GREATEST(job_count - 1, 0), updated_at = now()
    WHERE tag_id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE TRIGGER job_tags_trend_insert
AFTER INSERT ON public.jobs_tags
FOR EACH ROW
EXECUTE FUNCTION public.handle_job_tag_trend_change();

CREATE TRIGGER job_tags_trend_delete
AFTER DELETE ON public.jobs_tags
FOR EACH ROW
EXECUTE FUNCTION public.handle_job_tag_trend_change();
