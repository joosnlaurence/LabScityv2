alter table "public"."jobs"
add column "contact_email" text;

alter table "public"."jobs"
add constraint "jobs_contact_email_format"
check (
  contact_email is null
  or contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);
