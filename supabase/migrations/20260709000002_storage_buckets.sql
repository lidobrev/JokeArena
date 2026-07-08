-- Storage buckets for user avatars and optional joke images.
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('joke-images', 'joke-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read avatars" on storage.objects;
create policy "Public can read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

drop policy if exists "Users upload their own avatars" on storage.objects;
create policy "Users upload their own avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users update their own avatars" on storage.objects;
create policy "Users update their own avatars"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Public can read joke images" on storage.objects;
create policy "Public can read joke images"
on storage.objects for select
to public
using (bucket_id = 'joke-images');

drop policy if exists "Users upload own joke images" on storage.objects;
create policy "Users upload own joke images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'joke-images' and (storage.foldername(name))[1] = auth.uid()::text);
