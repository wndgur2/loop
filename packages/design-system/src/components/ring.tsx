import { memo, type ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

import { LoopColors, LoopMotion } from '../tokens/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingProps = {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  /** Animate the arc from empty to value on mount / value change. */
  animated?: boolean;
  children?: ReactNode;
};

/** Progress ring — visual motif for internalization rate (closing loop). Ported from demo home Ring. */
export const Ring = memo(function Ring({
  value,
  size = 92,
  stroke = 9,
  color = LoopColors.warm,
  track = LoopColors.ringTrack,
  animated = false,
  children,
}: RingProps) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  const progress = useSharedValue(animated ? 0 : clamped);
  useEffect(() => {
    if (animated) {
      progress.set(
        withTiming(clamped, { duration: LoopMotion.timing.slow, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      progress.set(clamped);
    }
  }, [animated, clamped, progress]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - progress.get()) }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle cx={center} cy={center} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
  center: { alignItems: 'center', justifyContent: 'center' },
});
