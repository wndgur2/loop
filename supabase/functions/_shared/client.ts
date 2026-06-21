import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

/**
 * Builds a **user-scoped** Supabase client from the request's Authorization (JWT).
 * → RLS applies as-is, so the user only reads and writes their own data (CLAUDE.md §6).
 * The service_role key is not used (split into a separate admin client only when needed).
 */
export function createUserClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("Authorization") ?? "";
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
