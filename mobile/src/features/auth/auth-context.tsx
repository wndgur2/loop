import { type Session, type SupabaseClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getSupabase } from '@/lib/supabase';

/**
 * 저장돼 있던 리프레시 토큰이 서버에서 무효(만료·회전·DB 리셋·유저 삭제)가 됐을 때
 * supabase-js 가 내는 에러. 기능적으로는 "그냥 로그아웃 상태"이므로 조용히 회복한다.
 */
function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  return /refresh token/i.test(message);
}

/**
 * 무효 리프레시 토큰을 만나면 storage 에 남은 stale 세션을 비운다(scope: 'local').
 * 정리하지 않으면 다음 실행마다 같은 토큰으로 갱신을 재시도해 에러가 반복된다.
 */
async function clearStaleSession(supabase: SupabaseClient): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // storage 정리는 best-effort — 실패해도 로그아웃 상태로 진행한다.
  }
}

/**
 * 이메일 확인 링크가 돌아올 리다이렉트 URL.
 *
 * 기본값(`Linking.createURL`)은 실행 환경에 따라 달라진다:
 *   - standalone 빌드 → loop://auth-callback  (정상)
 *   - Expo Go(dev)    → exp://<LAN-IP>/--/auth-callback
 *   - 웹(dev/preview)  → http://localhost:8081/auth-callback  ← localhost!
 * 이메일은 보통 다른 기기에서 열리므로 localhost/LAN 주소로 가면 확인 링크가 깨진다.
 *
 * 그래서 운영·프리뷰에서는 `EXPO_PUBLIC_AUTH_REDIRECT_URL`(예: loop://auth-callback)로
 * 고정한다. 이 값은 Supabase 대시보드의 Redirect URLs 허용목록(로컬은 config.toml의
 * additional_redirect_urls)에 반드시 등록되어 있어야 GoTrue 가 그대로 사용한다. 없으면
 * GoTrue 는 프로젝트 Site URL(기본 localhost)로 폴백한다.
 */
export function authRedirectUrl(): string {
  const configured = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim();
  if (configured) return configured;
  return Linking.createURL('auth-callback');
}

type AuthState = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** 이메일 확인이 켜져 있으면 세션 없이 needsConfirmation=true 를 돌려준다. */
  signUp: (email: string, password: string, displayName?: string) => Promise<{ needsConfirmation: boolean }>;
  resendConfirmation: (email: string) => Promise<void>;
  /** 표시 이름 변경. user_metadata(표시 기준)와 profiles(정본 저장소)를 함께 갱신. */
  updateDisplayName: (name: string) => Promise<void>;
  /** 본인 계정·모든 데이터 영구 삭제(Edge Function 경유) 후 로그아웃. */
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Supabase Auth 세션을 앱 전역에 제공. 세션은 AsyncStorage에 영속(getSupabase).
 * 토큰 만료/갱신은 supabase-js가 처리하고 onAuthStateChange로 반영한다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    // 시작 시 storage 의 세션을 복구한다. 리프레시 토큰이 무효면 supabase-js 가
    // 갱신을 시도하다 error 를 돌려준다 → stale 세션을 비우고 로그아웃 상태로 떨어진다.
    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!mounted) return;
        if (error && isInvalidRefreshTokenError(error)) {
          await clearStaleSession(supabase);
          if (!mounted) return;
          setSession(null);
        } else {
          setSession(data.session);
        }
        setLoading(false);
      })
      .catch(async (error: unknown) => {
        // getSession 이 throw 하는 경로(무효 토큰 등)도 동일하게 회복한다.
        if (isInvalidRefreshTokenError(error)) await clearStaleSession(supabase);
        if (!mounted) return;
        setSession(null);
        setLoading(false);
      });

    // 백그라운드 자동 갱신 실패는 SIGNED_OUT(next=null)으로 들어온다 → 그대로 반영.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      async signIn(email, password) {
        const { error } = await getSupabase().auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signUp(email, password, displayName) {
        const { data, error } = await getSupabase().auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: authRedirectUrl(),
            data: displayName ? { display_name: displayName } : undefined,
          },
        });
        if (error) throw error;
        // 이메일 확인이 켜져 있으면 session 이 없다 → 확인 대기 상태.
        return { needsConfirmation: !data.session };
      },
      async resendConfirmation(email) {
        const { error } = await getSupabase().auth.resend({
          type: 'signup',
          email,
          options: { emailRedirectTo: authRedirectUrl() },
        });
        if (error) throw error;
      },
      async updateDisplayName(name) {
        const supabase = getSupabase();
        const trimmed = name.trim();
        // user_metadata 갱신 → onAuthStateChange(USER_UPDATED)로 세션 반영(화면이 읽는 값).
        const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
        if (error) throw error;
        // 정본 저장소(profiles)도 동기화. RLS가 본인 행으로 스코프.
        if (session) {
          await supabase.from('profiles').update({ display_name: trimmed }).eq('id', session.user.id);
        }
      },
      async deleteAccount() {
        const supabase = getSupabase();
        // 권한 작업 → Edge Function(service_role)이 본인 계정과 연쇄 데이터를 삭제(CLAUDE.md §6).
        const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
        if (error) throw error;
        await supabase.auth.signOut();
      },
      async signOut() {
        await getSupabase().auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
