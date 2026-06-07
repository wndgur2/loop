import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { LoopMark } from '@/components/loop-mark';
import { Button, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === 'sign-up';

  async function submit() {
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError('이메일과 6자 이상 비밀번호를 입력해 주세요.');
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) await signUp(email.trim(), password, displayName.trim() || undefined);
      else await signIn(email.trim(), password);
      // 성공 시 onAuthStateChange → 루트 컨트롤러가 라우팅한다.
    } catch (e) {
      setError(authMessage(e));
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
              {isSignUp ? '되돌아보기를 시작해요' : '다시 오셨네요'}
            </LoopText>
            <LoopText variant="body" color="ink3" style={{ marginTop: 8 }}>
              스스로 남긴 피드백을 Loopi가 목표로 이어드려요.
            </LoopText>
          </View>

          <View style={{ gap: 12 }}>
            {isSignUp && (
              <Field placeholder="이름 (선택)" value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />
            )}
            <Field
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Field
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error && (
            <LoopText variant="caption" color="warmDeep" style={{ marginTop: 14 }}>
              {error}
            </LoopText>
          )}

          <Button
            label={isSignUp ? '가입하고 시작하기' : '로그인'}
            onPress={submit}
            loading={busy}
            style={{ marginTop: 22 }}
          />

          <Pressable onPress={() => setMode(isSignUp ? 'sign-in' : 'sign-up')} style={{ marginTop: 18, alignItems: 'center' }}>
            <LoopText variant="label" color="ink3">
              {isSignUp ? '이미 계정이 있어요 · 로그인' : '처음이세요? · 가입하기'}
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

function authMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/already registered|already exists/i.test(msg)) return '이미 가입된 이메일이에요. 로그인해 주세요.';
  if (/invalid login|invalid credentials/i.test(msg)) return '이메일 또는 비밀번호가 올바르지 않아요.';
  if (/password/i.test(msg)) return '비밀번호는 6자 이상이어야 해요.';
  return '문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
}
