import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback helper — platform-safe and fire-and-forget so it never blocks UI.
 * No-op on web (expo-haptics is native-only).
 * The only haptic in the app: a short light tap when a Loopi chat response arrives.
 */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

function run(fn: () => Promise<unknown>) {
  if (!enabled) return;
  void fn().catch(() => {});
}

export const haptics = {
  /** Short light tap — chat response arrival. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
};
