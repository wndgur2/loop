import { useEffect } from 'react';
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { LoopColors, LoopMotion, LoopRadius } from '../tokens/theme';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Single shimmer block — a soft opacity pulse. Compose into screen-shaped presets in the app. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = LoopRadius.md,
  style,
}: SkeletonProps) {
  const pulse = useSharedValue(0.5);
  useEffect(() => {
    pulse.set(
      withRepeat(
        withTiming(1, { duration: LoopMotion.timing.pulse, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [pulse]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.get() }));
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: LoopColors.fill },
        animatedStyle,
        style,
      ]}
    />
  );
}
