import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from '@/types/database';

/**
 * Supabase client (client side).
 *
 * - Uses only publicly-shareable values: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.
 * - Never place the service_role key or Anthropic key on the client. AI calls go through the Edge Function.
 *   (CLAUDE.md §6 · security/privacy)
 * - The session persists to AsyncStorage.
 *
 * For environment variables, copy .env.example to create .env and fill it in (.env must not be committed).
 */
let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase 환경변수가 없습니다. .env.example을 복사해 .env를 만들고 ' +
        'EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY 를 채우세요.',
    );
  }

  client = createClient<Database>(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Mobile does not auto-detect the session from the URL. The email-confirmation deep link
      // is handled by use-auth-deep-link via a direct code→session exchange (PKCE).
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });

  return client;
}

/** Current signed-in user id — throws when there is no session (mutations require auth). */
export async function requireUserId(): Promise<string> {
  const { data } = await getSupabase().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('로그인이 필요합니다.');
  return id;
}
