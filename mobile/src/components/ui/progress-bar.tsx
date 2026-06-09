import { useEffect } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LoopColors, LoopMotion } from '@/constants/loop-theme';

type ProgressBarProps = {
  /** 0..1 */
  value: number;
  height?: number;
  color?: string;
  track?: string;
  /** Minimum visible fill % when value > 0 (so tiny fractions stay legible). */
  minPct?: number;
  style?: StyleProp<ViewStyle>;
};

/** Horizontal track + fill that animates its width when value changes. */
export function ProgressBar({
  value,
  height = 8,
  color = LoopColors.warm,
  track = LoopColors.ringTrack,
  minPct = 0,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(
      withTiming(clamped, { duration: LoopMotion.timing.slow, easing: Easing.out(Easing.cubic) }),
    );
  }, [clamped, progress]);
  const fillStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return { width: `${p <= 0 ? 0 : Math.max(minPct, p * 100)}%` };
  });
  return (
    <View
      style={[{ height, borderRadius: 9999, backgroundColor: track, overflow: 'hidden' }, style]}
    >
      <Animated.View
        style={[{ height: '100%', borderRadius: 9999, backgroundColor: color }, fillStyle]}
      />
    </View>
  );
}
