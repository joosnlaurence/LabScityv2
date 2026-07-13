alter table "public"."product_images" alter column "height" drop not null;

alter table "public"."product_images" alter column "position" drop not null;

alter table "public"."product_images" alter column "width" drop not null;


  create policy "Enable insert for authenticated users only"
  on "public"."product_images"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."product_images"
  as permissive
  for select
  to public
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."product_tags"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."product_tags"
  as permissive
  for select
  to public
using (true);



