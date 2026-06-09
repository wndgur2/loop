// Account deletion Edge Function — an authenticated user can delete only "their own" account.
// Deleting auth.users → profiles (on delete cascade) → goals/sub_goals/feedbacks/takeaways/chat_*
// the cascade in init.sql removes all of the user's data together.
//
// User deletion is a privileged operation that requires the admin API (service_role), so it must go through the server (CLAUDE.md §6).
// The service_role key is used only inside this function, and the deletion target is fixed to the token-verified self (user.id).

import { createClient } from 'jsr:@supabase/supabase-js@2'

import { createUserClient } from '../_shared/client.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    // Verify the user via token (RLS-applied user client).
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const supabase = createUserClient(req)
    const {
      data: { user },
    } = await supabase.auth.getUser(token)
    if (!user) return jsonResponse({ error: 'unauthorized' }, 401)

    // Admin-delete only by the user's own id (other users can never be deleted).
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error

    return jsonResponse({ ok: true })
  } catch (err) {
    // Do not log message bodies or personal data (CLAUDE.md §6).
    console.error('delete-account error:', err instanceof Error ? err.message : 'unknown')
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})
