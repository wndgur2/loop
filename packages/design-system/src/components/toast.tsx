import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoopColors, LoopRadius, LoopShadow } from '../tokens/theme';

import { Icon, type IconName } from './icon';
import { LoopText } from './text';

type ToastTone = 'default' | 'good' | 'danger';

type ToastOptions = {
  tone?: ToastTone;
  icon?: IconName;
  /** Auto-dismiss delay in ms. */
  duration?: number;
};

type ToastState = ToastOptions & { id: number; message: string };

type ToastContextValue = { show: (message: string, options?: ToastOptions) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_BG: Record<ToastTone, string> = {
  default: LoopColors.ink,
  good: LoopColors.good,
  danger: LoopColors.danger,
};

/**
 * Wraps the app and renders a single transient toast at the bottom.
 * Pull `show` from `useToast()` to surface brief confirmations.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    if (timer.current) clearTimeout(timer.current);
    const id = (nextId.current += 1);
    setToast({ id, message, ...options });
    timer.current = setTimeout(() => setToast(null), options.duration ?? 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.duration(220)}
          exiting={FadeOutDown.duration(180)}
          pointerEvents="none"
          style={[styles.wrap, { bottom: insets.bottom + 24 }]}
        >
          <View style={[styles.toast, { backgroundColor: TONE_BG[toast.tone ?? 'default'] }]}>
            {!!toast.icon && <Icon name={toast.icon} size={16} color={LoopColors.white} />}
            <LoopText variant="bodyTight" color="white">
              {toast.message}
            </LoopText>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: 24 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 420,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: LoopRadius.full,
    ...LoopShadow.strong,
  },
});
