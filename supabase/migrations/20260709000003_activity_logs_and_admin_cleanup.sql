create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

grant select, insert on public.activity_logs to authenticated;

drop policy if exists activity_logs_insert_own on public.activity_logs;
create policy activity_logs_insert_own
on public.activity_logs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists activity_logs_admin_select on public.activity_logs;
create policy activity_logs_admin_select
on public.activity_logs
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists joke_ratings_admin_delete on public.joke_ratings;
create policy joke_ratings_admin_delete
on public.joke_ratings
for delete
to authenticated
using (public.is_admin(auth.uid()));

create index if not exists idx_activity_logs_user_id_created_at on public.activity_logs (user_id, created_at desc);
create index if not exists idx_activity_logs_action_created_at on public.activity_logs (action, created_at desc);
create index if not exists idx_activity_logs_created_at on public.activity_logs (created_at desc);
