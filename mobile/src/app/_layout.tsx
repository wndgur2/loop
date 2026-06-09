import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoopColors } from '@/constants/loop-theme';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { useAuthDeepLink } from '@/features/auth/use-auth-deep-link';
import { useActiveGoal } from '@/features/goals/queries';
import { LanguageProvider } from '@/lib/i18n';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <LanguageProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <RootNavigator />
                <StatusBar style="dark" />
              </AuthProvider>
            </QueryClientProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();
  const { data: goal, isLoading: goalLoading } = useActiveGoal(!!session);
  const segments = useSegments();
  const router = useRouter();

  // Email confirmation link (deep link) → session exchange. Once a session is set, the routing effect below takes over.
  useAuthDeepLink();

  useEffect(() => {
    if (loading) return;
    const seg0 = segments[0] as string | undefined;

    if (!session) {
      if (seg0 !== 'sign-in') router.replace('/sign-in');
      return;
    }
    if (goalLoading) return;

    if (!goal) {
      if (seg0 !== 'onboarding') router.replace('/onboarding');
      return;
    }
    // Authenticated + has a goal → go to the main app
    if (seg0 === 'sign-in' || seg0 === 'onboarding') router.replace('/');
  }, [loading, session, goal, goalLoading, segments, router]);

  if (loading || (session && goalLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: LoopColors.canvas }}>
        <ActivityIndicator color={LoopColors.warm} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: LoopColors.canvas } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="account" options={{ presentation: 'card' }} />
      <Stack.Screen name="feedback/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="feedback/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat/[mode]" options={{ presentation: 'card' }} />
    </Stack>
  );
}
