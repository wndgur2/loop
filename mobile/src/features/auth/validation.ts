/**
 * Auth form validation shared by the sign-in/sign-up screen.
 * Keep the client policy here so it stays in sync with the GoTrue server policy
 * (minimum_password_length in supabase/config.toml).
 */

/** Minimum password length. Must match `minimum_password_length` in supabase/config.toml. */
export const MIN_PASSWORD_LENGTH = 6;

// Pragmatic email shape check — one @, a dot in the domain, no whitespace.
// Not RFC-exhaustive on purpose; GoTrue remains the source of truth.
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
