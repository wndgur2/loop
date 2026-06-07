import type { EmailOtpType } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

import { getSupabase } from '@/lib/supabase';

/**
 * 이메일 확인 딥링크(loop://auth-callback?code=… 또는 ?token_hash=&type=)를 받아
 * 세션으로 교환한다. 성공하면 onAuthStateChange 가 발화해 루트 컨트롤러가 라우팅한다.
 *
 * - PKCE 플로우(기본)에서는 `code` 가 오므로 exchangeCodeForSession 로 교환한다.
 * - 커스텀 메일 템플릿(token_hash)을 쓰는 경우를 대비해 verifyOtp 도 처리한다.
 * - 토큰은 supabase-js 가 AsyncStorage 에 영속한다(CLAUDE.md §6).
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
        // 만료/재사용된 링크 등 — 조용히 무시(사용자는 로그인 화면을 유지).
      }
    }

    // 콜드 스타트(앱이 링크로 열림) + 포그라운드 수신 둘 다 처리.
    void Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (e) => handle(e.url));

    return () => {
      active = false;
      sub.remove();
    };
  }, []);
}
