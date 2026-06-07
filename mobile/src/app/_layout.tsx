import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoopColors } from '@/constants/loop-theme';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { useActiveGoal } from '@/features/goals/queries';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();
  const { data: goal, isLoading: goalLoading } = useActiveGoal(!!session);
  const segments = useSegments();
  const router = useRouter();

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
    // 인증 완료 + 목표 있음 → 앱 본체로
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
      <Stack.Screen name="feedback/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="feedback/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat/[mode]" options={{ presentation: 'card' }} />
    </Stack>
  );
}
