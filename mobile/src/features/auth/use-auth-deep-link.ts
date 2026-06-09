import type { EmailOtpType } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

import { getSupabase } from '@/lib/supabase';

/**
 * Receives the email confirmation deep link (loop://auth-callback?code=… or ?token_hash=&type=)
 * and exchanges it for a session. On success, onAuthStateChange fires and the root controller routes.
 *
 * - In the PKCE flow (default) a `code` arrives, so exchange it via exchangeCodeForSession.
 * - Also handle verifyOtp in case a custom mail template (token_hash) is used.
 * - Tokens are persisted in AsyncStorage by supabase-js (CLAUDE.md §6).
 */
export function useAuthDeepLink() {
  useEffect(() => {
    let active = true;

    async function handle(url: string | null) {
      if (!url || !active) return;
      const { queryParams } = Linking.parse(url);
      const code = typeof queryParams?.code === 'string' ? queryParams.code : null;
      const tokenHash = typeof queryParams?.token_hash === 'string' ? queryParams.token_hash : null;
      const type = typeof queryParams?.type === 'string' ? queryParams.type : null;

      try {
        if (code) {
          await getSupabase().auth.exchangeCodeForSession(code);
        } else if (tokenHash) {
          await getSupabase().auth.verifyOtp({
            token_hash: tokenHash,
            type: (type as EmailOtpType | null) ?? 'signup',
          });
        }
      } catch {
        // Expired/reused link, etc. — ignore silently (user stays on the sign-in screen).
      }
    }

    // Handle both cold start (app opened via link) and foreground reception.
    void Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (e) => handle(e.url));

    return () => {
      active = false;
      sub.remove();
    };
  }, []);
}
