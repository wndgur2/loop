-- Grant table privileges to API roles (anon/authenticated).
--
-- Background: the initial init migration defined only RLS and policies and relied on
-- Supabase default privileges for table GRANTs. But in the live project the anon/authenticated
-- roles lacked SELECT/INSERT/UPDATE/DELETE and schema USAGE, so before RLS evaluation
-- PostgREST rejected requests with 42501 ("permission denied for table ...").
-- As a result all client reads/writes failed, e.g. saving the goal during onboarding.
-- (Profile creation on sign-up worked regardless of privileges because it's a SECURITY DEFINER trigger.)
--
-- Row-level security is still handled by the existing RLS policies. This GRANT only grants
-- table-level entry access; users can still only access their own rows.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;

-- Set default privileges so future tables automatically get the same privileges.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
