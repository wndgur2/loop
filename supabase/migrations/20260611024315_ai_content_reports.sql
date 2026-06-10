-- ai_content_reports: user reports of inappropriate Loopi (AI) responses.
-- Required by the Google Play AI-Generated Content policy: apps that generate
-- content with AI must offer in-app reporting/flagging of offensive output.
-- The reported message text is snapshotted here so the report stays meaningful
-- even if the session/messages are deleted later.

create table ai_content_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  -- Nullable: a report must be possible even when session persistence failed.
  session_id uuid references chat_sessions (id) on delete set null,
  message_content text not null,
  reason text,
  created_at timestamptz not null default now()
);

create index ai_content_reports_user_id_idx on ai_content_reports (user_id);
create index ai_content_reports_session_id_idx on ai_content_reports (session_id);

-- Default privileges from 20260607235156_grant_api_roles should cover this, but
-- they only apply to tables created by the same role — grant explicitly to be safe.
grant select, insert, update, delete on ai_content_reports to anon, authenticated;

alter table ai_content_reports enable row level security;

create policy "ai_content_reports_select_own" on ai_content_reports
  for select using (user_id = auth.uid());

create policy "ai_content_reports_insert_own" on ai_content_reports
  for insert with check (user_id = auth.uid());

create policy "ai_content_reports_update_own" on ai_content_reports
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ai_content_reports_delete_own" on ai_content_reports
  for delete using (user_id = auth.uid());
