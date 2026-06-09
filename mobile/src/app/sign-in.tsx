import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { LoopMark } from '@/components/loop-mark';
import { Button, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useT } from '@/lib/i18n';
import type { TKey } from '@/lib/translations';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { signIn, signUp, resendConfirmation } = useAuth();
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
    if (!mail || password.length < 6) {
      setError('signin.err.fields');
      return;
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
                  {t(error)}
                </LoopText>
              )}
              <Button
                label={t('signin.confirm.resend')}
                variant="secondary"
                onPress={resend}
                loading={busy}
                style={styles.submit}
              />
              <Pressable onPress={backToSignIn} style={styles.toggle}>
                <LoopText variant="label" color="ink3">
                  {t('signin.confirm.back')}
                </LoopText>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.fields}>
                {isSignUp && (
                  <Field
                    placeholder={t('field.name')}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                )}
                <Field
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
                <Field
                  ref={passwordRef}
                  placeholder={t('field.password')}
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
                  {t(error)}
                </LoopText>
              )}

              <Button
                label={isSignUp ? t('signin.cta.signup') : t('signin.cta.signin')}
                onPress={submit}
                loading={busy}
                style={styles.submit}
              />

              <Pressable onPress={() => setMode(isSignUp ? 'sign-in' : 'sign-up')} style={styles.toggle}>
                <LoopText variant="label" color="ink3">
                  {isSignUp ? t('signin.toggle.toSignin') : t('signin.toggle.toSignup')}
                </LoopText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  ref,
  ...props
}: React.ComponentProps<typeof TextInput> & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} placeholderTextColor={LoopColors.ink4} style={styles.field} />;
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
  toggle: { marginTop: 18, alignItems: 'center' },
  field: {
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.line,
    borderRadius: LoopRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: LoopColors.ink,
  },
});

function authMessageKey(e: unknown): TKey {
  const msg = e instanceof Error ? e.message : String(e);
  if (/already registered|already exists/i.test(msg)) return 'signin.err.exists';
  if (/invalid login|invalid credentials/i.test(msg)) return 'signin.err.invalid';
  if (/password/i.test(msg)) return 'signin.err.password';
  return 'signin.err.generic';
}
