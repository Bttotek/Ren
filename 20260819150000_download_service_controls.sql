-- BTTOTEK download/service access controls
create table if not exists public.download_service_settings (
  service_key text primary key check (service_key in ('pdf','excel')),
  enabled boolean not null default true,
  access_mode text not null default 'free' check (access_mode in ('free','paid')),
  free_daily_limit integer not null default 2 check (free_daily_limit >= 0),
  price numeric(10,2) not null default 0 check (price >= 0),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.download_service_settings(service_key, enabled, access_mode, free_daily_limit, price)
values
 ('pdf', true, 'free', 2, 0),
 ('excel', true, 'free', 2, 0)
on conflict (service_key) do nothing;

alter table public.download_service_settings enable row level security;

drop policy if exists "Public read download service settings" on public.download_service_settings;
create policy "Public read download service settings"
on public.download_service_settings
for select to anon, authenticated
using (true);

drop policy if exists "Admins manage download service settings" on public.download_service_settings;
create policy "Admins manage download service settings"
on public.download_service_settings
for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

grant select on public.download_service_settings to anon, authenticated;
grant insert, update, delete on public.download_service_settings to authenticated;
grant all on public.download_service_settings to service_role;
