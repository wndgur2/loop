import { type Session, type SupabaseClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getSupabase } from '@/lib/supabase';

/**
 * The error supabase-js throws when a stored refresh token has become invalid on
 * the server (expired, rotated, DB reset, user deleted). Functionally this is just
 * "logged out", so recover silently.
 */
function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  return /refresh token/i.test(message);
}

/**
 * On an invalid refresh token, clear the stale session left in storage (scope: 'local').
 * Without cleanup, every launch retries refreshing with the same token and the error repeats.
 */
async function clearStaleSession(supabase: SupabaseClient): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Storage cleanup is best-effort — proceed as logged out even if it fails.
  }
}

/**
 * The redirect URL the email confirmation link returns to.
 *
 * The default (`Linking.createURL`) varies by runtime:
 *   - standalone build → loop://auth-callback  (correct)
 *   - Expo Go(dev)     → exp://<LAN-IP>/--/auth-callback
 *   - web(dev/preview)  → http://localhost:8081/auth-callback  ← localhost!
 * Email is usually opened on a different device, so a localhost/LAN address breaks the link.
 *
 * So in production/preview we pin it with `EXPO_PUBLIC_AUTH_REDIRECT_URL` (e.g. loop://auth-callback).
 * This value must be registered in the Redirect URLs allowlist in the Supabase dashboard
 * (locally, additional_redirect_urls in config.toml) for GoTrue to use it as-is. Otherwise
 * GoTrue falls back to the project Site URL (localhost by default).
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
  /** When email confirmation is enabled, returns needsConfirmation=true with no session. */
  signUp: (email: string, password: string, displayName?: string) => Promise<{ needsConfirmation: boolean }>;
  resendConfirmation: (email: string) => Promise<void>;
  /** Change display name. Updates both user_metadata (display source) and profiles (source of truth). */
  updateDisplayName: (name: string) => Promise<void>;
  /** Permanently delete own account and all data (via Edge Function), then sign out. */
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Provides the Supabase Auth session app-wide. The session is persisted in AsyncStorage (getSupabase).
 * Token expiry/refresh is handled by supabase-js and reflected via onAuthStateChange.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    // Restore the session from storage on start. If the refresh token is invalid, supabase-js
    // attempts a refresh and returns an error → clear the stale session and fall back to logged out.
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
        // Recover the same way for paths where getSession throws (invalid token, etc.).
        if (isInvalidRefreshTokenError(error)) await clearStaleSession(supabase);
        if (!mounted) return;
        setSession(null);
        setLoading(false);
      });

    // Background auto-refresh failures arrive as SIGNED_OUT (next=null) → reflect as-is.
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
        // When email confirmation is enabled there is no session → awaiting confirmation.
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
        // Update user_metadata → session reflected via onAuthStateChange(USER_UPDATED) (the value screens read).
        const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
        if (error) throw error;
        // Sync the source-of-truth store (profiles) too. RLS scopes to the user's own row.
        if (session) {
          await supabase.from('profiles').update({ display_name: trimmed }).eq('id', session.user.id);
        }
      },
      async deleteAccount() {
        const supabase = getSupabase();
        // Privileged operation → the Edge Function (service_role) deletes the account and cascading data (CLAUDE.md §6).
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
