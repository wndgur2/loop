import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { LoopMark } from '@/components/loop-mark';
import { Button, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useT } from '@/lib/i18n';
import type { TKey } from '@/lib/translations';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const t = useT();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<TKey | null>(null);

  const isSignUp = mode === 'sign-up';

  async function submit() {
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError('signin.err.fields');
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) await signUp(email.trim(), password, displayName.trim() || undefined);
      else await signIn(email.trim(), password);
      // 성공 시 onAuthStateChange → 루트 컨트롤러가 라우팅한다.
    } catch (e) {
      setError(authMessageKey(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }} keyboardShouldPersistTaps="handled">
          <View style={{ marginBottom: 28 }}>
            <LoopMark height={30} />
            <LoopText variant="title" style={{ marginTop: 22 }}>
              {isSignUp ? t('signin.title.signup') : t('signin.title.signin')}
            </LoopText>
            <LoopText variant="body" color="ink3" style={{ marginTop: 8 }}>
              {t('signin.subtitle')}
            </LoopText>
          </View>

          <View style={{ gap: 12 }}>
            {isSignUp && (
              <Field placeholder={t('field.name')} value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />
            )}
            <Field
              placeholder={t('field.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Field
              placeholder={t('field.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error && (
            <LoopText variant="caption" color="warmDeep" style={{ marginTop: 14 }}>
              {t(error)}
            </LoopText>
          )}

          <Button
            label={isSignUp ? t('signin.cta.signup') : t('signin.cta.signin')}
            onPress={submit}
            loading={busy}
            style={{ marginTop: 22 }}
          />

          <Pressable onPress={() => setMode(isSignUp ? 'sign-in' : 'sign-up')} style={{ marginTop: 18, alignItems: 'center' }}>
            <LoopText variant="label" color="ink3">
              {isSignUp ? t('signin.toggle.toSignin') : t('signin.toggle.toSignup')}
            </LoopText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={LoopColors.ink4}
      style={{
        backgroundColor: LoopColors.surface,
        borderWidth: 1,
        borderColor: LoopColors.line,
        borderRadius: LoopRadius.xl,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 15,
        color: LoopColors.ink,
      }}
    />
  );
}

function authMessageKey(e: unknown): TKey {
  const msg = e instanceof Error ? e.message : String(e);
  if (/already registered|already exists/i.test(msg)) return 'signin.err.exists';
  if (/invalid login|invalid credentials/i.test(msg)) return 'signin.err.invalid';
  if (/password/i.test(msg)) return 'signin.err.password';
  return 'signin.err.generic';
}
