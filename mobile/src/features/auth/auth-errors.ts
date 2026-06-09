import type { TKey } from '@/lib/translations';

/** Map a Supabase auth error to a user-facing message key. */
export function authMessageKey(e: unknown): TKey {
  const msg = e instanceof Error ? e.message : String(e);
  if (/already registered|already exists/i.test(msg)) return 'signin.err.exists';
  if (/invalid login|invalid credentials/i.test(msg)) return 'signin.err.invalid';
  if (/password/i.test(msg)) return 'signin.err.password';
  return 'signin.err.generic';
}
