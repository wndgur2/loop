-- Loop 초기 스키마
-- 정본: documents/data-model.md · 보안: CLAUDE.md §6
-- 원칙: 모든 사용자 데이터 테이블에 RLS 활성화 + select/insert/update/delete 4정책.
--       자식 테이블 소유권은 부모를 통해(EXISTS) 검증한다. DB가 최종 방어선.

-- ────────────────────────── Enums (data-model.md §3) ──────────────────────────
create type importance as enum ('high', 'mid', 'low');
create type sub_goal_source as enum ('ai_suggested', 'user_added');
create type session_mode as enum ('write', 'retrospective');
create type session_status as enum ('active', 'completed', 'abandoned');
create type message_role as enum ('user', 'assistant');

-- ────────────────────────── profiles (auth.users와 1:1) ──────────────────────────
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

-- ────────────────────────── goals — 최종 목표 (MVP 1개) ──────────────────────────
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

-- ────────────────────────── sub_goals — 하위 목표 (= category) ──────────────────────────
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

-- 소유권: 부모 goals 를 통해 검증
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

-- ────────────────────────── coaching_sessions — AI 대화 세션 ──────────────────────────
-- feedbacks.session_id 가 참조하므로 feedbacks 보다 먼저 만든다.
create table coaching_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid           not null references profiles (id) on delete cascade,
  mode         session_mode   not null,
  -- 회고는 더 이상 하위목표로 스코프하지 않음 → 보통 null ("영역 통째" 카드 진입 시 참고용)
  sub_goal_id  uuid           references sub_goals (id) on delete set null,
  status       session_status not null default 'active',
  created_at   timestamptz    not null default now(),
  completed_at timestamptz
);
create index coaching_sessions_user_id_idx on coaching_sessions (user_id);

alter table coaching_sessions enable row level security;

create policy "coaching_sessions_select_own" on coaching_sessions
  for select using (user_id = auth.uid());
create policy "coaching_sessions_insert_own" on coaching_sessions
  for insert with check (user_id = auth.uid());
create policy "coaching_sessions_update_own" on coaching_sessions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "coaching_sessions_delete_own" on coaching_sessions
  for delete using (user_id = auth.uid());

-- ────────────────────────── feedbacks — 회고 1건 (Canonical Template) ──────────────────────────
create table feedbacks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid        not null references profiles (id) on delete cascade,
  session_id      uuid        references coaching_sessions (id) on delete set null,
  title           text        not null,
  situation       text        not null,  -- 템플릿 ## Feedback
  root_cause      text        not null,  -- 템플릿 ## Root cause
  -- category = 하위목표. NOT NULL (미분류 없음). 연결 피드백이 있으면 하위목표 삭제 차단(restrict).
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

-- ────────────────────────── takeaways — 실천항목 (개별 done 추적) ──────────────────────────
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

-- 소유권: 부모 feedbacks 를 통해 검증
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

-- ────────────────────────── coaching_messages — 세션 내 메시지 ──────────────────────────
create table coaching_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid         not null references coaching_sessions (id) on delete cascade,
  role       message_role not null,
  content    text         not null,
  created_at timestamptz  not null default now()
);
create index coaching_messages_session_id_idx on coaching_messages (session_id);

alter table coaching_messages enable row level security;

-- 소유권: 부모 coaching_sessions 를 통해 검증
create policy "coaching_messages_select_own" on coaching_messages
  for select using (
    exists (select 1 from coaching_sessions s where s.id = coaching_messages.session_id and s.user_id = auth.uid())
  );
create policy "coaching_messages_insert_own" on coaching_messages
  for insert with check (
    exists (select 1 from coaching_sessions s where s.id = coaching_messages.session_id and s.user_id = auth.uid())
  );
create policy "coaching_messages_update_own" on coaching_messages
  for update using (
    exists (select 1 from coaching_sessions s where s.id = coaching_messages.session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from coaching_sessions s where s.id = coaching_messages.session_id and s.user_id = auth.uid())
  );
create policy "coaching_messages_delete_own" on coaching_messages
  for delete using (
    exists (select 1 from coaching_sessions s where s.id = coaching_messages.session_id and s.user_id = auth.uid())
  );

-- ────────────────────────── 가입 시 profiles 자동 생성 트리거 ──────────────────────────
-- SECURITY DEFINER + search_path='' (Supabase 권장 하드닝). 모든 객체를 풀 네임으로 참조.
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
