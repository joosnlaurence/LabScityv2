alter table "public"."products" drop constraint "products_other_links_check";

alter type "public"."academia_role" rename to "academia_role__old_version_to_be_dropped";

create type "public"."academia_role" as enum ('postdoc', 'faculty', 'phd', 'grad_student');

alter type "public"."job_type" rename to "job_type__old_version_to_be_dropped";

create type "public"."job_type" as enum ('full-time', 'part-time', 'internship', 'contract');

alter type "public"."product_type_enum" rename to "product_type_enum__old_version_to_be_dropped";

create type "public"."product_type_enum" as enum ('tool', 'platform', 'ai_tool', 'simulation', 'other');

alter table "public"."jobs" alter column academia_role type "public"."academia_role" using academia_role::text::"public"."academia_role";

alter table "public"."jobs" alter column job_type type "public"."job_type" using job_type::text::"public"."job_type";

alter table "public"."products" alter column product_type type "public"."product_type_enum" using product_type::text::"public"."product_type_enum";

drop type "public"."academia_role__old_version_to_be_dropped";

drop type "public"."job_type__old_version_to_be_dropped";

drop type "public"."product_type_enum__old_version_to_be_dropped";

alter table "public"."product_images" drop column "created_at";

alter table "public"."product_images" add column "height" bigint not null;

alter table "public"."product_images" add column "position" bigint not null;

alter table "public"."product_images" add column "width" bigint not null;

alter table "public"."products" drop column "github_link";

alter table "public"."products" drop column "other_links";

alter table "public"."products" drop column "website_link";

alter table "public"."products" add column "links" jsonb not null default '[]'::jsonb;

alter table "public"."products" alter column "is_featured" set not null;

alter table "public"."user_products" add column "created_at" timestamp with time zone default now();


  create policy "Enable authenticated users to update products"
  on "public"."products"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Enable delete for authenticated users only"
  on "public"."products"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."products"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable delete for users based on user_id"
  on "public"."user_products"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for authenticated users only"
  on "public"."user_products"
  as permissive
  for insert
  to authenticated
with check (true);



