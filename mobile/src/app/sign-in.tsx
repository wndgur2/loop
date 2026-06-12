import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { LoopMark } from '@/components/loop-mark';
import { Button, LoopText, PressScale, Screen, TextField } from '@/components/ui';
import { authMessageKey } from '@/features/auth/auth-errors';
import { useAuth } from '@/features/auth/auth-context';
import { isValidEmail, MIN_PASSWORD_LENGTH } from '@/features/auth/validation';
import { useT } from '@/lib/i18n';
import type { TKey } from '@/lib/translations';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const router = useRouter();
  const t = useT();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<TKey | null>(null);
  // Email confirmation waiting screen: the address the confirmation mail was sent to (null shows the normal form).
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  // Refs to move focus forward on Enter (name → email → password); the password field submits.
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isSignUp = mode === 'sign-up';

  async function submit() {
    setError(null);
    const mail = email.trim();
    if (!mail || !password) {
      setError('signin.err.fields');
      return;
    }
    // Only enforce email format / password length on sign-up; sign-in defers to the server
    // so legacy accounts that predate a stricter policy can still log in.
    if (isSignUp) {
      if (!isValidEmail(mail)) {
        setError('signin.err.email');
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError('signin.err.password');
        return;
      }
    }
    setBusy(true);
    try {
      if (isSignUp) {
        const { needsConfirmation } = await signUp(mail, password, displayName.trim() || undefined);
        // If confirmation is needed, go to the waiting screen; otherwise onAuthStateChange → the root controller routes.
        if (needsConfirmation) setSentTo(mail);
      } else {
        await signIn(mail, password);
      }
    } catch (e) {
      setError(authMessageKey(e));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!sentTo) return;
    setError(null);
    setResent(false);
    setBusy(true);
    try {
      await resendConfirmation(sentTo);
      setResent(true);
    } catch (e) {
      setError(authMessageKey(e));
    } finally {
      setBusy(false);
    }
  }

  function backToSignIn() {
    setSentTo(null);
    setResent(false);
    setError(null);
    setMode('sign-in');
  }

  const title = sentTo
    ? t('signin.confirm.title')
    : isSignUp
      ? t('signin.title.signup')
      : t('signin.title.signin');

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <LoopMark height={30} />
            <LoopText variant="title" style={styles.title}>
              {title}
            </LoopText>
            <LoopText variant="body" color="ink3" style={styles.subtitle}>
              {sentTo ? t('signin.confirm.body', { email: sentTo }) : t('signin.subtitle')}
            </LoopText>
          </View>

          {sentTo ? (
            <>
              {resent && (
                <LoopText variant="caption" color="ink3" style={styles.error}>
                  {t('signin.confirm.resent')}
                </LoopText>
              )}
              {error && (
                <LoopText variant="caption" color="warmDeep" style={styles.error}>
                  {t(error, { min: MIN_PASSWORD_LENGTH })}
                </LoopText>
              )}
              <Button
                label={t('signin.confirm.resend')}
                variant="secondary"
                onPress={resend}
                loading={busy}
                style={styles.submit}
              />
              <PressScale onPress={backToSignIn} style={styles.toggle}>
                <LoopText variant="label" color="ink3">
                  {t('signin.confirm.back')}
                </LoopText>
              </PressScale>
            </>
          ) : (
            <>
              <View style={styles.fields}>
                {isSignUp && (
                  <TextField
                    placeholder={t('field.name')}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                )}
                <TextField
                  ref={emailRef}
                  placeholder={t('field.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <TextField
                  ref={passwordRef}
                  placeholder={t('field.password', { min: MIN_PASSWORD_LENGTH })}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType={isSignUp ? 'done' : 'go'}
                  onSubmitEditing={submit}
                />
              </View>

              {error && (
                <LoopText variant="caption" color="warmDeep" style={styles.error}>
                  {t(error, { min: MIN_PASSWORD_LENGTH })}
                </LoopText>
              )}

              <Button
                label={isSignUp ? t('signin.cta.signup') : t('signin.cta.signin')}
                onPress={submit}
                loading={busy}
                style={styles.submit}
              />

              {/* Play User Data policy: signing up implies agreeing to terms/privacy — keep the docs one tap away. */}
              {isSignUp && (
                <View style={styles.consent}>
                  <LoopText variant="caption" color="ink4" style={styles.consentText}>
                    {t('signin.consent')}
                  </LoopText>
                  <View style={styles.consentLinks}>
                    <PressScale onPress={() => router.push('/legal/terms')} hitSlop={8}>
                      <LoopText variant="caption" color="warmDeep">
                        {t('legal.terms')}
                      </LoopText>
                    </PressScale>
                    <LoopText variant="caption" color="ink4">
                      ·
                    </LoopText>
                    <PressScale onPress={() => router.push('/legal/privacy')} hitSlop={8}>
                      <LoopText variant="caption" color="warmDeep">
                        {t('legal.privacy')}
                      </LoopText>
                    </PressScale>
                  </View>
                </View>
              )}

              <PressScale
                onPress={() => setMode(isSignUp ? 'sign-in' : 'sign-up')}
                style={styles.toggle}
              >
                <LoopText variant="label" color="ink3">
                  {isSignUp ? t('signin.toggle.toSignin') : t('signin.toggle.toSignup')}
                </LoopText>
              </PressScale>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  intro: { marginBottom: 28 },
  title: { marginTop: 22 },
  subtitle: { marginTop: 8 },
  fields: { gap: 12 },
  error: { marginTop: 14 },
  submit: { marginTop: 22 },
  consent: { marginTop: 14, alignItems: 'center', gap: 6 },
  consentText: { textAlign: 'center' },
  consentLinks: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggle: { marginTop: 18, alignItems: 'center' },
});
