import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoopColors } from '@loop/ui';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { useAuthDeepLink } from '@/features/auth/use-auth-deep-link';
import { useActiveGoal } from '@/features/goals/queries';
import { LanguageProvider } from '@/lib/i18n';
import { loginPurchases, logoutPurchases } from '@/lib/purchases';
import { queryClient } from '@/lib/query-client';

// Hold the splash until Pretendard is registered so the first frame renders in-brand (no system-font flash).
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Pretendard static weights — keys must match LoopFont in @loop/ui (Pretendard-Medium/SemiBold/Bold).
  const [fontsLoaded, fontError] = useFonts({
    'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.ttf'),
  });

  useEffect(() => {
    // Reveal the app once fonts are ready; don't block forever if a font fails to decode.
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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

  // Identify the RevenueCat customer as the Supabase user so the webhook's app_user_id matches
  // (no-op on web / Expo Go / when no SDK key — see lib/purchases).
  const userId = session?.user.id;
  useEffect(() => {
    if (userId) void loginPurchases(userId);
    else void logoutPurchases();
  }, [userId]);

  useEffect(() => {
    if (loading) return;
    const seg0 = segments[0] as string | undefined;

    if (!session) {
      // Legal docs stay reachable before sign-in (consent links on the sign-up form).
      if (seg0 !== 'sign-in' && seg0 !== 'legal') router.replace('/sign-in');
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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: LoopColors.canvas,
        }}
      >
        <ActivityIndicator color={LoopColors.warm} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: LoopColors.canvas } }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="account" options={{ presentation: 'card' }} />
      <Stack.Screen name="feedback/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="feedback/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat/[mode]" options={{ presentation: 'card' }} />
      <Stack.Screen name="legal/[doc]" options={{ presentation: 'card' }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
