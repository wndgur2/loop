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

/**
 * Builds a **service-role** Supabase client (bypasses RLS).
 * Use ONLY for trusted server-side writes the user must not be able to forge or tamper with —
 * e.g. subscription entitlement (webhook) and usage metering/quota (CLAUDE.md §6). Since it bypasses
 * RLS, every query MUST scope by user id explicitly. Never expose this key to the client.
 * SUPABASE_SERVICE_ROLE_KEY is auto-injected in the Edge runtime.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
