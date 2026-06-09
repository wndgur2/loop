-- Loop initial schema
-- Canonical source: documents/data-model.md · security: CLAUDE.md §6
-- Principle: enable RLS on every user-data table + 4 policies for select/insert/update/delete.
--            Child-table ownership is verified through the parent (EXISTS). The DB is the last line of defense.

-- ────────────────────────── Enums (data-model.md §3) ──────────────────────────
create type importance as enum ('high', 'mid', 'low');
create type sub_goal_source as enum ('ai_suggested', 'user_added');
create type session_mode as enum ('write', 'retrospective');
create type session_status as enum ('active', 'completed', 'abandoned');
create type message_role as enum ('user', 'assistant');

-- ────────────────────────── profiles (1:1 with auth.users) ──────────────────────────
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_premium   boolean     not null default false,
  created_at   timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_delete_own" on profiles
  for delete using (id = auth.uid());

-- ────────────────────────── goals — final goal (1 in MVP) ──────────────────────────
create table goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references profiles (id) on delete cascade,
  title       text        not null,
  description text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);
create index goals_user_id_idx on goals (user_id);

alter table goals enable row level security;

create policy "goals_select_own" on goals
  for select using (user_id = auth.uid());
create policy "goals_insert_own" on goals
  for insert with check (user_id = auth.uid());
create policy "goals_update_own" on goals
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals_delete_own" on goals
  for delete using (user_id = auth.uid());

-- ────────────────────────── sub_goals — sub-goals (= category) ──────────────────────────
create table sub_goals (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid            not null references goals (id) on delete cascade,
  name       text            not null,
  source     sub_goal_source not null default 'user_added',
  sort_order integer         not null default 0,
  created_at timestamptz     not null default now()
);
create index sub_goals_goal_id_idx on sub_goals (goal_id);

alter table sub_goals enable row level security;

-- Ownership: verified through the parent goals
create policy "sub_goals_select_own" on sub_goals
  for select using (
    exists (select 1 from goals g where g.id = sub_goals.goal_id and g.user_id = auth.uid())
  );
create policy "sub_goals_insert_own" on sub_goals
  for insert with check (
    exists (select 1 from goals g where g.id = sub_goals.goal_id and g.user_id = auth.uid())
  );
create policy "sub_goals_update_own" on sub_goals
  for update using (
    exists (select 1 from goals g where g.id = sub_goals.goal_id and g.user_id = auth.uid())
  ) with check (
    exists (select 1 from goals g where g.id = sub_goals.goal_id and g.user_id = auth.uid())
  );
create policy "sub_goals_delete_own" on sub_goals
  for delete using (
    exists (select 1 from goals g where g.id = sub_goals.goal_id and g.user_id = auth.uid())
  );

-- ────────────────────────── chat_sessions — AI conversation session ──────────────────────────
-- Created before feedbacks because feedbacks.session_id references it.
create table chat_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid           not null references profiles (id) on delete cascade,
  mode         session_mode   not null,
  -- Retrospective is no longer scoped by sub-goal → usually null (kept for reference when entering via a "whole area" card)
  sub_goal_id  uuid           references sub_goals (id) on delete set null,
  status       session_status not null default 'active',
  created_at   timestamptz    not null default now(),
  completed_at timestamptz
);
create index chat_sessions_user_id_idx on chat_sessions (user_id);

alter table chat_sessions enable row level security;

create policy "chat_sessions_select_own" on chat_sessions
  for select using (user_id = auth.uid());
create policy "chat_sessions_insert_own" on chat_sessions
  for insert with check (user_id = auth.uid());
create policy "chat_sessions_update_own" on chat_sessions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "chat_sessions_delete_own" on chat_sessions
  for delete using (user_id = auth.uid());

-- ────────────────────────── feedbacks — one reflection (Canonical Template) ──────────────────────────
create table feedbacks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid        not null references profiles (id) on delete cascade,
  session_id      uuid        references chat_sessions (id) on delete set null,
  title           text        not null,
  situation       text        not null,  -- template ## Feedback
  root_cause      text        not null,  -- template ## Root cause
  -- category = sub-goal. NOT NULL (no uncategorized). Blocks deleting a sub-goal that has linked feedback (restrict).
  sub_goal_id     uuid        not null references sub_goals (id) on delete restrict,
  importance      importance  not null default 'mid',
  tags            text[]      not null default '{}',
  internalized    boolean     not null default false,
  internalized_at timestamptz,
  created_at      timestamptz not null default now()
);
create index feedbacks_user_id_idx    on feedbacks (user_id);
create index feedbacks_sub_goal_id_idx on feedbacks (sub_goal_id);
create index feedbacks_session_id_idx  on feedbacks (session_id);

alter table feedbacks enable row level security;

create policy "feedbacks_select_own" on feedbacks
  for select using (user_id = auth.uid());
create policy "feedbacks_insert_own" on feedbacks
  for insert with check (user_id = auth.uid());
create policy "feedbacks_update_own" on feedbacks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "feedbacks_delete_own" on feedbacks
  for delete using (user_id = auth.uid());

-- ────────────────────────── takeaways — action items (per-item done tracking) ──────────────────────────
create table takeaways (
  id          uuid primary key default gen_random_uuid(),
  feedback_id uuid        not null references feedbacks (id) on delete cascade,
  text        text        not null,
  done        boolean     not null default false,
  done_at     timestamptz,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);
create index takeaways_feedback_id_idx on takeaways (feedback_id);

alter table takeaways enable row level security;

-- Ownership: verified through the parent feedbacks
create policy "takeaways_select_own" on takeaways
  for select using (
    exists (select 1 from feedbacks f where f.id = takeaways.feedback_id and f.user_id = auth.uid())
  );
create policy "takeaways_insert_own" on takeaways
  for insert with check (
    exists (select 1 from feedbacks f where f.id = takeaways.feedback_id and f.user_id = auth.uid())
  );
create policy "takeaways_update_own" on takeaways
  for update using (
    exists (select 1 from feedbacks f where f.id = takeaways.feedback_id and f.user_id = auth.uid())
  ) with check (
    exists (select 1 from feedbacks f where f.id = takeaways.feedback_id and f.user_id = auth.uid())
  );
create policy "takeaways_delete_own" on takeaways
  for delete using (
    exists (select 1 from feedbacks f where f.id = takeaways.feedback_id and f.user_id = auth.uid())
  );

-- ────────────────────────── chat_messages — messages within a session ──────────────────────────
create table chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid         not null references chat_sessions (id) on delete cascade,
  role       message_role not null,
  content    text         not null,
  created_at timestamptz  not null default now()
);
create index chat_messages_session_id_idx on chat_messages (session_id);

alter table chat_messages enable row level security;

-- Ownership: verified through the parent chat_sessions
create policy "chat_messages_select_own" on chat_messages
  for select using (
    exists (select 1 from chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid())
  );
create policy "chat_messages_insert_own" on chat_messages
  for insert with check (
    exists (select 1 from chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid())
  );
create policy "chat_messages_update_own" on chat_messages
  for update using (
    exists (select 1 from chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid())
  );
create policy "chat_messages_delete_own" on chat_messages
  for delete using (
    exists (select 1 from chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid())
  );

-- ────────────────────────── trigger to auto-create profiles on sign-up ──────────────────────────
-- SECURITY DEFINER + search_path='' (Supabase-recommended hardening). Reference all objects by full name.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
