import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/**
 * 요청의 Authorization(JWT)으로 **사용자 스코프** Supabase 클라이언트를 만든다.
 * → RLS가 그대로 적용되어 사용자는 자기 데이터만 읽고 쓴다(CLAUDE.md §6).
 * service_role 키는 사용하지 않는다(필요 시에만 별도 admin 클라이언트로 분리).
 */
export function createUserClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization') ?? '';
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
