-- 1. organizations: the tenancy boundary
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- 2. users: profile row per auth.users, carries org + role
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

-- 3. helper functions (security definer so policies on public.users don't
-- recurse into themselves when checking the caller's own org/role)
create or replace function public.current_org_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- 4. seed a "Demo Org" and attach all pre-existing rows + any pre-existing
-- auth users to it, so nothing that already worked stops working
insert into public.organizations (name) values ('Demo Org');

alter table public.teams add column organization_id uuid references public.organizations(id);
alter table public.vendors add column organization_id uuid references public.organizations(id); -- nullable: null = shared catalog
alter table public.employees add column organization_id uuid references public.organizations(id);
alter table public.ai_transactions add column organization_id uuid references public.organizations(id);
alter table public.productivity_metrics add column organization_id uuid references public.organizations(id);

update public.teams set organization_id = (select id from public.organizations where name = 'Demo Org');
update public.employees set organization_id = (select id from public.organizations where name = 'Demo Org');
update public.ai_transactions set organization_id = (select id from public.organizations where name = 'Demo Org');
update public.productivity_metrics set organization_id = (select id from public.organizations where name = 'Demo Org');
-- vendors.organization_id stays null for the existing catalog rows (shared)

alter table public.teams alter column organization_id set not null;
alter table public.employees alter column organization_id set not null;
alter table public.ai_transactions alter column organization_id set not null;
alter table public.productivity_metrics alter column organization_id set not null;

alter table public.teams alter column organization_id set default public.current_org_id();
alter table public.vendors alter column organization_id set default public.current_org_id();
alter table public.employees alter column organization_id set default public.current_org_id();
alter table public.ai_transactions alter column organization_id set default public.current_org_id();
alter table public.productivity_metrics alter column organization_id set default public.current_org_id();

-- backfill a profile for any auth user created before this migration existed,
-- so an already-registered account doesn't suddenly lose access to everything
insert into public.users (id, organization_id, role)
select au.id, (select id from public.organizations where name = 'Demo Org'), 'admin'
from auth.users au
on conflict (id) do nothing;

-- 5. loosen productivity_metrics.metric_type — a real company tracks its own
-- output types, not just the four the demo seed happened to use
alter table public.productivity_metrics drop constraint productivity_metrics_metric_type_check;

-- 6. new-signup bootstrap: first person in ever inherits the Demo Org (so the
-- account you already tested keeps its data); everyone after gets a fresh org
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if not exists (select 1 from public.users limit 1) then
    select id into v_org_id from public.organizations order by created_at asc limit 1;
  else
    insert into public.organizations (name)
    values (coalesce(nullif(split_part(new.email, '@', 1), ''), 'My') || '''s Organization')
    returning id into v_org_id;
  end if;

  insert into public.users (id, organization_id, role) values (new.id, v_org_id, 'admin');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. RLS: replace "public read" with org-scoped policies for authenticated users
alter table public.organizations enable row level security;
alter table public.users enable row level security;

drop policy "public read" on public.teams;
drop policy "public read" on public.vendors;
drop policy "public read" on public.employees;
drop policy "public read" on public.ai_transactions;
drop policy "public read" on public.productivity_metrics;

create policy "select own org" on public.organizations for select to authenticated
  using (id = public.current_org_id());
create policy "admin update own org" on public.organizations for update to authenticated
  using (id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (id = public.current_org_id() and public.current_user_role() = 'admin');

create policy "select org members" on public.users for select to authenticated
  using (organization_id = public.current_org_id());
create policy "update own profile" on public.users for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "select own org teams" on public.teams for select to authenticated
  using (organization_id = public.current_org_id());
create policy "admin insert teams" on public.teams for insert to authenticated
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin update teams" on public.teams for update to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin delete teams" on public.teams for delete to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin');

create policy "select shared or own vendors" on public.vendors for select to authenticated
  using (organization_id is null or organization_id = public.current_org_id());
create policy "admin insert own vendors" on public.vendors for insert to authenticated
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin update own vendors" on public.vendors for update to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin delete own vendors" on public.vendors for delete to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin');

create policy "select own org employees" on public.employees for select to authenticated
  using (organization_id = public.current_org_id());
create policy "admin insert employees" on public.employees for insert to authenticated
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin update employees" on public.employees for update to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin delete employees" on public.employees for delete to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin');

create policy "select own org transactions" on public.ai_transactions for select to authenticated
  using (organization_id = public.current_org_id());
create policy "admin insert transactions" on public.ai_transactions for insert to authenticated
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin update transactions" on public.ai_transactions for update to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin delete transactions" on public.ai_transactions for delete to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin');

create policy "select own org metrics" on public.productivity_metrics for select to authenticated
  using (organization_id = public.current_org_id());
create policy "admin insert metrics" on public.productivity_metrics for insert to authenticated
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin update metrics" on public.productivity_metrics for update to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
create policy "admin delete metrics" on public.productivity_metrics for delete to authenticated
  using (organization_id = public.current_org_id() and public.current_user_role() = 'admin');
