-- Subscriptions + Loopie usage metering (payments / RevenueCat)
-- Canonical source: documents/data-model.md · ADR: adrs/adr-0006-payments-revenuecat.md · security: CLAUDE.md §6
--
-- Trust model (the important part): the source of truth for entitlement is the RevenueCat
-- webhook + the service_role key — NEVER the client. So unlike every other user-data table,
-- these two tables are READ-ONLY for the client: RLS grants SELECT-own, and INSERT/UPDATE/DELETE
-- are explicitly REVOKED from anon/authenticated (overriding grant_api_roles' default privileges).
-- Otherwise a user could UPDATE their own subscription row to fake Pro, or reset usage_counters to
-- dodge the weekly limit. All writes happen server-side via service_role (bypasses RLS + grants).

-- ────────────────────────── Enums ──────────────────────────
create type subscription_plan as enum ('free', 'pro');
create type subscription_status as enum ('active', 'in_grace', 'expired', 'cancelled');

-- ────────────────────────── shared updated_at trigger ──────────────────────────
-- init.sql had no generic touch-updated_at function; add one here for these tables.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ────────────────────────── subscriptions — one row per user, written by the webhook ──────────────────────────
create table subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid                not null unique references profiles (id) on delete cascade,
  plan                subscription_plan   not null default 'free',
  status              subscription_status not null default 'active',
  -- RevenueCat identifiers (app_user_id is set to the Supabase user id via Purchases.logIn)
  rc_app_user_id      text,
  rc_product_id       text,
  rc_entitlement      text,
  current_period_end  timestamptz,
  will_renew          boolean             not null default false,
  -- Idempotency: ignore RevenueCat webhook events we've already applied.
  last_event_id       text,
  created_at          timestamptz         not null default now(),
  updated_at          timestamptz         not null default now()
);
-- (user_id unique constraint already provides the lookup index)

alter table subscriptions enable row level security;

-- Read-only for the owner. No insert/update/delete policies on purpose — writes are server-only.
create policy "subscriptions_select_own" on subscriptions
  for select using (user_id = auth.uid());

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function public.set_updated_at();

-- ────────────────────────── usage_counters — per-user, per-week Loopie turn count ──────────────────────────
-- period_start = Monday of the usage week (UTC), computed deterministically by the server.
create table usage_counters (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references profiles (id) on delete cascade,
  period_start date        not null,
  loopie_turns integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, period_start)
);
-- (user_id, period_start) unique constraint indexes the per-user weekly lookup.

alter table usage_counters enable row level security;

-- Read-only for the owner (so the app can show "used / limit"). Writes are server-only.
create policy "usage_counters_select_own" on usage_counters
  for select using (user_id = auth.uid());

create trigger usage_counters_set_updated_at
  before update on usage_counters
  for each row execute function public.set_updated_at();

-- Atomically bump this week's counter and return the new value (avoids read-modify-write races).
-- Called only by the server (service_role); execute is revoked from clients so a user can't inflate
-- another user's counter by passing an arbitrary p_user.
create function public.increment_loopie_turns(p_user uuid, p_period date)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.usage_counters as uc (user_id, period_start, loopie_turns)
  values (p_user, p_period, 1)
  on conflict (user_id, period_start)
  do update set loopie_turns = uc.loopie_turns + 1
  returning uc.loopie_turns into v_count;
  return v_count;
end;
$$;

-- ────────────────────────── grants (security core) ──────────────────────────
-- grant_api_roles.sql set default privileges granting full CRUD to anon/authenticated on every new
-- table. Undo INSERT/UPDATE/DELETE here so the client can only read these two tables.
revoke insert, update, delete on subscriptions   from anon, authenticated;
revoke insert, update, delete on usage_counters  from anon, authenticated;

-- Server (Edge Functions) writes via service_role. Grant it explicitly so writes don't depend on
-- Supabase's implicit defaults for a freshly created table.
grant select, insert, update, delete on subscriptions  to service_role;
grant select, insert, update, delete on usage_counters to service_role;

-- The increment function is server-only — clients must never call it (would let one user inflate
-- another's usage). Default execute is granted to public on new functions, so revoke it.
revoke execute on function public.increment_loopie_turns(uuid, date) from public;
grant execute on function public.increment_loopie_turns(uuid, date) to service_role;
