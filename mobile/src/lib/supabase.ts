import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from '@/types/database';

/**
 * Supabase 클라이언트 (클라이언트 측).
 *
 * - 공개 가능한 값만 사용한다: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.
 * - service_role 키·Anthropic 키는 절대 클라이언트에 두지 않는다. AI 호출은 Edge Function 경유.
 *   (CLAUDE.md §6 · 보안/프라이버시)
 * - 세션은 AsyncStorage에 영속화한다.
 *
 * 환경변수는 .env.example을 복사해 .env를 만들고 채운다(.env는 커밋 금지).
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
      detectSessionInUrl: false,
    },
  });

  return client;
}
