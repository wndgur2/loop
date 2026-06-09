import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback helper — centralized so call sites stay terse and platform-safe.
 * No-op on web (expo-haptics is native-only); fire-and-forget so it never blocks UI.
 */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

function run(fn: () => Promise<unknown>) {
  if (!enabled) return;
  void fn().catch(() => {});
}

export const haptics = {
  /** Light tap — tab / button press. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Selection tick — toggles, chips. */
  select: () => run(() => Haptics.selectionAsync()),
  /** Positive confirmation — proposal accept, internalize, takeaway done. */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Caution — destructive confirm, errors. */
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};

export type HapticKind = keyof typeof haptics;
