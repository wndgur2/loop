// 계정 삭제 Edge Function — 인증된 사용자가 "자기 자신"의 계정만 삭제한다.
// auth.users 삭제 → profiles(on delete cascade) → goals/sub_goals/feedbacks/takeaways/chat_* 까지
// init.sql의 연쇄 삭제로 모든 사용자 데이터가 함께 지워진다.
//
// 사용자 삭제는 admin API(service_role)가 필요한 권한 작업이라 반드시 서버를 경유한다(CLAUDE.md §6).
// service_role 키는 이 함수 안에서만 쓰이고, 삭제 대상은 토큰으로 검증된 본인(user.id)으로 고정한다.

import { createClient } from 'jsr:@supabase/supabase-js@2'

import { createUserClient } from '../_shared/client.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    // 토큰으로 본인 확인(RLS 적용 사용자 클라이언트).
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const supabase = createUserClient(req)
    const {
      data: { user },
    } = await supabase.auth.getUser(token)
    if (!user) return jsonResponse({ error: 'unauthorized' }, 401)

    // 본인 id로만 admin 삭제(다른 사용자는 절대 지울 수 없음).
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error

    return jsonResponse({ ok: true })
  } catch (err) {
    // 본문/개인정보는 남기지 않는다(CLAUDE.md §6).
    console.error('delete-account error:', err instanceof Error ? err.message : 'unknown')
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})
