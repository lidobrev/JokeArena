create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('user', 'admin')),
  primary key (user_id, role)
);

create table if not exists public.joke_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  slug text unique,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.jokes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id),
  category_id uuid references public.joke_categories(id),
  title text not null,
  content text not null,
  image_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.joke_ratings (
  id uuid primary key default gen_random_uuid(),
  joke_id uuid references public.jokes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating int check (rating between 1 and 5),
  created_at timestamptz default now(),
  unique (joke_id, user_id)
);

create table if not exists public.joke_edit_suggestions (
  id uuid primary key default gen_random_uuid(),
  joke_id uuid references public.jokes(id) on delete cascade,
  suggested_by uuid references public.profiles(id),
  suggested_title text,
  suggested_content text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where public.user_roles.user_id = user_id
      and public.user_roles.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  preferred_username text;
  display_name text;
  generated_username text;
begin
  preferred_username := lower(regexp_replace(coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1), 'user'), '[^a-z0-9_]+', '', 'g'));
  base_username := coalesce(preferred_username, 'user');

  if base_username is null or base_username = '' then
    base_username := 'user';
  end if;

  display_name := coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), nullif(new.raw_user_meta_data->>'username', ''), initcap(replace(base_username, '_', ' ')));
  generated_username := base_username || '_' || substr(replace(new.id::text, '-', ''), 1, 8);

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    generated_username,
    display_name
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_jokes_updated_at on public.jokes;
create trigger set_jokes_updated_at
before update on public.jokes
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.joke_categories enable row level security;
alter table public.jokes enable row level security;
alter table public.joke_ratings enable row level security;
alter table public.joke_edit_suggestions enable row level security;

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select on public.joke_categories to anon, authenticated;
grant insert, update, delete on public.joke_categories to authenticated;
grant select on public.jokes to anon, authenticated;
grant insert, update, delete on public.jokes to authenticated;
grant select on public.joke_ratings to anon, authenticated;
grant insert, update, delete on public.joke_ratings to authenticated;
grant select, insert, update, delete on public.joke_edit_suggestions to authenticated;

grant execute on function public.is_admin(uuid) to authenticated;

drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated
on public.profiles
for select
to authenticated
using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_admin_manage on public.profiles;
create policy profiles_admin_manage
on public.profiles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists user_roles_admin_manage on public.user_roles;
create policy user_roles_admin_manage
on public.user_roles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists joke_categories_select_all on public.joke_categories;
create policy joke_categories_select_all
on public.joke_categories
for select
to anon, authenticated
using (true);

drop policy if exists joke_categories_admin_manage on public.joke_categories;
create policy joke_categories_admin_manage
on public.joke_categories
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists jokes_select_approved on public.jokes;
create policy jokes_select_approved
on public.jokes
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists jokes_select_admin on public.jokes;
create policy jokes_select_admin
on public.jokes
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists jokes_insert_pending on public.jokes;
create policy jokes_insert_pending
on public.jokes
for insert
to authenticated
with check (auth.uid() = author_id and status = 'pending');

drop policy if exists jokes_update_own_pending on public.jokes;
create policy jokes_update_own_pending
on public.jokes
for update
to authenticated
using (auth.uid() = author_id and status = 'pending')
with check (auth.uid() = author_id and status = 'pending');

drop policy if exists jokes_delete_own_pending on public.jokes;
create policy jokes_delete_own_pending
on public.jokes
for delete
to authenticated
using (auth.uid() = author_id and status = 'pending');

drop policy if exists jokes_admin_manage on public.jokes;
create policy jokes_admin_manage
on public.jokes
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists joke_ratings_select_all on public.joke_ratings;
create policy joke_ratings_select_all
on public.joke_ratings
for select
to anon, authenticated
using (true);

drop policy if exists joke_ratings_insert_own on public.joke_ratings;
create policy joke_ratings_insert_own
on public.joke_ratings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists joke_ratings_update_own on public.joke_ratings;
create policy joke_ratings_update_own
on public.joke_ratings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists joke_ratings_delete_own on public.joke_ratings;
create policy joke_ratings_delete_own
on public.joke_ratings
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists joke_edit_suggestions_select_own on public.joke_edit_suggestions;
create policy joke_edit_suggestions_select_own
on public.joke_edit_suggestions
for select
to authenticated
using (suggested_by = auth.uid());

drop policy if exists joke_edit_suggestions_select_admin on public.joke_edit_suggestions;
create policy joke_edit_suggestions_select_admin
on public.joke_edit_suggestions
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists joke_edit_suggestions_insert_own on public.joke_edit_suggestions;
create policy joke_edit_suggestions_insert_own
on public.joke_edit_suggestions
for insert
to authenticated
with check (suggested_by = auth.uid());

drop policy if exists joke_edit_suggestions_admin_manage on public.joke_edit_suggestions;
create policy joke_edit_suggestions_admin_manage
on public.joke_edit_suggestions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists joke_edit_suggestions_admin_delete on public.joke_edit_suggestions;
create policy joke_edit_suggestions_admin_delete
on public.joke_edit_suggestions
for delete
to authenticated
using (public.is_admin(auth.uid()));

create index if not exists idx_jokes_author_id on public.jokes (author_id);
create index if not exists idx_jokes_category_id on public.jokes (category_id);
create index if not exists idx_jokes_status_created_at on public.jokes (status, created_at desc);
create index if not exists idx_jokes_created_at on public.jokes (created_at desc);

create index if not exists idx_joke_ratings_joke_id on public.joke_ratings (joke_id);
create index if not exists idx_joke_ratings_user_id on public.joke_ratings (user_id);

create index if not exists idx_profiles_created_at on public.profiles (created_at desc);
create index if not exists idx_joke_categories_created_at on public.joke_categories (created_at desc);
create index if not exists idx_joke_edit_suggestions_joke_id on public.joke_edit_suggestions (joke_id);
create index if not exists idx_joke_edit_suggestions_suggested_by on public.joke_edit_suggestions (suggested_by);
create index if not exists idx_joke_edit_suggestions_status_created_at on public.joke_edit_suggestions (status, created_at desc);

insert into public.joke_categories (name, slug, description)
values
  ('Programming', 'programming', 'Jokes about code, bugs, and developers.'),
  ('Office', 'office', 'Jokes about meetings, coworkers, and office life.'),
  ('School', 'school', 'Jokes about classes, teachers, and exams.'),
  ('Food', 'food', 'Jokes about cooking, eating, and cravings.'),
  ('Dark Humor', 'dark-humor', 'A darker category for edgy jokes.'),
  ('Animals', 'animals', 'Jokes featuring pets and wildlife.'),
  ('Random', 'random', 'Anything that does not fit elsewhere.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;